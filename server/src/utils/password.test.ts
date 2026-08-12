import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashPassword, verifyPassword } from './password.js';

/**
 * Password utility tests - pure in-memory, no MongoDB or network required.
 * The test passwords below are synthetic; no real user credentials are used.
 */

const VALID_PASSWORD = 'Correct-Horse-Battery-Staple!';
const PASSWORD_AT_LIMIT = 'a'.repeat(72); // exactly at the bcrypt 72-byte limit
const PASSWORD_OVER_LIMIT = 'a'.repeat(73);

describe('hashPassword', () => {
  it('produces a bcrypt hash for a valid password', async () => {
    const passwordHash = await hashPassword(VALID_PASSWORD);

    // Standard bcrypt format: $2<variant>$<cost>$<22-char salt><31-char checksum>
    assert.match(passwordHash, /^\$2[aby]\$\d{2}\$/);
    assert.equal(passwordHash.length, 60);
  });

  it('returns a hash that is not the plaintext password', async () => {
    const passwordHash = await hashPassword(VALID_PASSWORD);

    assert.notEqual(passwordHash, VALID_PASSWORD);
    assert.equal(passwordHash.includes(VALID_PASSWORD), false);
  });

  it('produces different hashes for the same password (random salt)', async () => {
    const [first, second] = await Promise.all([
      hashPassword(VALID_PASSWORD),
      hashPassword(VALID_PASSWORD),
    ]);

    assert.notEqual(first, second);
  });

  it('rejects an empty or whitespace-only password', async () => {
    await assert.rejects(hashPassword(''), /must not be empty/);
    await assert.rejects(hashPassword('   '), /must not be empty/);
  });

  it('rejects a password longer than the bcrypt 72-byte limit', async () => {
    await assert.rejects(hashPassword(PASSWORD_OVER_LIMIT), /72 bytes/);
  });

  it('accepts a password at exactly the 72-byte limit', async () => {
    const passwordHash = await hashPassword(PASSWORD_AT_LIMIT);
    assert.equal(passwordHash.length, 60);
  });
});

describe('verifyPassword', () => {
  it('verifies the correct password against its hash', async () => {
    const passwordHash = await hashPassword(VALID_PASSWORD);

    assert.equal(await verifyPassword(VALID_PASSWORD, passwordHash), true);
  });

  it('rejects an incorrect password', async () => {
    const passwordHash = await hashPassword(VALID_PASSWORD);

    assert.equal(await verifyPassword('Wrong-Password!', passwordHash), false);
  });

  it('rejects invalid password input', async () => {
    const passwordHash = await hashPassword(VALID_PASSWORD);

    await assert.rejects(verifyPassword('', passwordHash), /must not be empty/);
    await assert.rejects(verifyPassword(PASSWORD_OVER_LIMIT, passwordHash), /72 bytes/);
  });

  it('returns false for an empty or malformed stored hash', async () => {
    assert.equal(await verifyPassword(VALID_PASSWORD, ''), false);
    assert.equal(await verifyPassword(VALID_PASSWORD, 'not-a-bcrypt-hash'), false);
  });
});
