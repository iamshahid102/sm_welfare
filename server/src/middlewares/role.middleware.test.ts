import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Request, RequestHandler, Response } from 'express';
import type { AuthenticatedUser } from '../types/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { requireRole } from './role.middleware.js';

interface InvocationResult {
  calledNext: boolean;
  error: ApiError | undefined;
}

/** Runs the synchronous middleware with a stub request and captures the outcome. */
function invoke(
  middleware: RequestHandler,
  authUser: AuthenticatedUser | undefined,
): InvocationResult {
  const req = { authUser } as Request;
  const res = {} as Response;
  let passed = false;
  let error: ApiError | undefined;
  middleware(req, res, (nextError?: unknown) => {
    if (nextError === undefined) {
      passed = true;
    } else if (nextError instanceof ApiError) {
      error = nextError;
    }
  });
  return { calledNext: passed, error };
}

const SUPER_ADMIN: AuthenticatedUser = { id: 'user-super', role: 'SUPER_ADMIN' };
const ADMIN: AuthenticatedUser = { id: 'user-admin', role: 'ADMIN' };

describe('requireRole', () => {
  it('allows SUPER_ADMIN when SUPER_ADMIN is required', () => {
    const result = invoke(requireRole('SUPER_ADMIN'), SUPER_ADMIN);
    assert.equal(result.calledNext, true);
    assert.equal(result.error, undefined);
  });

  it('allows ADMIN when ADMIN is required', () => {
    const result = invoke(requireRole('ADMIN'), ADMIN);
    assert.equal(result.calledNext, true);
  });

  it('rejects ADMIN from a SUPER_ADMIN-only middleware with 403', () => {
    const result = invoke(requireRole('SUPER_ADMIN'), ADMIN);
    assert.equal(result.calledNext, false);
    assert.ok(result.error instanceof ApiError);
    assert.equal(result.error.statusCode, 403);
    assert.equal(result.error.message, 'Insufficient permissions.');
  });

  it('rejects SUPER_ADMIN from an ADMIN-only middleware with 403 (no implicit hierarchy)', () => {
    const result = invoke(requireRole('ADMIN'), SUPER_ADMIN);
    assert.equal(result.calledNext, false);
    assert.equal(result.error?.statusCode, 403);
  });

  it('allows either role when multiple roles are allowed', () => {
    const middleware = requireRole('ADMIN', 'SUPER_ADMIN');
    assert.equal(invoke(middleware, ADMIN).calledNext, true);
    assert.equal(invoke(middleware, SUPER_ADMIN).calledNext, true);
  });

  it('fails safely with 401 when the authenticated context is missing', () => {
    const result = invoke(requireRole('SUPER_ADMIN'), undefined);
    assert.equal(result.calledNext, false);
    assert.equal(result.error?.statusCode, 401);
    assert.equal(result.error?.message, 'Authentication required.');
  });

  it('rejects every user when no roles are allowed (safe default)', () => {
    const middleware = requireRole();
    assert.equal(invoke(middleware, ADMIN).error?.statusCode, 403);
    assert.equal(invoke(middleware, SUPER_ADMIN).error?.statusCode, 403);
  });

  it('rejects arbitrary role strings at compile time', () => {
    // 'EDITOR' is not part of the UserRole union - TypeScript must reject it.
    // @ts-expect-error - 'EDITOR' is not a valid UserRole
    requireRole('EDITOR');
  });
});
