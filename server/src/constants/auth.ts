/**
 * Authentication constants.
 *
 * Cookie names are prefixed with the project name to avoid collisions with
 * other applications on the same client origin. Both credentials are HttpOnly -
 * frontend JavaScript can never read the credential values.
 */
export const AUTH_ACCESS_COOKIE = 'smw_access_token';
export const AUTH_REFRESH_COOKIE = 'smw_refresh_token';

/**
 * Non-HttpOnly "session hint" marker.
 *
 * Its only job is to let the frontend answer "might this visitor have a
 * session?" without a network round-trip. Without it the root-layout
 * AuthProvider must probe GET /auth/me on every anonymous page load, and the
 * resulting 401 (plus the follow-up 401 from POST /auth/refresh) pollutes the
 * browser console for every visitor.
 *
 * It carries no secret and grants nothing: the browser can read/forge it, but
 * only the HttpOnly credentials above are validated by the server. A forged
 * marker merely causes one extra probe.
 */
export const AUTH_SESSION_HINT_COOKIE = 'smw_session';
