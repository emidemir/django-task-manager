import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Wifi, MessageSquare, UserCheck, CheckCircle2 } from 'lucide-react';
import { notifications as initialNotifs } from '../mockData';
import { formatDistanceToNow } from 'date-fns';
import styles from './Notifications.module.css';

const typeIcon = {
  task_assigned: UserCheck,
  comment_added: MessageSquare,
  task_done: CheckCircle2,
};

const typeColor = {
  task_assigned: 'var(--teal)',
  comment_added: 'var(--violet)',
  task_done: 'var(--sky)',
};

const typeLabel = {
  task_assigned: 'Assignment',
  comment_added: 'Comment',
  task_done: 'Completed',
};

// Simulate incoming WS notifications
const liveMessages = [
  { id: 'live1', type: 'comment_added', message: 'Priya commented on "File upload to S3"', actor: { initials: 'PM', color: '#8b5cf6', name: 'Priya Mehta' }, isRead: false },
  { id: 'live2', type: 'task_done', message: 'Sam marked "Slack webhook handler" as done', actor: { initials: 'SC', color: '#f43f5e', name: 'Sam Chen' }, isRead: false },
  { id: 'live3', type: 'task_assigned', message: 'Jordan assigned you to "Token audit"', actor: { initials: 'JL', color: '#f59e0b', name: 'Jordan Lee' }, isRead: false },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveQueue, setLiveQueue] = useState([]);
  const [wsLog, setWsLog] = useState([]);
  const [simIdx, setSimIdx] = useState(0);

  // Simulate WS connection
  useEffect(() => {
    const t = setTimeout(() => {
      setWsConnected(true);
      addLog('Connected to ws://api/ws/projects/p1/', 'connect');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const addLog = (msg, type) => {
    setWsLog(prev => [{ id: Date.now(), msg, type, time: new Date() }, ...prev].slice(0, 8));
  };

  const simulateIncoming = () => {
    if (simIdx >= liveMessages.length) return;
    const incoming = { ...liveMessages[simIdx], id: 'live_' + Date.now(), createdAt: new Date() };
    addLog(`← ${incoming.type}: "${incoming.message.slice(0, 40)}…"`, 'receive');
    setLiveQueue(q => [incoming, ...q]);
    setNotifs(prev => [incoming, ...prev]);
    setSimIdx(i => i + 1);
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setLiveQueue([]);
  };

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setLiveQueue(q => q.filter(n => n.id !== id));
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>{unread} unread · Real-time via WebSocket</p>
        </div>
        <div className={styles.headerActions}>
          {unread > 0 && (
            <button className={styles.markAllBtn} onClick={markAllRead}>
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button
            className={`${styles.simulateBtn} ${!wsConnected ? styles.disabled : ''}`}
            onClick={simulateIncoming}
            disabled={!wsConnected || simIdx >= liveMessages.length}
          >
            <Wifi size={14} />
            Simulate WS message
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Feed */}
        <div className={styles.feed}>
          <AnimatePresence mode="popLayout">
            {notifs.map((notif) => {
              const Icon = typeIcon[notif.type] || Bell;
              const isLive = liveQueue.some(n => n.id === notif.id);
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`${styles.notifCard} ${!notif.isRead ? styles.unread : ''} ${isLive ? styles.live : ''}`}
                  onClick={() => markRead(notif.id)}
                >
                  {isLive && <span className={styles.livePing} />}
                  <div className={styles.notifIcon}
                    style={{ background: typeColor[notif.type] + '18', color: typeColor[notif.type] }}>
                    <Icon size={15} strokeWidth={2} />
                  </div>
                  <div className={styles.notifBody}>
                    <div className={styles.notifTop}>
                      <span className={styles.notifType}
                        style={{ color: typeColor[notif.type] }}>{typeLabel[notif.type]}</span>
                      {!notif.isRead && <span className={styles.unreadDot} />}
                    </div>
                    <p className={styles.notifMessage}>{notif.message}</p>
                    <div className={styles.notifMeta}>
                      <div className={styles.notifActor}
                        style={{ background: notif.actor?.color + '20', color: notif.actor?.color }}>
                        {notif.actor?.initials}
                      </div>
                      <span className={styles.notifName}>{notif.actor?.name}</span>
                      <span className={styles.notifTime}>
                        · {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* WebSocket panel */}
        <div className={styles.wsPanel}>
          <div className={styles.wsPanelHeader}>
            <div className={styles.wsStatus}>
              <motion.div
                className={styles.wsIndicator}
                animate={{ scale: wsConnected ? [1, 1.3, 1] : 1, opacity: wsConnected ? 1 : 0.3 }}
                transition={{ repeat: wsConnected ? Infinity : 0, duration: 2 }}
                style={{ background: wsConnected ? 'var(--teal)' : 'var(--text-muted)' }}
              />
              <span style={{ color: wsConnected ? 'var(--teal)' : 'var(--text-muted)', fontSize: 12 }}>
                {wsConnected ? 'Connected' : 'Connecting…'}
              </span>
            </div>
            <span className={styles.wsPanelTitle}>WebSocket log</span>
          </div>

          <div className={styles.wsTerminal}>
            <AnimatePresence>
              {!wsConnected && (
                <motion.div className={styles.wsConnecting} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Establishing connection…
                </motion.div>
              )}
              {wsConnected && wsLog.length === 0 && (
                <div className={styles.wsEmpty}>Waiting for messages…</div>
              )}
              {wsLog.map(entry => (
                <motion.div
                  key={entry.id}
                  className={`${styles.wsEntry} ${styles[entry.type]}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={styles.wsEntryTime}>
                    {entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={styles.wsEntryMsg}>{entry.msg}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className={styles.wsInfo}>
            <div className={styles.wsInfoRow}>
              <span className={styles.wsInfoLabel}>Channel</span>
              <span className={styles.wsInfoVal}>project_p1</span>
            </div>
            <div className={styles.wsInfoRow}>
              <span className={styles.wsInfoLabel}>Protocol</span>
              <span className={styles.wsInfoVal}>Django Channels</span>
            </div>
            <div className={styles.wsInfoRow}>
              <span className={styles.wsInfoLabel}>Messages</span>
              <span className={styles.wsInfoVal}>{wsLog.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}