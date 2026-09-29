/**
 * User domain constants.
 *
 * This CMS has exactly ONE administrator account (`ADMIN`). There is no
 * second role and no role-based access control: every authenticated request
 * belongs to the same account and can manage every content type. The role is
 * kept as a single-value field so tokens and serialized users keep a stable
 * shape, and so the model stays forward-compatible if a second role is ever
 * introduced.
 *
 * Status values are defined as `as const` arrays so the Mongoose schema enum
 * and the derived union types stay in sync automatically.
 */

export const USER_ROLES = ['ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** The only role this system issues. */
export const ADMIN_ROLE = 'ADMIN' as const;

export const USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Shared email shape used by both the User schema and auth input validation. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
