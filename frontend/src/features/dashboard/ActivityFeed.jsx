import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FADE_UP } from '../../lib/constants';
import { Avatar } from '../../components/shared/Avatar';
import styles from './ActivityFeed.module.css';

export function ActivityFeed({ items }) {
  return (
    <div className={styles.list}>
      {items.map((item, i) => (
        <motion.div key={item.id} className={styles.item} {...FADE_UP(0.3 + i * 0.06)}>
          <Avatar initials={item.actor.initials} color={item.actor.color} size="md" />
          <div className={styles.body}>
            <span className={styles.actor}>{item.actor.name}</span>
            <span className={styles.action}> {item.action} </span>
            <span className={styles.target}>"{item.target}"</span>
          </div>
          <span className={styles.time}>
            {formatDistanceToNow(item.time, { addSuffix: true })}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
