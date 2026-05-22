import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Folder, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { stats, activityFeed, tasks, projects, users } from '../../lib/mockData';
import { FADE_UP } from '../../lib/constants';
import { calcPercent } from '../../lib/utils';
import { PageHeader } from '../../components/shared';
import { Avatar, ProgressBar } from '../../components/shared';
import { StatCard } from './StatCard';
import { VelocityChart } from './VelocityChart';
import { ActivityFeed } from './ActivityFeed';
import styles from './Dashboard.module.css';

const STAT_CARDS = [
  { label: 'Total Tasks',      value: 58, icon: CheckCircle2, color: 'var(--teal)',   bg: 'var(--teal-dim)',   delta: '+8 this week' },
  { label: 'Completed',        value: 12, icon: TrendingUp,   color: 'var(--violet)', bg: 'var(--violet-dim)', delta: '+4 vs last week' },
  { label: 'Overdue',          value: 3,  icon: AlertTriangle, color: 'var(--rose)',  bg: 'var(--rose-dim)',   delta: '-2 resolved' },
  { label: 'Active Projects',  value: 2,  icon: Folder,       color: 'var(--amber)',  bg: 'var(--amber-dim)',  delta: '4 total' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Grab the user's first name for the greeting, fallback to 'User' if missing
  const firstName = user?.first_name ? user.username.split('-')[0] : 'User';

  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').slice(0, 5);

  return (
    <div className={styles.page}>
      <motion.div {...FADE_UP(0)}>
        <PageHeader
          title={`Good morning, ${firstName} 👋`}
          subtitle="Here's what's happening across your workspace today."
          actions={
            <button className={styles.ctaBtn} onClick={() => navigate('/tasks')}>
              View all tasks <ArrowUpRight size={14} />
            </button>
          }
        />
      </motion.div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.label} {...card} delay={0.05 * i} />
        ))}
      </div>

      {/* Main content grid */}
      <div className={styles.mainGrid}>

        {/* Left: chart + activity */}
        <motion.div className={styles.card} {...FADE_UP(0.2)}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Weekly velocity</span>
            <span className={styles.cardMeta}>Tasks completed per day</span>
          </div>
          <VelocityChart days={stats.completionByDay} />

          <div className={styles.sectionDivider}>
            <span className={styles.cardTitle}>Live activity</span>
          </div>
          <ActivityFeed items={activityFeed} />
        </motion.div>

        {/* Right column */}
        <div className={styles.rightCol}>

          {/* In-progress tasks */}
          <motion.div className={styles.card} {...FADE_UP(0.25)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>In progress</span>
              <span className={styles.badge}>{inProgressTasks.length}</span>
            </div>
            <div className={styles.taskList}>
              {inProgressTasks.map((task, i) => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const project  = projects.find(p => p.id === task.projectId);
                return (
                  <motion.div key={task.id} className={styles.taskRow} {...FADE_UP(0.3 + i * 0.05)}>
                    <div className={styles.priorityBar} style={{
                      background: task.priority === 'urgent' ? 'var(--rose)'
                        : task.priority === 'high' ? 'var(--amber)' : 'var(--sky)',
                    }} />
                    <div className={styles.taskBody}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      <span className={styles.taskProject} style={{ color: project?.color }}>
                        {project?.name}
                      </span>
                    </div>
                    <Avatar initials={assignee?.initials} color={assignee?.color} size="sm" title={assignee?.name} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Project progress */}
          <motion.div className={styles.card} {...FADE_UP(0.3)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Project progress</span>
            </div>
            <div className={styles.projectList}>
              {projects.map((p, i) => {
                const pct = calcPercent(p.completedCount, p.taskCount);
                return (
                  <motion.div key={p.id} className={styles.projectRow} {...FADE_UP(0.35 + i * 0.05)}>
                    <div className={styles.projectRowTop}>
                      <span className={styles.projectName}>{p.name}</span>
                      <span className={styles.projectPct} style={{ color: p.color }}>{pct}%</span>
                    </div>
                    <ProgressBar percent={pct} color={p.color} delay={0.4 + i * 0.08} />
                    <div className={styles.projectRowBottom}>
                      <span className={styles.projectSub}>{p.completedCount} of {p.taskCount} tasks</span>
                      <div className={styles.memberStack}>
                        {p.members.slice(0, 3).map(uid => {
                          const u = users.find(x => x.id === uid);
                          return <Avatar key={uid} initials={u?.initials} color={u?.color} size="sm" title={u?.name} />;
                        })}
                        {p.members.length > 3 && (
                          <div className={styles.moreChip}>+{p.members.length - 3}</div>
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