import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MessageSquare, CheckCircle2, 
  Paperclip, FileText, Download, Send 
} from 'lucide-react';

// 1. Import your TanStack Query hooks
import { useTask, useUpdateTask } from '../../hooks/useTasks';
import { useProject } from '../../hooks/useProjects';
import { useComments, useCreateComment } from '../../hooks/useComments';
import { useAttachments } from '../../hooks/useAttachments'; // We will wire up upload later!

// Keeping users mock until a useUsers hook is built
import { users } from '../../lib/mockData';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../../lib/constants';
import { Avatar } from '../../components/shared';
import styles from './TaskDetail.module.css';

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  // 2. Fetch the Task
  const { data: task, isLoading: taskLoading, isError: taskError } = useTask(taskId);
  
  // 3. Dependent Queries: These wait for the task to load to get the projectId
  const projectId = task?.project; 
  const { data: project } = useProject(projectId);
  const { data: projectComments } = useComments(projectId);
  const { data: projectAttachments } = useAttachments(projectId);

  // 4. Initialize Mutations
  const createComment = useCreateComment();
  const updateTask = useUpdateTask();

  // Handle Loading/Error States
  if (taskLoading) {
    return <div className={styles.page}><div className={styles.emptyState}>Loading task details...</div></div>;
  }

  if (taskError || !task) {
    return <div className={styles.page}><div className={styles.emptyState}>Task not found or error loading.</div></div>;
  }

  // 5. Filter project-wide data for this specific task
  const attachments = (projectAttachments || []).filter(a => a.task === taskId);
  const comments = (projectComments || []).filter(c => c.task === taskId);

  // Data Translation
  const assigneeId = typeof task.assigned_to === 'object' ? task.assigned_to?.id : task.assigned_to;
  const assignee = users.find(u => u.id === assigneeId);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Finished';
  const priorityLevel = task.priority?.toLowerCase() || 'medium';

  // 6. Form Submission Handlers
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Execute the mutation
    createComment.mutate({
      projectId: projectId,
      data: {
        task: taskId,
        body: newComment
      }
    }, {
      onSuccess: () => {
        setNewComment(''); // Clear input only if successful
      }
    });
  };

  const handleMarkAsDone = () => {
    updateTask.mutate({
      id: taskId,
      status: 'Finished'
    });
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
            <div className={styles.projectLabel} onClick={() => navigate(`/projects/${projectId}`)}>
              <div className={styles.projectDot} style={{ background: project?.color || '#3b82f6' }} />
              {project?.name || 'Loading project...'}
            </div>
            {/* Displaying UUID cleanly is tough, so we slice the first 8 chars */}
            <span className={styles.taskId}>TSK-{task.id.slice(0,8).toUpperCase()}</span>
          </div>

          <h1 className={styles.title}>{task.title}</h1>
          
          <div className={styles.statusRow}>
            <span className={styles.statusPill} data-status={task.status?.toLowerCase()}>
              {task.status || 'Ongoing'}
            </span>
            <span className={styles.priorityPill} style={{ color: PRIORITY_COLOR[priorityLevel], background: PRIORITY_COLOR[priorityLevel] + '18' }}>
              {PRIORITY_LABEL[priorityLevel]}
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
                {attachments.map(att => {
                  // Extract filename from URL (e.g., /media/documents/123/file.pdf -> file.pdf)
                  const fileName = att.file?.split('/').pop() || 'Document';
                  
                  return (
                    <div key={att.id} className={styles.attachmentCard}>
                      <div className={styles.attachmentIcon}>
                        <FileText size={20} color="var(--teal)" />
                      </div>
                      <div className={styles.attachmentInfo}>
                        <span className={styles.attachmentName}>{fileName}</span>
                        <span className={styles.attachmentMeta}>
                          {new Date(att.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button className={styles.downloadBtn} onClick={() => window.open(att.file, '_blank')}>
                        <Download size={16} />
                      </button>
                    </div>
                  );
                })}
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
                  disabled={createComment.isPending}
                />
                <button 
                  type="submit" 
                  className={styles.sendBtn}
                  disabled={!newComment.trim() || createComment.isPending}
                >
                  <Send size={14} />
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className={styles.commentList}>
              {comments.map(comment => {
                const commentUser = users.find(u => u.id === comment.user);
                return (
                  <div key={comment.id} className={styles.commentRow}>
                    <Avatar initials={commentUser?.initials} color={commentUser?.color} size="md" />
                    <div className={styles.commentBody}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{commentUser?.name || 'Unknown User'}</span>
                        <span className={styles.commentTime}>
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.commentText}>
                        {comment.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar / Metadata */}
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
                <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}</span>
              </div>
            </div>

            <div className={styles.sidebarGroup}>
              <span className={styles.sidebarLabel}>Activity</span>
              <div className={styles.activityData}>
                <MessageSquare size={16} color="var(--text-muted)" />
                <span>{comments.length} Comments</span>
              </div>
            </div>

            {task.status?.toLowerCase() !== 'finished' && (
              <button 
                className={styles.completeBtn} 
                onClick={handleMarkAsDone}
                disabled={updateTask.isPending}
              >
                <CheckCircle2 size={16} /> 
                {updateTask.isPending ? 'Updating...' : 'Mark as Done'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}