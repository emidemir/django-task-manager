import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/shared';

// Import only the hooks we actually need
import { useCreateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useProjectMembers } from '../../hooks/useProjectMembers';

import { useAuth } from '../../contexts/AuthContext'

import styles from './CreateTask.module.css';

export default function CreateTask() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '', 
    assigneeId: '', 
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
  });

  // Fetch Base Data
  const { data: projectsList, isLoading: projectsLoading } = useProjects();
  const createTask = useCreateTask();

  const { user } = useAuth();
  
  // Dependent Query: Fetch members ONLY for the currently selected project
  const { data: membersList, isLoading: membersLoading } = useProjectMembers(formData.projectId);

  // Auto-select the first project on mount
  useEffect(() => {
    if (projectsList && projectsList.length > 0 && !formData.projectId) {
      setFormData(prev => ({ ...prev, projectId: projectsList[0].id }));
    }
  }, [projectsList, formData.projectId]);

  const safeProjects = projectsList || [];
  const safeMembers = membersList || [];

  // Safety Effect: If project changes, clear the assignee if they aren't in the new project
  useEffect(() => {
    if (formData.assigneeId) {
      const isStillMember = safeMembers.some(m => m.user?.id === formData.assigneeId);
      if (!isStillMember && safeMembers.length > 0) {
        setFormData(prev => ({ ...prev, assigneeId: '' }));
      }
    }
  }, [formData.projectId, safeMembers, formData.assigneeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      project: formData.projectId,          
      assigned_to: formData.assigneeId,     
      status: formData.status,
      priority: formData.priority,
      due_date: formData.dueDate || null,   
      created_by: user.id,
    };

    createTask.mutate(payload, {
      onSuccess: () => navigate('/tasks'),
      onError: (error) => console.error("Failed to create task:", error)
    });
  };

  const getUserDisplayName = (userObj) => {
    if (!userObj) return 'Unknown User';
    if (userObj.first_name) return `${userObj.first_name} ${userObj.last_name || ''}`.trim();
    return userObj.username;
  };

  const isPending = createTask.isPending;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/tasks')}>
        <ArrowLeft size={16} /> Back to Tasks
      </button>

      <PageHeader 
        title="Create New Task" 
        subtitle="Define work items and assign them to your team."
      />

      <motion.div 
        className={styles.formCard}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="title">Task Title</label>
            <input 
              type="text" 
              id="title"
              name="title"
              className={styles.input} 
              value={formData.title}
              onChange={handleChange}
              required 
              disabled={isPending}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea 
              id="description"
              name="description"
              className={styles.textarea} 
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required 
              disabled={isPending}
            />
          </div>

          <div className={styles.row}>
            {/* Project Dropdown */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="projectId">Project</label>
              <select 
                id="projectId"
                name="projectId" 
                className={styles.select} 
                value={formData.projectId} 
                onChange={handleChange}
                required
                disabled={isPending || projectsLoading}
              >
                <option value="" disabled>
                  {projectsLoading ? 'Loading projects...' : 'Select a project'}
                </option>
                {safeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Smart "Assign To" Dropdown (Now relies ONLY on members) */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="assigneeId">Assign To</label>
              <select 
                id="assigneeId"
                name="assigneeId" 
                className={styles.select} 
                value={formData.assigneeId} 
                onChange={handleChange}
                required
                disabled={isPending || membersLoading || !formData.projectId}
              >
                <option value="" disabled>
                  {membersLoading ? 'Loading team...' : !formData.projectId ? 'Select project first' : 'Select team member'}
                </option>
                
                {/* Map directly over the members returned by the backend */}
                {safeMembers.map(member => (
                  <option key={member.id} value={member.user?.id}>
                    {getUserDisplayName(member.user)}
                  </option>
                ))}
                
                {safeMembers.length === 0 && !membersLoading && formData.projectId && (
                  <option value="" disabled>No team members in this project</option>
                )}
              </select>
            </div>
          </div>

          {/* Status, Priority, Due Date row... (Unchanged) */}
          <div className={styles.gridRow3} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="status">Status</label>
              <select id="status" name="status" className={styles.select} value={formData.status} onChange={handleChange} disabled={isPending}>
                <option value="Todo">Todo</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Finished">Finished</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="priority">Priority</label>
              <select id="priority" name="priority" className={styles.select} value={formData.priority} onChange={handleChange} disabled={isPending}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="dueDate">Due Date (Optional)</label>
              <input type="date" id="dueDate" name="dueDate" className={styles.input} value={formData.dueDate} onChange={handleChange} disabled={isPending} />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/tasks')} disabled={isPending}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={isPending || !formData.title.trim() || !formData.projectId || !formData.assigneeId}>
              {isPending ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
              {isPending ? 'Saving...' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}