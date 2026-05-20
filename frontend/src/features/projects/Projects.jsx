import { motion } from 'framer-motion';
import { Plus, Users, CheckCircle2, Calendar, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Brought in your AuthContext
import { projects, users } from '../../lib/mockData';
import { PROJECT_STATUS } from '../../lib/constants';
import { calcPercent } from '../../lib/utils';
import { PageHeader, Avatar, ProgressBar } from '../../components/shared';
import styles from './Projects.module.css';

export default function Projects() {
  const { user } = useAuth(); // Pull the user from context
  
  // Personalize the title based on the logged-in user
  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const pageTitle = firstName ? `${firstName}'s Projects` : 'Projects';

  return (
    <div className={styles.page}>
      <PageHeader
        title={pageTitle}
        subtitle={`${projects.length} projects · ${projects.filter(p => p.status === 'active').length} active`}
        actions={
          <button className={styles.addBtn}>
            <Plus size={15} strokeWidth={2.5} /> New project
          </button>
        }
      />

      <div className={styles.grid}>
        {projects.map((project, i) => {
          const pct = calcPercent(project.completedCount, project.taskCount);
          const status = PROJECT_STATUS[project.status];
          const memberUsers = project.members.map(id => users.find(u => u.id === id)).filter(Boolean);

          return (
            <motion.div
              key={project.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
            >
              <div className={styles.colorBar} style={{ background: project.color }} />

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div
                    className={styles.projectIcon}
                    style={{ background: project.color + '18', border: `1px solid ${project.color}30` }}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: project.color }} />
                  </div>
                  <span
                    className={styles.statusBadge}
                    style={{ color: status.color, background: status.color + '15' }}
                  >
                    {status.label}
                  </span>
                </div>

                <h3 className={styles.projectName}>{project.name}</h3>
                <p className={styles.projectDesc}>{project.description}</p>

                <div className={styles.progressSection}>
                  <div className={styles.progressTop}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={styles.progressPct} style={{ color: project.color }}>{pct}%</span>
                  </div>
                  <ProgressBar
                    percent={pct}
                    color={`linear-gradient(90deg, ${project.color}, ${project.color}aa)`}
                    delay={i * 0.07 + 0.3}
                  />
                </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <CheckCircle2 size={13} color={project.color} />
                    <span>{project.completedCount}/{project.taskCount} tasks</span>
                  </div>
                  <div className={styles.stat}>
                    <Calendar size={13} color="var(--text-muted)" />
                    <span>{project.dueDate}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.memberStack}>
                    {memberUsers.map(u => (
                      <Avatar key={u.id} initials={u.initials} color={u.color} size="sm" title={u.name} />
                    ))}
                    <span className={styles.memberCount}>
                      <Users size={11} /> {project.members.length}
                    </span>
                  </div>
                  <button className={styles.openBtn} style={{ color: project.color }}>
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
          transition={{ delay: projects.length * 0.07, duration: 0.4 }}
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
        >
          <Plus size={24} color="var(--text-muted)" />
          <span className={styles.newCardLabel}>New project</span>
        </motion.button>
      </div>
    </div>
  );
}