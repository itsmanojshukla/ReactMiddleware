type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly enableLogging: boolean;

  constructor(failureThreshold: number, resetTimeoutMs: number, enableLogging: boolean) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.enableLogging = enableLogging;
  }

  async execute<T>(fn: () => Promise<T>, context: { url: string; method: string }): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        if (this.enableLogging) {
          console.info(`[CircuitBreaker] Transitioning to HALF_OPEN for ${context.method} ${context.url}`);
        }
      } else {
        const error = new Error(`Circuit breaker is OPEN. Request to ${context.method} ${context.url} rejected.`);
        (error as Error & { isCircuitBreakerError: boolean }).isCircuitBreakerError = true;
        throw error;
      }
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(context);
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN' && this.enableLogging) {
      console.info('[CircuitBreaker] Success in HALF_OPEN state. Closing circuit.');
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(context: { url: string; method: string }): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      if (this.enableLogging) {
        console.error(
          `[CircuitBreaker] Failure threshold (${this.failureThreshold}) reached. Circuit OPEN for ${context.method} ${context.url}. ` +
            `Will retry after ${this.resetTimeoutMs}ms.`
        );
      }
    }
  }

  getState(): { state: CircuitState; failureCount: number } {
    return { state: this.state, failureCount: this.failureCount };
  }
}
