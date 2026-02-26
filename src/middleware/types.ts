export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
  signal?: AbortSignal;
  [key: string]: unknown;
}

export interface ResponseData<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export type NextMiddleware<T = unknown> = (config: RequestConfig) => Promise<ResponseData<T>>;

export type Middleware<T = unknown> = (
  config: RequestConfig,
  next: NextMiddleware<T>
) => Promise<ResponseData<T>>;

export interface APIWrapperConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}
