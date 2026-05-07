import { motion } from 'framer-motion';
import { Plus, Users, CheckCircle2, Calendar, ArrowUpRight } from 'lucide-react';
import { projects, users } from '../mockData';
import styles from './Projects.module.css';

const statusConfig = {
  active: { label: 'Active', color: 'var(--teal)' },
  paused: { label: 'Paused', color: 'var(--amber)' },
  planning: { label: 'Planning', color: 'var(--violet)' },
};

export default function Projects({ onNavigate }) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>{projects.length} projects · {projects.filter(p => p.status === 'active').length} active</p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={15} strokeWidth={2.5} />
          New project
        </button>
      </div>

      <div className={styles.grid}>
        {projects.map((project, i) => {
          const pct = Math.round((project.completedCount / project.taskCount) * 100);
          const status = statusConfig[project.status];
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
              {/* Color bar */}
              <div className={styles.colorBar} style={{ background: project.color }} />

              <div className={styles.cardBody}>
                {/* Top */}
                <div className={styles.cardTop}>
                  <div className={styles.projectIcon} style={{ background: project.color + '18', border: `1px solid ${project.color}30` }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: project.color }} />
                  </div>
                  <span className={styles.statusBadge}
                    style={{ color: status.color, background: status.color + '15' }}>
                    {status.label}
                  </span>
                </div>

                <h3 className={styles.projectName}>{project.name}</h3>
                <p className={styles.projectDesc}>{project.description}</p>

                {/* Progress */}
                <div className={styles.progressSection}>
                  <div className={styles.progressTop}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={styles.progressPct} style={{ color: project.color }}>{pct}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <motion.div
                      className={styles.progressFill}
                      style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}aa)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Stats */}
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

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.memberStack}>
                    {memberUsers.map(u => (
                      <div key={u.id} className={styles.memberAvatar}
                        style={{ background: u.color + '22', color: u.color, borderColor: u.color + '40' }}
                        title={u.name}>
                        {u.initials}
                      </div>
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

        {/* New project card */}
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