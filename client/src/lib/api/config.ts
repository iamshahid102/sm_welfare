/**
 * API configuration.
 *
 * NEXT_PUBLIC_API_URL is the base URL of the Express API. It is the only
 * environment variable the client reads — all secrets live server-side.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
