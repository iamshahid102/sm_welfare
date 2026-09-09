# SM WELFARE — Complete Project Audit

**Audit Date:** 2026-09-09
**Current Branch:** `main` (last commit: `0f7242c "api's integrated"`; 7 commits total)
**Overall Status:** **MOSTLY COMPLETE** 🟡

> Backend (Phases 1–20) is complete and green: 313/313 tests pass, typecheck/lint/build all pass, all 30 endpoints verified live against the real MongoDB database. The public website is still presentation-based (template data, mailto/WhatsApp handoffs) and **Phase 21 (frontend integration of the Phase 20 public APIs) has not been started** — so the project is not yet production ready.

---

## 1. Executive Summary

| Area | Status |
|---|---|
| Server architecture (routes → controllers → services → models) | ✅ Complete, consistent |
| Authentication (JWT + HttpOnly cookies + refresh rotation) | ✅ Complete, secure |
| RBAC (ADMIN / SUPER_ADMIN) | ✅ Complete, enforced server-side |
| Admin management (SUPER_ADMIN-only CRUD) | ✅ Complete |
| Site settings singleton | ✅ Complete |
| Programs / Projects CRUD | ✅ Complete (no DELETE — by design) |
| Media / Cloudinary | ✅ Complete (upload/get/delete, magic-byte validation, rollback) |
| Phase 20 public APIs | ✅ 4 of 4 supported endpoints live |
| Contact API | ❌ Not implemented (documented future dependency) |
| Donations/payments | ❌ Not implemented (out of scope by requirement) |
| Public website pages | 🟡 Complete visually, **static/template data only** |
| Admin dashboard UI | ✅ Complete, integrated with protected APIs |
| Frontend ↔ public API integration | ❌ Not started (Phase 21) |

---

## 2. Repository Structure

```
├── client/     Next.js 16 (App Router) frontend — Tailwind CSS 4, shadcn/Base UI
├── server/     Express 5 + TypeScript REST API under /api/v1 — Mongoose/MongoDB Atlas
├── template/   READ-ONLY design source (6 PDF mockups) — verified untouched
└── SM-WELFARE-PROJECT-AUDIT.md   ← this report
```

Key configs verified: `server/tsconfig.json`, `client/tsconfig.json`, `client/components.json` (shadcn), `client/src/app/globals.css` (Tailwind 4 theme), `server/.env.example`, `client/.env.example`. No Next.js config issues observed; Next 16 uses `src/proxy.ts` (middleware replacement).

---

## 3. Phase-by-Phase Audit (Phase 1 → 20)

> ⚠️ **Verification note:** the repository contains no committed phase specification documents or phase reports — the phase history lives in conversation records. Phase boundaries below are reconstructed from the 7 git commits and cross-checked against the **actual current code**. Every claim below was verified from source; nothing is marked COMPLETE based on an old report alone.

| Phase | Objective (reconstructed) | Actually implemented (verified) | Key files | Status |
|---|---|---|---|---|
| 1 | Project scaffold & architecture split | Express server + Next client separation, strict client/server rule | `server/src/app.ts`, `client/src/app/` | ✅ COMPLETE |
| 2 | Config & environment handling | Centralized `env.ts`, validated secrets, typed constants | `server/src/config/env.ts` | ✅ COMPLETE |
| 3 | MongoDB connection layer | Mongoose connect/disconnect with graceful handling | `server/src/config/database.ts` | ✅ COMPLETE |
| 4 | Core models | User, RefreshSession, Program, Project, SiteSettings, Media with validation, indexes, timestamps | `server/src/models/*.model.ts` | ✅ COMPLETE |
| 5 | Authentication | login/refresh/logout/me, JWT (jose), HttpOnly cookies (`smw_access_token`), SHA-256-hashed refresh tokens, `requireAuth` | `auth.routes.ts`, `auth.service.ts`, `utils/auth.ts`, `middlewares/auth.middleware.ts` | ✅ COMPLETE |
| 6 | RBAC | `requireRole(...roles)` middleware; ADMIN vs SUPER_ADMIN split | `middlewares/role.middleware.ts` (+ tests) | ✅ COMPLETE |
| 7 | SUPER_ADMIN provisioning | CLI-only provisioning (no HTTP endpoint), E11000-safe | `scripts/provisionSuperAdmin.ts` (+ db tests) | ✅ COMPLETE |
| 8 | Admin management API | create/list/get/update/status — all SUPER_ADMIN-only | `admin.routes.ts`, `admin.service.ts` | ✅ COMPLETE |
| 9 | Site settings API | singleton GET/POST/PATCH, auth'd reads, SUPER_ADMIN mutations | `siteSettings.routes.ts`, `siteSettings.service.ts` | ✅ COMPLETE |
| 10 | Programs API | list/get/create/update/status, no DELETE (by design), search + bounded pagination | `program.routes.ts`, `program.service.ts` | ✅ COMPLETE |
| 11 | Projects API | same shape as programs + `programId` relationship, compound `(programId, slug)` unique index | `project.routes.ts`, `project.service.ts` | ✅ COMPLETE |
| 12 | Media/Cloudinary backend | upload/get/delete, multer + magic-byte validation, rollback on persistence failure | `media.routes.ts`, `media.service.ts`, `config/cloudinary.ts`, `upload.middleware.ts` | ✅ COMPLETE |
| 13 | Auth/RBAC tests | 25 test files incl. DB-backed route tests | `server/src/**/*.test.ts` | ✅ COMPLETE |
| 14 | Admin login UI | login page + auth provider + refresh-retry API client | `admin/login/page.tsx`, `providers/auth-provider.tsx`, `lib/api/client.ts` | ✅ COMPLETE |
| 15 | Admin shell & guard | protected layout, proxy.ts cookie gate, role-aware nav | `(admin)/admin/(protected)/layout.tsx`, `client/src/proxy.ts` | ✅ COMPLETE |
| 16 | Public site pages | Home/About/Projects/Media/Donate/Contact per template (static data by design at this stage) | `(public)/**/page.tsx`, `components/sections/`, `data/` | ✅ COMPLETE (static) |
| 17 | Admin dashboard | `/admin/dashboard` with stats | `(protected)/dashboard/page.tsx` | ✅ COMPLETE |
| 18 | Admin CRUD UIs | programs, projects, site-settings, media, admins pages wired to protected APIs | `(protected)/*/page.tsx`, `components/admin/`, `services/*` | ✅ COMPLETE |
| 19 | Public API audit | Found **no** public-safe endpoints (all reads required auth) — phase intentionally blocked | — | ✅ COMPLETE (audit; blocker resolved by Phase 20) |
| 20 | Public API foundation | `GET /public/programs|projects|site-settings|media` + tests + docs; contact deferred (no infra) | `routes/v1/public/*`, `controllers/public/*`, `services/public/*` | ✅ COMPLETE |

**Regressions found during this audit:** none. All Phase 20 deliverables verified present and passing (public service DTO whitelists, bounded pagination, published-only filtering, protected-endpoint regression tests).

**Phase 20 fix note:** the previously flaky `provisionSuperAdmin.db.test.ts` was investigated — the historical failure was caused by destructive `deleteMany({})` calls in interim public-API test drafts wiping shared DB state. Those drafts were rewritten with tracked fixtures + verified cleanup; the provisioning test now passes in isolation (7/7) and in the full suite. The test itself was never skipped, weakened, or deleted.

---

## 4. Frontend Page / Route Inventory

Build output (`next build`) confirms 14 routes. Verified against `client/src/app/`:

| Route | Page Exists | Type | Authentication | Backend Integration | Current Status |
|---|---|---|---|---|---|
| `/` | ✅ | Public (SSG) | none | ❌ static (`data/`) | ✅ Renders; static |
| `/about` | ✅ | Public (SSG) | none | ❌ static (`data/programs.ts`) | ✅ Renders; static |
| `/projects` | ✅ | Public (SSG) | none | ❌ static (`data/projects.ts`) | ✅ Renders; static — **Phase 21 target** |
| `/media` | ✅ | Public (SSG) | none | ❌ static (`data/media.ts`) | ✅ Renders; static — **Phase 21 target** |
| `/donate` | ✅ | Public (SSG) | none | ❌ static (WhatsApp handoff) | ✅ Renders; static |
| `/contact` | ✅ | Public (SSG) | none | ❌ `mailto:` fallback | ✅ Renders; static |
| `/admin/login` | ✅ | Auth (dynamic ƒ) | none (login itself) | ✅ `POST /auth/login` | ✅ Working |
| `/admin` | ❌ no page | — | cookie gate | — | 🟡 Unauth → redirect to login; authed visitors get 404 (minor gap) |
| `/admin/dashboard` | ✅ | Protected | required (cookie + client guard) | ✅ auth APIs | ✅ Working |
| `/admin/programs` | ✅ | Protected | required | ✅ `GET/POST/PATCH /programs` | ✅ Working |
| `/admin/projects` | ✅ | Protected | required | ✅ `GET/POST/PATCH /projects` | ✅ Working |
| `/admin/site-settings` | ✅ | Protected (SUPER_ADMIN) | required + role gate | ✅ site settings APIs | ✅ Working |
| `/admin/media` | ✅ | Protected | required | ✅ media upload/get/delete | ✅ Working (⚠️ see bug §29-H1) |
| `/admin/admins` | ✅ | Protected (SUPER_ADMIN) | required + role gate | ✅ admins APIs | ✅ Working |
| `/_not-found` | ✅ | System | — | — | ✅ |

---

## 5. Complete Backend API Inventory

Route registration verified in `server/src/routes/v1/index.ts` + `public.routes.ts`. **30 endpoints total.** All responses follow the contract `{ success: true, data }` / `{ success: false, error: { statusCode, message } }` (verified in code and live smoke tests — no violations found).

### Health APIs
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| GET | `/api/v1/health` | — | — | Service/DB health | ✅ | ✅ (live smoke) |

### Authentication APIs
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| POST | `/api/v1/auth/login` | — | — | Login, sets HttpOnly cookies | ✅ | ✅ `auth.routes.db.test.ts` |
| POST | `/api/v1/auth/refresh` | refresh cookie | — | Rotate access token | ✅ | ✅ |
| POST | `/api/v1/auth/logout` | — | — | Clear cookies + revoke session | ✅ | ✅ |
| GET | `/api/v1/auth/me` | ✅ | — | Current safe user | ✅ | ✅ |

### Admin Management APIs (all SUPER_ADMIN)
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| POST | `/api/v1/admins` | ✅ | SUPER_ADMIN | Create admin | ✅ | ✅ `admin.routes.db.test.ts` |
| GET | `/api/v1/admins` | ✅ | SUPER_ADMIN | List admins (paginated) | ✅ | ✅ |
| GET | `/api/v1/admins/:id` | ✅ | SUPER_ADMIN | Get admin | ✅ | ✅ |
| PATCH | `/api/v1/admins/:id` | ✅ | SUPER_ADMIN | Update admin | ✅ | ✅ |
| PATCH | `/api/v1/admins/:id/status` | ✅ | SUPER_ADMIN | Activate/suspend admin | ✅ | ✅ |

### Site Settings APIs
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| GET | `/api/v1/site-settings` | ✅ | — | Read singleton | ✅ | ✅ `siteSettings.routes.db.test.ts` |
| POST | `/api/v1/site-settings` | ✅ | SUPER_ADMIN | Initialize (once) | ✅ | ✅ |
| PATCH | `/api/v1/site-settings` | ✅ | SUPER_ADMIN | Update | ✅ | ✅ |

### Programs APIs
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| GET | `/api/v1/programs` | ✅ | — | List (search, pagination) | ✅ | ✅ `program.routes.db.test.ts` |
| GET | `/api/v1/programs/:id` | ✅ | — | Get by id | ✅ | ✅ |
| POST | `/api/v1/programs` | ✅ | SUPER_ADMIN | Create | ✅ | ✅ |
| PATCH | `/api/v1/programs/:id` | ✅ | SUPER_ADMIN | Update | ✅ | ✅ |
| PATCH | `/api/v1/programs/:id/status` | ✅ | SUPER_ADMIN | DRAFT/PUBLISHED/ARCHIVED | ✅ | ✅ |

### Projects APIs
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| GET | `/api/v1/projects` | ✅ | — | List (program/status filters) | ✅ | ✅ `project.routes.db.test.ts` |
| GET | `/api/v1/projects/:id` | ✅ | — | Get by id | ✅ | ✅ |
| POST | `/api/v1/projects` | ✅ | SUPER_ADMIN | Create | ✅ | ✅ |
| PATCH | `/api/v1/projects/:id` | ✅ | SUPER_ADMIN | Update | ✅ | ✅ |
| PATCH | `/api/v1/projects/:id/status` | ✅ | SUPER_ADMIN | Status change | ✅ | ✅ |

> **DELETE not implemented by design** for programs and projects — ARCHIVED status retains documents. Verified in route files; not a bug.

### Media / Cloudinary APIs
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| POST | `/api/v1/media` | ✅ | SUPER_ADMIN, ADMIN | Upload (multer + magic bytes → Cloudinary → Mongo metadata) | ✅ | ✅ `media.routes.db.test.ts`, `media.cloudinary.test.ts` |
| GET | `/api/v1/media/:id` | ✅ | SUPER_ADMIN, ADMIN | Get metadata by id | ✅ | ✅ |
| DELETE | `/api/v1/media/:id` | ✅ | SUPER_ADMIN, ADMIN | Delete asset + record | ✅ | ✅ |

> There is **no authenticated media list endpoint** (`GET /api/v1/media` is unregistered) — only the Phase 20 public list exists.

### Public APIs (Phase 20)
| Method | Endpoint | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|
| GET | `/api/v1/public/programs` | — | — | PUBLISHED programs, whitelist DTO, `page/limit/search/program` | ✅ | ✅ `publicProgram.service.test.ts` |
| GET | `/api/v1/public/projects` | — | — | PUBLISHED projects under PUBLISHED programs, embedded program summary | ✅ | ✅ `publicProject.service.test.ts` |
| GET | `/api/v1/public/site-settings` | — | — | Public whitelist; 404 if uninitialized | ✅ | ✅ `publicSiteSettings.service.test.ts` |
| GET | `/api/v1/public/media` | — | — | Public media metadata, bounded pagination | ✅ | ✅ `publicMedia.service.test.ts` |
| POST | `/api/v1/public/contact` | — | — | **NOT IMPLEMENTED / NOT SUPPORTED** — no contact model or mail transport exists; frontend keeps mailto. Verified: live request → 404 (correct). | ❌ | — |

---

## 6. Authentication & Security Audit

**Verified secure:**

- ✅ JWT via `jose`; separate access/refresh secrets; `AUTH_*` secrets ≥ 32 chars enforced in `env.ts`.
- ✅ Tokens delivered as **HttpOnly cookies** (`smw_access_token`, refresh cookie); refresh tokens stored **hashed (SHA-256)** in `refresh_sessions`.
- ✅ **Zero** `localStorage` / `sessionStorage` / `document.cookie` usage in `client/src` (grep-verified). No auth bypass found.
- ✅ Client `apiRequest` sends `credentials: "include"`; single-flight refresh with one retry; unauthorized handler routes to login.
- ✅ `requireAuth` resolves the user from DB per request; `requireRole` enforces ADMIN/SUPER_ADMIN; all mutation routes SUPER_ADMIN-only.
- ✅ `client/src/proxy.ts` guards `/admin/*` (except login) by cookie **presence only** — deliberately does not parse JWTs; backend remains the security authority.
- ✅ Public endpoints expose whitelist DTOs only — no `_id`, `__v`, `status`, `passwordHash`, Cloudinary credentials, or internal config (asserted in tests).
- ✅ Error handler hides internals: 5xx → generic `"Internal server error"`, stack only in non-production.
- ✅ No secrets committed: only `server/.env.example` / `client/.env.example` are tracked; `.env` git-ignored.

**Concerns:** none critical. (See §29 for the client media-upload URL bug, which is functional, not security.)

---

## 7. Database & MongoDB Audit

| Model | Collection | Key fields | Relationships | Indexes | Status |
|---|---|---|---|---|---|
| User | `users` | name, email (unique), passwordHash, role, status | — | unique email | ✅ |
| RefreshSession | `refresh_sessions` | userId, tokenHash, expiresAt, revoked | → User | userId, tokenHash | ✅ |
| Program | `programs` | title, slug (unique), shortDescription, description, status enum, displayOrder | ← Projects | unique slug | ✅ |
| Project | `projects` | programId, title, slug, status enum, displayOrder | → Program | **compound unique (programId, slug)**; (programId, status, displayOrder) | ✅ |
| SiteSettings | `site_settings` | key (singleton), organizationName, tagline, description, contact, socialLinks, footer | — | unique key | ✅ |
| Media | (media collection) | publicId, secureUrl, resourceType, format, width/height/bytes, folder, originalFilename, createdBy | → User (createdBy) | publicId | ✅ |

- Connection: Mongoose → MongoDB Atlas, database **`sm_welfare`** (per project convention/env `MONGODB_URI`). Health endpoint reports `database.state: connected` live.
- Timestamps enabled on all models; status enums (`DRAFT/PUBLISHED/ARCHIVED`) enforced at schema level; slug patterns + length caps validated in schemas and services.

---

## 8. Programs Audit — Summary

✅ Model, constants, service, controller, routes, validation, status handling (DRAFT/PUBLISHED/ARCHIVED), CRUD (create/read/update; **no DELETE by design**), pagination (bounded 1–40, max page 10000), search, admin UI page with form + status controls, protected API. Public API returns PUBLISHED only (draft/archived exclusion test-covered). Slug filter is URL-safe validated; no raw selectors accepted.

## 9. Projects Audit — Summary

✅ Everything in Programs plus the **Program relationship**: public endpoint embeds a program summary resolved via one `populate` (no N+1) and restricts results to published projects under published programs; program filter accepts slug only. Compound `(programId, slug)` unique index prevents duplicate slugs per program at DB level. **DELETE NOT IMPLEMENTED BY DESIGN.** Tests cover draft/archived exclusion at both project and program level, whitelist shape, pagination bounds, and invalid-filter 400s.

## 10. Site Settings Audit — Summary

✅ Strict singleton (fixed `key` + unique index; concurrent init hits E11000). Auth'd GET; SUPER_ADMIN POST (initialize) / PATCH (update). Public DTO whitelist: `organizationName, tagline?, description?, contact{email,phone,address}, socialLinks{facebook,instagram,linkedin,youtube,twitter,website}, footer{shortDescription,copyrightText}, createdAt, updatedAt` — raw doc never returned; `key`/`_id` excluded (test-asserted). Uninitialized → clean `404 "Site settings not found."` (live-verified). Admin UI (SUPER_ADMIN-only nav) integrated.

## 11. Media / Cloudinary Audit — Summary

✅ Cloudinary config server-side only; refuses to boot in production without credentials. Upload pipeline: multer (10 MB cap, never trusts client MIME) → **magic-byte detection** (allowed: jpg/png/webp) → Cloudinary upload → Mongo metadata; **on persistence failure the just-uploaded Cloudinary asset is destroyed (rollback)**. Delete removes asset + record. Admin UI uploads via FormData. Public listing implemented in Phase 20 with bounded pagination and metadata-only DTO; **the Media model has no visibility field — documented decision:** all persisted media metadata is exposed because Cloudinary CDN URLs are already publicly addressable; no credentials or upload context are ever returned (test-asserted).

## 12. Admin Management Audit — Summary

✅ SUPER_ADMIN-only API surface (all 5 endpoints); ADMIN role cannot list/create/update admins (test-enforced, RBAC regression covered in `role.middleware.db.test.ts`). No public registration route exists. Frontend `/admin/admins` page is nav-hidden for ADMIN and hard-gated by `SUPER_ADMIN_ONLY_PREFIXES` in the protected layout; backend remains authoritative.

---

## 13. Public Website Audit

| Page | Data source | Loading | Empty | Error | Responsive | Notes |
|---|---|---|---|---|---|---|
| Home `/` | **STATIC** (`data/`) | n/a | n/a | n/a | ✅ Tailwind responsive | Template-derived stats/chips; CTAs link internally |
| About `/about` | **STATIC** | n/a | n/a | n/a | ✅ | "What we do" from `data/programs.ts` |
| Projects `/projects` | **STATIC** (`PROJECTS` constant) | client filter only | ✅ handled | n/a | ✅ | Category filtering client-side; **not backend-connected** |
| Media `/media` | **STATIC** (`MEDIA_UPDATES`) | client filter only | ✅ handled | n/a | ✅ | Category chips; placeholder imagery |
| Donate `/donate` | **STATIC** (`data/donations.ts`) | n/a | n/a | n/a | ✅ | Builds a WhatsApp deep-link (`wa.me`) — no payment processing (correct per scope) |
| Contact `/contact` | **STATIC** (`SITE` constants) | client form | n/a | n/a | ✅ | Form composes a **mailto:** — honest fallback, documented in code |

**Conclusion:** no public page fetches real backend data. This is the expected pre-Phase-21 state and is honestly labeled static/presentation-based. Admin pages (14 routes) DO use real backend APIs.

---

## 14. Template Design Audit

`template/` contains the 6 source PDFs; **verified unmodified** (`git status` clean for `template/`). The public frontend follows the template system:

- Palette tokens in `globals.css` match the template spec exactly: `--primary: #1f4cbd`, `--secondary-foreground: #0c2475`, `--accent: #fbc024`, background `#f9fcff`, tint `#f1f7ff` (muted), ink `#111826`, muted-foreground `#626b7e`, border `#dfe4ed`.
- Shared building blocks mirror the PDFs: `components/shared/hero`, `page-hero`, `section-heading`, `cta-band`, `container`, `stat`, plus header/topbar/footer in `(public)/layout.tsx`.
- No redesign detected; section structure (hero → stats → programs → CTA) matches the Home PDF ordering.

---

## 15. shadcn / UI Audit

- `client/components.json` present; stack is **shadcn on Base UI** (`@base-ui/react@^1.7`) — not Radix. Components correctly use Base UI APIs.
- Installed (14): `alert, badge, button, card, dialog, empty, input, label, select, separator, sheet, skeleton, textarea, toast`.
- No nested-interactive-element violations found in page/section code (buttons inside buttons absent); dialogs/sheets use the provided primitives.
- No duplicate hand-rolled replacements of shadcn components detected.
- Skill installed at `.agents/skills/shadcn/` — present, untouched during this audit.

---

## 16. Frontend Architecture Audit

- Clean separation: `app/` routes → `components/{admin,public,sections,shared,ui}` → `services/*` (single `lib/api/client.ts`) → typed `types/api.ts`.
- No `any`, no `@ts-ignore`, no `@ts-nocheck`, no unsafe `as any` (grep-verified in both client and server).
- Server/client boundaries sensible: data pages are server components; interactive explorers/forms are `"use client"`.
- `useEffect` usage in auth provider/layout is guard-style, no hydration hazards found in static pages.
- **Findings (no code changed):** 20 lint warnings in client (mostly unused re-exports like `'Program' is defined but never used` in `services/projects.ts`); `services/media.ts` bypasses the shared client for upload (justified for FormData, but see §29-H1); `data/` constants intentionally duplicate some `types/api.ts` shapes (transition scaffolding for Phase 21).

---

## 17. Backend Architecture Audit

- Strict **Route → Controller → Service → Model** layering throughout; controllers are thin handlers, services own validation + business rules, models own schema constraints. Public modules follow the same pattern.
- All input validated (`req.query`/`params`/`body` never trusted): integer-bounded pagination, URL-safe slug regex, enum-restricted statuses, email patterns.
- Response contract uniform via `ApiSuccessResponse`/`ApiErrorResponse` + centralized `errorHandler`; no endpoint violates it.
- DB access is projection/select-scoped; public queries use `Promise.all` count+fetch (2 queries, no N+1); existing compound indexes cover the public project query shape.
- Logging is minimal and error-scoped (`[UnhandledError]` on 500 only).

---

## 18. Automated Testing (run fresh during this audit)

### Server (`cd server`)
| Check | Result |
|---|---|
| `npm run typecheck` (tsc --noEmit) | ✅ PASS (0 errors) |
| `npm run lint` (eslint) | ✅ PASS (0 problems) |
| `npm test` (node:test via tsx) | ✅ **313 / 313 pass, 0 fail, 0 skipped** (42 suites, ~90 s, real MongoDB) |

Coverage includes: auth routes (DB), admin routes (DB), RBAC middleware (unit + DB), program/project/siteSettings/media routes (DB), media Cloudinary (upload/delete paths), services (admin/auth/media/program/project/siteSettings/superAdmin), models, utils (auth tokens, password bcrypt), and all four Phase 20 public suites (whitelist, status exclusion, pagination bounds, protected-endpoint regression).

### Client (`cd client`)
| Check | Result |
|---|---|
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS — **0 errors, 20 warnings** (unused vars/re-exports; cosmetic) |
| `npm run build` (production) | ✅ PASS — 16/16 static pages generated; 14 routes + `/_not-found` |
| Test runner | ⚠️ None configured (no test script) — no frontend unit tests exist |

---

## 19. Real API Smoke Test (live, this audit)

Server started via `tsx src/server.ts` against the real MongoDB Atlas DB; all probes via curl:

| Probe | Expected | Actual |
|---|---|---|
| `GET /api/v1/health` | 200, `database.state: connected` | ✅ 200 `connected` |
| `GET /api/v1/public/programs` | 200 | ✅ 200 |
| `GET /api/v1/public/projects` | 200 | ✅ 200 |
| `GET /api/v1/public/site-settings` | 200 **or** clean 404 when uninitialized | ✅ 404 `"Site settings not found."` |
| `GET /api/v1/public/media?limit=2` | 200 | ✅ 200 |
| `POST /api/v1/public/contact` | 404 (not implemented) | ✅ 404 |
| `GET /api/v1/programs` (no auth) | 401 | ✅ 401 |
| `GET /api/v1/projects` (no auth) | 401 | ✅ 401 |
| `GET /api/v1/site-settings` (no auth) | 401 | ✅ 401 |
| `GET /api/v1/admins` (no auth) | 401 | ✅ 401 |
| `GET /api/v1/media/:id` (no auth) | 401 | ✅ 401 |
| `POST /api/v1/auth/login` (bad creds) | 401 | ✅ 401 |
| `POST /api/v1/auth/refresh` (no cookie) | 401 | ✅ 401 |
| `GET /api/v1/auth/me` (no auth) | 401 | ✅ 401 |

Authenticated-path behavior (login → cookies → `/auth/me` → RBAC 403 for insufficient role) is covered continuously by the DB-backed test suites, which exercise the same Express app over real HTTP.

---

## 20. Frontend Runtime QA

Performed within audit constraints (production build + route verification + code-path review; no full interactive browser session):

- ✅ Production build compiles all 14 routes; `/admin/login` correctly server-rendered on demand; everything else static.
- ✅ No hydration-risk patterns found in public pages (static server components; interactive islands are client components).
- ✅ Auth flow code paths verified: login sets cookies via backend → provider hydrates via `/auth/me` → 401 triggers single shared refresh → failure routes to `/admin/login?from=…`. No 401/refresh loop possible by construction (single-flight + one retry).
- ✅ Proxy gate returns redirect (not a crash) for cookie-less `/admin/*` requests; login page always reachable.
- ⚠️ Not performed: pixel-level browser QA at every breakpoint and dialog interaction (see §29-Low).

## 21. Responsive QA

Static analysis of Tailwind breakpoint usage across layouts/sections: grid collapses, `Sheet`-based mobile nav in both public header and admin shell, mobile menu state in protected layout. All public sections use `Container` + responsive `grid-cols-*`. **No horizontal-overflow antipatterns found.** Pixel-by-pixel device QA at 320/375/390/414/768/1024/1280/1440 was not executed in this audit (browser automation out of scope) — flagged as a verification gap, not a known defect.

## 22. Performance / Code Quality Findings (report-only)

- Public API queries: bounded, projection-friendly, index-aligned — no N+1 (populate used once per list; program summary embedded).
- Client: static pages are fully SSG (no runtime data fetching); interactive components load minimal state; no duplicate fetch layers (single `apiRequest` wrapper aside from the justified FormData upload path).
- Media uploads stream via multipart to backend (no base64 inflation).
- Minor: `asPublicList`-style duplicate helpers across the four public test files; unused re-exports in `services/*` (lint warnings).

---

## 23. Environment / Security Configuration

| Item | Status |
|---|---|
| `.env` committed? | ❌ No — only `*.env.example` tracked; `.env*` git-ignored |
| Server secrets hardcoded? | ❌ None found (all via `process.env` in `config/env.ts`) |
| Client env vars | Only `NEXT_PUBLIC_API_URL` (non-secret) |
| MongoDB URI server-side only | ✅ [CONFIGURED] (value not read/printed) |
| JWT secrets server-side only | ✅ [CONFIGURED] |
| Cloudinary credentials server-side only | ✅ [USED] via `config/cloudinary.ts`; never prefixed `NEXT_PUBLIC_`; never returned by any endpoint (test-asserted) |
| Provisioning credentials | Env/stdin only, never argv |

---

## 24. Git / Scope Audit

- Branch `main`, 7 commits, clean working tree except the Phase 20 implementation (uncommitted, as expected mid-phase):
  `README.md` + 5 files under `server/src/services/public/` (modified) — all Phase 20 scope.
- ✅ `template/` untouched (`git status` empty for the path).
- ✅ No client changes; no junk/debug files; no new dependencies added during Phase 20 (verified against `server/package.json`).
- ⚠️ Phase 20 work is **uncommitted** — committing is left to the user (none performed during this audit, per rules).

---

## 25. Overall Status

**MOSTLY COMPLETE** — the backend platform (auth, RBAC, content management, media, and the Phase 20 public API layer) is production-grade and fully validated; what remains before production is Phase 21 (wiring public pages to the new public APIs), a contact backend, and the intentionally-absent donation processing.

---

## 26. Final Feature Matrix

| Feature | Backend | Frontend | API | Tests | Status |
|---|---|---|---|---|---|
| Authentication (login/logout/me) | ✅ | ✅ | ✅ | ✅ | ✅ COMPLETE |
| JWT access tokens | ✅ | ✅ (cookie) | ✅ | ✅ | ✅ COMPLETE |
| Refresh token rotation | ✅ | ✅ | ✅ | ✅ | ✅ COMPLETE |
| RBAC (ADMIN/SUPER_ADMIN) | ✅ | ✅ (nav + guard) | ✅ | ✅ | ✅ COMPLETE |
| Admin management | ✅ | ✅ `/admin/admins` | ✅ | ✅ | ✅ COMPLETE |
| Site settings | ✅ | ✅ `/admin/site-settings` | ✅ | ✅ | ✅ COMPLETE |
| Programs | ✅ | ✅ `/admin/programs` | ✅ | ✅ | ✅ COMPLETE |
| Projects | ✅ | ✅ `/admin/projects` | ✅ | ✅ | ✅ COMPLETE |
| Media (upload/get/delete) | ✅ | ✅ `/admin/media` | ✅ | ✅ | ✅ COMPLETE |
| Cloudinary integration | ✅ | ✅ (via API) | ✅ | ✅ | ✅ COMPLETE |
| Public Programs | ✅ | ❌ (static page) | ✅ | ✅ | 🟡 Backend ready, not integrated |
| Public Projects | ✅ | ❌ | ✅ | ✅ | 🟡 Backend ready, not integrated |
| Public Site Settings | ✅ | ❌ | ✅ | ✅ | 🟡 Backend ready, not integrated |
| Public Media | ✅ | ❌ | ✅ | ✅ | 🟡 Backend ready, not integrated |
| Contact | ❌ | 🟡 mailto fallback | ❌ | — | ❌ Future backend dependency |
| Donations / payments | ❌ | 🟡 WhatsApp handoff | ❌ | — | ❌ Out of scope (by requirement) |
| Home page | — | ✅ static | — | — | ✅ Complete (static) |
| About page | — | ✅ static | — | — | ✅ Complete (static) |
| Projects page | — | ✅ static | — | — | 🟡 Awaiting Phase 21 |
| Media page | — | ✅ static | — | — | 🟡 Awaiting Phase 21 |
| Donate page | — | ✅ static | — | — | ✅ Complete (static) |
| Contact page | — | ✅ static | — | — | ✅ Complete (static) |
| Admin Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Admin Programs | ✅ | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Admin Projects | ✅ | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Admin Media | ✅ | ✅ | ✅ | ✅ | 🟡 COMPLETE (⚠️ upload URL bug, §29-H1) |
| Admin Site Settings | ✅ | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Admin Management UI | ✅ | ✅ | ✅ | ✅ | ✅ COMPLETE |

---

## 27. Complete API Matrix (every implemented endpoint)

| # | Method | Path | Auth | Role | Purpose | Status | Tests |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/health` | — | — | Health + DB state | ✅ | live smoke |
| 2 | POST | `/api/v1/auth/login` | — | — | Login | ✅ | ✅ |
| 3 | POST | `/api/v1/auth/refresh` | cookie | — | Refresh access token | ✅ | ✅ |
| 4 | POST | `/api/v1/auth/logout` | — | — | Logout/revoke | ✅ | ✅ |
| 5 | GET | `/api/v1/auth/me` | ✅ | — | Current user | ✅ | ✅ |
| 6 | POST | `/api/v1/admins` | ✅ | SUPER_ADMIN | Create admin | ✅ | ✅ |
| 7 | GET | `/api/v1/admins` | ✅ | SUPER_ADMIN | List admins | ✅ | ✅ |
| 8 | GET | `/api/v1/admins/:id` | ✅ | SUPER_ADMIN | Get admin | ✅ | ✅ |
| 9 | PATCH | `/api/v1/admins/:id` | ✅ | SUPER_ADMIN | Update admin | ✅ | ✅ |
| 10 | PATCH | `/api/v1/admins/:id/status` | ✅ | SUPER_ADMIN | Admin status | ✅ | ✅ |
| 11 | GET | `/api/v1/site-settings` | ✅ | — | Read settings | ✅ | ✅ |
| 12 | POST | `/api/v1/site-settings` | ✅ | SUPER_ADMIN | Initialize | ✅ | ✅ |
| 13 | PATCH | `/api/v1/site-settings` | ✅ | SUPER_ADMIN | Update | ✅ | ✅ |
| 14 | GET | `/api/v1/programs` | ✅ | — | List programs | ✅ | ✅ |
| 15 | GET | `/api/v1/programs/:id` | ✅ | — | Get program | ✅ | ✅ |
| 16 | POST | `/api/v1/programs` | ✅ | SUPER_ADMIN | Create | ✅ | ✅ |
| 17 | PATCH | `/api/v1/programs/:id` | ✅ | SUPER_ADMIN | Update | ✅ | ✅ |
| 18 | PATCH | `/api/v1/programs/:id/status` | ✅ | SUPER_ADMIN | Status | ✅ | ✅ |
| 19 | GET | `/api/v1/projects` | ✅ | — | List projects | ✅ | ✅ |
| 20 | GET | `/api/v1/projects/:id` | ✅ | — | Get project | ✅ | ✅ |
| 21 | POST | `/api/v1/projects` | ✅ | SUPER_ADMIN | Create | ✅ | ✅ |
| 22 | PATCH | `/api/v1/projects/:id` | ✅ | SUPER_ADMIN | Update | ✅ | ✅ |
| 23 | PATCH | `/api/v1/projects/:id/status` | ✅ | SUPER_ADMIN | Status | ✅ | ✅ |
| 24 | POST | `/api/v1/media` | ✅ | SUPER_ADMIN, ADMIN | Upload media | ✅ | ✅ |
| 25 | GET | `/api/v1/media/:id` | ✅ | SUPER_ADMIN, ADMIN | Get media | ✅ | ✅ |
| 26 | DELETE | `/api/v1/media/:id` | ✅ | SUPER_ADMIN, ADMIN | Delete media | ✅ | ✅ |
| 27 | GET | `/api/v1/public/programs` | — | — | Public programs | ✅ | ✅ |
| 28 | GET | `/api/v1/public/projects` | — | — | Public projects | ✅ | ✅ |
| 29 | GET | `/api/v1/public/site-settings` | — | — | Public settings | ✅ | ✅ |
| 30 | GET | `/api/v1/public/media` | — | — | Public media list | ✅ | ✅ |
| — | POST | `/api/v1/public/contact` | — | — | Contact submission | ❌ NOT IMPLEMENTED | — |

*(No other endpoints exist. `GET /api/v1/media` without `:id` is unregistered; `GET /api/v1/media/:id` unauthenticated → 401 as verified.)*

---

## 28. Complete Page Matrix

| Route | Public/Protected | Purpose | Backend integration | Auth gate | Responsive | Runtime |
|---|---|---|---|---|---|---|
| `/` | Public | Home | None (static) | — | ✅ | ✅ |
| `/about` | Public | Mission/programs | None (static) | — | ✅ | ✅ |
| `/projects` | Public | Project explorer | None (static) — Phase 21 | — | ✅ | ✅ |
| `/media` | Public | Media gallery | None (static) — Phase 21 | — | ✅ | ✅ |
| `/donate` | Public | Donation builder | None (WhatsApp) | — | ✅ | ✅ |
| `/contact` | Public | Contact form | None (mailto) | — | ✅ | ✅ |
| `/admin/login` | Public | Admin sign-in | ✅ auth API | — | ✅ | ✅ |
| `/admin` | Protected | (no index page) | — | cookie gate | — | 🟡 authed hit → 404 |
| `/admin/dashboard` | Protected | Overview | ✅ | client guard + cookie | ✅ | ✅ |
| `/admin/programs` | Protected | Program CRUD | ✅ | client guard + cookie | ✅ | ✅ |
| `/admin/projects` | Protected | Project CRUD | ✅ | client guard + cookie | ✅ | ✅ |
| `/admin/site-settings` | Protected | Settings editor | ✅ | SUPER_ADMIN gate | ✅ | ✅ |
| `/admin/media` | Protected | Media library | ✅ | client guard + cookie | ✅ | 🟡 upload URL bug |
| `/admin/admins` | Protected | Admin management | ✅ | SUPER_ADMIN gate | ✅ | ✅ |

---

## 29. Known Issues & Gaps

### Critical
*None found.*

### High
1. **[H1] Wrong API URL fallback in client media upload** — `client/src/services/media.ts:14` falls back to `http://localhost:3001/media` while every other service and the default `API_BASE_URL` use port **4000** (`NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"`). With `NEXT_PUBLIC_API_URL` unset, `/admin/media` uploads target the wrong port and fail. Functional bug; one-line fix in Phase 21.

### Medium
1. **[M1] Public pages are entirely static** — expected pre-Phase-21 state, but it means Home/Projects/Media/About content cannot be managed from the admin panel yet.
2. **[M2] No `/admin` index page** — authenticated users landing on `/admin` get a 404 instead of a redirect to `/admin/dashboard`. Minor UX gap.
3. **[M3] No frontend test runner** — client has zero unit/integration tests (server has 313).

### Low
1. **[L1] 20 client lint warnings** (unused imports/re-exports, e.g. `services/projects.ts` `Program`).
2. **[L2] Duplicated response-parsing helpers across the four public test files** — candidates for a shared test util.
3. **[L3] Pixel-perfect responsive QA at all 8 viewports not executed in this audit** (static analysis only; no overflow antipatterns found).

### Future Backend Dependency
- **Contact endpoint** (`POST /api/v1/public/contact`) requires a Contact model + mail transport/notification service — does not exist; frontend mailto fallback stays until then.
- **Donation processing** intentionally absent (no payment gateway per requirements).

### Future Frontend Work (Phase 21)
- Wire public pages to `/api/v1/public/*` (projects, media, site settings, programs), add loading/empty/error states, replace static `data/` sources.
- Fix [H1] while touching `services/media.ts`.
- Optionally add `/admin` redirect page.

### Documentation/Polish
- Phase 20 code is uncommitted; commit when ready.
- README Public API section exists (added in Phase 20); consider OpenAPI spec later if needed.

---

## 30. Recommended Next Steps (prioritized, not implemented)

1. **Fix [H1]** — media upload URL fallback (port 3001 → reuse `API_BASE_URL`) before any admin media usage.
2. **Commit the Phase 20 work** (server public API + README) to lock in the green state.
3. **Phase 21:** integrate public pages with `/api/v1/public/*` (projects → media → site settings → home content), including loading/empty/error states per the template.
4. **Add `/admin` index redirect** to `/admin/dashboard`.
5. **Add a minimal client test setup** (e.g. Vitest/Testing Library) starting with the auth provider and API client refresh logic.
6. **Contact backend** (model + transport + `POST /api/v1/public/contact`) as a follow-on backend phase, then swap the mailto fallback.
7. Clean up the 20 client lint warnings and extract shared public-test helpers.

---

## 31. Audit Compliance Checklist

- [x] Verified from code, not from prior reports
- [x] All 30 endpoints inventoried; Phase 20 public APIs confirmed live
- [x] Contact endpoint honestly reported NOT IMPLEMENTED (404 live)
- [x] No endpoint/page falsely marked complete
- [x] Server: typecheck ✅ lint ✅ tests 313/313 ✅ (fresh run)
- [x] Client: typecheck ✅ lint ✅ (0 errors/20 warnings) build ✅ (fresh run)
- [x] Real API smoke tests against real MongoDB (fresh run)
- [x] Security audit: no token storage, no secrets, no bypasses, RBAC intact
- [x] `template/` untouched · public pages untouched · server code untouched during this audit
- [x] No new dependencies · no commits/pushes performed
- [x] No secrets included in this report

---

*End of audit — SM-WELFARE-PROJECT-AUDIT.md, generated 2026-09-09. Phase 21 not started.*
