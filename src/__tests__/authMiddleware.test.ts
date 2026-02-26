import { describe, it, expect, vi } from 'vitest';
import { createAuthMiddleware } from '../middleware/middlewares/authMiddleware';
import type { NextMiddleware, RequestConfig, ResponseData } from '../middleware/types';

const mockConfig: RequestConfig = { url: '/test', method: 'GET' };
const mockResponse: ResponseData = { data: {}, status: 200, headers: {} };

describe('createAuthMiddleware', () => {
  it('adds Authorization header when token exists', async () => {
    const getToken = vi.fn().mockReturnValue('my-token');
    const middleware = createAuthMiddleware(getToken);
    const next: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    await middleware(mockConfig, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ headers: { Authorization: 'Bearer my-token' } })
    );
  });

  it('does not add Authorization header when token is null', async () => {
    const getToken = vi.fn().mockReturnValue(null);
    const middleware = createAuthMiddleware(getToken);
    const next: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    await middleware(mockConfig, next);
    expect(next).toHaveBeenCalledWith(
      expect.not.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) })
    );
  });
});
