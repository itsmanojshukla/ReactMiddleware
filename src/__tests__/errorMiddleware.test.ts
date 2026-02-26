import { describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';
import { errorMiddleware, APIRequestError } from '../middleware/middlewares/errorMiddleware';
import type { NextMiddleware, RequestConfig, ResponseData } from '../middleware/types';

const mockConfig: RequestConfig = { url: '/test', method: 'GET' };
const mockResponse: ResponseData = { data: {}, status: 200, headers: {} };

describe('errorMiddleware', () => {
  it('passes through successful responses', async () => {
    const next: NextMiddleware = vi.fn().mockResolvedValue(mockResponse);
    const result = await errorMiddleware(mockConfig, next);
    expect(result).toEqual(mockResponse);
  });

  it('wraps AxiosError into APIRequestError', async () => {
    const axiosError = new AxiosError('Request failed', 'ERR_NETWORK', undefined, undefined, {
      status: 404,
    } as never);
    const next: NextMiddleware = vi.fn().mockRejectedValue(axiosError);
    await expect(errorMiddleware(mockConfig, next)).rejects.toBeInstanceOf(APIRequestError);
  });

  it('passes through non-Axios errors', async () => {
    const genericError = new Error('generic');
    const next: NextMiddleware = vi.fn().mockRejectedValue(genericError);
    await expect(errorMiddleware(mockConfig, next)).rejects.toThrow('generic');
    await expect(errorMiddleware(mockConfig, next)).rejects.not.toBeInstanceOf(APIRequestError);
  });
});
