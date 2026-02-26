export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
}

export interface CreateUserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
}
