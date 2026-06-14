import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '../api';

export const attachmentKeys = {
  all: () => ['attachments'],
  list: (projectId) => ['attachments', { projectId }],
};

export function useProjectAttachments(projectId) {
  return useQuery({
    queryKey: attachmentKeys.list(projectId),
    queryFn: () => attachmentsApi.getAllForProject(projectId),
    enabled: !!projectId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, formData }) => attachmentsApi.upload(formData),
    onSuccess: (_, variables) => {
      // Invalidate so the UI instantly shows the new file
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(variables.projectId) });
    },
  });
}