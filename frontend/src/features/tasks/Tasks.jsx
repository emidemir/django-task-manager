import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Clock, Filter, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; 

// 1. Import your TanStack Query hooks
import { useTasks, useCreateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';

// Keep users mock ONLY if you haven't built a useUsers hook yet
import { users } from '../../lib/mockData';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../../lib/constants';
import { PageHeader, Avatar } from '../../components/shared';
import styles from './Tasks.module.css';

// 2. Updated to match Django's exact TaskStatus choices ('Todo', 'Ongoing', 'Finished')
const COLUMNS = [
  { id: 'Todo',     label: 'To Do',       color: 'var(--text-muted)' },
  { id: 'Ongoing',  label: 'In Progress', color: 'var(--sky)' },
  { id: 'Finished', label: 'Done',        color: 'var(--teal)' },
];

export default function Tasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [selectedProject, setProject] = useState('all');

  // 3. Fetch real data for the authenticated user
  const { data: allTasks, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const { data: allProjects, isLoading: projectsLoading } = useProjects();
  const createTask = useCreateTask();

  // Personalize the title based on the logged-in user
  const firstName = user?.first_name ? user.first_name : (user?.username?.split('-')[0] || 'User');
  const pageTitle = firstName ? `${firstName}'s Tasks` : 'My Tasks';

  // 4. Handle Loading & Error States gracefully
  if (tasksLoading || projectsLoading) {
    return (
      <div className={styles.page}>
        <PageHeader title={pageTitle} subtitle="Loading your tasks..." />
        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Syncing your board...</div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className={styles.page}>
        <PageHeader title={pageTitle} subtitle="Error" />
        <div style={{ padding: '2rem', color: 'var(--rose)' }}>Failed to load your tasks.</div>
      </div>
    );
  }

  // Fallbacks to prevent mapping over undefined
  const safeTasks = allTasks || [];
  const safeProjects = allProjects || [];

  // Filter tasks based on the search bar and project dropdown
  const filtered = safeTasks.filter(t => {
    const matchSearch  = t.title?.toLowerCase().includes(search.toLowerCase());
    // Use Django's 'project' FK field (which is the project ID)
    const matchProject = selectedProject === 'all' || t.project === selectedProject;
    return matchSearch && matchProject;
  });

  return (
    <div className={styles.page}>
      <PageHeader
        title={pageTitle}
        subtitle={`${safeTasks.length} tasks across ${safeProjects.length} projects`}
        actions={
          <button 
            className={styles.addBtn} 
            onClick={()=>{navigate('new')}}
            disabled={createTask.isPending || safeProjects.length === 0}
          >
            <Plus size={15} strokeWidth={2.5} /> 
            {createTask.isPending ? 'Saving...' : 'New task'}
          </button>
        }
      />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} color="var(--text-muted)" />
          <input
            className={styles.searchInput}
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <button className={styles.filterBtn}><Filter size={13} /> Filter</button>
          <select
            className={styles.select}
            value={selectedProject}
            onChange={e => setProject(e.target.value)}
          >
            <option value="all">All projects</option>
            {safeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban board */}
      <div className={styles.board}>
        {COLUMNS.map((col, ci) => {
          // Compare against Django's status casing
          const colTasks = filtered.filter(t => t.status === col.id);
          
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
                  // 5. Data Translation: Match Django's foreign keys and field names
                  const assigneeId = typeof task.assigned_to === 'object' ? task.assigned_to?.id : task.assigned_to;
                  const assignee = users.find(u => u.id === assigneeId);
                  const project  = safeProjects.find(p => p.id === task.project);
                  
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Finished';
                  const priorityLevel = task.priority?.toLowerCase() || 'medium';
                  const commentCount = task.comments?.length || 0;

                  return (
                    <motion.div
                      key={task.id}
                      className={styles.taskCard}
                      // 6. Navigate to the TaskDetail page when clicked
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      style={{ cursor: 'pointer' }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.05 + ti * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    >
                      <div
                        className={styles.priorityStrip}
                        style={{ background: PRIORITY_COLOR[priorityLevel] }}
                      />
                      <div className={styles.cardInner}>
                        <div className={styles.tagRow}>
                          {(task.tags || []).map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                          {task.priority && (
                            <span
                              className={styles.priorityPill}
                              style={{
                                color: PRIORITY_COLOR[priorityLevel],
                                background: PRIORITY_COLOR[priorityLevel] + '18',
                              }}
                            >
                              {PRIORITY_LABEL[priorityLevel]}
                            </span>
                          )}
                        </div>

                        <p className={styles.cardTitle}>{task.title}</p>
                        {task.description && <p className={styles.cardDesc}>{task.description}</p>}

                        <div className={styles.projectLabel} style={{ color: project?.color || '#3b82f6' }}>
                          <div className={styles.projectDot} style={{ background: project?.color || '#3b82f6' }} />
                          {project?.name || 'Unknown Project'}
                        </div>

                        <div className={styles.cardFooter}>
                          <div className={styles.cardMeta}>
                            {commentCount > 0 && (
                              <span className={styles.metaItem}>
                                <MessageSquare size={11} /> {commentCount}
                              </span>
                            )}
                            {task.due_date && (
                              <span
                                className={styles.metaItem}
                                style={{ color: isOverdue ? 'var(--rose)' : 'var(--text-muted)' }}
                              >
                                <Clock size={11} /> {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Avatar
                            initials={assignee?.initials}
                            color={assignee?.color}
                            size="sm"
                            title={assignee?.name}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className={styles.emptyCol}>No tasks here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}