import styles from './Avatar.module.css';

/**
 * Reusable avatar chip used for users throughout the app.
 * size: 'sm' | 'md' | 'lg'
 */
export function Avatar({ initials, color, size = 'md', title }) {
  return (
    <div
      className={`${styles.avatar} ${styles[size]}`}
      style={{ background: color + '22', color, border: `1px solid ${color}40` }}
      title={title}
    >
      {initials}
    </div>
  );
}
