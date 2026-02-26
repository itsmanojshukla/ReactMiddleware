import axios, { AxiosInstance, AxiosResponse, ResponseType } from 'axios';
import { ApiRequest } from '../types/apiRequest';
import { ApiResponse, ApiResponseFactory } from '../types/apiResponse';
import { MiddlewareConfig, DEFAULT_CONFIG } from '../types/middlewareConfig';
import { RetryMiddleware } from '../resilience/retryMiddleware';
import { CircuitBreaker } from '../resilience/circuitBreaker';
import { createAuthInterceptor } from '../interceptors/authInterceptor';
import { createRequestLogger, createResponseLogger } from '../interceptors/loggingInterceptor';
import { createErrorInterceptor } from '../interceptors/errorInterceptor';

export class GenericApiClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly retryMiddleware: RetryMiddleware;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly config: MiddlewareConfig;

  constructor(config?: Partial<MiddlewareConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      retry: { ...DEFAULT_CONFIG.retry, ...config?.retry },
      circuitBreaker: { ...DEFAULT_CONFIG.circuitBreaker, ...config?.circuitBreaker },
      baseURL: config?.baseURL ?? import.meta.env.VITE_API_BASE_URL ?? DEFAULT_CONFIG.baseURL,
      timeoutMs:
        config?.timeoutMs ?? (Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_CONFIG.timeoutMs),
      enableLogging:
        config?.enableLogging !== undefined
          ? config.enableLogging
          : (import.meta.env.VITE_ENABLE_LOGGING === 'true' || DEFAULT_CONFIG.enableLogging),
    };

    this.retryMiddleware = new RetryMiddleware(this.config.retry, this.config.enableLogging);
    this.circuitBreaker = new CircuitBreaker(
      this.config.circuitBreaker.failureThreshold,
      this.config.circuitBreaker.resetTimeoutMs,
      this.config.enableLogging
    );

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.defaultHeaders,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptors
    this.axiosInstance.interceptors.request.use(createAuthInterceptor(this.config));
    if (this.config.enableLogging) {
      this.axiosInstance.interceptors.request.use(createRequestLogger());
      this.axiosInstance.interceptors.response.use(createResponseLogger(), createErrorInterceptor());
    } else {
      this.axiosInstance.interceptors.response.use(undefined, createErrorInterceptor());
    }
  }

  async sendAsync<T>(request: ApiRequest): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const context = { url: request.url, method: request.method };

    const executeRequest = async (): Promise<AxiosResponse> => {
      return this.axiosInstance.request({
        url: request.url,
        method: request.method,
        data: request.payload,
        headers: request.headers,
        params: request.params,
        timeout: request.timeoutMs ?? this.config.timeoutMs,
        responseType: this.mapResponseType(request.responseFormat),
        signal: request.signal,
      });
    };

    try {
      let response: AxiosResponse;

      if (request.skipCircuitBreaker && request.skipRetry) {
        response = await executeRequest();
      } else if (request.skipCircuitBreaker) {
        response = await this.retryMiddleware.execute(executeRequest, context);
      } else if (request.skipRetry) {
        response = await this.circuitBreaker.execute(executeRequest, context);
      } else {
        response = await this.circuitBreaker.execute(
          () => this.retryMiddleware.execute(executeRequest, context),
          context
        );
      }

      const durationMs = Date.now() - startTime;
      const headers = this.extractHeaders(response.headers);
      const rawContent =
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      this.config.onResponse?.({
        url: request.url,
        method: request.method,
        statusCode: response.status,
        durationMs,
        success: true,
      });

      return ApiResponseFactory.success<T>(response.data as T, response.status, rawContent, headers, durationMs);
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      const { statusCode, errorMessage, rawContent, headers } = this.extractErrorDetails(error);

      this.config.onResponse?.({
        url: request.url,
        method: request.method,
        statusCode,
        durationMs,
        success: false,
      });

      return ApiResponseFactory.failure<T>(statusCode, errorMessage, rawContent, headers, durationMs);
    }
  }

  async get<T>(
    url: string,
    options?: Partial<Omit<ApiRequest, 'url' | 'method' | 'payload'>>
  ): Promise<ApiResponse<T>> {
    return this.sendAsync<T>({ url, method: 'GET', ...options });
  }

  async post<T>(
    url: string,
    payload?: unknown,
    options?: Partial<Omit<ApiRequest, 'url' | 'method' | 'payload'>>
  ): Promise<ApiResponse<T>> {
    return this.sendAsync<T>({ url, method: 'POST', payload, ...options });
  }

  async put<T>(
    url: string,
    payload?: unknown,
    options?: Partial<Omit<ApiRequest, 'url' | 'method' | 'payload'>>
  ): Promise<ApiResponse<T>> {
    return this.sendAsync<T>({ url, method: 'PUT', payload, ...options });
  }

  async patch<T>(
    url: string,
    payload?: unknown,
    options?: Partial<Omit<ApiRequest, 'url' | 'method' | 'payload'>>
  ): Promise<ApiResponse<T>> {
    return this.sendAsync<T>({ url, method: 'PATCH', payload, ...options });
  }

  async delete<T>(
    url: string,
    options?: Partial<Omit<ApiRequest, 'url' | 'method' | 'payload'>>
  ): Promise<ApiResponse<T>> {
    return this.sendAsync<T>({ url, method: 'DELETE', ...options });
  }

  getCircuitBreakerState(): { state: string; failureCount: number } {
    return this.circuitBreaker.getState();
  }

  private mapResponseType(responseFormat?: ApiRequest['responseFormat']): ResponseType {
    switch (responseFormat) {
      case 'blob':
        return 'blob';
      case 'text':
      case 'xml':
        return 'text';
      default:
        return 'json';
    }
  }

  private extractHeaders(headers: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') result[key] = value;
    }
    return result;
  }

  private extractErrorDetails(error: unknown): {
    statusCode: number;
    errorMessage: string;
    rawContent: string | null;
    headers: Record<string, string>;
  } {
    const axiosError = error as {
      response?: { status?: number; data?: unknown; headers?: Record<string, unknown> };
      message?: string;
      isCircuitBreakerError?: boolean;
    };

    if (axiosError?.response) {
      return {
        statusCode: axiosError.response.status ?? 500,
        errorMessage:
          typeof axiosError.response.data === 'string'
            ? axiosError.response.data
            : JSON.stringify(axiosError.response.data) ?? 'Request failed',
        rawContent:
          typeof axiosError.response.data === 'string'
            ? axiosError.response.data
            : JSON.stringify(axiosError.response.data),
        headers: this.extractHeaders(axiosError.response.headers ?? {}),
      };
    }

    if (axiosError?.isCircuitBreakerError) {
      return {
        statusCode: 503,
        errorMessage: axiosError.message ?? 'Circuit breaker open',
        rawContent: null,
        headers: {},
      };
    }

    return {
      statusCode: 0,
      errorMessage: axiosError?.message ?? 'Unknown error',
      rawContent: null,
      headers: {},
    };
  }
}
