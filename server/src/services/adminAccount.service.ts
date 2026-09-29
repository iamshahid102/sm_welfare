import { EMAIL_PATTERN } from '../constants/user.js';
import { UserModel } from '../models/user.model.js';
import type { SafeUser } from '../types/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { serializeSafeUser } from '../utils/auth.js';
import { isDuplicateKeyError } from '../utils/mongo.js';
import { hashPassword, MAX_PASSWORD_BYTES } from '../utils/password.js';

/**
 * Single administrator provisioning service.
 *
 * This CMS is operated by exactly ONE admin account, so this is the ONLY code
 * path that creates a user - and it can run only once. It is invoked
 * exclusively by the server-side CLI (scripts/provisionAdmin.ts); there is
 * deliberately no HTTP route for it, so neither an unauthenticated request nor
 * an existing session can ever create a second account.
 *
 * Security properties:
 *  - credentials are validated and normalized exactly like the User schema
 *    (trim + lowercase email, EMAIL_PATTERN, the shared 72-byte bcrypt limit)
 *  - the password goes through the existing hashPassword() utility - bcrypt
 *    logic is never duplicated here
 *  - the document is always created with the single ADMIN role and status
 *    ACTIVE; neither is taken from input
 *  - provisioning fails safely if ANY user already exists (ACTIVE or
 *    INACTIVE) - this is a strict one-time operation
 *  - the returned value is serializeSafeUser(): passwordHash can never leave
 *    the server through this service
 */

const ACTIVE_STATUS = 'ACTIVE' as const;

/** Fallback display name when the operator does not provide one. */
export const DEFAULT_ADMIN_NAME = 'Administrator';

const MAX_NAME_LENGTH = 100; // mirrors the User schema maxlength

export interface AdminCredentials {
  email: string;
  password: string;
}

/**
 * Validates provisioning credentials before any database work.
 * Email is normalized exactly like the User model (trim + lowercase).
 * Throws ApiError(400) on missing or malformed input; the message never
 * echoes the password itself.
 */
export function validateAdminCredentials(
  email: unknown,
  password: unknown,
): AdminCredentials {
  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new ApiError(400, 'Email is required.');
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new ApiError(400, 'Provide a valid email address.');
  }
  if (typeof password !== 'string' || password.trim().length === 0) {
    throw new ApiError(400, 'Password is required.');
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new ApiError(400, `Password must not exceed ${MAX_PASSWORD_BYTES} bytes.`);
  }
  return { email: normalizedEmail, password };
}

/** Validates the optional display name; falls back to the default when absent. */
function validateName(name: unknown): string {
  if (name === undefined || name === null) {
    return DEFAULT_ADMIN_NAME;
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ApiError(400, 'Name is required.');
  }
  const trimmed = name.trim();
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new ApiError(400, `Name must not exceed ${MAX_NAME_LENGTH} characters.`);
  }
  return trimmed;
}

/**
 * Creates the one administrator account.
 *
 * Fails safely (409, nothing created) when any user already exists - the
 * account is strictly one-time, so the single-admin guarantee can never be
 * broken by re-running the CLI. The duplicate-key fallback covers the race
 * between the existence check and the insert - the unique email index is the
 * authoritative guard.
 */
export async function provisionAdmin(
  email: unknown,
  password: unknown,
  name?: unknown,
): Promise<SafeUser> {
  const { email: normalizedEmail, password: plainPassword } =
    validateAdminCredentials(email, password);
  const displayName = validateName(name);

  // Fail-safe guard: any existing account (ACTIVE or INACTIVE) blocks
  // provisioning, so there can only ever be one admin.
  const existing = await UserModel.exists({});
  if (existing) {
    throw new ApiError(
      409,
      'An administrator account already exists; provisioning is a one-time operation.',
    );
  }

  const passwordHash = await hashPassword(plainPassword);
  try {
    const user = await UserModel.create({
      name: displayName,
      email: normalizedEmail,
      passwordHash,
      role: 'ADMIN',
      status: ACTIVE_STATUS,
    });
    return serializeSafeUser(user);
  } catch (error) {
    // Race between the exists check and the insert: the unique index wins.
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A user with this email already exists.');
    }
    throw error;
  }
}
