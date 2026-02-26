import { useState, useCallback, useRef } from 'react';
import { useAPIWrapperContext } from '../context/APIWrapperContext';
import type { RequestConfig, ResponseData, Middleware } from '../middleware/types';

export interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: number | null;
}

export interface UseAPIOptions {
  middlewares?: Middleware[];
}

export interface UseAPIResult<T> extends UseAPIState<T> {
  execute: (config: RequestConfig) => Promise<ResponseData<T> | null>;
  reset: () => void;
}

export function useAPI<T = unknown>(options: UseAPIOptions = {}): UseAPIResult<T> {
  const { request, globalMiddlewares } = useAPIWrapperContext();
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (config: RequestConfig): Promise<ResponseData<T> | null> => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({ data: null, loading: true, error: null, status: null });

      try {
        const middlewares = [...globalMiddlewares, ...(options.middlewares ?? [])];
        const response = await request<T>({ ...config, signal: controller.signal }, middlewares);
        setState({ data: response.data, loading: false, error: null, status: response.status });
        return response;
      } catch (err) {
        if ((err as Error).name === 'CanceledError' || (err as Error).name === 'AbortError') {
          return null;
        }
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error, status: null });
        return null;
      }
    },
    [request, globalMiddlewares, options.middlewares]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, status: null });
  }, []);

  return { ...state, execute, reset };
}
