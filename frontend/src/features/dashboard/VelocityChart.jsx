import { motion } from 'framer-motion';
import styles from './VelocityChart.module.css';

export function VelocityChart({ days }) {
  const max = Math.max(...days.map(d => d.count));
  return (
    <div className={styles.chart}>
      {days.map((d, i) => (
        <div key={d.day} className={styles.col}>
          <motion.div
            className={styles.bar}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: `${(d.count / max) * 100}%` }}
          />
          <span className={styles.label}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}
