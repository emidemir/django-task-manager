import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { PAGE_VARIANTS } from './lib/constants';
import styles from './App.module.css';

export default function App() {
  const location = useLocation();
  
  // Extract the current page from the URL (e.g., "/dashboard" becomes "dashboard")
  // We pass this to the Sidebar so it knows which item to highlight
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className={styles.app}>
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      
      <Sidebar activePage={activePage} />
      
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // Triggers the animation when the URL changes
            className={styles.pageWrapper}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* The Outlet renders whatever child route matches the current URL */}
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}