import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, MessageSquare, Clock, Search } from 'lucide-react';

// 1. Import your TanStack Query hooks
import { useProject } from '../../hooks/useProjects';
import { useTasks, useCreateTask } from '../../hooks/useTasks'; 

// Keeping users mock only if you haven't built a useUsers hook yet
import { users } from '../../lib/mockData'; 
import { PRIORITY_COLOR, PRIORITY_LABEL, PROJECT_STATUS } from '../../lib/constants';
import { Avatar, ProgressBar } from '../../components/shared';
import { calcPercent } from '../../lib/utils';
import styles from './ProjectDetail.module.css'; 

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--sky)' },
  { id: 'done',        label: 'Done',        color: 'var(--teal)' },
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // 2. Fetch the specific project and all tasks
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId);
  const { data: allTasks, isLoading: tasksLoading, isError: tasksError } = useTasks();
  
  // 3. Initialize the mutation for the "New task" button
  const createTask = useCreateTask();

  // 4. Handle Loading States
  if (projectLoading || tasksLoading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
          Loading project details...
        </div>
      </div>
    );
  }

  // 5. Handle Error / Not Found States
  if (projectError || tasksError) {
    return <div className={styles.page}><div className={styles.emptyState}>Failed to load project data.</div></div>;
  }
  
  if (!project) {
    return <div className={styles.page}><div className={styles.emptyState}>Project not found.</div></div>;
  }

  // Fallbacks for data mapping
  const safeTasks = allTasks || [];
  
  // Filter tasks only for this project, then by search query
  const projectTasks = safeTasks.filter(t => t.project === projectId);
  const filteredTasks = projectTasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // Data Translation: Safely handle Django's data
  const taskCount = projectTasks.length;
  const completedCount = projectTasks.filter(t => t.status?.toLowerCase() === 'finished').length;
  const pct = calcPercent(completedCount, taskCount);
  
  // Match Django's status format
  const status = PROJECT_STATUS[project.status?.toLowerCase()] || PROJECT_STATUS['ongoing'];
  const projectColor = project.color || '#3b82f6'; // Fallback color

  const handleCreateDummyTask = () => {
    createTask.mutate({
      title: "New Task from Project Detail",
      status: "todo",
      project: projectId
    });
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/projects')}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Project Header */}
      <div className={styles.projectHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.projectIcon} style={{ background: projectColor + '18', border: `1px solid ${projectColor}30` }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: projectColor }} />
          </div>
          <h1 className={styles.title}>{project.name}</h1>
          <span className={styles.statusBadge} style={{ color: status?.color || '#ccc', background: (status?.color || '#ccc') + '15' }}>
            {status?.label || project.status}
          </span>
        </div>
        <p className={styles.description}>{project.description}</p>
        
        <div className={styles.progressRow}>
          <span className={styles.progressPct} style={{ color: projectColor }}>{pct}% Complete</span>
          <div style={{ width: '200px' }}>
            <ProgressBar percent={pct} color={`linear-gradient(90deg, ${projectColor}, ${projectColor}aa)`} delay={0.1} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} color="var(--text-muted)" />
          <input
            className={styles.searchInput}
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button 
          className={styles.addBtn} 
          onClick={handleCreateDummyTask}
          disabled={createTask.isPending}
        >
          <Plus size={15} strokeWidth={2.5} /> 
          {createTask.isPending ? 'Saving...' : 'New task'}
        </button>
      </div>

      {/* Kanban Board */}
      <div className={styles.board}>
        {COLUMNS.map((col, ci) => {
          // Map Django status ('Todo', 'Ongoing', 'Finished') to your columns
          const columnToDjangoStatus = {
            'todo': 'Todo',
            'in_progress': 'Ongoing',
            'done': 'Finished'
          };
          
          const colTasks = filteredTasks.filter(t => t.status === columnToDjangoStatus[col.id]);
          
          return (
            <div key={col.id} className={styles.column}>
              <div className={styles.colHeader}>
                <div className={styles.colDot} style={{ background: col.color }} />
                <span className={styles.colLabel}>{col.label}</span>
                <span className={styles.colCount}>{colTasks.length}</span>
                <button className={styles.colAddBtn}><Plus size={13} /></button>
              </div>

              <div className={styles.cardList}>
                {colTasks.map((task, ti) => {
                  // DRF usually returns relation IDs or nested objects. Adjust based on your serializer.
                  const assigneeId = typeof task.assigned_to === 'object' ? task.assigned_to?.id : task.assigned_to;
                  const assignee = users.find(u => u.id === assigneeId);
                  
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Finished';
                  const priorityLevel = task.priority?.toLowerCase() || 'medium';

                  return (
                    <motion.div
                      key={task.id}
                      className={styles.taskCard}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.05 + ti * 0.04, duration: 0.35 }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    >
                      <div className={styles.priorityStrip} style={{ background: PRIORITY_COLOR[priorityLevel] }} />
                      <div className={styles.cardInner}>
                        <div className={styles.tagRow}>
                          {(task.tags || []).map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                          {task.priority && (
                            <span className={styles.priorityPill} style={{ color: PRIORITY_COLOR[priorityLevel], background: PRIORITY_COLOR[priorityLevel] + '18' }}>
                              {PRIORITY_LABEL[priorityLevel]}
                            </span>
                          )}
                        </div>

                        <p className={styles.cardTitle}>{task.title}</p>
                        {task.description && <p className={styles.cardDesc}>{task.description}</p>}

                        <div className={styles.cardFooter}>
                          <div className={styles.cardMeta}>
                            {/* Assumes backend sends comments or a comment_count field */}
                            {task.comments?.length > 0 && (
                              <span className={styles.metaItem}>
                                <MessageSquare size={11} /> {task.comments.length}
                              </span>
                            )}
                            {task.due_date && (
                              <span className={styles.metaItem} style={{ color: isOverdue ? 'var(--rose)' : 'var(--text-muted)' }}>
                                <Clock size={11} /> {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {assignee && (
                            <Avatar initials={assignee.initials} color={assignee.color} size="sm" title={assignee.name} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {colTasks.length === 0 && <div className={styles.emptyCol}>No tasks here</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}