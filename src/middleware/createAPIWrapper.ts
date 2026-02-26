import axios, { type AxiosRequestConfig } from 'axios';
import type { APIWrapperConfig, Middleware, NextMiddleware, RequestConfig, ResponseData } from './types';
import { applyMiddleware } from './applyMiddleware';

export function createAPIWrapper(wrapperConfig: APIWrapperConfig = {}) {
  const { baseURL = '', defaultHeaders = {}, timeout = 30000 } = wrapperConfig;

  const instance = axios.create({ baseURL, timeout, headers: defaultHeaders });

  const coreHandler: NextMiddleware = async <T>(config: RequestConfig): Promise<ResponseData<T>> => {
    const axiosConfig: AxiosRequestConfig = {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.body,
      signal: config.signal,
    };
    const response = await instance.request<T>(axiosConfig);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
    };
  };

  function request<T = unknown>(
    config: RequestConfig,
    middlewares: Middleware[] = []
  ): Promise<ResponseData<T>> {
    const pipeline = applyMiddleware<T>(middlewares as Middleware<T>[], coreHandler as NextMiddleware<T>);
    return pipeline(config);
  }

  return { request, instance };
}
