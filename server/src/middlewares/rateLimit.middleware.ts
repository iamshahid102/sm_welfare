import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

/**
 * Rate limiter for POST /api/v1/auth/login — 10 requests per 15 minutes per IP.
 * Prevents brute-force / credential-stuffing attacks.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    _next(new ApiError(429, 'Too many attempts. Please try again later.'));
  },
});

/**
 * Rate limiter for POST /api/v1/auth/refresh — 30 requests per 15 minutes per IP.
 * Prevents token-refresh abuse while allowing normal session renewal.
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    _next(new ApiError(429, 'Too many attempts. Please try again later.'));
  },
});

/**
 * Rate limiter for the unauthenticated write endpoints — form submissions
 * (POST /api/v1/forms/submit) and contact messages (POST /api/v1/contact).
 * 10 submissions per 15 minutes per IP keeps the public forms usable for a
 * real visitor while blunting spam floods, since both endpoints are open to
 * anonymous clients.
 */
export const submissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    _next(
      new ApiError(429, 'Too many submissions. Please try again later.'),
    );
  },
});
