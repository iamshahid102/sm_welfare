# Deploying on Vercel

Two independent Vercel projects built from this one repository:

| Project | Root Directory | URL |
| ------- | -------------- | --- |
| API (Express) | `server` | `https://sm-welfare-api.vercel.app` |
| Web (Next.js) | `client` | `https://sm-welfare.vercel.app` |

Deploy the **API first** — the web build fetches public content from it while
prerendering pages (it falls back to curated local content if the API is down,
but then the pages ship with fallback data instead of live CMS data).

---

## 1. API project (`server/`)

### Vercel project settings

| Setting | Value |
| ------- | ----- |
| Framework Preset | Other |
| Root Directory | `server` |
| Build Command | `npm run build` (also pinned in `server/vercel.json`) |
| Output Directory | *(leave empty)* |
| Install Command | `npm install` |
| Node.js Version | 24.x (from `server/package.json` `engines`) |

`server/vercel.json` wires everything up:

- `buildCommand` compiles TypeScript to `dist/` (`tsc` is what resolves the
  server's NodeNext `.js` → `.ts` import specifiers).
- `functions.includeFiles: "dist/**"` ships the compiled tree with the function.
- `rewrites` send **every** path to `/api` (`api/index.js`). A Vercel rewrite
  preserves the original URL, so Express still receives `/api/v1/...`.

### Environment variables

Set these in **Project → Settings → Environment Variables** (Production and
Preview):

| Variable | Value |
| -------- | ----- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas SRV connection string |
| `AUTH_ACCESS_TOKEN_SECRET` | `openssl rand -hex 32` |
| `AUTH_REFRESH_TOKEN_SECRET` | `openssl rand -hex 32` (different from above) |
| `AUTH_COOKIE_SECURE` | `true` |
| `AUTH_COOKIE_SAMESITE` | `lax` |
| `CORS_ORIGINS` | `https://sm-welfare.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | from the Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from the Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from the Cloudinary dashboard |

Optional (defaults shown): `AUTH_ACCESS_TOKEN_TTL_SECONDS=900`,
`AUTH_REFRESH_TOKEN_TTL_SECONDS=604800`, `BCRYPT_ROUNDS=12`.

> **Do not set `HOST` or `PORT`.** They are only used by the long-running
> server (`npm run dev` / `npm start`); Vercel runs `api/index.js` instead.

> **`NODE_ENV=production` is required.** The server refuses to boot without the
> Cloudinary credentials in production, and the secure-cookie default depends
> on it.

**MongoDB Atlas:** allow connections from anywhere (`0.0.0.0/0`) — Vercel
Functions have no static egress IP. The API keeps a cached, pooled connection
per instance (`maxPoolSize: 10`) so parallel instances do not exhaust the
cluster's connection limit.

### Verify

```bash
curl https://sm-welfare-api.vercel.app/api/v1/health
# {"success":true,"data":{"service":"SM Welfare API","status":"ok",
#  "environment":"production","database":{"state":"connected"},...}}

curl "https://sm-welfare-api.vercel.app/api/v1/public/programs?limit=2"
```

### Seed data and the admin account

Both are CLI-only and are **not** Vercel functions. Run them once from a
machine that has the repository (they need `client/public/images` for media
uploads) against the same Atlas database:

```bash
cd server
MONGODB_URI='<your atlas uri>' npm run provision:admin
MONGODB_URI='<your atlas uri>' npm run seed:cms
MONGODB_URI='<your atlas uri>' npm run seed:certificates
```

---

## 2. Web project (`client/`)

Framework Preset: **Next.js**, Root Directory: `client`. Nothing else to
configure — the API proxy lives in `client/next.config.mjs`.

### Environment variables

| Variable | Value | Scope |
| -------- | ----- | ----- |
| `NEXT_PUBLIC_API_URL` | `https://sm-welfare-api.vercel.app/api/v1` | absolute API URL — used by server components and by the build |
| `NEXT_PUBLIC_API_PROXY_PATH` | `/api/v1` | browser calls go through this same-origin path |
| `API_ORIGIN` | `https://sm-welfare-api.vercel.app` | rewrite destination in `next.config.mjs` |

All three are read at **build time** — changing any of them needs a redeploy,
not just an env update.

### Why the proxy exists (important)

The API and the web app are on different `vercel.app` origins. `vercel.app` is
on the Public Suffix List, so the browser treats them as **different sites**:

- a cookie set by `sm-welfare-api.vercel.app` is **never sent** to
  `sm-welfare.vercel.app`;
- because the API's session cookies are `HttpOnly`, JavaScript cannot read them
  either.

Without the proxy the `/admin` guard in `client/src/proxy.ts` would see no
cookie on every request and bounce the user to `/admin/login` forever, even
right after a successful login.

With `API_ORIGIN` set, `client/next.config.mjs` rewrites `/api/v1/*` to the API,
so browser requests are **first-party**:

- the API's cookies are stored against `sm-welfare.vercel.app`;
- the `/admin` guard and the Axios-style 401-refresh flow work unchanged;
- **no CORS and no `SameSite=None` are needed** — `SameSite=lax` is both
  sufficient and safer.

Server components (`public-programs`, `public-projects`, `public-pages`,
`public-site-settings`) still call the absolute `NEXT_PUBLIC_API_URL`, because
Node's `fetch` cannot resolve a relative URL. `client/src/lib/api/config.ts`
picks the right one automatically.

### Verify

```bash
curl -I https://sm-welfare.vercel.app/api/v1/health   # proxied -> 200
```

Then in a browser:

1. `https://sm-welfare.vercel.app/admin/login` → log in with the provisioned
   admin account → the dashboard must load (not bounce back to login).
2. DevTools → Application → Cookies for `sm-welfare.vercel.app` → both
   `smw_access_token` and `smw_refresh_token` present, `HttpOnly` + `Secure`.
3. Upload an image on `/admin/media` (≤ 4 MB) → appears in the library.

---

## Platform limits that shaped the configuration

| Limit | Effect here |
| ----- | ----------- |
| Function request body ≤ 4.5 MB | `MAX_MEDIA_BYTES` is **4 MB** (`server/src/constants/media.ts`, mirrored in the admin upload UI) so the API returns a clear 413 instead of Vercel rejecting the request opaquely. |
| Function duration | `maxDuration: 30` in `server/vercel.json`. |
| No always-on process | MongoDB connects lazily in `api/index.js` and the promise is cached per warm instance. Expect a short cold start on the first request after idle. |
| In-memory rate limiting | `express-rate-limit` counters live per instance and reset on cold start, so limits are looser than a single server. Move the store to Redis (e.g. Upstash) if strict login throttling matters. |
| Serverless filesystem is read-only | The seed scripts that upload from `client/public/images` must run locally, never on Vercel. |

## Alternative: single domain

If you later put both apps on one registrable domain (e.g.
`app.example.com` + `api.example.com`, or a custom domain on the API and a
rewrite from the client), you can drop `NEXT_PUBLIC_API_PROXY_PATH`,
`API_ORIGIN` and the rewrite, point `NEXT_PUBLIC_API_URL` straight at the API,
and keep `AUTH_COOKIE_SAMESITE=lax`. Cookies are shared across subdomains of the
same registrable domain only when the API sets an explicit `domain` attribute —
the rewrite approach above therefore stays the simplest option.
