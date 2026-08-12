import type { Request } from 'express';
import type { UserRole, UserStatus } from '../constants/user.js';

/** The two credential kinds issued by the auth service. */
export type AuthTokenType = 'access' | 'refresh';

/**
 * Minimal claims carried in signed JWTs.
 *
 * Deliberately no email, no permissions, no user document - the server always
 * reloads the user from the database where authority matters (middleware uses
 * the live role/status, never the token).
 */
export interface AuthTokenPayload {
  role: UserRole;
  type: AuthTokenType;
  /** Unique token id (random UUID) - guarantees no two tokens are identical. */
  jti: string;
}

/** Authenticated user context attached to the request by requireAuth. */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

/** A request that has passed requireAuth (authUser is guaranteed to exist). */
export interface AuthenticatedRequest extends Request {
  authUser: AuthenticatedUser;
}

/** Pair of freshly signed credentials returned to the controller. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * User information that is safe to return to clients.
 * Never contains passwordHash or any credential material.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Express namespace augmentation is the canonical way to extend Request.
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth; undefined on unprotected routes. */
      authUser?: AuthenticatedUser;
    }
  }
}
