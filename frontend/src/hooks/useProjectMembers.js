import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api';

export const memberKeys = {
  all: () => ['members'],
  list: (projectId) => ['members', { projectId }],
};

export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: memberKeys.list(projectId),
    queryFn: () => membersApi.getAllForProject(projectId),
    enabled: !!projectId,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => membersApi.add(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(variables.projectId) });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, memberId }) => membersApi.remove(projectId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(variables.projectId) });
    },
  });
}