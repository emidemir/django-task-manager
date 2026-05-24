import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { PAGE_VARIANTS } from './lib/constants';
import { socketManager } from './lib/socket';
import { useAuth } from './contexts/AuthContext';
import { taskKeys } from './hooks/useTasks';
import { projectKeys } from './hooks/useProjects';
import { notificationKeys } from './hooks/useNotifications';
import styles from './App.module.css';

export default function App() {
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    // Connect with the user's auth token
    socketManager.connect(user.token);

    // --- Wire up invalidations ---

    const unsubs = [

      // A task was created, updated, or deleted
      socketManager.on('task.created', () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),

      socketManager.on('task.updated', ({ taskId }) => {
        // Invalidate the specific task detail AND the list
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),

      socketManager.on('task.deleted', () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),

      // Project progress changed (e.g. a task moved to done)
      socketManager.on('project.updated', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.all() });
      }),

      // Someone sent this user a notification
      socketManager.on('notification.new', () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      }),

    ];

    // Cleanup: unsubscribe all listeners and close socket on logout/unmount
    return () => {
      unsubs.forEach(fn => fn());
      socketManager.disconnect();
    };
  }, [user.token, queryClient]);

  return (
    <div className={styles.app}>
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <Sidebar activePage={activePage} />
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className={styles.pageWrapper}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}