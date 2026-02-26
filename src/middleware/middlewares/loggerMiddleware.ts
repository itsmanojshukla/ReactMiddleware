import type { Middleware } from '../types';

export const loggerMiddleware: Middleware = async (config, next) => {
  const start = Date.now();
  console.log(`[API] ${config.method} ${config.url}`, config);
  try {
    const response = await next(config);
    console.log(`[API] ${config.method} ${config.url} => ${response.status} (${Date.now() - start}ms)`);
    return response;
  } catch (error) {
    console.error(`[API] ${config.method} ${config.url} => ERROR (${Date.now() - start}ms)`, error);
    throw error;
  }
};
