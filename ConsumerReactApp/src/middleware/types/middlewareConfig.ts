export interface MiddlewareConfig {
  baseURL: string;
  timeoutMs: number;
  defaultHeaders?: Record<string, string>;
  getAuthToken?: () => Promise<string | null> | string | null;
  retry: {
    maxRetries: number;
    baseDelayMs: number;
    retryableStatuses: number[];
  };
  circuitBreaker: {
    failureThreshold: number;
    resetTimeoutMs: number;
  };
  enableLogging: boolean;
  onResponse?: (response: {
    url: string;
    method: string;
    statusCode: number;
    durationMs: number;
    success: boolean;
  }) => void;
}

export const DEFAULT_CONFIG: MiddlewareConfig = {
  baseURL: '',
  timeoutMs: 30000,
  retry: { maxRetries: 3, baseDelayMs: 1000, retryableStatuses: [408, 429, 500, 502, 503, 504] },
  circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30000 },
  enableLogging: false,
};
