import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCacheMiddleware, clearCache } from '../middleware/middlewares/cacheMiddleware';
import type { NextMiddleware, RequestConfig, ResponseData } from '../middleware/types';

const mockConfig: RequestConfig = { url: '/test', method: 'GET' };
const mockResponse: ResponseData = { data: { cached: true }, status: 200, headers: {} };

describe('createCacheMiddleware', () => {
  beforeEach(() => clearCache());

  it('caches GET responses', async () => {
    const next: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const middleware = createCacheMiddleware();
    await middleware(mockConfig, next);
    await middleware(mockConfig, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not cache non-GET requests', async () => {
    const postConfig: RequestConfig = { url: '/test', method: 'POST', body: {} };
    const next: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const middleware = createCacheMiddleware();
    await middleware(postConfig, next);
    await middleware(postConfig, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('respects TTL and re-fetches after expiry', async () => {
    vi.useFakeTimers();
    const next: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const middleware = createCacheMiddleware(100);
    await middleware(mockConfig, next);
    vi.advanceTimersByTime(200);
    await middleware(mockConfig, next);
    expect(next).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
