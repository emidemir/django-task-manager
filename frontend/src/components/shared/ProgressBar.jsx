import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export function ProgressBar({ percent, color, delay = 0 }) {
  return (
    <div className={styles.track}>
      <motion.div
        className={styles.fill}
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
