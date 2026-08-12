import { compare, hash } from 'bcryptjs';
import { env } from '../config/env.js';

/**
 * bcrypt derives its key from the first 72 bytes of input only; longer
 * passwords are silently truncated, which would let two distinct long
 * passwords verify against the same hash. Rejecting them upfront (the policy
 * used by Rails' has_secure_password and Django's bcrypt backend) avoids this
 * footgun and keeps the input domain identical for both functions.
 *
 * Exported so callers (e.g. admin user creation) can validate the same limit
 * and surface a 400 instead of letting hashing throw a generic 500.
 */
export const MAX_PASSWORD_BYTES = 72;

/**
 * Guards every password entering the hashing/verification pipeline.
 * Rejects empty and whitespace-only input so a blank password can never be
 * stored, and input beyond the bcrypt 72-byte limit.
 */
function assertValidPassword(password: string): void {
  if (password.trim().length === 0) {
    throw new Error('password must not be empty or whitespace-only');
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new Error(`password must not exceed ${MAX_PASSWORD_BYTES} bytes`);
  }
}

/**
 * Hashes a password for storage using bcrypt with a random salt and the
 * configured work factor (env.bcryptRounds). The returned hash contains the
 * salt and cost, so verification needs no extra configuration.
 *
 * Never log the password or the returned hash.
 */
export async function hashPassword(password: string): Promise<string> {
  assertValidPassword(password);
  return hash(password, env.bcryptRounds);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 * Returns false for an empty or malformed stored hash; throws only on invalid
 * password input (same domain as hashPassword).
 */
export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  assertValidPassword(password);
  if (passwordHash.length === 0) {
    return false;
  }
  return compare(password, passwordHash);
}
