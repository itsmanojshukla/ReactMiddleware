import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@middleware/hooks/useApiClient';
import { createPostService } from '../services/postService';
import { CreatePostRequest, PostItem } from '../types/post';

export function usePosts() {
  const client = useApiClient();
  const service = createPostService(client);

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await service.getAll();
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to fetch posts');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useCreatePost() {
  const client = useApiClient();
  const service = createPostService(client);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: CreatePostRequest) => {
      const response = await service.create(post);
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to create post');
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    retry: false,
  });
}

export function useUpdatePost() {
  const client = useApiClient();
  const service = createPostService(client);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: PostItem) => {
      const response = await service.update(post.id, post);
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to update post');
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    retry: false,
  });
}

export function useDeletePost() {
  const client = useApiClient();
  const service = createPostService(client);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await service.delete(id);
      if (!response.isSuccess) {
        throw new Error(response.errorMessage ?? 'Failed to delete post');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    retry: false,
  });
}
