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
