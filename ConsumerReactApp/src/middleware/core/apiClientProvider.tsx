import React, { createContext, useContext, useMemo } from 'react';
import { GenericApiClient } from './apiClient';
import { MiddlewareConfig } from '../types/middlewareConfig';

const ApiClientContext = createContext<GenericApiClient | null>(null);

interface ApiClientProviderProps {
  children: React.ReactNode;
  config?: Partial<MiddlewareConfig>;
}

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children, config }) => {
  const apiClient = useMemo(() => new GenericApiClient(config), []); // intentional singleton
  return <ApiClientContext.Provider value={apiClient}>{children}</ApiClientContext.Provider>;
};

export const useApiClientContext = (): GenericApiClient => {
  const context = useContext(ApiClientContext);
  if (!context) throw new Error('useApiClientContext must be used within <ApiClientProvider>');
  return context;
};
