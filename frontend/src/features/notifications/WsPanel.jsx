import { motion, AnimatePresence } from 'framer-motion';
import styles from './WsPanel.module.css';

export function WsPanel({ wsConnected, wsLog }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.status}>
          <motion.div
            className={styles.indicator}
            animate={{ scale: wsConnected ? [1, 1.3, 1] : 1, opacity: wsConnected ? 1 : 0.3 }}
            transition={{ repeat: wsConnected ? Infinity : 0, duration: 2 }}
            style={{ background: wsConnected ? 'var(--teal)' : 'var(--text-muted)' }}
          />
          <span style={{ color: wsConnected ? 'var(--teal)' : 'var(--text-muted)', fontSize: 12 }}>
            {wsConnected ? 'Connected' : 'Connecting…'}
          </span>
        </div>
        <span className={styles.title}>WebSocket log</span>
      </div>

      <div className={styles.terminal}>
        <AnimatePresence>
          {!wsConnected && (
            <motion.div className={styles.placeholder} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Establishing connection…
            </motion.div>
          )}
          {wsConnected && wsLog.length === 0 && (
            <div className={styles.placeholder}>Waiting for messages…</div>
          )}
          {wsLog.map(entry => (
            <motion.div
              key={entry.id}
              className={`${styles.entry} ${styles[entry.type]}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.entryTime}>
                {entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={styles.entryMsg}>{entry.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={styles.info}>
        {[
          { label: 'Channel',  val: 'project_p1' },
          { label: 'Protocol', val: 'Django Channels' },
          { label: 'Messages', val: wsLog.length },
        ].map(row => (
          <div key={row.label} className={styles.infoRow}>
            <span className={styles.infoLabel}>{row.label}</span>
            <span className={styles.infoVal}>{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
