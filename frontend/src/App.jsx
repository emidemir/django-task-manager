import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './features/Dashboard';
import Tasks from './features/Tasks';
import Projects from './features/Projects';
import Notifications from './features/Notifications';
import Team from './features/Team';
import styles from './App.css';

const pages = { dashboard: Dashboard, tasks: Tasks, projects: Projects, notifications: Notifications, team: Team };

const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.18 } },
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = pages[activePage] || Dashboard;

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
            variants={pageVariants}
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