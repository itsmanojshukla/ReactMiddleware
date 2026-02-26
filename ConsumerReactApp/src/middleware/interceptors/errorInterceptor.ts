import { AxiosError } from 'axios';

export function createErrorInterceptor() {
  return (error: AxiosError): Promise<never> => {
    const duration = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
    if (error.response) {
      console.error(
        `[API Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`,
        { statusText: error.response.statusText, data: error.response.data }
      );
    } else if (error.request) {
      console.error(
        `[API Error] No response from ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`,
        { message: error.message }
      );
    } else {
      console.error(`[API Error] Request setup failed: ${error.message}`);
    }
    return Promise.reject(error);
  };
}
