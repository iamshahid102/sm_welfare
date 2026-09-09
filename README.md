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

> **Windows note:** on this machine the top-level folders are currently on disk
> as `Client`/`Server` (a file lock prevented the lowercase rename during setup).
> `npm run dev` works from any casing, but the **production build** of Next.js 16
> (Turbopack) fails with `Invariant: Expected workStore to be initialized` when
> the shell path casing does not match the on-disk casing. Until the folders are
> renamed to `client`/`server` (safe to do once the lock clears, e.g. after
> closing the project in the IDE), run builds from the exact-cased directory:
>
> ```bash
> cd Client && npm run build   # not `cd client`
> ```

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

Not implemented (future dependencies): `POST /api/v1/public/contact` — no contact model or mail transport exists yet, so the frontend keeps its mailto behavior; donations/payment processing remains out of scope.

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
│       ├── app/                # App Router pages
│       ├── components/         # ui/ shared/ public/ admin/
│       ├── features/           # feature-specific modules
│       ├── services/           # API client services (consumes /api/v1)
│       ├── hooks/              # shared React hooks
│       ├── lib/                # client utilities
│       ├── types/              # shared TypeScript types
│       ├── constants/          # client constants
│       └── utils/              # pure helper functions
└── server/                     # Express REST API
    └── src/
        ├── config/             # centralized env handling
        ├── modules/            # feature modules (future)
        ├── models/             # Mongoose models (future)
        ├── middlewares/        # 404 + centralized error handling
        ├── routes/             # versioned route assemblies (/api/v1)
        ├── utils/              # ApiError and helpers
        ├── types/              # shared API types
        ├── constants/          # server constants
        ├── app.ts              # express app assembly
        └── server.ts           # bootstrap + graceful shutdown
```
