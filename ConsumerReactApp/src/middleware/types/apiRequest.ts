export interface ApiRequest<TPayload = unknown> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: TPayload;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeoutMs?: number;
  responseFormat?: 'json' | 'xml' | 'text' | 'blob';
  skipRetry?: boolean;
  skipCircuitBreaker?: boolean;
  signal?: AbortSignal;
}
