import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MessageSquare, CheckCircle2, 
  Paperclip, FileText, Download, Send 
} from 'lucide-react';

import { useTask, useUpdateTask } from '../../hooks/useTasks';
import { useProject } from '../../hooks/useProjects';
import { useComments, useCreateComment } from '../../hooks/useComments';
import { useProjectAttachments, useUploadAttachment } from '../../hooks/useAttachments';

import { Avatar } from '../../components/shared';
import styles from './TaskDetail.module.css';

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [newComment, setNewComment] = useState('');

  // Fetch task
  const { data: task, isLoading: taskLoading, isError: taskError } = useTask(taskId);

  const projectId = task?.project;
  const { data: project } = useProject(projectId);
  const { data: projectComments } = useComments(projectId);
  const { data: projectAttachments } = useProjectAttachments(projectId);

  const createComment = useCreateComment();
  const updateTask = useUpdateTask();
  const uploadAttachment = useUploadAttachment();

  if (taskLoading) {
    return <div className={styles.page}><div className={styles.emptyState}>Loading task details...</div></div>;
  }

  if (taskError || !task) {
    return <div className={styles.page}><div className={styles.emptyState}>Task not found or error loading.</div></div>;
  }

  const attachments = (projectAttachments || []).filter(a => a.task === taskId);
  const comments = (projectComments || []).filter(c => c.task === taskId);

  const assigneeId = typeof task.assigned_to === 'object' ? task.assigned_to?.id : task.assigned_to;
  const assignee = task.assigned_to;

  const assigneeName = assignee 
  ? `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || assignee.username 
  : "Unassigned";
  
  const assigneeInitials = assigneeName !== "Unassigned" 
  ? assigneeName.substring(0, 2).toUpperCase() 
  : "?";


  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Finished';

  // -------------------------
  // Comment submit
  // -------------------------
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createComment.mutate({
      projectId,
      data: {
        task: taskId,
        body: newComment
      }
    }, {
      onSuccess: () => setNewComment('')
    });
  };

  // -------------------------
  // Task complete
  // -------------------------
  const handleMarkAsDone = () => {
    updateTask.mutate({
      id: taskId,
      status: 'Finished'
    });
  };

  // -------------------------
  // File upload handlers
  // -------------------------
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('task', taskId);
    formData.append('file', selectedFile);

    uploadAttachment.mutate(
      { projectId, formData },
      {
        onSuccess: () => {
          // Reset the input value so the user can upload the same file again if they delete it
          e.target.value = '';
        },
        onError: (error) => {
          console.error("Upload Failed:", error);
          alert("File upload failed. Check console for details.");
          e.target.value = '';
        }
      }
    );
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className={styles.layout}>
        <div className={styles.mainContent}>

          {/* HEADER */}
          <div className={styles.headerMeta}>
            <div className={styles.projectLabel} onClick={() => navigate(`/projects/${projectId}`)}>
              <div className={styles.projectDot} style={{ background: project?.color || '#3b82f6' }} />
              {project?.name || 'Loading project...'}
            </div>
            <span className={styles.taskId}>TSK-{task.id.slice(0,8).toUpperCase()}</span>
          </div>

          <h1 className={styles.title}>{task.title}</h1>

          {/* ATTACHMENTS */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Attachments</h3>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="fileUploadInput"
                  disabled={uploadAttachment.isPending}
                />

                <label 
                  htmlFor="fileUploadInput" 
                  className={styles.actionBtn}
                  style={{ 
                    opacity: uploadAttachment.isPending ? 0.7 : 1, 
                    cursor: uploadAttachment.isPending ? 'not-allowed' : 'pointer' 
                  }}
                >
                  <Paperclip size={14} /> 
                  {uploadAttachment.isPending ? 'Uploading...' : 'Upload File'}
                </label>
              </div>
            </div>

            {attachments.length > 0 ? (
              <div className={styles.attachmentGrid}>
                {attachments.map(att => {
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
                      <button
                        className={styles.downloadBtn}
                        onClick={() => window.open(att.file, '_blank')}
                      >
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

          {/* COMMENTS */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Activity</h3>

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

            <div className={styles.commentList}>
              {comments.map(comment => {
                // The user is now a real object attached to the comment from the backend!
                const commentUser = comment.user;
                
                // Safely format the display name
                const displayName = commentUser 
                  ? `${commentUser.first_name || ''} ${commentUser.last_name || ''}`.trim() || commentUser.username 
                  : 'Unknown User';

                // Grab the first letter for the Avatar
                const userInitials = displayName.substring(0, 2).toUpperCase();

                return (
                  <div key={comment.id} className={styles.commentRow}>
                    <Avatar
                      initials={userInitials}
                      color="var(--indigo)" // You can randomize this or pass a real color if you add it to the user model later
                      size="md"
                    />
                    <div className={styles.commentBody}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>
                          {displayName}
                        </span>
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

        {/* SIDEBAR */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
          <div className={styles.sidebarGroup}>
           <span className={styles.sidebarLabel}>Assignee</span>
           <div className={styles.assigneeData}>
             {/* Use the new variables here */}
             <Avatar initials={assigneeInitials} color="var(--sky)" size="md" />
             <span>{assigneeName}</span>
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