import { GenericApiClient } from '@middleware/core/apiClient';
import { ApiResponse } from '@middleware/types/apiResponse';
import { CreateUserRequest, CreateUserResponse } from '../types/user';

export function createUserService(client: GenericApiClient) {
  return {
    async create(user: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
      return client.post<CreateUserResponse>('/users', user);
    },
  };
}
