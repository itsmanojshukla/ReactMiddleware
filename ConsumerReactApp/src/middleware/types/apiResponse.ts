export interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  data: T | null;
  rawContent: string | null;
  errorMessage: string | null;
  headers: Record<string, string>;
  durationMs: number;
}

export const ApiResponseFactory = {
  success<T>(
    data: T,
    statusCode: number,
    rawContent: string,
    headers: Record<string, string>,
    durationMs: number
  ): ApiResponse<T> {
    return { isSuccess: true, statusCode, data, rawContent, errorMessage: null, headers, durationMs };
  },
  failure<T>(
    statusCode: number,
    errorMessage: string,
    rawContent: string | null = null,
    headers: Record<string, string> = {},
    durationMs: number = 0
  ): ApiResponse<T> {
    return { isSuccess: false, statusCode, data: null, rawContent, errorMessage, headers, durationMs };
  },
};
