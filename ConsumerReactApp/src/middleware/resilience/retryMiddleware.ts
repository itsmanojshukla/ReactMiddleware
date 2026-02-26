import { MiddlewareConfig } from '../types/middlewareConfig';

export class RetryMiddleware {
  private readonly config: MiddlewareConfig['retry'];
  private readonly enableLogging: boolean;

  constructor(config: MiddlewareConfig['retry'], enableLogging: boolean) {
    this.config = config;
    this.enableLogging = enableLogging;
  }

  async execute<T>(fn: () => Promise<T>, context: { url: string; method: string }): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const statusCode = (error as { response?: { status?: number } })?.response?.status;
        const isRetryable = !statusCode || this.config.retryableStatuses.includes(statusCode);
        if (!isRetryable || attempt === this.config.maxRetries) throw error;
        const delay = this.config.baseDelayMs * Math.pow(2, attempt);
        const jitter = delay * 0.1 * Math.random();
        if (this.enableLogging) {
          console.warn(
            `[RetryMiddleware] Attempt ${attempt + 1}/${this.config.maxRetries} failed for ${context.method} ${context.url}. ` +
              `Status: ${statusCode ?? 'network error'}. Retrying in ${Math.round(delay + jitter)}ms...`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      }
    }
    throw lastError;
  }
}
