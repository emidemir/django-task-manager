import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Folder, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 1. Import your TanStack hooks
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';

// 2. Keep mocks for ActivityFeed/VelocityChart (until backend supports them) and Users
import { stats, activityFeed, users } from '../../lib/mockData';
import { FADE_UP } from '../../lib/constants';
import { calcPercent } from '../../lib/utils';
import { PageHeader, Avatar, ProgressBar } from '../../components/shared';
import { StatCard } from './StatCard';
import { VelocityChart } from './VelocityChart';
import { ActivityFeed } from './ActivityFeed';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 3. Fetch real data
  const { data: allTasks, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const { data: allProjects, isLoading: projectsLoading, isError: projectsError } = useProjects();

  const firstName = user?.first_name ? user.first_name : (user?.username?.split('-')[0] || 'User');

  // 4. Handle Loading States gracefully
  if (tasksLoading || projectsLoading) {
    return (
      <div className={styles.page}>
        <PageHeader title={`Good morning, ${firstName} 👋`} subtitle="Loading your workspace..." />
        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Syncing data...</div>
      </div>
    );
  }

  if (tasksError || projectsError) {
    return (
      <div className={styles.page}>
        <PageHeader title={`Good morning, ${firstName} 👋`} subtitle="Error connecting to server." />
      </div>
    );
  }

  // 5. Data Translation & Calculations
  const safeTasks = allTasks || [];
  const safeProjects = allProjects || [];

  // Calculate dynamic stats
  const totalTasksCount = safeTasks.length;
  const completedTasksCount = safeTasks.filter(t => t.status?.toLowerCase() === 'finished').length;
  const overdueTasksCount = safeTasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status?.toLowerCase() !== 'finished'
  ).length;
  const activeProjectsCount = safeProjects.filter(p => p.status?.toLowerCase() === 'ongoing').length;

  // Move STAT_CARDS inside the component so it can use the dynamic variables
  const STAT_CARDS = [
    { label: 'Total Tasks',      value: totalTasksCount,     icon: CheckCircle2, color: 'var(--teal)',   bg: 'var(--teal-dim)' },
    { label: 'Completed',        value: completedTasksCount, icon: TrendingUp,   color: 'var(--violet)', bg: 'var(--violet-dim)' },
    { label: 'Overdue',          value: overdueTasksCount,   icon: AlertTriangle, color: 'var(--rose)',  bg: 'var(--rose-dim)' },
    { label: 'Active Projects',  value: activeProjectsCount, icon: Folder,       color: 'var(--amber)',  bg: 'var(--amber-dim)' },
  ];

  // Map 'in_progress' to Django's 'Ongoing'
  const inProgressTasks = safeTasks.filter(t => t.status?.toLowerCase() === 'ongoing').slice(0, 5);

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

      {/* Stat cards (Now fully dynamic!) */}
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
          {/* Note: Velocity uses mock data until a backend statistics endpoint is built */}
          <VelocityChart days={stats.completionByDay} />

          <div className={styles.sectionDivider}>
            <span className={styles.cardTitle}>Live activity</span>
          </div>
          {/* Note: ActivityFeed uses mock data until a backend audit log model is built */}
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
                const assigneeId = typeof task.assigned_to === 'object' ? task.assigned_to?.id : task.assigned_to;
                const assignee = users.find(u => u.id === assigneeId);
                const project  = safeProjects.find(p => p.id === task.project);
                
                // Map Django priorities to UI colors
                const pColor = task.priority?.toLowerCase() === 'critical' ? 'var(--rose)'
                             : task.priority?.toLowerCase() === 'high' ? 'var(--amber)' 
                             : 'var(--sky)';

                return (
                  <motion.div 
                    key={task.id} 
                    className={styles.taskRow} 
                    {...FADE_UP(0.3 + i * 0.05)}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.priorityBar} style={{ background: pColor }} />
                    <div className={styles.taskBody}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      <span className={styles.taskProject} style={{ color: project?.color || '#3b82f6' }}>
                        {project?.name || 'Unknown Project'}
                      </span>
                    </div>
                    <Avatar initials={assignee?.initials} color={assignee?.color} size="sm" title={assignee?.name} />
                  </motion.div>
                );
              })}
              {inProgressTasks.length === 0 && (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No ongoing tasks. You're all caught up!
                </div>
              )}
            </div>
          </motion.div>

          {/* Project progress */}
          <motion.div className={styles.card} {...FADE_UP(0.3)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Project progress</span>
            </div>
            <div className={styles.projectList}>
              {safeProjects.map((p, i) => {
                // Safely calculate counts based on Django's nested tasks
                const taskCount = p.tasks?.length || 0;
                const completedCount = p.tasks?.filter(t => t.status?.toLowerCase() === 'finished').length || 0;
                const pct = calcPercent(completedCount, taskCount);
                const pColor = p.color || '#3b82f6';

                return (
                  <motion.div 
                    key={p.id} 
                    className={styles.projectRow} 
                    {...FADE_UP(0.35 + i * 0.05)}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.projectRowTop}>
                      <span className={styles.projectName}>{p.name}</span>
                      <span className={styles.projectPct} style={{ color: pColor }}>{pct}%</span>
                    </div>
                    <ProgressBar percent={pct} color={pColor} delay={0.4 + i * 0.08} />
                    <div className={styles.projectRowBottom}>
                      <span className={styles.projectSub}>{completedCount} of {taskCount} tasks</span>
                      <div className={styles.memberStack}>
                        {(p.members || []).slice(0, 3).map((m, idx) => {
                          const uid = typeof m === 'object' ? m.user : m;
                          const u = users.find(x => x.id === uid);
                          return <Avatar key={uid || idx} initials={u?.initials} color={u?.color} size="sm" title={u?.name} />;
                        })}
                        {(p.members?.length || 0) > 3 && (
                          <div className={styles.moreChip}>+{(p.members?.length || 0) - 3}</div>
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