/**
 * Next.js configuration.
 *
 * API PROXY
 * This app and the Express API are separate Vercel projects on separate
 * origins (`sm-welfare.vercel.app` + `sm-welfare-api.vercel.app`). Browsers
 * never send a cookie set by one origin to another, so the API's HttpOnly
 * session cookies would be invisible to the `/admin` guard in `src/proxy.ts`
 * and every admin request would bounce back to the login page.
 *
 * Setting API_ORIGIN here rewrites browser calls from `/api/v1/*` to the API,
 * making them same-origin for the browser: the cookies are stored first-party,
 * the guard works, and no CORS or `SameSite=None` is needed.
 *
 * Set API_ORIGIN in the Vercel project (e.g. https://sm-welfare-api.vercel.app).
 * Rewrites are compiled at build time, so changing it requires a redeploy.
 * Leave it unset for local development — then the client talks to
 * NEXT_PUBLIC_API_URL directly, exactly as before.
 */
const apiOrigin = process.env.API_ORIGIN?.trim().replace(/\/+$/, "");

export const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    if (!apiOrigin) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        // Auth, admin and form responses must never be cached by the CDN or
        // the browser: the media/program endpoints change from the admin panel
        // and the auth endpoints set cookies.
        source: "/api/v1/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
