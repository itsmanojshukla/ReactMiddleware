import type { Middleware } from '../types';

export function createAuthMiddleware(getToken: () => string | null): Middleware {
  return async (config, next) => {
    const token = getToken();
    const headers = { ...config.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return next({ ...config, headers });
  };
}
