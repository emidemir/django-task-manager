import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, MessageSquare, Clock, Search, Users } from 'lucide-react';

import { useProject } from '../../hooks/useProjects';
import { useTasks, useCreateTask } from '../../hooks/useTasks'; 
// NOTE: We no longer import ProjectTeam here!

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

  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId);
  const { data: allTasks, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const createTask = useCreateTask();

  if (projectLoading || tasksLoading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
          Loading project details...
        </div>
      </div>
    );
  }

  if (projectError || tasksError || !project) {
    return <div className={styles.page}><div className={styles.emptyState}>Project not found or failed to load.</div></div>;
  }

  const safeTasks = allTasks || [];
  const projectTasks = safeTasks.filter(t => t.project === projectId);
  const filteredTasks = projectTasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const taskCount = projectTasks.length;
  const completedCount = projectTasks.filter(t => t.status?.toLowerCase() === 'finished').length;
  const pct = calcPercent(completedCount, taskCount);
  
  const status = PROJECT_STATUS[project.status?.toLowerCase()] || PROJECT_STATUS['ongoing'];
  const projectColor = project.color || '#3b82f6';

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

      {/* Main Content (Now full width!) */}
      <div className={styles.mainContent}>
        
        {/* Updated Toolbar with "Manage Team" button */}
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
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className={styles.addBtn} 
              style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)' }}
              onClick={() => navigate(`/projects/${projectId}/team`)}
            >
              <Users size={15} strokeWidth={2} /> Manage Team
            </button>
            
            <button 
              className={styles.addBtn} 
              onClick={()=>{navigate('/tasks/new')}}
              disabled={createTask.isPending}
            >
              <Plus size={15} strokeWidth={2.5} /> 
              {createTask.isPending ? 'Saving...' : 'New task'}
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className={styles.board}>
          {COLUMNS.map((col, ci) => {
            const columnToDjangoStatus = { 'todo': 'Todo', 'in_progress': 'Ongoing', 'done': 'Finished' };
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
    </div>
  );
}