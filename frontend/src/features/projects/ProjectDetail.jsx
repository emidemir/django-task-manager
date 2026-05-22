import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, MessageSquare, Clock, Search } from 'lucide-react';
import { projects, tasks, users } from '../../lib/mockData';
import { PRIORITY_COLOR, PRIORITY_LABEL, PROJECT_STATUS } from '../../lib/constants';
import { Avatar, ProgressBar } from '../../components/shared';
import { calcPercent } from '../../lib/utils';
import styles from './ProjectDetail.module.css'; // You can duplicate Tasks.module.css and add the header styles below

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--sky)' },
  { id: 'done',        label: 'Done',        color: 'var(--teal)' },
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const project = projects.find((p) => p.id === projectId);
  
  if (!project) {
    return <div className={styles.page}><div className={styles.emptyState}>Project not found.</div></div>;
  }

  // Filter tasks only for this project, then by search query
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const filteredTasks = projectTasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const pct = calcPercent(project.completedCount, project.taskCount);
  const status = PROJECT_STATUS[project.status];

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/projects')}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Project Header */}
      <div className={styles.projectHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.projectIcon} style={{ background: project.color + '18', border: `1px solid ${project.color}30` }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: project.color }} />
          </div>
          <h1 className={styles.title}>{project.name}</h1>
          <span className={styles.statusBadge} style={{ color: status.color, background: status.color + '15' }}>
            {status.label}
          </span>
        </div>
        <p className={styles.description}>{project.description}</p>
        
        <div className={styles.progressRow}>
          <span className={styles.progressPct} style={{ color: project.color }}>{pct}% Complete</span>
          <div style={{ width: '200px' }}>
            <ProgressBar percent={pct} color={project.color} delay={0.1} />
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
        <button className={styles.addBtn}>
          <Plus size={15} strokeWidth={2.5} /> New task
        </button>
      </div>

      {/* Kanban Board */}
      <div className={styles.board}>
        {COLUMNS.map((col, ci) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
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
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

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
                      <div className={styles.priorityStrip} style={{ background: PRIORITY_COLOR[task.priority] }} />
                      <div className={styles.cardInner}>
                        <div className={styles.tagRow}>
                          {task.tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                          <span className={styles.priorityPill} style={{ color: PRIORITY_COLOR[task.priority], background: PRIORITY_COLOR[task.priority] + '18' }}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                        </div>

                        <p className={styles.cardTitle}>{task.title}</p>
                        {task.description && <p className={styles.cardDesc}>{task.description}</p>}

                        <div className={styles.cardFooter}>
                          <div className={styles.cardMeta}>
                            {task.commentCount > 0 && (
                              <span className={styles.metaItem}>
                                <MessageSquare size={11} /> {task.commentCount}
                              </span>
                            )}
                            <span className={styles.metaItem} style={{ color: isOverdue ? 'var(--rose)' : 'var(--text-muted)' }}>
                              <Clock size={11} /> {task.dueDate}
                            </span>
                          </div>
                          <Avatar initials={assignee?.initials} color={assignee?.color} size="sm" title={assignee?.name} />
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