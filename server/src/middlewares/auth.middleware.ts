import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AUTH_ACCESS_COOKIE } from '../constants/auth.js';
import { UserModel } from '../models/user.model.js';
import type { AuthenticatedUser } from '../types/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAuthToken } from '../utils/auth.js';

/**
 * requireAuth - guards every protected route.
 *
 *   1. reads the access credential from its HttpOnly cookie
 *   2. validates the JWT signature and expiry
 *   3. reloads the user from the database (authoritative account state)
 *   4. rejects non-ACTIVE accounts
 *   5. attaches a typed context and calls next()
 *
 * This CMS has exactly one administrator account and one role, so there is no
 * separate role-authorization layer: passing requireAuth already means "the
 * one admin". Only generic 401 messages leave the server - token internals
 * never do.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[AUTH_ACCESS_COOKIE];
    if (typeof token !== 'string' || token.length === 0) {
      throw new ApiError(401, 'Authentication required.');
    }

    const verified = await verifyAuthToken(token, 'access', env.authAccessTokenSecret);

    // Never trust the account state from the token - the database is
    // authoritative.
    const user = await UserModel.findById(verified.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new ApiError(401, 'Authentication required.');
    }

    const authUser: AuthenticatedUser = { id: user.id, role: user.role };
    req.authUser = authUser;
    next();
  } catch (error) {
    // Distinguish "no credential" from "credential present but invalid/expired".
    next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired credentials.'));
  }
};
