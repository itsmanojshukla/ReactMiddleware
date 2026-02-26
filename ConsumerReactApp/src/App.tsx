import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApiClientProvider } from '@middleware/core/apiClientProvider';
import { Dashboard } from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const middlewareConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeoutMs: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  retry: {
    maxRetries: Number(import.meta.env.VITE_RETRY_COUNT) || 3,
    baseDelayMs: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeoutMs: 30000,
  },
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientProvider config={middlewareConfig}>
        <Dashboard />
      </ApiClientProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
