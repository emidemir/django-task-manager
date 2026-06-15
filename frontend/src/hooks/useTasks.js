// src/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api';

export const taskKeys = {
  all: () => ['tasks'],
  list: (projectId) => ['tasks', { projectId }], 
  detail: (id) => ['tasks', id],
};

// Default to null so it doesn't break when the Dashboard calls it empty
export function useTasks(projectId = null) {
  return useQuery({
    queryKey: projectId ? taskKeys.list(projectId) : taskKeys.all(),
    // THE FIX: Use an arrow function so the Context Object isn't passed!
    queryFn: () => tasksApi.getAll(projectId), 
  });
}

export function useTask(taskId) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    // THE FIX: Arrow function here too
    queryFn: () => tasksApi.getById(taskId), 
    enabled: !!taskId,
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

// Add this to the bottom of useTasks.js
export function useSearchTasks(query) {
  return useQuery({
    queryKey: ['tasks', 'search', query],
    queryFn: () => tasksApi.search(query),
    // Only fire the API call if the user typed at least 2 characters
    enabled: query.length > 1, 
    staleTime: 1000 * 60, // Keep search results cached for a minute
  });
}