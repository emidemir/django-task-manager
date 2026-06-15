import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api';
import { projectKeys } from './useProjects'; // We import this to update project member counts!
import { taskKeys } from './useTasks';

export const memberKeys = {
  all: () => ['members'],
  list: (projectId) => ['members', { projectId }],
};

// --- Queries ---
export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: memberKeys.list(projectId),
    queryFn: () => membersApi.getAllForProject(projectId),
    enabled: !!projectId, // Only fetch if we actually have a project ID
  });
}

// --- Mutations ---
export function useAddMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => membersApi.add(data),
    onSuccess: (newMember) => {
      // Assuming your Django backend returns the created member object, 
      // and it has a 'project' field with the project ID.
      const projectId = newMember.project;
      
      queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all() });

      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    // We accept both memberId (for the API) and projectId (just for cache invalidation)
    mutationFn: ({ memberId }) => membersApi.remove(memberId),
    onSuccess: (_, variables) => {
      // 'variables' contains whatever you passed to .mutate()
      queryClient.invalidateQueries({ queryKey: memberKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all() });

      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
    },
  });
}