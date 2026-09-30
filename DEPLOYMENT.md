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

### Zero configuration — do not add `vercel.json` or an `api/` folder

Vercel detects the Express app and deploys it as a single Vercel Function. It
finds the app by looking for a **default export** (or a port listener) in
`app`, `index` or `server` at the project root or under `src/`. This project
satisfies that twice over:

- `src/app.ts` exports the Express app as its **default export**, and
- `src/server.ts` starts one with a port listener (used for local dev).

Vercel's own docs are explicit that this removes the need for rewrites in
`vercel.json` **and** for an `api/` folder. Adding either one actively breaks
things:

- an `api/` function plus a catch-all rewrite makes Vercel treat the request
  path as the *rewrite destination*, so Express would receive `/api` instead of
  `/api/v1/...` and every route would 404 (Vercel warns about this at build
  time: *"Internal rewrites in backend framework projects now route requests
  using the rewritten destination path"*);
- a custom `buildCommand` competes with the framework build.

**So: no `vercel.json`, no `api/` folder, no build command, no output
directory.** Every path (`/api/v1/...`) reaches the Express router unchanged.

### Vercel project settings

| Setting | Value |
| ------- | ----- |
| Framework Preset | Express (auto-detected — leave it) |
| Root Directory | `server` |
| Build Command | *(leave empty — the Express preset supplies it)* |
| Output Directory | *(leave empty)* |
| Install Command | `npm install` |
| Node.js Version | 24.x (from `server/package.json` `engines`) |

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

> **Do not set `HOST` or `PORT`.** They are only read by the long-running
> server (`npm run dev` / `npm start`); Vercel manages the HTTP layer itself.

> **`NODE_ENV=production` is required.** The server refuses to boot without the
> Cloudinary credentials in production, and the secure-cookie default depends
> on it.

**MongoDB Atlas:** allow connections from anywhere (`0.0.0.0/0`) — Vercel
Functions have no static egress IP. The app keeps a cached, pooled connection
per instance (`maxPoolSize: 10`) so parallel instances do not exhaust the
cluster's connection limit.

### Three code details that exist because of the platform

1. **Database bootstrap** — `src/app.ts` opens the connection in a middleware
   rather than relying on `src/server.ts`. A serverless platform imports the
   app module directly, so nothing would ever connect and every query would
   hang until the request timed out. `connectToDatabase()` caches its promise,
   so this costs one connection per warm instance and nothing per request; a
   failed connect clears the cache and the next request retries.
2. **helmet's dual typings** — helmet ships `index.d.mts` *and* `index.d.cts`
   and its `exports` map has no `types` condition, so the declaration file
   TypeScript picks depends on the consumer's module resolution. Vercel's
   Express build resolves the **CommonJS** one, where the default import is
   typed as the module namespace and `helmet()` fails with
   *TS2349: This expression is not callable*. `src/app.ts` normalises the
   import once through a documented assertion that builds under both
   resolutions.
3. **express-rate-limit's dual typings** — the same split applies to
   `express-rate-limit@8`, which ships `index.d.mts` *and* `index.d.cts`. Under
   Vercel's own typecheck step the default import resolves to the module
   namespace, producing *TS2349* plus a cascade of *TS7006: Parameter
   '_req' implicitly has an 'any' type* in
   `src/middlewares/rateLimit.middleware.ts`. The fix is the package's
   **named** export (`import { rateLimit } from 'express-rate-limit'`), which is
   present in both the ESM and CJS builds. Note that plain `npm run build`,
   a clean-room `npm ci && tsc`, and `npm run typecheck` all pass without it —
   Vercel runs a *separate* TypeScript step (`Using TypeScript 6.0.3`), so the
   failure only reproduces with `vercel build`.

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

> **Git Bash mangles leading slashes.** Setting a value that starts with `/`
> from Git Bash (MSYS) converts it into a Windows path, so
> `--value "/api/v1"` is silently stored as
> `C:/Program Files/Git/api/v1`. The client then fetches
> `file:///C:/Program Files/Git/api/v1/...` and the browser reports
> *“Not allowed to load local resource”*. Prefix the command with
> `MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*"` (and keep the variable
> non-sensitive) so it stays exactly `/api/v1`:
>
> ```bash
> MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
>   vercel env add NEXT_PUBLIC_API_PROXY_PATH "production,preview" \
>   --value "/api/v1" --no-sensitive --force -y </dev/null
> ```
>
> Verify the built value, not just the env list — the proxy path is inlined
> into the client bundle:
>
> ```bash
> curl -s https://sm-welfare.vercel.app/_next/static/immutable/chunks/1mhc4ymzz8ax7.js \
>   | grep -o 'API_BASE_URL",0,"[^"]*"'   # -> API_BASE_URL",0,"/api/v1"
> ```

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
- the `/admin` guard and the 401-refresh flow work unchanged;
- **no CORS and no `SameSite=None` are needed** — `SameSite=lax` is both
  sufficient and safer.

Server components (`public-programs`, `public-projects`, `public-pages`,
`public-site-settings`) still call the absolute `NEXT_PUBLIC_API_URL`, because
Node's `fetch` cannot resolve a relative URL. `client/src/lib/api/config.ts`
picks the right one automatically. (This rewrite is on the **client** project,
which is Next.js — it is unrelated to the Express project, which needs none.)

### Why there is a `smw_session` cookie

The `AuthProvider` lives in the **root** layout, so it would otherwise probe
`GET /auth/me` on every page load. For an anonymous visitor that probe returns
401 and the API client then retries via `POST /auth/refresh`, which also
returns 401 — two failed requests, and two console errors, on every public
page. On top of the API, `setAuthCookies` therefore also sets a **readable**
(non-`HttpOnly`) marker cookie `smw_session=1` with the refresh token's
lifetime, and `clearAuthCookies` clears it on logout. The client
(`client/src/providers/auth-provider.tsx`) skips the probe when there is no
hint and the current route is outside `/admin`; inside `/admin` it always
probes, and the hint is cleared whenever the backend reports the session dead.

The hint holds no secret and grants nothing — forging it only causes one extra
probe — while the two `HttpOnly` credentials remain the only things the server
validates. It is intentionally **not** `HttpOnly` so JavaScript can read it.

### Verify

```bash
curl -I https://sm-welfare.vercel.app/api/v1/health   # proxied -> 200
```

Then in a browser:

1. `https://sm-welfare.vercel.app/admin/login` → log in with the provisioned
   admin account → the dashboard must load (not bounce back to login).
2. DevTools → Application → Cookies for `sm-welfare.vercel.app` → both
   `smw_access_token` and `smw_refresh_token` present, `HttpOnly` + `Secure`,
   plus the readable `smw_session` marker. Opening a public page while logged
   out must produce **no** `401` in the console (no `/auth/me` or
   `/auth/refresh` request).
3. Upload an image on `/admin/media` (≤ 4 MB) → appears in the library.

---

### Deploying with the Vercel CLI

The client project's **Root Directory is `client`**, and the CLI resolves that
relative to the directory it is run from. Running `vercel` inside `client/`
therefore looks for `client/client` and fails; run it from the **repository
root**, linked to the `sm-welfare` project:

```bash
# from the repository root (the root .gitignore ignores .vercel and .env*)
vercel link --yes --project sm-welfare
vercel --prod --yes --non-interactive
```

The API project's Root Directory is `server`, so deploy it from `server/`:

```bash
cd server
vercel --prod --yes --non-interactive
```

---

## Platform limits that shaped the configuration

| Limit | Effect here |
| ----- | ----------- |
| Function request body ≤ 4.5 MB | `MAX_MEDIA_BYTES` is **4 MB** (`server/src/constants/media.ts`, mirrored in the admin upload UI) so the API returns a clear 413 instead of Vercel rejecting the request opaquely. |
| Function duration | Left at the platform default. If a long route (e.g. `POST /api/v1/seed`) ever times out, raise it per-path under Project → Settings → Functions rather than adding a `vercel.json` `functions` block, which would have to guess the framework's internal entry path. |
| No always-on process | The app connects to MongoDB lazily (see above) and reuses the connection on warm instances. Expect a short cold start on the first request after idle. |
| In-memory rate limiting | `express-rate-limit` counters live per instance and reset on cold start, so limits are looser than a single server. Move the store to Redis (e.g. Upstash) if strict login throttling matters. |
| Serverless filesystem is read-only | The seed scripts that upload from `client/public/images` must run locally, never on Vercel. |
| Single bundled function ≤ 250 MB | Mongoose + Express + Cloudinary are well inside this. |
