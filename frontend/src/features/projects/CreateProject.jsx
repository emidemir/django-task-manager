import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/shared';

// 1. Import your new mutation hook!
import { useCreateProject } from '../../hooks/useProjects';
import styles from './CreateProject.module.css';

const THEME_COLORS = ['#3b82f6', '#00e5c3', '#8b5cf6', '#f59e0b', '#f43f5e'];

export default function CreateProject() {
  const navigate = useNavigate();
  
  // 2. Initialize the mutation
  const createProject = useCreateProject();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: THEME_COLORS[0],
    status: 'Ongoing'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 3. Fire the mutation and navigate ONLY if it succeeds
    createProject.mutate(formData, {
      onSuccess: () => {
        navigate('/projects');
      },
      onError: (error) => {
        // Optional: Handle Django validation errors here (e.g., show a toast notification)
        console.error("Failed to create project:", error);
      }
    });
  };

  // Use createProject.isPending instead of local state
  const isPending = createProject.isPending;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/projects')}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <PageHeader 
        title="Create New Project" 
        subtitle="Set up a new workspace for your team's tasks."
      />

      <motion.div 
        className={styles.formCard}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="name">Project Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              className={styles.input} 
              placeholder="e.g. Website Redesign" 
              value={formData.name}
              onChange={handleChange}
              required 
              maxLength={150}
              disabled={isPending}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea 
              id="description"
              name="description"
              className={styles.textarea} 
              placeholder="What is the goal of this project?" 
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required 
              disabled={isPending}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Status</label>
              <select 
                name="status" 
                className={styles.select} 
                value={formData.status} 
                onChange={handleChange}
                disabled={isPending}
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Finished">Finished</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Theme Color</label>
              <div className={styles.colorPicker}>
                {THEME_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorSwatch} ${formData.color === color ? styles.activeSwatch : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={() => navigate('/projects')}
              disabled={isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isPending || !formData.name.trim()}
            >
              {isPending ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
              {isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}