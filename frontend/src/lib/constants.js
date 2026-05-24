// Priority
export const PRIORITY_COLOR = {
  urgent: 'var(--rose)',
  high: 'var(--amber)',
  medium: 'var(--sky)',
  low: 'var(--text-muted)',
};

export const PRIORITY_LABEL = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

// Task status
export const STATUS_LABEL = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const STATUS_COLOR = {
  todo: 'var(--text-muted)',
  in_progress: 'var(--sky)',
  done: 'var(--teal)',
};

// Project status
export const PROJECT_STATUS = {
  active:   { label: 'Active',    color: 'var(--teal)' },
  paused:   { label: 'Paused',   color: 'var(--amber)' },
  planning: { label: 'Planning', color: 'var(--violet)' },
};

// Notification types
export const NOTIF_COLOR = {
  task_assigned: 'var(--teal)',
  comment_added: 'var(--violet)',
  task_done:     'var(--sky)',
};

export const NOTIF_LABEL = {
  task_assigned: 'Assignment',
  comment_added: 'Comment',
  task_done:     'Completed',
};

// Page animation variants (framer-motion)
export const PAGE_VARIANTS = {
  initial:  { opacity: 0, x: 12 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, x: -8, transition: { duration: 0.18 } },
};

export const FADE_UP = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});
