import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '../api';

export const attachmentKeys = {
  all: () => ['attachments'],
  list: (projectId) => ['attachments', { projectId }],
};

export function useAttachments(projectId) {
  return useQuery({
    queryKey: attachmentKeys.list(projectId),
    queryFn: () => attachmentsApi.getAllForProject(projectId),
    enabled: !!projectId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, formData }) => attachmentsApi.upload(projectId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(variables.projectId) });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, attachmentId }) => attachmentsApi.delete(projectId, attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(variables.projectId) });
    },
  });
}