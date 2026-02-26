import { GenericApiClient } from '@middleware/core/apiClient';
import { ApiResponse } from '@middleware/types/apiResponse';
import { TodoItem } from '../types/todo';

export function createTodoService(client: GenericApiClient) {
  return {
    async getAll(): Promise<ApiResponse<TodoItem[]>> {
      return client.get<TodoItem[]>('/todos');
    },

    async getById(id: number): Promise<ApiResponse<TodoItem>> {
      return client.get<TodoItem>(`/todos/${id}`);
    },

    async getByUserId(userId: number): Promise<ApiResponse<TodoItem[]>> {
      return client.get<TodoItem[]>('/todos', { params: { userId } });
    },

    async create(todo: Omit<TodoItem, 'id'>): Promise<ApiResponse<TodoItem>> {
      return client.post<TodoItem>('/todos', todo);
    },

    async update(id: number, todo: TodoItem): Promise<ApiResponse<TodoItem>> {
      return client.put<TodoItem>(`/todos/${id}`, todo);
    },

    async patch(id: number, changes: Partial<TodoItem>): Promise<ApiResponse<TodoItem>> {
      return client.patch<TodoItem>(`/todos/${id}`, changes);
    },

    async delete(id: number): Promise<ApiResponse<unknown>> {
      return client.delete<unknown>(`/todos/${id}`);
    },
  };
}
