import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { usersApi } from '../../api';
import { useProjectMembers, useAddMember, useRemoveMember } from '../../hooks/useProjectMembers';
import { useTasks } from '../../hooks/useTasks';
import { useProject } from '../../hooks/useProjects';

import { PageHeader, Avatar } from '../../components/shared';
import styles from './ProjectTeamPage.module.css'; // We will create this below

export default function ProjectTeamPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // --- Data Hooks ---
  const { data: project } = useProject(projectId);
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: allTasks } = useTasks();
  
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounce the Elasticsearch query so we don't spam the backend
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['usersSearch', debouncedSearch],
    queryFn: () => usersApi.search(debouncedSearch),
    enabled: debouncedSearch.length > 2, // Only search if they typed 3+ chars
  });

  const handleAddUser = (user) => {
    // Prevent adding if they are already in the project
    if (members?.some(m => m.user.id === user.id)) {
      alert('User is already in this project!');
      return;
    }

    // Match your Django Serializer fields (project, user_id, role)
    addMember.mutate({
      project: projectId,
      user_id: user.id,
      role: 'Member' // Default role
    }, {
      onSuccess: () => {
        setSearchTerm('');
        setIsDropdownOpen(false);
      }
    });
  };

  const safeMembers = members || [];
  const safeTasks = allTasks || [];

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(`/projects/${projectId}`)}>
        <ArrowLeft size={16} /> Back to {project?.name || 'Project'}
      </button>

      <PageHeader
        title="Project Team"
        subtitle={`${safeMembers.length} members · Manage access and roles`}
      />

      {/* --- Elasticsearch Bar --- */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="email"
            className={styles.searchInput}
            placeholder="Search users by email to add them..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          {isSearching && <Loader2 size={16} className={styles.spinner} />}
        </div>

        {/* Dropdown Results */}
        <AnimatePresence>
          {isDropdownOpen && searchTerm.length > 2 && (
            <motion.div 
              className={styles.dropdown}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {searchResults?.length > 0 ? (
                searchResults.map(user => (
                  <button 
                    key={user.id} 
                    className={styles.dropdownItem}
                    onClick={() => handleAddUser(user)}
                    disabled={addMember.isPending}
                  >
                    <div className={styles.dropdownUser}>
                      <Avatar initials={user.first_name?.[0] || user.username?.[0]} size="sm" />
                      <div style={{ textAlign: 'left' }}>
                        <div className={styles.dropdownName}>{user.first_name} {user.last_name}</div>
                        <div className={styles.dropdownEmail}>{user.email || user.username}</div>
                      </div>
                    </div>
                    <Plus size={16} color="var(--teal)" />
                  </button>
                ))
              ) : (
                <div className={styles.dropdownEmpty}>
                  {isSearching ? 'Searching...' : 'No users found.'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Existing Team Grid --- */}
      {membersLoading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading team...</div>
      ) : (
        <div className={styles.grid}>
          {safeMembers.map((member, i) => {
            const userObj = member.user;
            
            // Calculate real stats for this specific project and user
            const userTasks = safeTasks.filter(t => t.assigned_to === userObj.id && t.project === projectId);
            const todo = userTasks.filter(t => t.status === 'Todo').length;
            const inProgress = userTasks.filter(t => t.status === 'Ongoing').length;
            const done = userTasks.filter(t => t.status === 'Finished').length;
            
            // Dynamic color fallback (you could hash the user's name for a consistent color)
            const cardColor = 'var(--teal)';

            return (
              <motion.div
                key={member.id}
                className={styles.card}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
              >
                {/* Remove Button */}
                <button 
                  className={styles.removeBtn} 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(`Remove ${userObj.first_name} from project?`)) {
                      removeMember.mutate({ memberId: member.id, projectId });
                    }
                  }}
                  title="Remove from project"
                >
                  <Trash2 size={14} />
                </button>

                <div className={styles.cardGlow} style={{ background: cardColor }} />
                <Avatar initials={userObj.first_name?.[0] || 'U'} color={cardColor} size="lg" />

                <div className={styles.userInfo}>
                  <div className={styles.userName}>
                    {userObj.first_name} {userObj.last_name}
                  </div>
                  <div className={styles.userRole}>{member.role}</div>
                </div>

                <div className={styles.statRow}>
                  <div className={styles.statBlock}>
                    <span className={styles.statNum} style={{ color: 'var(--text-muted)' }}>{todo}</span>
                    <span className={styles.statLbl}>To Do</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statBlock}>
                    <span className={styles.statNum} style={{ color: 'var(--sky)' }}>{inProgress}</span>
                    <span className={styles.statLbl}>Ongoing</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statBlock}>
                    <span className={styles.statNum} style={{ color: 'var(--teal)' }}>{done}</span>
                    <span className={styles.statLbl}>Finished</span>
                  </div>
                </div>

                <div className={styles.projects}>
                  <span
                    className={styles.projectTag}
                    style={{ color: cardColor, background: cardColor + '14', borderColor: cardColor + '30' }}
                  >
                    {project?.name || 'Project Member'}
                  </span>
                </div>

                <div className={styles.onlineRow}>
                  <Activity size={11} color="var(--teal)" />
                  <span className={styles.onlineTxt}>Active access</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}