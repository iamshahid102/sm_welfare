import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.js';
import type { ApiErrorResponse } from '../types/index.js';
import { ApiError } from '../utils/ApiError.js';

/** Responds with 404 for any request that did not match a registered route. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Extracts a client-facing HTTP status from HTTP-aware errors (e.g. express.json()). */
function httpErrorStatus(error: unknown): number | undefined {
  if (error !== null && typeof error === 'object' && 'status' in error) {
    const status = error.status;
    if (typeof status === 'number' && status >= 400 && status <= 599) {
      return status;
    }
  }
  return undefined;
}

/** Centralized error handler - the single place where errors become responses. */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    const payload: ApiErrorResponse = {
      success: false,
      error: { statusCode: error.statusCode, message: error.message },
    };
    res.status(error.statusCode).json(payload);
    return;
  }

  // HTTP-aware errors (e.g. malformed JSON bodies rejected by express.json())
  // carry their own status code - forward it to the client.
  const statusCode = httpErrorStatus(error) ?? 500;

  let message = 'Bad request';
  if (statusCode >= 500) {
    message = 'Internal server error';
    console.error('[UnhandledError]', error);
  } else if (error !== null && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    message = error.message;
  }

  const payload: ApiErrorResponse = {
    success: false,
    error: {
      statusCode,
      message,
      ...(env.isProduction ? {} : { stack: error instanceof Error ? error.stack : undefined }),
    },
  };
  res.status(statusCode).json(payload);
};
