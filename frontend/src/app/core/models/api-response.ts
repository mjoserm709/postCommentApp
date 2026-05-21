export interface ApiErrorPayload {
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: ApiErrorPayload;
}
