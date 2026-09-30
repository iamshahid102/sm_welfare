import { createHash, randomUUID } from 'node:crypto';
import type { CookieOptions } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { USER_ROLES, type UserRole, type UserStatus } from '../constants/user.js';
import type { AuthTokenType, SafeUser } from '../types/auth.js';

/** HS256 with a server-only random secret - no weak or deprecated algorithms. */
const SIGNING_ALGORITHM = 'HS256';

const VALID_ROLES = new Set<string>(USER_ROLES);

/** Encodes the string secret into the bytes jose expects for HS256. */
function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/**
 * Signs a minimal JWT carrying only identity + token-type claims.
 *
 * Every token gets a unique `jti` (random UUID): `iat` has second granularity,
 * so two tokens signed within the same second would otherwise be byte-identical
 * - unacceptable for refresh rotation, where a new credential must never equal
 * the one it replaces.
 */
export async function signAuthToken(params: {
  userId: string;
  role: UserRole;
  type: AuthTokenType;
  ttlSeconds: number;
  secret: string;
}): Promise<string> {
  return new SignJWT({ role: params.role, type: params.type, jti: randomUUID() })
    .setProtectedHeader({ alg: SIGNING_ALGORITHM })
    .setSubject(params.userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + params.ttlSeconds)
    .sign(secretKey(params.secret));
}

export interface VerifiedToken {
  userId: string;
  role: UserRole;
  type: AuthTokenType;
}

/**
 * Verifies signature, expiry and token type.
 *
 * Throws jose errors on any violation (callers map them to a generic 401 -
 * the details must never reach the client).
 */
export async function verifyAuthToken(
  token: string,
  expectedType: AuthTokenType,
  secret: string,
): Promise<VerifiedToken> {
  const { payload } = await jwtVerify(token, secretKey(secret), {
    algorithms: [SIGNING_ALGORITHM],
  });

  const { sub, role, type, jti } = payload;
  if (
    typeof sub !== 'string' ||
    typeof role !== 'string' ||
    !VALID_ROLES.has(role) ||
    type !== expectedType ||
    typeof jti !== 'string'
  ) {
    throw new Error('token payload is malformed');
  }

  return { userId: sub, role: role as UserRole, type: type as AuthTokenType };
}

/**
 * Cookie flags shared by both credentials.
 *
 * httpOnly keeps the credential unreadable by frontend JavaScript; secure is
 * driven by AUTH_COOKIE_SECURE (defaults to true in production); sameSite is
 * the CSRF strategy baseline (lax blocks cross-site POSTs from other origins).
 */
function baseCookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.authCookieSecure,
    sameSite: env.authCookieSameSite,
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  };
}

export function accessCookieOptions(): CookieOptions {
  return baseCookieOptions(env.authAccessTokenTtlSeconds);
}

export function refreshCookieOptions(): CookieOptions {
  return baseCookieOptions(env.authRefreshTokenTtlSeconds);
}

/** Max-Age=0 with the same flags - tells the browser to delete the cookie. */
export function clearingCookieOptions(): CookieOptions {
  return baseCookieOptions(0);
}

/**
 * The session hint is deliberately NOT HttpOnly: the whole point is that
 * frontend JavaScript can read it to decide whether to probe the session. It
 * mirrors the refresh credential's lifetime (the longest-lived secret) so the
 * hint never outlives the session it advertises.
 */
export function sessionHintCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(env.authRefreshTokenTtlSeconds),
    httpOnly: false,
  };
}

/** Max-Age=0 with the same flags - tells the browser to delete the hint. */
export function clearingSessionHintCookieOptions(): CookieOptions {
  return { ...sessionHintCookieOptions(), maxAge: 0 };
}

/**
 * SHA-256 hex digest of a refresh token - the only form ever persisted.
 * The raw token is never stored in MongoDB.
 */
export function hashRefreshToken(refreshToken: string): string {
  return createHash('sha256').update(refreshToken).digest('hex');
}

/** Fields a loaded user document must expose for safe serialization. */
export interface SerializableUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Picks only client-safe fields from a loaded user document. */
export function serializeSafeUser(user: SerializableUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt?.toISOString() ?? '',
    updatedAt: user.updatedAt?.toISOString() ?? '',
  };
}
