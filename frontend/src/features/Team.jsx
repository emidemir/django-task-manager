import { motion } from 'framer-motion';
import { Mail, Shield, Activity } from 'lucide-react';
import { users, tasks, projects } from '../mockData';
import styles from './Team.module.css';

export default function Team() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Team</h1>
          <p className={styles.subtitle}>{users.length} members · all online</p>
        </div>
      </div>

      <div className={styles.grid}>
        {users.map((user, i) => {
          const userTasks = tasks.filter(t => t.assigneeId === user.id);
          const inProgress = userTasks.filter(t => t.status === 'in_progress').length;
          const done = userTasks.filter(t => t.status === 'done').length;
          const userProjects = projects.filter(p => p.members.includes(user.id));

          return (
            <motion.div
              key={user.id}
              className={styles.card}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
            >
              <div className={styles.cardGlow} style={{ background: user.color }} />
              <div className={styles.avatarLarge}
                style={{ background: user.color + '20', color: user.color, border: `2px solid ${user.color}40` }}>
                {user.initials}
              </div>

              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userRole}>{user.role}</div>
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
                  <span className={styles.statNum} style={{ color: user.color }}>{userProjects.length}</span>
                  <span className={styles.statLbl}>Projects</span>
                </div>
              </div>

              <div className={styles.projects}>
                {userProjects.map(p => (
                  <span key={p.id} className={styles.projectTag} style={{ color: p.color, background: p.color + '14', borderColor: p.color + '30' }}>
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