/**
 * User domain constants.
 *
 * Roles and statuses are defined as `as const` arrays so the Mongoose schema
 * enum and the derived union types stay in sync automatically. Extending the
 * platform later means adding an entry to the array - nothing else to change.
 */

export const USER_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Shared email shape used by both the User schema and auth input validation. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
