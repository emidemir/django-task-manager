import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Users, CheckCircle2, Calendar, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// 1. Import your new TanStack Query hook
import { useProjects } from '../../hooks/useProjects'; 

// Keep users mock ONLY if you haven't built a useUsers hook yet
import { users } from '../../lib/mockData'; 
import { PROJECT_STATUS } from '../../lib/constants';
import { calcPercent } from '../../lib/utils';
import { PageHeader, Avatar, ProgressBar } from '../../components/shared';
import styles from './Projects.module.css';

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 2. Call the hook to fetch data from Django!
  const { data: projectsList, isLoading, isError } = useProjects();

  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const pageTitle = firstName ? `${firstName}'s Projects` : 'Projects';

  // 3. Handle Loading State
  if (isLoading) {
    return (
      <div className={styles.page}>
        <PageHeader title={pageTitle} subtitle="Loading projects..." />
        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
          Fetching your workspace...
        </div>
      </div>
    );
  }

  // 4. Handle Error State
  if (isError) {
    return (
      <div className={styles.page}>
        <PageHeader title={pageTitle} subtitle="Error" />
        <div style={{ padding: '2rem', color: 'var(--rose)' }}>
          Failed to connect to the server. Please try again.
        </div>
      </div>
    );
  }

  // Fallback to empty array just in case
  const safeProjects = projectsList || [];
  // Match Django's status ('Ongoing') instead of the mock data's 'active'
  const activeCount = safeProjects.filter(p => p.status === 'Ongoing').length;

  return (
    <div className={styles.page}>
      <PageHeader
        title={pageTitle}
        subtitle={`${safeProjects.length} projects · ${activeCount} active`}
        actions={
          <button className={styles.addBtn}>
            <Plus size={15} strokeWidth={2.5} /> New project
          </button>
        }
      />

      <div className={styles.grid}>
        {safeProjects.map((project, i) => {
          // 5. Data Translation: Safely handle Django's nested data
          const taskCount = project.tasks?.length || 0;
          const completedCount = project.tasks?.filter(t => t.status === 'Finished').length || 0;
          const pct = calcPercent(completedCount, taskCount);
          
          // Match your constants. If PROJECT_STATUS expects lowercase, use toLowerCase()
          const status = PROJECT_STATUS[project.status?.toLowerCase()] || PROJECT_STATUS['ongoing'];
          
          // Fallback color since Django doesn't store one (yet)
          const projectColor = project.color || '#3b82f6'; 

          // Safely map members if Django returns an array of member objects
          const memberUsers = (project.members || []).map(m => {
            // Adjust this line based on how your DRF serializer returns members!
            const userId = typeof m === 'object' ? m.user : m; 
            return users.find(u => u.id === userId);
          }).filter(Boolean);

          return (
            <motion.div
              key={project.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
            >
              <div className={styles.colorBar} style={{ background: projectColor }} />

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div
                    className={styles.projectIcon}
                    style={{ background: projectColor + '18', border: `1px solid ${projectColor}30` }}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: projectColor }} />
                  </div>
                  <span
                    className={styles.statusBadge}
                    style={{ color: status?.color || '#ccc', background: (status?.color || '#ccc') + '15' }}
                  >
                    {status?.label || project.status}
                  </span>
                </div>

                <h3 className={styles.projectName}>{project.name}</h3>
                <p className={styles.projectDesc}>{project.description}</p>

                <div className={styles.progressSection}>
                  <div className={styles.progressTop}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={styles.progressPct} style={{ color: projectColor }}>{pct}%</span>
                  </div>
                  <ProgressBar
                    percent={pct}
                    color={`linear-gradient(90deg, ${projectColor}, ${projectColor}aa)`}
                    delay={i * 0.07 + 0.3}
                  />
                </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <CheckCircle2 size={13} color={projectColor} />
                    <span>{completedCount}/{taskCount} tasks</span>
                  </div>
                  <div className={styles.stat}>
                    <Calendar size={13} color="var(--text-muted)" />
                    {/* Format Django's ISO date string cleanly */}
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.memberStack}>
                    {memberUsers.map((u, idx) => (
                      <Avatar key={u.id || idx} initials={u.initials} color={u.color} size="sm" title={u.name} />
                    ))}
                    <span className={styles.memberCount}>
                      <Users size={11} /> {project.members?.length || 0}
                    </span>
                  </div>
                  <button className={styles.openBtn} style={{ color: projectColor }} onClick={() => navigate('/projects/' + project.id)}>
                    Open <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.button
          className={styles.newCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: safeProjects.length * 0.07, duration: 0.4 }}
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
        >
          <Plus size={24} color="var(--text-muted)" />
          <span className={styles.newCardLabel}>New project</span>
        </motion.button>
      </div>
    </div>
  );
}