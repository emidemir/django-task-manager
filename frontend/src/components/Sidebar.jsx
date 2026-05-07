import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Bell,
  Settings, ChevronRight, Zap, Users, Plus
} from 'lucide-react';
import { projects, currentUser, notifications } from '../mockData';
import styles from './Sidebar.module.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <span className={styles.logoText}>TeamFlow</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
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

        <button
          className={`${styles.navItem} ${activePage === 'notifications' ? styles.active : ''}`}
          onClick={() => onNavigate('notifications')}
        >
          <Bell size={16} strokeWidth={activePage === 'notifications' ? 2.5 : 1.8} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
          {activePage === 'notifications' && (
            <motion.div className={styles.activeIndicator} layoutId="activeNav"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
        </button>
      </nav>

      {/* Projects */}
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
                <button key={project.id} className={styles.projectItem}
                  onClick={() => onNavigate('projects')}>
                  <span className={styles.projectDot} style={{ background: project.color }} />
                  <span className={styles.projectName}>{project.name}</span>
                  <span className={styles.projectCount}>
                    {project.completedCount}/{project.taskCount}
                  </span>
                </button>
              ))}
              <button className={styles.projectItem} style={{ opacity: 0.5 }}>
                <Plus size={12} />
                <span style={{ fontSize: 12 }}>New project</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User */}
      <div className={styles.userSection}>
        <button className={styles.navItem} onClick={() => onNavigate('settings')}>
          <Settings size={16} strokeWidth={1.8} />
          <span>Settings</span>
        </button>
        <div className={styles.userCard}>
          <div className={styles.avatar} style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}>
            {currentUser.initials}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{currentUser.name}</span>
            <span className={styles.userRole}>{currentUser.role}</span>
          </div>
          <div className={styles.onlineDot} />
        </div>
      </div>
    </aside>
  );
}