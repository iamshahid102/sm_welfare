import { Types } from 'mongoose';
import {
  EMAIL_PATTERN,
  USER_STATUSES,
  type UserStatus,
} from '../constants/user.js';
import { UserModel } from '../models/user.model.js';
import type { SafeUser } from '../types/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { serializeSafeUser } from '../utils/auth.js';
import { hashPassword, MAX_PASSWORD_BYTES } from '../utils/password.js';

/**
 * Admin management service - SUPER_ADMIN-only account operations.
 *
 * Business rules enforced here (routes/controllers stay thin):
 *  - every created account is forced to role ADMIN (client input ignored)
 *  - only ADMIN documents are visible/manipulable - SUPER_ADMIN accounts are
 *    never exposed or modified through these endpoints (404)
 *  - no hard delete, no arbitrary role assignment, no status strings other
 *    than the UserStatus union
 */

const ADMIN_ROLE = 'ADMIN' as const;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 100;
// Upper bound keeps skip() offsets sane (10000 pages x 100 limit = 1M docs).
const MAX_PAGE = 10_000;
const MAX_NAME_LENGTH = 100; // mirrors the User schema maxlength

const VALID_STATUSES = new Set<string>(USER_STATUSES);

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export interface AdminListQuery {
  page: number;
  limit: number;
  search: string | undefined;
  status: UserStatus | undefined;
}

export interface AdminListResult {
  admins: SafeUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Identifies MongoDB duplicate-key (E11000) errors from the unique email index. */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000
  );
}

function assertValidName(name: unknown): string {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ApiError(400, 'Name is required.');
  }
  const trimmed = name.trim();
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new ApiError(400, `Name must not exceed ${MAX_NAME_LENGTH} characters.`);
  }
  return trimmed;
}

/** Normalizes email exactly like the User schema (trim + lowercase). */
function assertValidEmail(email: unknown): string {
  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new ApiError(400, 'Email is required.');
  }
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new ApiError(400, 'Provide a valid email address.');
  }
  return normalized;
}

function assertValidPassword(password: unknown): string {
  if (typeof password !== 'string' || password.trim().length === 0) {
    throw new ApiError(400, 'Password is required.');
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new ApiError(400, `Password must not exceed ${MAX_PASSWORD_BYTES} bytes.`);
  }
  return password;
}

/**
 * Validates create-admin input before any database work.
 * Role is deliberately absent: the service always forces ADMIN.
 */
export function validateCreateAdminInput(
  name: unknown,
  email: unknown,
  password: unknown,
): CreateAdminInput {
  return {
    name: assertValidName(name),
    email: assertValidEmail(email),
    password: assertValidPassword(password),
  };
}

/**
 * Accepts only a strict 24-hex-character MongoDB ObjectId; anything else is a
 * 400. (Types.ObjectId.isValid alone also accepts 12-byte strings, which would
 * blur the "invalid id -> 400" contract.)
 */
export function validateAdminId(id: unknown): Types.ObjectId {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, 'Invalid admin id.');
  }
  return new Types.ObjectId(id);
}

/**
 * Validates list query parameters (page/limit/search/status).
 * Strict about types: arrays or non-integer values are rejected instead of
 * being silently coerced.
 */
export function validateListAdminsQuery(query: {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  status?: unknown;
}): AdminListQuery {
  let page = DEFAULT_PAGE;
  if (query.page !== undefined) {
    if (
      typeof query.page !== 'string' ||
      !/^\d+$/.test(query.page) ||
      Number(query.page) < 1 ||
      Number(query.page) > MAX_PAGE
    ) {
      throw new ApiError(400, `Page must be between 1 and ${MAX_PAGE}.`);
    }
    page = Number(query.page);
  }

  let limit = DEFAULT_PAGE_LIMIT;
  if (query.limit !== undefined) {
    if (typeof query.limit !== 'string' || !/^\d+$/.test(query.limit)) {
      throw new ApiError(400, `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`);
    }
    limit = Number(query.limit);
    if (limit < 1 || limit > MAX_PAGE_LIMIT) {
      throw new ApiError(400, `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`);
    }
  }

  let search: string | undefined;
  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      throw new ApiError(400, 'Search must be a string.');
    }
    search = query.search.trim() || undefined;
  }

  let status: UserStatus | undefined;
  if (query.status !== undefined) {
    if (typeof query.status !== 'string' || !VALID_STATUSES.has(query.status)) {
      throw new ApiError(400, 'Status must be ACTIVE or INACTIVE.');
    }
    status = query.status as UserStatus;
  }

  return { page, limit, search, status };
}

/** Escapes regex metacharacters so user search input cannot inject patterns. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates an ADMIN account. The client-supplied role (if any) is ignored -
 * the document is always created with role ADMIN and status ACTIVE.
 * Returns the safe serialization; passwordHash never leaves the server.
 */
export async function createAdmin(
  name: unknown,
  email: unknown,
  password: unknown,
): Promise<SafeUser> {
  const input = validateCreateAdminInput(name, email, password);

  // Friendly pre-check; the unique index below is the authoritative guard.
  const existing = await UserModel.exists({ email: input.email });
  if (existing) {
    throw new ApiError(409, 'An admin with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: ADMIN_ROLE,
      status: 'ACTIVE',
    });
    return serializeSafeUser(user);
  } catch (error) {
    // Race between the existence check and the insert: the unique index wins.
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'An admin with this email already exists.');
    }
    throw error;
  }
}

/**
 * Lists ADMIN users only (role filter is non-negotiable - SUPER_ADMIN accounts
 * never appear here), with pagination, optional search and optional status.
 */
export async function listAdmins(query: AdminListQuery): Promise<AdminListResult> {
  // Built inline (with conditional spreads) so TypeScript infers a literal that
  // satisfies Mongoose's QueryFilter - the role filter is non-negotiable.
  const match = {
    role: ADMIN_ROLE,
    ...(query.status !== undefined ? { status: query.status } : {}),
    ...(query.search
      ? { $or: [{ name: new RegExp(escapeRegExp(query.search), 'i') }, { email: new RegExp(escapeRegExp(query.search), 'i') }] }
      : {}),
  };

  const [total, admins] = await Promise.all([
    UserModel.countDocuments(match),
    UserModel.find(match)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
  ]);

  return {
    admins: admins.map(serializeSafeUser),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

/** Returns a single ADMIN. SUPER_ADMIN ids resolve to a generic 404. */
export async function getAdminById(id: unknown): Promise<SafeUser> {
  const adminId = validateAdminId(id);
  const admin = await UserModel.findOne({ _id: adminId, role: ADMIN_ROLE });
  if (!admin) {
    throw ApiError.notFound('Admin not found.');
  }
  return serializeSafeUser(admin);
}

/**
 * Updates an ADMIN's profile fields (name/email only).
 * Role, status and passwordHash are never touched here; email changes must
 * stay unique and are normalized like the schema.
 */
export async function updateAdmin(
  id: unknown,
  name: unknown,
  email: unknown,
): Promise<SafeUser> {
  const adminId = validateAdminId(id);

  const updates: { name?: string; email?: string } = {};
  if (name !== undefined) {
    updates.name = assertValidName(name);
  }
  if (email !== undefined) {
    updates.email = assertValidEmail(email);
  }
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'Provide at least one field to update.');
  }

  if (updates.email !== undefined) {
    const conflict = await UserModel.exists({
      email: updates.email,
      _id: { $ne: adminId },
    });
    if (conflict) {
      throw new ApiError(409, 'An admin with this email already exists.');
    }
  }

  try {
    const admin = await UserModel.findOneAndUpdate(
      { _id: adminId, role: ADMIN_ROLE },
      { $set: updates },
      { new: true },
    );
    if (!admin) {
      throw ApiError.notFound('Admin not found.');
    }
    return serializeSafeUser(admin);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'An admin with this email already exists.');
    }
    throw error;
  }
}

/**
 * Dedicated status operation - only ACTIVE/INACTIVE are accepted (the
 * UserStatus union). Updates nothing but the status field.
 */
export async function setAdminStatus(id: unknown, status: unknown): Promise<SafeUser> {
  const adminId = validateAdminId(id);
  if (typeof status !== 'string' || !VALID_STATUSES.has(status)) {
    throw new ApiError(400, 'Status must be ACTIVE or INACTIVE.');
  }

  const admin = await UserModel.findOneAndUpdate(
    { _id: adminId, role: ADMIN_ROLE },
    { $set: { status: status as UserStatus } },
    { new: true },
  );
  if (!admin) {
    throw ApiError.notFound('Admin not found.');
  }
  return serializeSafeUser(admin);
}
