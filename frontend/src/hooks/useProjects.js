// src/hooks/useProjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api';

export const projectKeys = {
  all:    ()   => ['projects'],
  detail: (id) => ['projects', id],
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all(),  
    queryFn: () => projectsApi.getAll(),
  });
}

export function useProject(projectId) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn:  () => projectsApi.getById(projectId),
    enabled:  !!projectId,
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => projectsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(updated.id) });
    },
  });
}