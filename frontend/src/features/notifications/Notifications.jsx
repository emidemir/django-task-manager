import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Wifi, MessageSquare, UserCheck, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext'; // Brought in your AuthContext
import { NOTIF_COLOR, NOTIF_LABEL } from '../../lib/constants';
import { useNotifications } from '../../hooks/useNotifications';
import { PageHeader, Avatar } from '../../components/shared';
import { WsPanel } from './WsPanel';
import styles from './Notifications.module.css';

const TYPE_ICON = {
  task_assigned: UserCheck,
  comment_added: MessageSquare,
  task_done:     CheckCircle2,
};

export default function Notifications() {
  const { user } = useAuth(); // Pull the user from context
  
  const {
    notifs, unreadCount, liveQueue, wsConnected, wsLog,
    canSimulate, simulateIncoming, markAllRead, markRead,
  } = useNotifications();

  // Personalize the title based on the logged-in user
  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const pageTitle = firstName ? `${firstName}'s Notifications` : 'Notifications';

  return (
    <div className={styles.page}>
      <PageHeader
        title={pageTitle}
        subtitle={`${unreadCount} unread · Real-time via WebSocket`}
        actions={
          <>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button
              className={`${styles.simulateBtn} ${!canSimulate ? styles.disabled : ''}`}
              onClick={simulateIncoming}
              disabled={!canSimulate}
            >
              <Wifi size={14} /> Simulate WS message
            </button>
          </>
        }
      />

      <div className={styles.layout}>
        {/* Feed */}
        <div className={styles.feed}>
          <AnimatePresence mode="popLayout">
            {notifs.map((notif) => {
              const Icon   = TYPE_ICON[notif.type] || Bell;
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
                  <div
                    className={styles.notifIcon}
                    style={{ background: NOTIF_COLOR[notif.type] + '18', color: NOTIF_COLOR[notif.type] }}
                  >
                    <Icon size={15} strokeWidth={2} />
                  </div>
                  <div className={styles.notifBody}>
                    <div className={styles.notifTop}>
                      <span className={styles.notifType} style={{ color: NOTIF_COLOR[notif.type] }}>
                        {NOTIF_LABEL[notif.type]}
                      </span>
                      {!notif.isRead && <span className={styles.unreadDot} />}
                    </div>
                    <p className={styles.notifMessage}>{notif.message}</p>
                    <div className={styles.notifMeta}>
                      <Avatar initials={notif.actor?.initials} color={notif.actor?.color} size="sm" />
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

        <WsPanel wsConnected={wsConnected} wsLog={wsLog} />
      </div>
    </div>
  );
}