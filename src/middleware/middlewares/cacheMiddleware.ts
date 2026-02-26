import type { Middleware, ResponseData } from '../types';

const cache = new Map<string, { data: ResponseData; expiresAt: number }>();

function getCacheKey(url: string, params?: Record<string, unknown>): string {
  return `${url}?${JSON.stringify(params ?? {})}`;
}

export function createCacheMiddleware(ttlMs = 60_000): Middleware {
  return async (config, next) => {
    if (config.method !== 'GET') {
      return next(config);
    }
    const key = getCacheKey(config.url, config.params);
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    const response = await next(config);
    cache.set(key, { data: response, expiresAt: Date.now() + ttlMs });
    return response;
  };
}

export function clearCache(): void {
  cache.clear();
}
