/** Successful JSON response body for every API endpoint. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Error JSON response body produced by the centralized error handler. */
export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    stack?: string;
  };
}
