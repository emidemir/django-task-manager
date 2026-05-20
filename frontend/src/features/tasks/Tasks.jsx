import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Clock, Filter, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Brought in your AuthContext
import { tasks, users, projects } from '../../lib/mockData';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../../lib/constants';
import { PageHeader } from '../../components/shared';
import { Avatar } from '../../components/shared';
import styles from './Tasks.module.css';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress',  color: 'var(--sky)' },
  { id: 'done',        label: 'Done',         color: 'var(--teal)' },
];

export default function Tasks() {
  const { user } = useAuth(); // Pull the user from context
  const [search, setSearch]               = useState('');
  const [selectedProject, setProject]     = useState('all');

  // Personalize the title based on the logged-in user
  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const pageTitle = firstName ? `${firstName}'s Tasks` : 'My Tasks';

  const filtered = tasks.filter(t => {
    const matchSearch  = t.title.toLowerCase().includes(search.toLowerCase());
    const matchProject = selectedProject === 'all' || t.projectId === selectedProject;
    return matchSearch && matchProject;
  });

  return (
    <div className={styles.page}>
      <PageHeader
        title={pageTitle}
        subtitle={`${tasks.length} tasks across ${projects.length} projects`}
        actions={
          <button className={styles.addBtn}>
            <Plus size={15} strokeWidth={2.5} /> New task
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
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban board */}
      <div className={styles.board}>
        {COLUMNS.map((col, ci) => {
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
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const project  = projects.find(p => p.id === task.projectId);
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

                  return (
                    <motion.div
                      key={task.id}
                      className={styles.taskCard}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.05 + ti * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    >
                      <div
                        className={styles.priorityStrip}
                        style={{ background: PRIORITY_COLOR[task.priority] }}
                      />
                      <div className={styles.cardInner}>
                        <div className={styles.tagRow}>
                          {task.tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                          <span
                            className={styles.priorityPill}
                            style={{
                              color: PRIORITY_COLOR[task.priority],
                              background: PRIORITY_COLOR[task.priority] + '18',
                            }}
                          >
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                        </div>

                        <p className={styles.cardTitle}>{task.title}</p>
                        {task.description && <p className={styles.cardDesc}>{task.description}</p>}

                        <div className={styles.projectLabel} style={{ color: project?.color }}>
                          <div className={styles.projectDot} style={{ background: project?.color }} />
                          {project?.name}
                        </div>

                        <div className={styles.cardFooter}>
                          <div className={styles.cardMeta}>
                            {task.commentCount > 0 && (
                              <span className={styles.metaItem}>
                                <MessageSquare size={11} /> {task.commentCount}
                              </span>
                            )}
                            <span
                              className={styles.metaItem}
                              style={{ color: isOverdue ? 'var(--rose)' : 'var(--text-muted)' }}
                            >
                              <Clock size={11} /> {task.dueDate}
                            </span>
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