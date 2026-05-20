import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Brought in your AuthContext
import { users, tasks, projects } from '../../lib/mockData';
import { PageHeader, Avatar } from '../../components/shared';
import styles from './Team.module.css';

export default function Team() {
  const { user } = useAuth(); // Pull the user from context
  
  // Personalize the title based on the logged-in user
  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const pageTitle = firstName ? `${firstName}'s Team` : 'Your Team';

  return (
    <div className={styles.page}>
      <PageHeader
        title={pageTitle}
        subtitle={`${users.length} members · all online`}
      />

      <div className={styles.grid}>
        {users.map((userMock, i) => {
          // Renamed mapping variable to 'userMock' to avoid clashing with the 'user' from context
          const userTasks    = tasks.filter(t => t.assigneeId === userMock.id);
          const inProgress   = userTasks.filter(t => t.status === 'in_progress').length;
          const done         = userTasks.filter(t => t.status === 'done').length;
          const userProjects = projects.filter(p => p.members.includes(userMock.id));

          return (
            <motion.div
              key={userMock.id}
              className={styles.card}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
            >
              <div className={styles.cardGlow} style={{ background: userMock.color }} />
              <Avatar initials={userMock.initials} color={userMock.color} size="lg" />

              <div className={styles.userInfo}>
                <div className={styles.userName}>{userMock.name}</div>
                <div className={styles.userRole}>{userMock.role}</div>
              </div>

              <div className={styles.statRow}>
                <div className={styles.statBlock}>
                  <span className={styles.statNum} style={{ color: 'var(--sky)' }}>{inProgress}</span>
                  <span className={styles.statLbl}>In progress</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statBlock}>
                  <span className={styles.statNum} style={{ color: 'var(--teal)' }}>{done}</span>
                  <span className={styles.statLbl}>Completed</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statBlock}>
                  <span className={styles.statNum} style={{ color: userMock.color }}>{userProjects.length}</span>
                  <span className={styles.statLbl}>Projects</span>
                </div>
              </div>

              <div className={styles.projects}>
                {userProjects.map(p => (
                  <span
                    key={p.id}
                    className={styles.projectTag}
                    style={{ color: p.color, background: p.color + '14', borderColor: p.color + '30' }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>

              <div className={styles.onlineRow}>
                <Activity size={11} color="var(--teal)" />
                <span className={styles.onlineTxt}>Online now</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}