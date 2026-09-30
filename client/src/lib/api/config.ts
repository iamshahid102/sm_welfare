/**
 * API configuration — the only place the client decides where the API lives.
 *
 * TWO DEPLOYMENT SHAPES
 *
 * 1. Same-origin proxy (used when the API has its own origin, e.g.
 *    https://sm-welfare.vercel.app calling https://sm-welfare-api.vercel.app).
 *    Set NEXT_PUBLIC_API_PROXY_PATH=/api/v1. Browser calls then go to this
 *    app's own `/api/v1/*`, which `next.config.mjs` rewrites to the API.
 *    Because the request is first-party, the API's HttpOnly auth cookies are
 *    stored against this origin — so the `/admin` guard in `src/proxy.ts` can
 *    see them and no CORS or `SameSite=None` is required.
 *
 * 2. Direct API origin. Leave NEXT_PUBLIC_API_PROXY_PATH unset and point
 *    NEXT_PUBLIC_API_URL at the API. This only works when both apps share a
 *    registrable domain (e.g. app.example.com + api.example.com): across
 *    different registrable domains the browser keeps the API's cookies on the
 *    API's own origin, where this app cannot read them.
 *
 * Server components always use the absolute URL: they run in Node, where
 * `window` is undefined and a relative URL cannot be fetched at all.
 */

const FALLBACK_API_URL = "http://localhost:4000/api/v1";

/** Absolute API base URL — required by server components and the build. */
const absoluteApiUrl = process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_URL;

/** Same-origin path the browser should use instead (e.g. "/api/v1"). */
const proxyPath = process.env.NEXT_PUBLIC_API_PROXY_PATH;

/** True while rendering on the server (SSR, prerender, build-time fetch). */
const isServer = typeof window === "undefined";

export const API_BASE_URL = proxyPath && !isServer ? proxyPath : absoluteApiUrl;
