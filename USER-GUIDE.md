# SM Welfare Trust — User Guide

> **Sirat-e-Mustaqeem Welfare Trust** (SM Welfare Trust) is a registered welfare organisation in Orangi Town, Karachi, Pakistan, serving food, education and healthcare to families in need since 2017. This project is the organisation's public website and admin content management system (CMS).

---

## 1. What This Project Is

This project has two parts:

- **Public website** (`client/`) — a Next.js 16 (App Router) app that visitors see. It shows the organisation's programs, projects, media updates, donation information, application forms and contact details.
- **Admin CMS** (`server/` + `client/` admin area) — a password-protected panel where staff manage programs, projects, images and site settings. The backend is an Express 5 REST API with MongoDB for data and Cloudinary for image hosting.

There is **no public sign-up form**. Admin accounts are created manually through a one-time server provisioning command (see Section 3).

---

## 2. How the Pieces Fit Together

```
Visitor browser ──► Next.js client (port 3000)
                         │
                         ├── Public pages fetch data from ──► Express API (port 4000) ──► MongoDB
                         │                                         │
                         │                                         └── Media uploads go to ──► Cloudinary
                         │
Admin browser ────► /admin/* (protected by cookie check)
                         │
                         └── Admin API calls ──► Express API ──► MongoDB
```

**Two route groups in the client:**

- `(public)` — pages anyone can visit: Home, About, Projects, Media, Forms, Donate, Contact.
- `(admin)/(protected)` — pages that require login: Dashboard, Programs, Projects, Media library, Site Settings, Admins.

**Two route groups on the server:**

- `/api/v1/public/*` — no authentication required. Serves only published data to the public website.
- `/api/v1/*` (everything else) — requires HttpOnly cookie authentication. Role-based: some endpoints need `SUPER_ADMIN`, some accept both `ADMIN` and `SUPER_ADMIN`.
- `/api/v1/forms/*` and `/api/v1/contact` — public **write** endpoints (no login). They accept form submissions and contact messages, validate every field server-side, and are rate limited to 10 submissions per 15 minutes per IP. Reading stored submissions/messages is admin-only: `GET /api/v1/forms/submissions` and `GET /api/v1/contact` are the paginated inboxes (ADMIN + SUPER_ADMIN) behind the dashboard's **Submissions** page, and `GET …/:id` reads a single document by id.

---

## 3. First-Time Setup (Developer)

### Prerequisites

- **Node.js 24.x** (required — see `"engines"` field in `server/package.json`)
- **MongoDB** running locally or a remote connection string
- A **Cloudinary** account (for image uploads — optional in development but required in production)

### Install

```bash
# Server
cd server
cp .env.example .env          # then fill in values below
npm install

# Client
cd ../client
npm install
```

### Server Environment Variables

Copy `server/.env.example` to `server/.env` and set every value. The server **will not start** without the two auth secrets.

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NODE_ENV` | No | `development` | Set to `production` for live deploys |
| `HOST` | No | `0.0.0.0` | Bind address |
| `PORT` | No | `4000` | Server port |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |
| `MONGODB_URI` | Yes* | — | MongoDB connection string (e.g. `mongodb://127.0.0.1:27017/sm_welfare`) |
| `BCRYPT_ROUNDS` | No | `12` | Password hashing cost (integer 4–16) |
| `AUTH_ACCESS_TOKEN_SECRET` | **Yes** | — | JWT signing secret. Must be ≥32 characters. Generate with: `openssl rand -hex 32` |
| `AUTH_REFRESH_TOKEN_SECRET` | **Yes** | — | JWT signing secret for refresh tokens. Must be ≥32 characters. Generate with: `openssl rand -hex 32` |
| `AUTH_ACCESS_TOKEN_TTL_SECONDS` | No | `900` (15 min) | How long an access token lives |
| `AUTH_REFRESH_TOKEN_TTL_SECONDS` | No | `604800` (7 days) | How long a refresh token lives |
| `AUTH_COOKIE_SECURE` | No | `true` in production | Set to `false` for local HTTP development |
| `AUTH_COOKIE_SAMESITE` | No | `lax` | Cookie SameSite policy (`lax`, `strict`, or `none` — `none` requires `AUTH_COOKIE_SECURE=true`) |
| `CLOUDINARY_CLOUD_NAME` | No** | — | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | No** | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No** | — | Cloudinary API secret |

\* `MONGODB_URI` is technically optional at import time but the server will fail to start without it (validated in `server/src/config/database.ts`).

\** Cloudinary credentials are optional in development (media endpoints return a clear error). In production, the server **refuses to boot** without all three.

### Client Environment Variable

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the Express API. Defaults to `http://localhost:4000/api/v1` if unset. |

Create `client/.env.local` only if you need a non-default API URL.

### Creating the First Admin Account

There is no sign-up page. The first `SUPER_ADMIN` account is created by running the provisioning script from the `server/` directory:

**Interactive mode** (prompts for email and password, password hidden on screen):

```bash
cd server
npm run provision:super-admin
```

**Non-interactive mode** (for CI or scripts — set environment variables first):

```bash
cd server
SUPER_ADMIN_EMAIL=admin@example.com \
SUPER_ADMIN_PASSWORD=your-strong-password \
SUPER_ADMIN_NAME="Super Admin" \
npm run provision:super-admin
```

> The password is never printed or recoverable. The script only confirms the email, role and status of the created account.

### Running in Development

```bash
# Terminal 1 — server (port 4000)
cd server
npm run dev

# Terminal 2 — client (port 3000)
cd client
npm run dev
```

Open **http://localhost:3000** for the public site. Open **http://localhost:3000/admin/login** for the admin panel.

---

## 4. Admin Panel Guide (Staff)

### Logging In

1. Go to `/admin/login` in your browser.
2. Enter your email and password, then click **Sign in**.
3. On success you are taken to the Dashboard.
4. On failure you see "Invalid email or password" — this is the same message whether the email doesn't exist or the password is wrong (for security).

> If you are redirected back to the login page after clicking around, your session may have expired. The system automatically refreshes your session in the background, but if the refresh fails you will need to log in again.

### What You Can See (Role Differences)

There are two roles:

- **SUPER_ADMIN** — can see and do everything.
- **ADMIN** — can view programs, projects, media and the dashboard. **Cannot** create/edit programs, projects or site settings. **Cannot** manage other admin accounts.

The navigation menu automatically hides pages you don't have access to. If an ADMIN tries to visit a SUPER_ADMIN-only page directly by typing the URL, they see an "Access denied" message.

**SUPER_ADMIN-only sections:**
- Site Settings (`/admin/site-settings`)
- Admins (`/admin/admins`)
- Creating, editing and status-changing programs and projects
- Creating, editing and deactivating admin accounts

### Dashboard (`/admin/dashboard`)

Shows three summary cards:
- **Total programmes** — how many programs exist in the system
- **Total projects** — how many projects across all programs
- Third card is role-aware: **Administrators** (active admin accounts) for a SUPER_ADMIN, or **Media** (images in the library) for an ADMIN — admin management is SUPER_ADMIN-only, so asking for it as an ADMIN would be denied

Plus quick-action links to the most common management pages (programs, projects, media upload, submissions inbox, and — for SUPER_ADMIN — site settings and admins).

### Programs (`/admin/programs`)

Programs are the top-level categories (e.g. "Food Distribution", "Education Support"). Projects belong to programs.

**What you see:** A table with columns for Name, Slug, Short description, Display order and Actions.

**Creating a program (SUPER_ADMIN only):**
1. Click **Create program**.
2. Fill in: Title (required), Slug (optional — auto-generated from title if left blank), Short description (required), Description (required), Display order (optional).
3. Click **Create program**. The new program starts as `DRAFT`.

**Editing a program (SUPER_ADMIN only):**
1. Click **Edit** on the program row.
2. Change any fields.
3. Click **Save changes**.
4. You can also change the status: click **Set to Published**, **Set to Draft**, or **Set to Archived** in the Status section at the bottom.

**Statuses:**
- `DRAFT` — not visible on the public website
- `PUBLISHED` — visible on the public website
- `ARCHIVED` — hidden from the public website but retained in the system (never permanently deleted)

**Filtering and search:** Use the search box and status dropdown to narrow the list. Pagination appears when there are more than 10 programs.

### Projects (`/admin/projects`)

Projects are individual initiatives under a program (e.g. "Daily Food Packs" under "Food Distribution").

**What you see:** A table with columns for Name, Program, Slug, Short description, Display order and Actions.

**Creating a project (SUPER_ADMIN only):**
1. Click **Create project**.
2. Select a **Program** from the dropdown (required).
3. Fill in: Title (required), Slug (optional), Short description (required), Description (required), Display order (optional).
4. Click **Create project**. The new project starts as `DRAFT`.

**Editing a project (SUPER_ADMIN only):**
1. Click **Edit** on the project row.
2. Change any fields, including the parent program.
3. Click **Save changes**.
4. You can also change the status in the Status section.

**Filtering:** You can filter by status, by program, or search by name.

> Programs and projects are never permanently deleted. Changing status to `ARCHIVED` hides them from the public site while keeping the data.

### Media (`/admin/media`)

Upload, organize and manage images for the website. Both `ADMIN` and `SUPER_ADMIN` can manage media.

**Uploading an image:**
1. Select an image file. Accepted formats: **JPG, PNG, WebP**. Maximum size: **5 MB**.
2. Enter a **Title** (required) and **Description** (required).
3. Click **Upload media**.
4. The image is uploaded to Cloudinary (the organisation's image CDN) and saved to the database.

**Editing an image:**
1. Click the pencil icon on any image card.
2. Update the title and/or description.
3. Click **Save changes**.

**Deleting an image:**
1. Click the trash icon on any image card.
2. Confirm the deletion. This permanently removes the image from Cloudinary and the database.

**Browsing:** The "All media" section shows a paginated grid of all uploaded images with thumbnails, titles, formats, dimensions and upload dates.

### Submissions (`/admin/submissions`) — ADMIN + SUPER_ADMIN

The read-only inbox for everything the public website sends us. Two tabs:

- **Form submissions** — every application sent from `/forms` (Hunarmand Beti, IT Courses, Employee, Free Education, Quran Academy). Columns: received date/time, form badge, name, email + phone, message. A dropdown filters by form type; pagination is 10 per page. Backed by `GET /api/v1/forms/submissions`.
- **Contact messages** — every message sent from the `/contact` page. Columns: received date/time, name, email, topic, message. Backed by `GET /api/v1/contact`.

Both tabs load newest-first and are read-only by design (personal data — review, don't edit). Both roles can open this page.

### Site Settings (`/admin/site-settings`) — SUPER_ADMIN only

Controls organisation-wide information displayed on the public website.

**What you can change:**

| Section | Fields |
|---------|--------|
| Organisation | Organisation name (required), Tagline, Description |
| Contact | Contact email, Phone, Address |
| Social links | Facebook, Instagram, LinkedIn, YouTube, Twitter, Website (all URLs) |
| Footer | Short description, Copyright text |

After making changes, click **Save changes** at the bottom of the page. If no settings have been created yet, you'll see an **Initialize settings** button to create the initial record.

### Admins (`/admin/admins`) — SUPER_ADMIN only

Manage administrator accounts. There is no self-registration — all accounts are created here.

**Creating an admin:**
1. Click **Create admin**.
2. Enter Name, Email and Password (with confirmation).
3. Click **Create admin**.
4. The new account is created as `ACTIVE`.

**Editing an admin:**
1. Click **Edit** on the admin row.
2. Update the name and/or email.
3. Click **Save changes**.

**Activating / deactivating:**
1. Click **Edit** on the admin row.
2. In the Status section, click **Deactivate** or **Activate**.
3. A deactivated admin cannot log in.

**Filtering:** You can search by name/email and filter by status (Active / Inactive).

### Logging Out

Click **Sign out** in the top-right corner of the admin header. Your session is ended and you are returned to the login page.

---

## 5. Public Website Guide (Visitor-Facing)

### Home (`/`)

The landing page shows sections in this order:
- A full-width homepage banner (the live site's designed artwork) that links to /donate — click anywhere on it to reach the donation page.
- Programme chips — links to each published program.
- "Our Projects" — a grid of six featured projects with photos, plus a View all link.
- "Our Project" — impact counters (daily food packs, ration support, education, medical).
- "Charity Efforts Are For Happiness" — about intro with six numbered service cards.
- "Our Mission" — mission paragraphs with a Read More link to /about.
- "Media Updates" — latest field stories with photos.
- A call-to-action band with donate/contact links.

### About (`/about`)

- Hero: "Charity Efforts Are For Happiness".
- "Who we are" — the organisation's story and grassroots work in Orangi Town, with a photo.
- "What We Do" — a grid of published programs fetched from the API.
- "Our Mission" — mission/vision paragraphs.
- A call-to-action band.

### Projects (`/projects`)

- A hero section introducing the projects page.
- An interactive explorer component that lists published projects, filterable by program. Each project shows its title, short description and parent program.

### Media (`/media`)

- A hero section introducing the media page.
- An explorer component showing published media items (images uploaded by admins) with thumbnails, titles and descriptions.

### Donate (`/donate`)

**This is a manual donation flow — there is no online payment gateway.** Here's exactly what happens:

1. **Choose an amount:** Pick from preset amounts or enter a custom amount.
   - PKR 1,500 — Feeds a family for a week
   - PKR 3,500 — One month of school for a child
   - PKR 7,500 — A full monthly ration pack
   - PKR 25,000 — Sponsors a vocational course
2. **Choose a project:** Select which initiative to direct the donation to (from a dropdown of project names).
3. **Optional:** Check "Make this a monthly commitment".
4. **See a live summary** of what you're giving and where.
5. **Confirm:** Click **Confirm on WhatsApp** (opens WhatsApp with a pre-filled message to the organisation's number) or **Call us** (dials the organisation's phone number).
6. **Bank and wallet details** are shown on the right side (verbatim from the live site):
   - Account title: Sirat e mustaqeem welfare trust
   - Bank: Faysal Bank
   - Account number: 355430100008288
   - IBAN: PK48FAYS355430100008288
   - SWIFT code: FAYSPKKA
   - EasyPaisa account: 03152616482
7. A note explains that the funds are Zakat-eligible and donors should specify whether their donation is Zakat, Sadaqah or general.

### Forms (`/forms`)

The five application/registration forms from the organisation's programme list.
A chip selector switches between them; each form validates in the browser and
submits to `POST /api/v1/forms/submit`, where it is stored in MongoDB.

1. **Hunarmand Beti Vocational Admission** — course, age and notes.
2. **IT Courses & Vocational Training Registration** — course type and experience level.
3. **Employee Form** — department, address and field-work availability.
4. **Sirat e Mustaqeem Free Education System** — educational level and last school attended.
5. **Sirat ul Quran Academy** — course, age and a motivation statement.

After a successful submission the visitor sees a confirmation message and can
submit another response. Each IP address is limited to 10 submissions per 15
minutes.

### Contact (`/contact`)

- Contact details: email, phone and physical address (fetched from Site Settings if available, otherwise from built-in defaults).
- A "Chat on WhatsApp" button linking to the organisation's WhatsApp number.
- A "Send a message" form (name, email, optional topic, message) that submits to `POST /api/v1/contact`. Messages are validated, rate limited and stored in MongoDB; a confirmation panel is shown on success.

---

## 6. Content Flow (How Admin Changes Reach the Public Site)

```
Admin creates/edits a program/project/media/site-settings
        │
        ▼
Express API validates and saves to MongoDB
        │
        ▼
Public API (/api/v1/public/*) serves published items
        │       (programs/projects → PUBLISHED only)
        │       (media → all uploaded items)
        ▼
Next.js server components fetch from public API
        │
        ▼
Visitor sees updated content
```

**Important details:**

- **Public API** for programs (`/api/v1/public/programs`) and projects (`/api/v1/public/projects`) only returns `PUBLISHED` items. `DRAFT` and `ARCHIVED` items are never sent to visitors.
- **Public media API** (`/api/v1/public/media`) returns **all** uploaded media. The Media model has no status/visibility field — every uploaded image is publicly accessible via its Cloudinary URL.
- **No authentication required** for public API endpoints — they serve read-only data.
- **Public pages are server-rendered** as Next.js server components. There are no `generateStaticParams`, `revalidate`, or `export const dynamic` configurations in the page files. Changes made in the admin panel appear on the public site on the next page load. Depending on your deployment platform's caching behaviour, you may need to trigger a redeploy or wait for the cache to expire for changes to become visible to all visitors.
- The client's Next.js proxy (`client/src/proxy.ts`) checks for the `smw_access_token` cookie before allowing access to any `/admin/*` page. If the cookie is missing, the visitor is redirected to `/admin/login`. This is a first line of defense — the actual security (signature verification, role checks) happens on the server.

---

## 7. Deployment Guide

### Client (Next.js)

The client is a standard Next.js app. It can be deployed to any platform that supports Node.js or has built-in Next.js support (e.g. Vercel).

**Environment variable to set:**
- `NEXT_PUBLIC_API_URL` — the full base URL of your deployed API (e.g. `https://api.smwelfare.charity/api/v1`). If unset, it defaults to `http://localhost:4000/api/v1` which will not work in production.

### Server (Express)

The server is a standard Node.js HTTP server. The code in `server/src/server.ts` includes a comment confirming Vercel zero-config detection: the `server.listen()` call at module startup is captured by Vercel's Node.js server detection, so no `vercel.json` configuration is needed when deploying to Vercel.

For other platforms (Railway, Render, a VPS), run:

```bash
cd server
npm run build        # compiles TypeScript to dist/
node dist/server.js  # starts the server
```

**Production environment variables to set:**

| Variable | Production value |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `AUTH_COOKIE_SECURE` | `true` (required for HTTPS — cookies won't work without it) |
| `CORS_ORIGINS` | Your production client URL (e.g. `https://smwelfare.charity`) |
| `AUTH_ACCESS_TOKEN_SECRET` | A strong random string (≥32 chars). Never reuse the dev value. |
| `AUTH_REFRESH_TOKEN_SECRET` | A strong random string (≥32 chars). Never reuse the dev value. |
| `MONGODB_URI` | Your production MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary credentials |
| `CLOUDINARY_API_KEY` | Your Cloudinary credentials |
| `CLOUDINARY_API_SECRET` | Your Cloudinary credentials |

**One-time production step:** After deploying the server, create the first SUPER_ADMIN account by running the provisioning script against the production database:

```bash
SUPER_ADMIN_EMAIL=admin@smwelfare.charity \
SUPER_ADMIN_PASSWORD=your-strong-password \
npm run provision:super-admin
```

### CORS and Cookies

- `CORS_ORIGINS` must include the exact origin(s) of your client app (comma-separated). The server sets `credentials: true` on CORS, so the origin must be exact — no wildcards.
- In production, `AUTH_COOKIE_SECURE` **must** be `true` (or it defaults to `true` when `NODE_ENV=production`). Browsers reject `Secure` cookies over non-HTTPS connections.
- `AUTH_COOKIE_SAMESITE` defaults to `lax`. If your client and API are on different subdomains, you may need `none` (but this requires `Secure=true`).

---

## 8. Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Server crashes on startup with "AUTH_ACCESS_TOKEN_SECRET must be set…" | Missing or short auth secrets in `.env` | Set both `AUTH_ACCESS_TOKEN_SECRET` and `AUTH_REFRESH_TOKEN_SECRET` to strings ≥32 characters. Generate with `openssl rand -hex 32`. |
| Server crashes with "AUTH_COOKIE_SAMESITE=none requires AUTH_COOKIE_SECURE=true" | `AUTH_COOKIE_SAMESITE=none` set but `AUTH_COOKIE_SECURE` is not `true` | Either set `AUTH_COOKIE_SECURE=true` or change SameSite to `lax`. |
| Admin login page loads but login fails with "Invalid email or password" | Wrong credentials, or account is `INACTIVE` | Double-check email and password. If the account was deactivated, a SUPER_ADMIN must reactivate it. |
| Admin page redirects back to login immediately | Access cookie missing or session expired, or `AUTH_COOKIE_SECURE` is wrong for the protocol | Ensure `AUTH_COOKIE_SECURE=false` for local HTTP, `true` for production HTTPS. Check CORS_ORIGINS includes your client origin. |
| Media upload fails | Cloudinary not configured, or file too large | Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env`. File must be ≤5 MB and JPG/PNG/WebP. |
| "File must not exceed 5 MB" error on upload | File exceeds `MAX_MEDIA_BYTES` (5 MB = 5 × 1024 × 1024 bytes) | Choose a smaller image or compress it before uploading. |
| `npm test` crashes with "AUTH_ACCESS_TOKEN_SECRET must be set…" | Missing `.env.test` file | The `.env.test` file is included in the repository with dummy values. Run `npm test` from the `server/` directory — it loads `.env.test` automatically when `NODE_ENV=test`. |
| Public website shows no programs/projects/media | No items have `PUBLISHED` status yet | Create items in the admin panel and change their status to `PUBLISHED`. |
| Build fails with Google Fonts errors | Old code fetching from `fonts.googleapis.com` at build time | Fonts have been replaced with self-hosted `@fontsource-variable` packages — no network access needed. |
| `next build` fails with "fetch failed" during static generation | API at `NEXT_PUBLIC_API_URL` is unreachable | Ensure the Express server is running and `NEXT_PUBLIC_API_URL` points to it. |
| Contact page shows fallback email/phone | Site Settings not initialised | A SUPER_ADMIN must go to `/admin/site-settings` and click "Initialize settings", then fill in the contact details. |

---

## 9. Glossary

| Term | Definition |
|------|-----------|
| **SUPER_ADMIN** | The highest-privilege role. Can do everything: manage admins, site settings, programs and projects. Only one SUPER_ADMIN can be created through the provisioning script — additional SUPER_ADMINs can be created through the Admins page. |
| **ADMIN** | A staff role with read access to programs, projects, media and the dashboard. Can upload, edit and delete media. Cannot create/edit programs, projects or site settings, and cannot manage other admin accounts. |
| **DRAFT** | A program or project status meaning "not yet public." Only visible in the admin panel. |
| **PUBLISHED** | A program or project status meaning "visible on the public website." |
| **ARCHIVED** | A program or project status meaning "hidden from the public website but retained in the system." Programs and projects are never permanently deleted. |
| **Cloudinary** | A cloud-based image hosting service. Images uploaded through the admin panel are stored on Cloudinary's CDN and served to visitors from there. |
| **Slug** | A URL-friendly version of a title (lowercase, hyphens instead of spaces). Used in URLs like `/projects#food-distribution`. Auto-generated from the title if not specified. |
| **Jwt / Access Token / Refresh Token** | The authentication mechanism. An access token proves you are logged in (short-lived, 15 minutes). A refresh token lets you get a new access token without re-entering your password (longer-lived, 7 days). Both are stored as HttpOnly cookies — JavaScript cannot read them. |
| **HttpOnly Cookie** | A browser cookie that JavaScript cannot access. Used for auth tokens so that even if the website has a security vulnerability, the tokens cannot be stolen by malicious scripts. |
| **Rate Limiting** | A security measure that limits how many requests a single IP address can make in a given time period. Login is limited to 10 attempts per 15 minutes; token refresh is limited to 30 per 15 minutes; form and contact submissions are limited to 10 per 15 minutes. |
| **Singleton** | A resource that exists only once in the database. Site Settings is a singleton — there is exactly one configuration document for the entire site, enforced by a unique database index. |
