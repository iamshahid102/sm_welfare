import { env } from '../config/env.js';
import { RefreshSessionModel } from '../models/refreshSession.model.js';
import { UserModel } from '../models/user.model.js';
import type { AuthTokens, SafeUser } from '../types/auth.js';
import { ApiError } from '../utils/ApiError.js';
import {
  hashRefreshToken,
  serializeSafeUser,
  signAuthToken,
  verifyAuthToken,
} from '../utils/auth.js';
import { verifyPassword } from '../utils/password.js';
import { ADMIN_ROLE, EMAIL_PATTERN, type UserRole } from '../constants/user.js';

// Precomputed bcrypt hash of a random throwaway string (cost 12, same as the
// configured work factor). Used to equalize login timing for unknown emails so
// account existence cannot be inferred from response latency.
const DUMMY_PASSWORD_HASH = '$2b$12$fLabzU2lkr5nIuMfwsFfteKUeSTdue.mWwZRKRUUnPClYAU4Lkz.a';

/**
 * Generic failure for every bad-login variant (unknown email, wrong password,
 * inactive user). Never reveals whether a specific account exists.
 */
const GENERIC_LOGIN_ERROR = 'Invalid email or password.';

/** Generic failure for refresh/session problems - internal details stay hidden. */
const GENERIC_SESSION_ERROR = 'Invalid or expired credentials.';

export interface LoginResult {
  user: SafeUser;
  tokens: AuthTokens;
}

/**
 * Validates login input before any database work.
 * Email is normalized exactly like the User model (trim + lowercase).
 * Throws ApiError(400) on malformed or missing input.
 */
export function validateLoginInput(
  email: unknown,
  password: unknown,
): { email: string; password: string } {
  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new ApiError(400, 'Email and password are required.');
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new ApiError(400, 'Provide a valid email address.');
  }
  if (typeof password !== 'string' || password.trim().length === 0) {
    throw new ApiError(400, 'Email and password are required.');
  }
  return { email: normalizedEmail, password };
}

async function signTokens(userId: string, role: UserRole): Promise<AuthTokens> {
  const accessToken = await signAuthToken({
    userId,
    role,
    type: 'access',
    ttlSeconds: env.authAccessTokenTtlSeconds,
    secret: env.authAccessTokenSecret,
  });
  const refreshToken = await signAuthToken({
    userId,
    role,
    type: 'refresh',
    ttlSeconds: env.authRefreshTokenTtlSeconds,
    secret: env.authRefreshTokenSecret,
  });
  return { accessToken, refreshToken };
}

/** Persists a refresh session keyed by the token hash (raw token never stored). */
async function persistRefreshSession(userId: string, refreshToken: string): Promise<void> {
  await RefreshSessionModel.create({
    userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + env.authRefreshTokenTtlSeconds * 1000),
  });
}

/** Verifies a password against the stored hash; malformed input counts as a failed attempt. */
async function passwordMatchesStored(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await verifyPassword(password, passwordHash);
  } catch {
    return false;
  }
}

/**
 * Authenticates credentials and issues fresh access + refresh credentials.
 * Exactly one administrator account can exist; any failure (unknown user,
 * wrong password, inactive account) maps to the same generic 401.
 */
export async function login(email: unknown, password: unknown): Promise<LoginResult> {
  const { email: normalizedEmail, password: plainPassword } = validateLoginInput(email, password);

  const user = await UserModel.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    // Burn a bcrypt comparison so unknown emails take the same time as a wrong
    // password - response latency must not reveal whether the account exists.
    await passwordMatchesStored(plainPassword, DUMMY_PASSWORD_HASH);
    throw new ApiError(401, GENERIC_LOGIN_ERROR);
  }

  // Verify the password even for inactive accounts so the response timing does
  // not leak account state.
  const passwordMatches = await passwordMatchesStored(plainPassword, user.passwordHash);
  if (!passwordMatches || user.status !== 'ACTIVE') {
    throw new ApiError(401, GENERIC_LOGIN_ERROR);
  }

  // Targeted update instead of a full-document save():
  //  - only the two fields that actually change are written
  //  - full-document validation is skipped, so a legacy document provisioned
  //    with an older multi-role value can never fail to log in - it is healed
  //    to the single ADMIN role right here
  await UserModel.updateOne(
    { _id: user.id },
    { $set: { lastLoginAt: new Date(), role: ADMIN_ROLE } },
  );

  const tokens = await signTokens(user.id, user.role);
  await persistRefreshSession(user.id, tokens.refreshToken);

  return { user: serializeSafeUser(user), tokens };
}

/**
 * Verifies the refresh credential, rotates the session and issues fresh
 * credentials. Rotation invalidates the presented token for future use.
 */
export async function refresh(refreshToken: string | undefined): Promise<LoginResult> {
  if (!refreshToken) {
    throw new ApiError(401, GENERIC_SESSION_ERROR);
  }

  let verified;
  try {
    verified = await verifyAuthToken(refreshToken, 'refresh', env.authRefreshTokenSecret);
  } catch {
    throw new ApiError(401, GENERIC_SESSION_ERROR);
  }

  // Atomically consume the old session (findOneAndDelete) so concurrent replays
  // of the same refresh token cannot both rotate successfully.
  const session = await RefreshSessionModel.findOneAndDelete({
    tokenHash: hashRefreshToken(refreshToken),
  });
  if (!session) {
    throw new ApiError(401, GENERIC_SESSION_ERROR);
  }

  const user = await UserModel.findById(verified.userId);
  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, GENERIC_SESSION_ERROR);
  }

  const tokens = await signTokens(user.id, user.role);
  await persistRefreshSession(user.id, tokens.refreshToken);

  return { user: serializeSafeUser(user), tokens };
}

/**
 * Ends the session identified by the refresh credential and clears all auth
 * state. Safe to call when already logged out - a missing/expired refresh
 * credential is simply ignored.
 */
export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) {
    return;
  }
  await RefreshSessionModel.deleteOne({ tokenHash: hashRefreshToken(refreshToken) });
}

/** Loads the current user fresh from the database for GET /auth/me. */
export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await UserModel.findById(userId);
  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'Authentication required.');
  }
  return serializeSafeUser(user);
}
