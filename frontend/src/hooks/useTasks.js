// src/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api';

export const taskKeys = {
  all:    ()   => ['tasks'],
  detail: (id) => ['tasks', id],
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all(),
    queryFn:  tasksApi.getAll,
  });
}

export function useTask(taskId) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn:  () => tasksApi.getById(taskId),
    enabled:  !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tasksApi.update(id, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(updatedTask.id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
    },
  });
}