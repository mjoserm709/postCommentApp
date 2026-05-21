export interface ApiErrorDetails {
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorDetails;
}

export class ApiResponse {
  static success<T>(message: string, data: T): ApiSuccessResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error: ApiErrorDetails = {}): ApiErrorResponse {
    return {
      success: false,
      message,
      error,
    };
  }
}
