/**
 * Authentication constants.
 *
 * Cookie names are prefixed with the project name to avoid collisions with
 * other applications on the same client origin. Both cookies are HttpOnly -
 * frontend JavaScript can never read the credential values.
 */
export const AUTH_ACCESS_COOKIE = 'smw_access_token';
export const AUTH_REFRESH_COOKIE = 'smw_refresh_token';
