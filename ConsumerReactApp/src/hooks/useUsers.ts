import { useMutation } from '@tanstack/react-query';
import { useApiClient } from '@middleware/hooks/useApiClient';
import { createUserService } from '../services/userService';
import { CreateUserRequest } from '../types/user';

export function useCreateUser() {
  const client = useApiClient();
  const service = createUserService(client);

  return useMutation({
    mutationFn: async (user: CreateUserRequest) => {
      const response = await service.create(user);
      if (!response.isSuccess || response.data === null) {
        throw new Error(response.errorMessage ?? 'Failed to create user');
      }
      return response.data;
    },
    retry: false,
  });
}
