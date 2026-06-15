import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

import { Sidebar } from './components/layout/Sidebar';
import { PAGE_VARIANTS } from './lib/constants';
import { socketManager } from './lib/socket';
import { useAuth } from './contexts/AuthContext';
import styles from './App.module.css';

// --- Query Keys ---
import { taskKeys } from './hooks/useTasks';
import { projectKeys } from './hooks/useProjects';
// import { notificationKeys } from './hooks/useNotifications';
import { commentKeys } from './hooks/useComments';
import { attachmentKeys } from './hooks/useAttachments';
import { memberKeys } from './hooks/useProjectMembers';

export default function App() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (isAuthenticated && token) {
      socketManager.connect(token);
    }

    // --- Wire up real-time invalidations ---  
    const unsubs = [
      // Tasks
      socketManager.on('task.created', () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),
      socketManager.on('task.updated', ({ taskId }) => {
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),
      socketManager.on('task.deleted', () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),

      // Projects
      socketManager.on('project.created', () => {
        queryClient.invalidateQueries({ queryKey: projectKeys.all() });
      }),
      socketManager.on('project.updated', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.all() });
      }),
      socketManager.on('project.deleted', () => {
        queryClient.invalidateQueries({ queryKey: projectKeys.all() });
      }),

      // Comments (Requires payload to include projectId)
      socketManager.on('comment.created', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: commentKeys.list(projectId) });
      }),
      socketManager.on('comment.deleted', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: commentKeys.list(projectId) });
      }),

      // Attachments (Requires payload to include projectId)
      socketManager.on('attachment.uploaded', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: attachmentKeys.list(projectId) });
      }),
      socketManager.on('attachment.deleted', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: attachmentKeys.list(projectId) });
      }),

      // Project Members (Requires payload to include projectId)
      socketManager.on('member.added', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) }); // To update member counts
        queryClient.invalidateQueries({ queryKey: projectKeys.all() });
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),
      socketManager.on('member.removed', ({ projectId }) => {
        queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.all() });
        queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      }),

      // // Notifications
      // socketManager.on('notification.new', () => {
      //   queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      // }),
    ];

    // Cleanup: unsubscribe all listeners and close socket on logout/unmount
    return () => {
      unsubs.forEach(fn => fn());
      socketManager.disconnect();
    };
  }, [user?.token, queryClient]);

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