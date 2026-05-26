import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Bell,
  Settings, ChevronRight, Zap, Users, Plus, LogOut
} from 'lucide-react';
import { projects } from '../../lib/mockData';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext'; // 2. Import your AuthContext
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'projects',      label: 'Projects',       icon: FolderKanban },
  { id: 'tasks',         label: 'My Tasks',       icon: CheckSquare },
  { id: 'team',          label: 'Team',           icon: Users },
];

export function Sidebar({ activePage }) { // Removed onNavigate prop
  const navigate = useNavigate(); // Initialize navigation
  const [projectsOpen, setProjectsOpen] = useState(true);
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth(); // Grab the real user and logout function

  // Safely extract initials (e.g., "Alex Carter" -> "AC")
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split('-');
    return names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Send back to login screen
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <span className={styles.logoText}>Hira</span>
      </div>

      {/* Primary nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => navigate(`/${item.id}`)} // Use navigate here
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  className={styles.activeIndicator}
                  layoutId="activeNav"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}

        {/* Notifications — separated so badge logic is contained */}
        <button
          className={`${styles.navItem} ${activePage === 'notifications' ? styles.active : ''}`}
          onClick={() => navigate('/notifications')} // Use navigate here
        >
          <Bell size={16} strokeWidth={activePage === 'notifications' ? 2.5 : 1.8} />
          <span>Notifications</span>
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          {activePage === 'notifications' && (
            <motion.div
              className={styles.activeIndicator}
              layoutId="activeNav"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      </nav>

      {/* Projects list */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => setProjectsOpen(p => !p)}
        >
          <span className={styles.sectionLabel}>Projects</span>
          <motion.div animate={{ rotate: projectsOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={13} />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {projectsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {projects.map((project) => (
                <button
                  key={project.id}
                  className={styles.projectItem}
                  onClick={() => navigate('/projects')} // Use navigate here
                >
                  <span className={styles.projectDot} style={{ background: project.color }} />
                  <span className={styles.projectName}>{project.name}</span>
                  <span className={styles.projectCount}>
                    {project.completedCount}/{project.taskCount}
                  </span>
                </button>
              ))}
              <button className={styles.projectItem} style={{ opacity: 0.5 }} onClick={() => navigate('/projects/new')}>
                <Plus size={12} />
                <span style={{ fontSize: 12 }}>New project</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User + settings */}
      <div className={styles.userSection}>
        <button className={styles.navItem} onClick={() => navigate('/settings')}>
          <Settings size={16} strokeWidth={1.8} />
          <span>Settings</span>
        </button>
        
        {/* Dynamic User Profile Card */}
        <div className={styles.userCard}>
          <div
            className={styles.avatar}
            style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
          >
            {getInitials(user?.username)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{`${user?.first_name} ${user?.last_name}` || 'User'}</span>
            <span className={styles.userRole}>{user?.email || 'Member'}</span>
          </div>
          <button 
            onClick={handleLogout} 
            title="Log out"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}