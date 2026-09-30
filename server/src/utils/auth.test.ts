import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SignJWT } from 'jose';
import { env } from '../config/env.js';
import {
  accessCookieOptions,
  clearingCookieOptions,
  clearingSessionHintCookieOptions,
  hashRefreshToken,
  refreshCookieOptions,
  serializeSafeUser,
  sessionHintCookieOptions,
  signAuthToken,
  verifyAuthToken,
} from './auth.js';

describe('auth utils', () => {
  it('signs and verifies an access token with the expected claims', async () => {
    const token = await signAuthToken({
      userId: 'user-1',
      role: 'ADMIN',
      type: 'access',
      ttlSeconds: 900,
      secret: env.authAccessTokenSecret,
    });

    const verified = await verifyAuthToken(token, 'access', env.authAccessTokenSecret);
    assert.equal(verified.userId, 'user-1');
    assert.equal(verified.role, 'ADMIN');
    assert.equal(verified.type, 'access');
  });

  it('never issues two identical tokens, even within the same second', async () => {
    const params = {
      userId: 'user-1',
      role: 'ADMIN' as const,
      type: 'refresh' as const,
      ttlSeconds: 900,
      secret: env.authAccessTokenSecret,
    };

    // Signed back-to-back within the same `iat` second: with only second-level
    // iat, these would be byte-identical. The unique jti claim must differ them.
    const [first, second] = await Promise.all([
      signAuthToken(params),
      signAuthToken(params),
    ]);

    assert.notEqual(first, second);
    assert.match(first, /\./);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signAuthToken({
      userId: 'user-1',
      role: 'ADMIN',
      type: 'access',
      ttlSeconds: 900,
      secret: env.authAccessTokenSecret,
    });

    await assert.rejects(
      verifyAuthToken(token, 'access', 'a-different-secret-that-is-long-enough-123456'),
    );
  });

  it('rejects an expired token', async () => {
    const token = await signAuthToken({
      userId: 'user-1',
      role: 'ADMIN',
      type: 'access',
      ttlSeconds: -10,
      secret: env.authAccessTokenSecret,
    });

    await assert.rejects(verifyAuthToken(token, 'access', env.authAccessTokenSecret));
  });

  it('rejects a token presented with the wrong type', async () => {
    const token = await signAuthToken({
      userId: 'user-1',
      role: 'ADMIN',
      type: 'access',
      ttlSeconds: 900,
      secret: env.authAccessTokenSecret,
    });

    await assert.rejects(verifyAuthToken(token, 'refresh', env.authAccessTokenSecret));
  });

  it('rejects an access token signed with the refresh secret', async () => {
    const token = await signAuthToken({
      userId: 'user-1',
      role: 'ADMIN',
      type: 'access',
      ttlSeconds: 900,
      secret: env.authRefreshTokenSecret,
    });

    await assert.rejects(verifyAuthToken(token, 'access', env.authAccessTokenSecret));
  });

  it('rejects a token carrying an unknown role claim', async () => {
    const token = await new SignJWT({ role: 'EDITOR', type: 'access' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-1')
      .setExpirationTime(Math.floor(Date.now() / 1000) + 900)
      .sign(new TextEncoder().encode(env.authAccessTokenSecret));

    await assert.rejects(verifyAuthToken(token, 'access', env.authAccessTokenSecret));
  });

  it('hashes refresh tokens deterministically as 64 hex chars', () => {
    const first = hashRefreshToken('some-refresh-token');
    const second = hashRefreshToken('some-refresh-token');
    const other = hashRefreshToken('some-other-token');

    assert.equal(first, second);
    assert.notEqual(first, other);
    assert.match(first, /^[0-9a-f]{64}$/);
  });

  it('serializes a safe user without any credential material', () => {
    const safe = serializeSafeUser({
      id: 'user-1',
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      lastLoginAt: new Date('2026-08-12T00:00:00.000Z'),
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-02T00:00:00.000Z'),
    });

    assert.deepEqual(safe, {
      id: 'user-1',
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-12T00:00:00.000Z',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
    });
    assert.equal('passwordHash' in safe, false);
  });

  it('builds HttpOnly cookie options from the environment', () => {
    const access = accessCookieOptions();
    const refresh = refreshCookieOptions();

    for (const options of [access, refresh]) {
      assert.equal(options.httpOnly, true);
      assert.equal(options.path, '/');
      assert.equal(options.secure, env.authCookieSecure);
      assert.equal(options.sameSite, env.authCookieSameSite);
    }

    assert.equal(access.maxAge, env.authAccessTokenTtlSeconds * 1000);
    assert.equal(refresh.maxAge, env.authRefreshTokenTtlSeconds * 1000);
    assert.equal(clearingCookieOptions().maxAge, 0);
  });

  it('builds a readable session hint that mirrors the session lifetime', () => {
    const hint = sessionHintCookieOptions();

    // Readable by design: the frontend uses it to skip an anonymous probe.
    assert.equal(hint.httpOnly, false);
    assert.equal(hint.path, '/');
    assert.equal(hint.secure, env.authCookieSecure);
    assert.equal(hint.sameSite, env.authCookieSameSite);
    // Never outlives the refresh credential it advertises.
    assert.equal(hint.maxAge, env.authRefreshTokenTtlSeconds * 1000);

    const clearing = clearingSessionHintCookieOptions();
    assert.equal(clearing.maxAge, 0);
    assert.equal(clearing.httpOnly, false);
  });
});
