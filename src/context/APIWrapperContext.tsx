import React, { createContext, useContext, useMemo } from 'react';
import { createAPIWrapper } from '../middleware/createAPIWrapper';
import type { APIWrapperConfig, Middleware } from '../middleware/types';

interface APIWrapperContextValue {
  request: ReturnType<typeof createAPIWrapper>['request'];
  globalMiddlewares: Middleware[];
}

const APIWrapperContext = createContext<APIWrapperContextValue | null>(null);

export interface APIWrapperProviderProps {
  children: React.ReactNode;
  config?: APIWrapperConfig;
  middlewares?: Middleware[];
}

export function APIWrapperProvider({
  children,
  config = {},
  middlewares = [],
}: APIWrapperProviderProps) {
  const wrapper = useMemo(() => createAPIWrapper(config), [config]);

  const value: APIWrapperContextValue = useMemo(
    () => ({ request: wrapper.request, globalMiddlewares: middlewares }),
    [wrapper, middlewares]
  );

  return (
    <APIWrapperContext.Provider value={value}>
      {children}
    </APIWrapperContext.Provider>
  );
}

export function useAPIWrapperContext(): APIWrapperContextValue {
  const ctx = useContext(APIWrapperContext);
  if (!ctx) {
    throw new Error('useAPIWrapperContext must be used within an APIWrapperProvider');
  }
  return ctx;
}
