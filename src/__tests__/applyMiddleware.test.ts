import { describe, it, expect, vi } from 'vitest';
import { applyMiddleware } from '../middleware/applyMiddleware';
import type { Middleware, NextMiddleware, RequestConfig, ResponseData } from '../middleware/types';

const mockConfig: RequestConfig = { url: '/test', method: 'GET' };
const mockResponse: ResponseData = { data: { ok: true }, status: 200, headers: {} };

describe('applyMiddleware', () => {
  it('calls coreHandler when no middlewares provided', async () => {
    const core: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const pipeline = applyMiddleware([], core);
    const result = await pipeline(mockConfig);
    expect(core).toHaveBeenCalledWith(mockConfig);
    expect(result).toEqual(mockResponse);
  });

  it('calls middleware in correct order', async () => {
    const order: number[] = [];
    const m1: Middleware = async (config, next) => { order.push(1); const r = await next(config); order.push(4); return r; };
    const m2: Middleware = async (config, next) => { order.push(2); const r = await next(config); order.push(3); return r; };
    const core: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const pipeline = applyMiddleware([m1, m2], core);
    await pipeline(mockConfig);
    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('allows middleware to modify config', async () => {
    const m: Middleware = async (config, next) => next({ ...config, headers: { 'x-custom': 'yes' } });
    const core: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const pipeline = applyMiddleware([m], core);
    await pipeline(mockConfig);
    expect(core).toHaveBeenCalledWith(expect.objectContaining({ headers: { 'x-custom': 'yes' } }));
  });

  it('allows middleware to modify response', async () => {
    const m: Middleware = async (config, next) => {
      const r = await next(config);
      return { ...r, status: 201 };
    };
    const core: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const pipeline = applyMiddleware([m], core);
    const result = await pipeline(mockConfig);
    expect(result.status).toBe(201);
  });

  it('propagates errors through the chain', async () => {
    const error = new Error('network failure');
    const core: NextMiddleware = vi.fn().mockRejectedValue(error);
    const m: Middleware = async (config, next) => next(config);
    const pipeline = applyMiddleware([m], core);
    await expect(pipeline(mockConfig)).rejects.toThrow('network failure');
  });
});
