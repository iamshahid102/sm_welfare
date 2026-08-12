/**
 * Operational error with an HTTP status code that is safe to expose
 * to API clients. The centralized error handler converts instances of
 * this class into matching JSON error responses.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }
}
