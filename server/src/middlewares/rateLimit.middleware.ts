import { rateLimit } from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

/**
 * `rateLimit` is imported as a **named** import on purpose.
 *
 * express-rate-limit ships the factory both as the default export and as a
 * named export (`export declare const rateLimit`). Which declaration file
 * TypeScript resolves depends on the consumer's module resolution, and under
 * some of them the default import is typed as the module *namespace*, so
 * calling it reports `TS2349: This expression is not callable` (this is the
 * same dual-typing problem that forced the helmet normalisation in `app.ts`,
 * and it is what Vercel's own typecheck step hits).
 *
 * A named import resolves through the same `exports` conditions but is never
 * synthesised, so it types correctly under ESM, CJS and bundler resolution
 * alike. The runtime exposes `rateLimit` as a named export in both
 * `dist/index.mjs` and `dist/index.cjs`, so this holds at runtime too.
 */

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
