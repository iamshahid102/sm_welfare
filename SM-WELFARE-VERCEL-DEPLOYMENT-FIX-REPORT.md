# SM Welfare — Vercel Deployment Configuration Fix Report

Date: September 10, 2026
Scope: Fix the invalid Vercel deployment configuration, upgrade the server runtime to Node 24, and verify the full Express + Next.js architecture remains intact.

---

## 1. Original Vercel error

```
Invalid request:
`functions.src/server.ts` should NOT have additional property `node`.
Please remove it.
```

This error is raised by Vercel's deployment validation when `vercel.json` contains
a property that is not part of the `functions` schema.

## 2. Root cause

The repository contained an invalid root-level `vercel.json`:

```json
{
  "framework": "express",
  "functions": {
    "src/server.ts": {
      "node": { "version": "20" }
    }
  }
}
```

- `functions.<path>.node` is **not a supported Vercel property** (the supported
  `functions` properties are runtime settings such as `maxDuration`, `memory`,
  `runtime`, `includeFiles`, `excludeFiles` — not a nested `node` object).
- The configuration also targeted `src/server.ts` as a **legacy serverless
  function entry point**. Vercel no longer requires (and in the current
  zero-configuration model does not want) this kind of manual function wiring for
  an Express application.

## 3. Exact configuration problem

| Item | Problem |
| ---- | ------- |
| `functions.src/server.ts.node` | Invented/unsupported property → Vercel validation error |
| Legacy `functions` wiring | Unnecessary under Vercel's zero-configuration Node.js/Express detection |
| `framework: "express"` | Unnecessary — Vercel auto-detects Express from `package.json` dependencies |
| Node version pinned to 20 | Node 20 reaches end-of-life (2026-04-30) and is deprecated for Vercel Builds/Functions on 2026-10-01 |

## 4. Final vercel.json status

**The root `vercel.json` was deleted and is NOT required.**

Vercel's current (2026) zero-configuration deployment model is authoritative here:

- The changelog *"Deploy Node servers with zero configuration"* (2026-06-23):
  Vercel detects `server.ts` at the project root **or `src/server.ts`** and
  deploys it as a Node.js application — *"with no configuration files required"*.
- The Node.js Runtime docs (updated 2026-08-11): Vercel looks for a server
  entrypoint at `server.{js,cjs,mjs,ts,cts,mts}` / `src/server.{...}` and captures
  the HTTP server when `server.listen()` is called during module startup.
- The Express framework docs/guide (2026-06/08): Express apps deploy with **zero
  configuration**; Vercel finds the entry file (`app`, `index`, or `server` under
  the project root or `src/`) and detects the app either by default export or by
  a port listener. No `vercel.json` is required.

**Local validation using Vercel's own build logic** (Vercel CLI 56.4.1,
`@vercel/build-utils`), run against `server/` as the project root:

```
isNodeEntrypoint(src/server.ts)        -> true
isNodeBackendFramework("express")      -> true
BACKEND_FRAMEWORKS includes express    -> true
getNodeVersion(server dir)             -> { "major": 24, "range": "24.x", "runtime": "nodejs24.x" }
```

The final configuration contains **no `functions.<path>.node`** and no other
unsupported property — there is no Vercel configuration file left to be invalid.

## 5. Node.js version strategy

Node version is now configured through the **`engines` field** in
`server/package.json`, which is the documented, supported mechanism:

```json
"engines": {
  "node": "24.x"
}
```

- Vercel's *Supported Node.js versions* docs (updated 2026-02-27) explicitly
  support `engines#node` overrides: `"24.x"` maps to the latest `24.x` release.
- Vercel's own `getNodeVersion` resolved this project's `"24.x"` to runtime
  **`nodejs24.x`** (major 24).
- Node 24 is Vercel's current default LTS and the official upgrade path away from
  the Node 20 deprecation (Builds/Functions blocked after 2026-10-01).
- Compatibility: the server already runs on local Node **v24.15.0**; full
  typecheck, lint, build, and the 308-test suite all pass on Node 24. Dependencies
  (Express 5, Mongoose 9, jose 6, cloudinary 2, multer 2, bcryptjs 3) are all
  Node-24 compatible.
- Other Node pins audited:
  - No `.nvmrc` or `.node-version` files exist.
  - No CI configuration exists.
  - No root `package.json` exists (client and server are separate).
  - `client/package.json` has no `engines` field and no Node runtime pin;
    `@types/node: ^20` there is a compile-time types package, not a runtime pin,
    and was left untouched to avoid unnecessary churn.

## 6. server.ts verification

`server/src/server.ts` was restored to the **zero-configuration Node.js server
bootstrap** pattern (the same proven bootstrap that previously existed before the
broken deployment change), which satisfies both Vercel and local development:

- Same single Express `app` from `src/app.ts` — no second Express application,
  no duplicated routes.
- `const server = createServer(app)` and a top-level `startServer()` invocation
  that calls `server.listen(...)` during module startup — this is exactly the
  call Vercel's zero-config Node server detection captures. On Vercel the port is
  internal-only; locally it boots on `PORT` (default 4000).
- `startServer()` remains exported (importable by tests/tooling without listening).
- MongoDB integration preserved: `startServer()` awaits `connectToDatabase()`
  before listening (fail-fast on missing `MONGODB_URI`).
- Graceful shutdown restored: closes the HTTP server and disconnects MongoDB on
  `SIGINT`/`SIGTERM`.
- The legacy `(req, res)` default-export handler was removed — it belonged to the
  old serverless-function model that required the invalid `functions` config.

`app.ts` was **not modified**: Helmet, CORS (explicit origins + credentials),
cookie-parser, JSON/urlencoded body parsing, versioned API router, 404 handler,
and centralized error handler all remain in their original order.

## 7. API route verification

All routes remain mounted unchanged via `server/src/routes/index.ts` →
`server/src/routes/v1/index.ts` under `/api/v1`:

| Mount | Router |
| ----- | ------ |
| `/api/v1/health` | `healthRouter` |
| `/api/v1/auth` | `authRouter` |
| `/api/v1/admins` | `adminRouter` |
| `/api/v1/site-settings` | `siteSettingsRouter` |
| `/api/v1/programs` | `programRouter` |
| `/api/v1/projects` | `projectRouter` |
| `/api/v1/media` | `mediaRouter` |
| `/api/v1/public` | `publicRouter` |

No endpoint paths, names, or handlers were changed. Authentication (JWT access +
rotating refresh sessions) and RBAC (`requireRole`) are untouched.

## 8. CORS / cookie verification

Separate client/server Vercel deployments are supported without weakening security:

- **CORS**: `cors({ origin: env.corsOrigins, credentials: true })` — an explicit,
  comma-separated allowlist from `CORS_ORIGINS` (default `http://localhost:3000`).
  No wildcard `*` with credentials.
- **HttpOnly cookies**: auth cookies are set with `httpOnly: true` — JWTs are
  never exposed to frontend JavaScript.
- **Secure cookies**: `secure` defaults to `true` when `NODE_ENV=production`.
- **SameSite**: configurable via `AUTH_COOKIE_SAMESITE` (default `lax`); the
  server **refuses to boot** with `SameSite=None` unless `AUTH_COOKIE_SECURE=true`.
- Deployment guidance: set `CORS_ORIGINS` to the exact client deployment origin
  (e.g. `https://sm-welfare-client.vercel.app`), `NODE_ENV=production`, and keep
  `AUTH_COOKIE_SECURE` enabled in production.

Required environment variables (from `server/src/config/env.ts` and
`server/.env.example` — names verified, values never committed/exposed):

| Variable | Required? | Notes |
| -------- | --------- | ----- |
| `MONGODB_URI` | Yes | Validated before connecting; server refuses to serve DB routes without it |
| `AUTH_ACCESS_TOKEN_SECRET` | Yes (startup) | ≥32 chars; server throws if missing/weak |
| `AUTH_REFRESH_TOKEN_SECRET` | Yes (startup) | ≥32 chars; server throws if missing/weak |
| `NODE_ENV` | Recommended | `production` on Vercel; drives secure cookies |
| `CORS_ORIGINS` | Recommended | Comma-separated allowed client origins |
| `CLOUDINARY_CLOUD_NAME` | For media | Required by `/api/v1/media`; refuses to boot without them in production |
| `CLOUDINARY_API_KEY` | For media | Server-only |
| `CLOUDINARY_API_SECRET` | For media | Server-only |
| `BCRYPT_ROUNDS` | Optional | Integer 4–16, default 12 |
| `AUTH_ACCESS_TOKEN_TTL_SECONDS` | Optional | Default 900 |
| `AUTH_REFRESH_TOKEN_TTL_SECONDS` | Optional | Default 604800 |
| `AUTH_COOKIE_SECURE` | Optional | Defaults to production |
| `AUTH_COOKIE_SAMESITE` | Optional | Default `lax` |

## 9. Client validation

| Check | Result |
| ----- | ------ |
| `npm run typecheck` | PASS — 0 errors |
| `npm run lint` | PASS — 0 errors (11 pre-existing warnings in admin pages, untouched) |
| `npm run build` (Next.js 16.3.4, Turbopack) | PASS — 17 routes compiled, all static pages generated |
| `npm audit` | PASS — 0 vulnerabilities |

No client source, routing, or design was changed. The Next.js App Router structure
remains intact (no React Router, no SPA catch-all rewrites, no `/index.html`
fallback — the frontend/backend stay fully separate).

## 10. Server validation

| Check | Result |
| ----- | ------ |
| `npm run typecheck` | PASS — 0 errors |
| `npm run lint` | PASS — 0 errors |
| `npm run build` (`tsc -p tsconfig.build.json`) | PASS — compiles to `dist/` |
| `npm test` | PASS — 308 passed, 0 failed, 5 skipped (SUPER_ADMIN-provisioning tests skip because a SUPER_ADMIN already exists in the test DB — expected) |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm run dev` bootstrap | Restored — top-level `startServer()` boots HTTP server + MongoDB connection again |

## 11. Dependency / security validation

- `npm audit` (server): **0 vulnerabilities**.
- `npm audit` (client): **0 vulnerabilities**.
- No dependencies were added, removed, or upgraded.
- Authentication secrets remain server-only and required at startup (fail-fast).
- No wildcard CORS, no credentials exposed to the client, no weakened cookie policy.

## 12. Git safety confirmation

- ✅ **GitHub was NOT pushed** (no `git push` was run).
- ✅ **No commit was created** (working tree changes only).
- ✅ **No pull / reset / revert** was performed.
- ✅ **`template/` was untouched** (0 changes).
- ✅ **No business logic was changed** (routes, controllers, services, models,
  middleware, auth, RBAC, Cloudinary, MongoDB all unchanged).
- ✅ **No frontend UI/design was changed** (client source untouched).

Changed files (working tree only, uncommitted):

```
D  vercel.json                     (invalid config removed — zero-config detection replaces it)
M  server/package.json             (engines: ">=20.9.0" -> "24.x"; fixed devDependencies indent)
M  server/src/server.ts            (zero-config bootstrap: top-level listen, graceful shutdown; legacy handler removed)
M  server/.gitignore               (added .vercel/ — matches client/.gitignore hygiene)
```

## 13. Remaining deployment steps

The code is ready; these steps happen in the Vercel dashboard/CLI (not performed here):

1. **Server project** — create a Vercel project from the repo with **Root Directory
   set to `server`**. No build command, no output directory, no `vercel.json`
   needed: Vercel auto-detects Express and the `src/server.ts` entry.
2. **Client project** — create a second Vercel project with **Root Directory set
   to `client`** (Next.js is auto-detected; no config needed).
3. **Environment variables** — add the table from section 8 to the server project:
   `MONGODB_URI`, `AUTH_ACCESS_TOKEN_SECRET`, `AUTH_REFRESH_TOKEN_SECRET`,
   `NODE_ENV=production`, `CORS_ORIGINS` (exact client URL), and the Cloudinary
   trio (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
   Add `NEXT_PUBLIC_API_URL` (server deployment URL) to the client project.
4. **Node.js version** — `server/package.json` already pins `"24.x"` (verified to
   resolve to `nodejs24.x`); no dashboard setting needed.
5. **Deploy** — `vercel` (preview) then `vercel --prod` per project, or import the
   repo at vercel.com/new. After deploying, verify:
   - `GET {server}/api/v1/health` returns 200.
   - One authenticated flow (login → `/api/v1/auth/me`) works from the client
     origin with HttpOnly cookies.
   - A Cloudinary media upload works with the production credentials.

---

### Acceptance criteria recap

| # | Criterion | Status |
| - | --------- | ------ |
| 1 | Invalid `functions.src/server.ts.node` removed | ✅ (vercel.json deleted) |
| 2 | Vercel config contains only valid/current properties | ✅ (no config file remains; zero-config detection) |
| 3 | Node version via supported mechanism | ✅ (`engines.node = "24.x"`) |
| 4 | Node 24 used | ✅ (resolves to `nodejs24.x`; tested on local Node 24) |
| 5 | Express architecture intact | ✅ |
| 6 | Next.js frontend architecture intact | ✅ |
| 7 | No React Router | ✅ |
| 8 | No SPA catch-all rewrite | ✅ |
| 9 | All API routes intact | ✅ |
| 10 | Auth/RBAC intact | ✅ |
| 11 | CORS/cookies secure | ✅ |
| 12–13 | Client typecheck/lint pass | ✅ |
| 14 | Client build passes | ✅ |
| 15–16 | Server typecheck/lint pass | ✅ |
| 17 | Server tests pass | ✅ (308 pass, 0 fail) |
| 18 | npm audit passes | ✅ (0 vulnerabilities both projects) |
| 19 | `template/` untouched | ✅ |
| 20 | No GitHub push | ✅ |
| 21 | No Git commit | ✅ |