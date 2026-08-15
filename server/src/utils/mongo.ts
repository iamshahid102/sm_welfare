/**
 * Identifies MongoDB duplicate-key (E11000) errors, e.g. from the unique email
 * index on the User model. Shared by the services that create users so the
 * detection logic lives in exactly one place.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000
  );
}
