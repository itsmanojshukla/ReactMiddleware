import { GenericApiClient } from '@middleware/core/apiClient';
import { ApiResponse } from '@middleware/types/apiResponse';
import { PostItem, CreatePostRequest } from '../types/post';

export function createPostService(client: GenericApiClient) {
  return {
    async getAll(): Promise<ApiResponse<PostItem[]>> {
      return client.get<PostItem[]>('/posts');
    },

    async getById(id: number): Promise<ApiResponse<PostItem>> {
      return client.get<PostItem>(`/posts/${id}`);
    },

    async create(post: CreatePostRequest): Promise<ApiResponse<PostItem>> {
      return client.post<PostItem>('/posts', post);
    },

    async update(id: number, post: PostItem): Promise<ApiResponse<PostItem>> {
      return client.put<PostItem>(`/posts/${id}`, post);
    },

    async patch(id: number, changes: Partial<PostItem>): Promise<ApiResponse<PostItem>> {
      return client.patch<PostItem>(`/posts/${id}`, changes);
    },

    async delete(id: number): Promise<ApiResponse<unknown>> {
      return client.delete<unknown>(`/posts/${id}`);
    },
  };
}
