import type { Middleware } from '../types';
import { AxiosError } from 'axios';

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

export class APIRequestError extends Error {
  status?: number;
  code?: string;

  constructor(apiError: APIError) {
    super(apiError.message);
    this.name = 'APIRequestError';
    this.status = apiError.status;
    this.code = apiError.code;
  }
}

export const errorMiddleware: Middleware = async (config, next) => {
  try {
    return await next(config);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new APIRequestError({
        message: error.message,
        status: error.response?.status,
        code: error.code,
      });
    }
    throw error;
  }
};
