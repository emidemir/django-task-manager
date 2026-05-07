import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Folder, TrendingUp, ArrowUpRight } from 'lucide-react';
import { stats, activityFeed, tasks, projects, users } from '../mockData';
import { formatDistanceToNow } from 'date-fns';
import styles from './Dashboard.module.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

const statCards = [
  { label: 'Total Tasks', value: 58, icon: CheckCircle2, color: 'var(--teal)', bg: 'var(--teal-dim)', delta: '+8 this week' },
  { label: 'Completed', value: 12, icon: TrendingUp, color: 'var(--violet)', bg: 'var(--violet-dim)', delta: '+4 vs last week' },
  { label: 'Overdue', value: 3, icon: AlertTriangle, color: 'var(--rose)', bg: 'var(--rose-dim)', delta: '-2 resolved' },
  { label: 'Active Projects', value: 2, icon: Folder, color: 'var(--amber)', bg: 'var(--amber-dim)', delta: '4 total' },
];

const priorityColor = { urgent: 'var(--rose)', high: 'var(--amber)', medium: 'var(--teal)', low: 'var(--text-muted)' };
const statusLabel = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
const statusColor = { todo: 'var(--text-muted)', in_progress: 'var(--sky)', done: 'var(--teal)' };

const activityIcon = { done: '✓', progress: '→', comment: '💬', create: '+' };
const activityColor = { done: 'var(--teal)', progress: 'var(--sky)', comment: 'var(--violet)', create: 'var(--amber)' };

export default function Dashboard({ onNavigate }) {
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').slice(0, 5);
  const maxBar = Math.max(...stats.completionByDay.map(d => d.count));

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div className={styles.header} {...fadeUp(0)}>
        <div>
          <h1 className={styles.title}>Good morning, Alex 👋</h1>
          <p className={styles.subtitle}>Here's what's happening across your workspace today.</p>
        </div>
        <button className={styles.ctaBtn} onClick={() => onNavigate('tasks')}>
          View all tasks <ArrowUpRight size={14} />
        </button>
      </motion.div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} className={styles.statCard} {...fadeUp(0.05 * i)}>
              <div className={styles.statTop}>
                <div className={styles.statIcon} style={{ background: card.bg, color: card.color }}>
                  <Icon size={16} strokeWidth={2} />
                </div>
                <span className={styles.statDelta}>{card.delta}</span>
              </div>
              <div className={styles.statValue} style={{ color: card.color }}>{card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className={styles.mainGrid}>

        {/* Activity chart + feed */}
        <motion.div className={styles.card} {...fadeUp(0.2)}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Weekly velocity</span>
            <span className={styles.cardMeta}>Tasks completed per day</span>
          </div>
          {/* Bar chart */}
          <div className={styles.barChart}>
            {stats.completionByDay.map((d, i) => (
              <div key={d.day} className={styles.barCol}>
                <motion.div
                  className={styles.bar}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: `${(d.count / maxBar) * 100}%` }}
                />
                <span className={styles.barLabel}>{d.day}</span>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className={styles.cardHeader} style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <span className={styles.cardTitle}>Live activity</span>
          </div>
          <div className={styles.activityList}>
            {activityFeed.map((item, i) => (
              <motion.div key={item.id} className={styles.activityItem} {...fadeUp(0.3 + i * 0.06)}>
                <div className={styles.activityAvatar}
                  style={{ background: item.actor.color + '20', color: item.actor.color, border: `1px solid ${item.actor.color}40` }}>
                  {item.actor.initials}
                </div>
                <div className={styles.activityBody}>
                  <span className={styles.activityActor}>{item.actor.name}</span>
                  <span className={styles.activityAction}> {item.action} </span>
                  <span className={styles.activityTarget}>"{item.target}"</span>
                </div>
                <span className={styles.activityTime}>
                  {formatDistanceToNow(item.time, { addSuffix: true })}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <div className={styles.rightCol}>

          {/* In-progress tasks */}
          <motion.div className={styles.card} {...fadeUp(0.25)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>In progress</span>
              <span className={styles.cardBadge}>{inProgressTasks.length}</span>
            </div>
            <div className={styles.taskList}>
              {inProgressTasks.map((task, i) => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <motion.div key={task.id} className={styles.taskRow} {...fadeUp(0.3 + i * 0.05)}>
                    <div className={styles.taskPriority} style={{ background: priorityColor[task.priority] }} />
                    <div className={styles.taskBody}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      <div className={styles.taskMeta}>
                        <span style={{ color: project?.color, fontSize: 11 }}>{project?.name}</span>
                        <span className={styles.dot}>·</span>
                        <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.dueDate}</span>
                      </div>
                    </div>
                    <div className={styles.taskAvatar}
                      style={{ background: assignee?.color + '20', color: assignee?.color }}>
                      {assignee?.initials}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Projects progress */}
          <motion.div className={styles.card} {...fadeUp(0.3)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Project progress</span>
            </div>
            <div className={styles.projectList}>
              {projects.map((p, i) => {
                const pct = Math.round((p.completedCount / p.taskCount) * 100);
                return (
                  <motion.div key={p.id} className={styles.projectRow} {...fadeUp(0.35 + i * 0.05)}>
                    <div className={styles.projectRowTop}>
                      <span className={styles.projectRowName}>{p.name}</span>
                      <span className={styles.projectRowPct} style={{ color: p.color }}>{pct}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <motion.div
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        style={{ background: p.color }}
                      />
                    </div>
                    <div className={styles.projectRowBottom}>
                      <span className={styles.projectRowSub}>{p.completedCount} of {p.taskCount} tasks</span>
                      <div className={styles.memberStack}>
                        {p.members.slice(0, 3).map(uid => {
                          const u = users.find(x => x.id === uid);
                          return (
                            <div key={uid} className={styles.memberChip}
                              style={{ background: u?.color + '25', color: u?.color, borderColor: u?.color + '40' }}>
                              {u?.initials}
                            </div>
                          );
                        })}
                        {p.members.length > 3 && (
                          <div className={styles.memberChip} style={{ background: 'var(--bg-glass)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                            +{p.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}