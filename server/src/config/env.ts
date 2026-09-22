import dotenv from 'dotenv';
import { APP_NAME } from '../constants/index.js';

// Load environment variables: use .env.test during test runs, .env otherwise.
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

/**
 * Centralized environment configuration.
 * All `process.env` access for the server lives in this module.
 */

const DEFAULT_BCRYPT_ROUNDS = 12;
const MIN_BCRYPT_ROUNDS = 4;
const MAX_BCRYPT_ROUNDS = 16;

// Authentication secrets must be strong server-only random strings.
const MIN_AUTH_SECRET_LENGTH = 32;
const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOrigins(value: string | undefined, fallback: string[]): string[] {
  if (!value) {
    return fallback;
  }
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value === 'true';
}

type SameSiteOption = 'lax' | 'strict' | 'none';

function toSameSite(value: string | undefined): SameSiteOption {
  const candidate = value?.toLowerCase();
  if (candidate === 'lax' || candidate === 'strict' || candidate === 'none') {
    return candidate;
  }
  if (candidate !== undefined) {
    console.warn(
      `[${APP_NAME}] AUTH_COOKIE_SAMESITE=${value} is invalid; expected lax, strict or none. Using lax.`,
    );
  }
  return 'lax';
}

/**
 * bcrypt work factor (cost). Must be an integer within a safe range: below 4
 * the hash is trivially fast, above 16 it can stall the event loop. Invalid
 * values are rejected with a warning and the default is used instead.
 */
function toBcryptRounds(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_BCRYPT_ROUNDS;
  }
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < MIN_BCRYPT_ROUNDS ||
    parsed > MAX_BCRYPT_ROUNDS
  ) {
    console.warn(
      `[${APP_NAME}] BCRYPT_ROUNDS=${value} is invalid; expected an integer between ${MIN_BCRYPT_ROUNDS} and ${MAX_BCRYPT_ROUNDS}. Using ${DEFAULT_BCRYPT_ROUNDS}.`,
    );
    return DEFAULT_BCRYPT_ROUNDS;
  }
  return parsed;
}

/**
 * Authentication secrets are required at startup - refusing to boot with a
 * missing or weak secret is safer than running with an insecure default.
 * Generate them with: openssl rand -hex 32
 */
function requireSecret(name: string, value: string | undefined): string {
  if (value === undefined || value.length < MIN_AUTH_SECRET_LENGTH) {
    throw new Error(
      `${name} must be set to a random string of at least ${MIN_AUTH_SECRET_LENGTH} characters (see server/.env.example).`,
    );
  }
  return value;
}

const authAccessTokenSecret = requireSecret(
  'AUTH_ACCESS_TOKEN_SECRET',
  process.env.AUTH_ACCESS_TOKEN_SECRET,
);
const authRefreshTokenSecret = requireSecret(
  'AUTH_REFRESH_TOKEN_SECRET',
  process.env.AUTH_REFRESH_TOKEN_SECRET,
);
const authCookieSecure = toBoolean(process.env.AUTH_COOKIE_SECURE, isProduction);
const authCookieSameSite = toSameSite(process.env.AUTH_COOKIE_SAMESITE);

// SameSite=None cookies are rejected by browsers unless they are Secure.
if (authCookieSameSite === 'none' && !authCookieSecure) {
  throw new Error('AUTH_COOKIE_SAMESITE=none requires AUTH_COOKIE_SECURE=true.');
}

export const env = {
  nodeEnv,
  isProduction,
  host: process.env.HOST ?? '0.0.0.0',
  port: toNumber(process.env.PORT, 4000),
  corsOrigins: toOrigins(process.env.CORS_ORIGINS, ['http://localhost:3000']),
  // Optional at import time; validated before connecting (see config/database.ts).
  mongodbUri: process.env.MONGODB_URI,
  // bcrypt work factor for password hashing (consumed by utils/password.ts).
  bcryptRounds: toBcryptRounds(process.env.BCRYPT_ROUNDS),
  // Cloudinary media upload credentials (server-only). Optional at import time;
  // validated in config/cloudinary.ts - never exposed to the client.
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  // Server-only JWT secrets - never exposed to the client.
  authAccessTokenSecret,
  authRefreshTokenSecret,
  authAccessTokenTtlSeconds: toNumber(
    process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
    DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  ),
  authRefreshTokenTtlSeconds: toNumber(
    process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
    DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
  ),
  // HttpOnly cookie policy (defaults: secure in production, SameSite=lax).
  authCookieSecure,
  authCookieSameSite,
} as const;
