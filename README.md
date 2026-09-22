# SM Welfare

Welfare management platform for SM Welfare Trust with a **strict client/server separation**.

## Architecture

| Directory | Role | Stack |
| --------- | ---- | ----- |
| `client/` | Frontend only — no backend logic, no database access | Next.js (App Router), React, TypeScript, Tailwind CSS, ESLint |
| `server/` | REST API under `/api/v1` — all business, database, auth & credential logic | Node.js, Express, TypeScript, ESLint |

**Architecture rules**

1. Next.js is ONLY the frontend. No API routes, route handlers, server actions, or Mongoose/MongoDB inside `client/`.
2. The client consumes the server exclusively through HTTP at `NEXT_PUBLIC_API_URL`.
3. All business logic, database logic, authentication, and Cloudinary credentials live in `server/`.
4. Never commit real credentials — use the `.env.example` files as templates.

## Getting started

### Server (Express API on port 4000)

```bash
cd server
npm install
cp .env.example .env        # adjust values as needed
npm run dev                 # tsx watch (hot reload)
```

### Client (Next.js on port 3000)

```bash
cd client
npm install
cp .env.example .env.local  # adjust NEXT_PUBLIC_API_URL as needed
npm run dev
```

The client expects the API at `http://localhost:4000/api/v1` by default.

### Initial SUPER_ADMIN provisioning (one-time)

The first (and only) SUPER_ADMIN account is created through a server-side CLI -
there is deliberately no HTTP endpoint for it. Credentials come from the
environment (non-interactive shells) or from hidden interactive prompts
(terminal); never pass them on the command line.

```bash
cd server
SUPER_ADMIN_EMAIL=admin@example.com SUPER_ADMIN_PASSWORD='a-strong-password' npm run provision:super-admin
```

Optional: `SUPER_ADMIN_NAME` sets the display name (defaults to "Super Admin").

The command fails safely (exit code 1, nothing created) if a SUPER_ADMIN already
exists, credentials are missing/invalid, the email is taken, or MongoDB is
unreachable. See `server/.env.example` for the full variable reference.

### Seeding CMS content (one-time)

The public API serves programs, projects and site settings from MongoDB. To
load the same content the live smwelfare.charity site publishes (13 main
projects, 17 project pages, contact/footer copy):

```bash
cd server
npm run seed:cms                 # requires MONGODB_URI in server/.env
```

The script is idempotent — upserts keyed by slug — so re-running it re-syncs
seeded content after edits without duplicating documents, and it never
deletes admin-created data. Everything is written as `PUBLISHED` because the
public endpoints only expose published documents. Media is **not** seeded
(Media documents reference Cloudinary assets), so upload images through the
admin panel; until then the client renders its byte-verified local photo
fallbacks.

Notes:

- The top-level directories are `client/` and `server/` (lowercase) — always
  run builds from the exact-cased directory so Next.js can resolve the project
  correctly on case-insensitive filesystems.
- Do **not** run `next build` while `next dev` is running in the same project:
  both write to `client/.next/`, and the build clobbers the dev server's chunk
  files (the dev server then 500s with `Cannot find module './NNN.js'`).
  Stop dev, remove `client/.next/`, then run the build — or restart dev after a
  build.

## Public API (Phase 20)

Unauthenticated, read-only endpoints for the public website live under `/api/v1/public/*`. They never require auth and return only PUBLISHED, public-safe content via explicit field whitelists (never raw MongoDB documents). The existing protected admin endpoints are unchanged.

| Endpoint | Method | Auth | Query parameters |
| -------- | ------ | ---- | ---------------- |
| `/api/v1/public/programs` | GET | none | `page` (≤10000), `limit` (≤40), `search`, `program` (slug) |
| `/api/v1/public/projects` | GET | none | `page`, `limit`, `search`, `program` (slug) |
| `/api/v1/public/site-settings` | GET | none | — |
| `/api/v1/public/media` | GET | none | `page`, `limit` |

Responses use the standard contract. Lists return `{ success: true, data: { items, page, limit, total, totalPages } }`; site settings return `{ success: true, data: { settings } }`. Errors return `{ success: false, error: { statusCode, message } }` with safe messages (e.g. `404 "Site settings not found."` when the singleton is uninitialized, `400` for invalid query parameters).

Visibility rules: programs/projects are exposed only when `status = PUBLISHED`; projects additionally require their parent program to be published. The Media model has no visibility field, so the public endpoint exposes the same metadata the admin API already returns (Cloudinary URLs are publicly addressable CDN links) and never returns credentials or upload secrets.

### Public write endpoints (forms + contact)

The public website's forms are unauthenticated writes under the same versioned
prefix. Both are validated server-side, rate limited to **10 submissions per 15
minutes per IP**, and never expose credentials.

| Endpoint | Method | Auth | Body |
| -------- | ------ | ---- | ---- |
| `/api/v1/forms/submit` | POST | none | `formType` (one of the five documented forms), `name`, `email`, `phone`, `message` |
| `/api/v1/forms/submissions` | GET | ADMIN / SUPER_ADMIN | `page` (≤10000), `limit` (≤100), `formType` (one of the five — optional filter) |
| `/api/v1/forms/submission/:id` | GET | ADMIN / SUPER_ADMIN | — |
| `/api/v1/contact` | POST | none | `name`, `email`, `topic` (optional), `message` |
| `/api/v1/contact` | GET | ADMIN / SUPER_ADMIN | `page`, `limit` |
| `/api/v1/contact/:id` | GET | ADMIN / SUPER_ADMIN | — |

Successful writes return `201` with `{ success: true, message, data }`. All read
endpoints are administrator-only because submissions contain personal data: the
two list endpoints (`GET /forms/submissions`, `GET /contact`) back the admin
dashboard's Submissions inbox at `/admin/submissions` (newest-first, paginated,
`{ success, data: { items, page, limit, total, totalPages } }`), while the
by-id reads stay available for direct lookups.

Not implemented (future dependencies): transactional email delivery for form and
contact submissions (no SMTP transport is configured, so messages are stored in
MongoDB only); donations/payment processing remains out of scope.

## Validation

| Command | Purpose |
| ------- | ------- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (no emit) |
| `npm run build` | Production build (`server`: compiles to `dist/`, `client`: `next build`) |
| `npm run test` | Model tests via the Node test runner (`server` only; MongoDB-backed tests skip when `MONGODB_URI` is not set) |

## Project structure

```
├── client/                     # Next.js frontend
│   └── src/
│       ├── app/                # App Router pages — (public) and (admin) route groups
│       ├── components/         # ui/ shared/ sections/ admin/
│       ├── data/               # curated fallback content (verbatim live-site copy)
│       ├── services/           # API client services (consumes /api/v1)
│       ├── hooks/              # shared React hooks
│       ├── lib/                # client utilities
│       ├── providers/          # React providers
│       ├── types/              # shared TypeScript types
│       ├── constants/          # client constants (nav, forms)
│       └── proxy.ts            # middleware — guards /admin/* via the auth cookie
└── server/                     # Express REST API
    └── src/
        ├── config/             # centralized env + MongoDB connection
        ├── constants/          # server constants (form types, limits)
        ├── controllers/        # request handlers (incl. public/ read handlers)
        ├── middlewares/        # auth, role, rate-limit, upload, 404 + error handling
        ├── models/             # Mongoose models (users, programs, projects, media, …)
        ├── routes/             # versioned route assemblies (/api/v1)
        ├── scripts/            # CLIs: provision super-admin, seed CMS content
        ├── services/           # business logic (incl. public/ read services)
        ├── types/              # shared API types
        ├── utils/              # ApiError and helpers
        ├── app.ts              # express app assembly
        └── server.ts           # bootstrap + graceful shutdown
```
