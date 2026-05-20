import { motion } from 'framer-motion';
import { FADE_UP } from '../../lib/constants';
import styles from './StatCard.module.css';

export function StatCard({ label, value, icon: Icon, color, bg, delta, delay = 0 }) {
  return (
    <motion.div className={styles.card} {...FADE_UP(delay)}>
      <div className={styles.top}>
        <div className={styles.icon} style={{ background: bg, color }}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <span className={styles.delta}>{delta}</span>
      </div>
      <div className={styles.value} style={{ color }}>{value}</div>
      <div className={styles.label}>{label}</div>
    </motion.div>
  );
}
