import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import Dashboard     from './features/dashboard/Dashboard';
import Tasks         from './features/tasks/Tasks';
import Projects      from './features/projects/Projects';
import Notifications from './features/notifications/Notifications';
import Team          from './features/team/Team';
import { PAGE_VARIANTS } from './lib/constants';
import styles from './App.module.css';

const PAGES = {
  dashboard:     Dashboard,
  tasks:         Tasks,
  projects:      Projects,
  notifications: Notifications,
  team:          Team,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <div className={styles.app}>
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            className={styles.pageWrapper}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PageComponent onNavigate={setActivePage} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
