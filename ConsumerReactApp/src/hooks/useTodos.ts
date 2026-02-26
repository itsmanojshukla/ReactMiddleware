import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@middleware/hooks/useApiClient';
import { createTodoService } from '../services/todoService';
import { TodoItem } from '../types/todo';

export function useTodos() {
  const client = useApiClient();
  const service = createTodoService(client);

  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await service.getAll();
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to fetch todos');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useTodoById(id: number) {
  const client = useApiClient();
  const service = createTodoService(client);

  return useQuery({
    queryKey: ['todos', id],
    queryFn: async () => {
      const response = await service.getById(id);
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to fetch todo');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: id > 0,
  });
}

export function useToggleTodo() {
  const client = useApiClient();
  const service = createTodoService(client);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todo: TodoItem) => {
      const response = await service.patch(todo.id, { completed: !todo.completed });
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to toggle todo');
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    retry: false,
  });
}
