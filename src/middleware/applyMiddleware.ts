import type { Middleware, NextMiddleware, RequestConfig, ResponseData } from './types';

export function applyMiddleware<T = unknown>(
  middlewares: Middleware<T>[],
  coreHandler: NextMiddleware<T>
): NextMiddleware<T> {
  return middlewares.reduceRight(
    (next: NextMiddleware<T>, middleware: Middleware<T>): NextMiddleware<T> =>
      (config: RequestConfig) => middleware(config, next),
    coreHandler
  );
}
