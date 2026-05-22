import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MessageSquare, CheckCircle2, 
  Paperclip, FileText, Download, Send 
} from 'lucide-react';
import { tasks, projects, users } from '../../lib/mockData';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../../lib/constants';
import { Avatar } from '../../components/shared';
import styles from './TaskDetail.module.css';

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return <div className={styles.page}><div className={styles.emptyState}>Task not found.</div></div>;
  }

  const project = projects.find(p => p.id === task.projectId);
  const assignee = users.find(u => u.id === task.assigneeId);
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

  // Fallback mock data matching your Django models if not present in mockData.js
  const attachments = task.attachments || [
    { id: '1', file: 'schema_design.pdf', size: '2.4 MB', uploaded_by: assignee, uploaded_at: '2 hours ago' },
    { id: '2', file: 'error_logs.txt', size: '14 KB', uploaded_by: assignee, uploaded_at: 'Yesterday' }
  ];

  const comments = task.comments || [
    { id: '1', user: assignee, body: 'I just uploaded the initial schema design. Can you take a look?', created_at: '2 hours ago' }
  ];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // TODO: Send to Django backend
    setNewComment('');
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className={styles.layout}>
        {/* Main Content Area */}
        <div className={styles.mainContent}>
          <div className={styles.headerMeta}>
            <div className={styles.projectLabel} onClick={() => navigate(`/projects/${project?.id}`)}>
              <div className={styles.projectDot} style={{ background: project?.color }} />
              {project?.name}
            </div>
            <span className={styles.taskId}>TSK-{task.id.slice(0,4).toUpperCase()}</span>
          </div>

          <h1 className={styles.title}>{task.title}</h1>
          
          <div className={styles.statusRow}>
            <span className={styles.statusPill} data-status={task.status}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={styles.priorityPill} style={{ color: PRIORITY_COLOR[task.priority], background: PRIORITY_COLOR[task.priority] + '18' }}>
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>

          {/* Description Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <div className={styles.description}>
              {task.description || "No description provided."}
            </div>
          </div>

          {/* Attachments Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Attachments</h3>
              <button className={styles.actionBtn}>
                <Paperclip size={14} /> Add File
              </button>
            </div>
            {attachments.length > 0 ? (
              <div className={styles.attachmentGrid}>
                {attachments.map(att => (
                  <div key={att.id} className={styles.attachmentCard}>
                    <div className={styles.attachmentIcon}>
                      <FileText size={20} color="var(--teal)" />
                    </div>
                    <div className={styles.attachmentInfo}>
                      <span className={styles.attachmentName}>{att.file}</span>
                      <span className={styles.attachmentMeta}>{att.size} · {att.uploaded_at}</span>
                    </div>
                    <button className={styles.downloadBtn}>
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyBlock}>No attachments yet.</div>
            )}
          </div>

          <div className={styles.divider} />

          {/* Comments Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Activity</h3>
            
            {/* Comment Input */}
            <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
              <Avatar initials="You" color="var(--sky)" size="md" />
              <div className={styles.commentInputWrapper}>
                <textarea 
                  className={styles.commentInput} 
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={1}
                />
                <button 
                  type="submit" 
                  className={styles.sendBtn}
                  disabled={!newComment.trim()}
                >
                  <Send size={14} />
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className={styles.commentList}>
              {comments.map(comment => (
                <div key={comment.id} className={styles.commentRow}>
                  <Avatar initials={comment.user?.initials} color={comment.user?.color} size="md" />
                  <div className={styles.commentBody}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.user?.name || 'Unknown User'}</span>
                      <span className={styles.commentTime}>{comment.created_at}</span>
                    </div>
                    <div className={styles.commentText}>
                      {comment.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Metadata (Remains mostly the same) */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarGroup}>
              <span className={styles.sidebarLabel}>Assignee</span>
              <div className={styles.assigneeData}>
                <Avatar initials={assignee?.initials} color={assignee?.color} size="md" />
                <span>{assignee?.name || "Unassigned"}</span>
              </div>
            </div>

            <div className={styles.sidebarGroup}>
              <span className={styles.sidebarLabel}>Due Date</span>
              <div className={styles.dateData} style={{ color: isOverdue ? 'var(--rose)' : 'var(--text-primary)' }}>
                <Clock size={16} />
                <span>{task.dueDate}</span>
              </div>
            </div>

            <div className={styles.sidebarGroup}>
              <span className={styles.sidebarLabel}>Activity</span>
              <div className={styles.activityData}>
                <MessageSquare size={16} color="var(--text-muted)" />
                <span>{comments.length} Comments</span>
              </div>
            </div>

            {task.status !== 'done' && (
              <button className={styles.completeBtn}>
                <CheckCircle2 size={16} /> Mark as Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}