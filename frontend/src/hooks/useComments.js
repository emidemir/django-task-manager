import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api';

export const commentKeys = {
  all: () => ['comments'],
  list: (projectId) => ['comments', { projectId }],
};

export function useComments(projectId) {
  return useQuery({
    queryKey: commentKeys.list(projectId),
    queryFn: () => commentsApi.getAllForProject(projectId),
    enabled: !!projectId, 
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => commentsApi.create(projectId, data),
    onSuccess: (_, variables) => {
      // variables contains the arguments passed to mutationFn
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.projectId) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, commentId }) => commentsApi.delete(projectId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.projectId) });
    },
  });
}