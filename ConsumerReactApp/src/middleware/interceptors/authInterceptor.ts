import { InternalAxiosRequestConfig } from 'axios';
import { MiddlewareConfig } from '../types/middlewareConfig';

export function createAuthInterceptor(config: MiddlewareConfig) {
  return async (axiosConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    if (config.getAuthToken) {
      const token = await config.getAuthToken();
      if (token) axiosConfig.headers.set('Authorization', `Bearer ${token}`);
    }
    return axiosConfig;
  };
}
