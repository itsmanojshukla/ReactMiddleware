import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

export function createRequestLogger() {
  return (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.metadata = { startTime: Date.now() };
    console.info(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      hasBody: !!config.data,
    });
    return config;
  };
}

export function createResponseLogger() {
  return (response: AxiosResponse): AxiosResponse => {
    const duration = response.config.metadata ? Date.now() - response.config.metadata.startTime : 0;
    console.info(
      `[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`,
      {
        statusText: response.statusText,
        dataSize: JSON.stringify(response.data)?.length || 0,
      }
    );
    return response;
  };
}
