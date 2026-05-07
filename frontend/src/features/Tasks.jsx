import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Paperclip, Clock, Filter, Search } from 'lucide-react';
import { tasks, users, projects } from '../mockData';
import styles from './Tasks.module.css';

const columns = [
  { id: 'todo', label: 'To Do', color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--sky)' },
  { id: 'done', label: 'Done', color: 'var(--teal)' },
];

const priorityColor = {
  urgent: 'var(--rose)',
  high: 'var(--amber)',
  medium: 'var(--sky)',
  low: 'var(--text-muted)',
};

const priorityLabel = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchProject = selectedProject === 'all' || t.projectId === selectedProject;
    return matchSearch && matchProject;
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Tasks</h1>
          <p className={styles.subtitle}>{tasks.length} tasks across {projects.length} projects</p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={15} strokeWidth={2.5} />
          New task
        </button>
      </div>

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
          <button className={styles.filterBtn}>
            <Filter size={13} />
            Filter
          </button>
          <select
            className={styles.select}
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="all">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban board */}
      <div className={styles.board}>
        {columns.map((col, ci) => {
          const colTasks = filtered.filter(t => t.status === col.id);
          return (
            <div key={col.id} className={styles.column}>
              {/* Column header */}
              <div className={styles.colHeader}>
                <div className={styles.colDot} style={{ background: col.color }} />
                <span className={styles.colLabel}>{col.label}</span>
                <span className={styles.colCount}>{colTasks.length}</span>
                <button className={styles.colAddBtn}><Plus size={13} /></button>
              </div>

              {/* Cards */}
              <div className={styles.cardList}>
                {colTasks.map((task, ti) => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const project = projects.find(p => p.id === task.projectId);
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
                      {/* Priority strip */}
                      <div className={styles.priorityStrip} style={{ background: priorityColor[task.priority] }} />

                      <div className={styles.cardInner}>
                        {/* Tags */}
                        <div className={styles.tagRow}>
                          {task.tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                          <span className={styles.priorityPill} style={{
                            color: priorityColor[task.priority],
                            background: priorityColor[task.priority] + '18',
                          }}>
                            {priorityLabel[task.priority]}
                          </span>
                        </div>

                        {/* Title */}
                        <p className={styles.cardTitle}>{task.title}</p>

                        {/* Description */}
                        {task.description && (
                          <p className={styles.cardDesc}>{task.description}</p>
                        )}

                        {/* Project label */}
                        <div className={styles.projectLabel} style={{ color: project?.color }}>
                          <div className={styles.projectLabelDot} style={{ background: project?.color }} />
                          {project?.name}
                        </div>

                        {/* Footer */}
                        <div className={styles.cardFooter}>
                          <div className={styles.cardMeta}>
                            {task.commentCount > 0 && (
                              <span className={styles.metaItem}>
                                <MessageSquare size={11} />
                                {task.commentCount}
                              </span>
                            )}
                            <span className={styles.metaItem} style={{ color: isOverdue ? 'var(--rose)' : 'var(--text-muted)' }}>
                              <Clock size={11} />
                              {task.dueDate}
                            </span>
                          </div>
                          <div
                            className={styles.assigneeAvatar}
                            style={{ background: assignee?.color + '22', color: assignee?.color }}
                            title={assignee?.name}
                          >
                            {assignee?.initials}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty state */}
                {colTasks.length === 0 && (
                  <div className={styles.emptyCol}>
                    <span>No tasks here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}