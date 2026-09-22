# SM Welfare — Updated Report (Roman Urdu)

**Tareekh:** 22 September 2026
**Kaam:** Purani useless files/reports remove karna, project audit, aur ye updated report (sari detail Roman Urdu mein).

---

## 1. Kya kya REMOVE / DELETE kiya

### A. Purani kharab aur stale reports (7 files delete)

| # | File | Kis wajah se delete ki |
|---|------|------------------------|
| 1 | `forms_implementation_report.md` | Purani report — is mein forms ke fields (file upload, 6 fields) likhe the jo actual implementation se match hi nahi karte. Code mein sirf is ka ek purana comment reference tha, wo bhi fix kar diya. |
| 2 | `server_implementation_report.md` | Purani report — structure galat tha (`config/db.js` jabke asal mein `database.ts` hai), auth ko "Planned" likha tha jabke auth implement ho chuka hai, routes ki list bhi incomplete thi. |
| 3 | `smwelfare_clone_implementation_plan.md` | Purana implementation plan — saare phases pehle hi complete ho chuke the, is mein purana structure (13 projects, Next.js 14, galat folder layout) pada tha. |
| 4 | `smwelfare_complete_analysis.md` | Purani analysis — galat info thi (color palette green likha jabke theme blue/amber hai, Next.js 14 likha jabke 16 hai, 13 projects likhe jabke 17 hain). |
| 5 | `SM-WELFARE-FINAL-CLEANUP-REPORT.md` | Ek phase ka temporary cleanup report — us waqt ka kaam complete ho chuka, ab is ka koi faida nahi. |
| 6 | `SM-WELFARE-VERCEL-DEPLOYMENT-FIX-REPORT.md` | Ek dafa ka fix report — Vercel config fix ho chuka, deployment guide ab `USER-GUIDE.md` Section 7 mein mojood hai. |
| 7 | `SM-WELFARE-VERCEL-HELMET-FIX-REPORT.md` | Ek dafa ka fix report — `@types/helmet` remove ho chuka, ab duplicate info rakhna useless tha. |

### B. Client ki boilerplate file (1 delete)

| # | File | Wajah |
|---|------|-------|
| 8 | `client/README.md` | `create-next-app` ki default boilerplate — is mein galat baatein thin (bola gaya tha `app/page.tsx` edit karein jabke asal path `src/app/` hai, aur Geist font likha tha jo project mein hai hi nahi). Asal documentation root `README.md` aur `USER-GUIDE.md` mein hai. |

### C. Temporary scripts jo maine crawl/verification ke liye banaye the (12 files delete)

`.buffy-compare.mjs`, `.buffy-crawl.mjs`, `.buffy-dates.mjs`, `.buffy-genimages.mjs`, `.buffy-home-structure.mjs`, `.buffy-imgscan.mjs`, `.buffy-outline.mjs`, `.buffy-pdfimages.mjs`, `.buffy-saylani.mjs`, `.buffy-seeimg.mjs`, `.buffy-verify-map.mjs`, `client/.buffy-verify-page.mjs`

> Ye sab one-time temporary scripts thin (live site crawl karne, images verify karne, PDF se images nikaalne ke liye). Codebase mein in ka koi reference nahi tha.

### D. Temporary folder (1 folder delete — 96 images)

| # | Folder | Wajah |
|---|--------|-------|
| 9 | `tmp-pdf-images/` (96 JPG files) | Template PDFs se nikaali gayi temporary images — kaam khatam, website ki images `sm-welfare-pics/` se hain. |

### E. Dead code (1 file delete)

| # | File | Wajah |
|---|------|-------|
| 10 | `client/src/components/animations/framer-motion-utils.tsx` (+ khali `animations/` folder) | Is file ko code mein **kahin se bhi import nahi kiya** jata tha — pure dead code. |

### F. Unused npm packages (4 remove kiye — `client/package.json` se)

| # | Package | Wajah |
|---|---------|-------|
| 11 | `@radix-ui/react-dropdown-menu` | Pure project mein **zero imports** — saare UI components `@base-ui/react` pe bane hain, Radix pe nahi. |
| 12 | `@radix-ui/react-icons` | Zero imports — icons `react-icons` se aate hain. |
| 13 | `@radix-ui/react-slot` | Zero imports — buttons/primitives `@base-ui/react` use karte hain. |
| 14 | `framer-motion` | Sirf us dead file mein import hota tha jo upar delete ki (E point). |

> `package-lock.json` bhi `npm install` se sync kiya — ab **0 vulnerabilities**, aur build bilkul theek chal rahi hai.

### G. Stale references theek kiye (3 files update)

- `server/src/constants/form.ts` — purane deleted report ka naam wala comment hata diya.
- `README.md` — project structure diagram actual folders ke mutabiq kiya (purane `features/`, `modules/`, `utils/` waghera jo exist hi nahi karte the).
- `USER-GUIDE.md` — 3 galtiyan fix: Next.js 14 → 16, Home/About ke sections asal order ke mutabiq, aur donate ki bank details (Meezan → **Faysal Bank**, account/IBAN/SWIFT/EasyPaisa asal wale).

### Kya KYA RAKHA gaya (aur kyun)

| File/Folder | Wajah |
|-------------|-------|
| `README.md` | Asal project documentation (architecture, setup, API table, seed guide) — update karke rakha. |
| `USER-GUIDE.md` | Staff/user guide (admin panel, deployment, troubleshooting) — facts update karke rakha. |
| `client/AGENTS.md` + `client/CLAUDE.md` | Next.js tooling khud `next dev` se inhe regenerate karta hai — hatana kaam kharab karega. |
| `skills-lock.json` + `.agents/` | Installed shadcn skill ki locking/tooling. |
| `sm-welfare-pics/` | Aapki provide ki hui images — website isi mein se chalti hai. |
| `template/` | Design reference PDFs (touch nahi kiye). |

**Kul totals:** 10 files + 1 folder (96 images) delete · 4 packages remove · 3 files ki stale info fix · 0 references toota hue (delete se pehle poore codebase mein grep karke verify kiya).

---

## 2. Kitne APIs bane hue hain — KUL 36 ENDPOINTS

Saari APIs `server/` (Express) mein hain, sab ke sab prefix **`/api/v1`** ke neeche. 10 routers hain.

### A. Public APIs — bina login, sirf padhne ke liye (7 endpoints)

| # | Endpoint | Method | Kaam |
|---|----------|--------|------|
| 1 | `/api/v1/health` | GET | Server + MongoDB ki sehat check karta hai (status, uptime, DB state) — deployment verify ke liye. |
| 2 | `/api/v1/public/programs` | GET | Website ko published programs ki list deta hai (`page`, `limit`, `search`, `program` slug filters). |
| 3 | `/api/v1/public/projects` | GET | Published projects ki list — homepage grid, projects page aur filters chalte hain isi se. |
| 4 | `/api/v1/public/site-settings` | GET | Org ka naam, tagline, contact, social links, footer copy — header/footer/contact isi se bharta hai. |
| 5 | `/api/v1/public/media` | GET | Media/blog images ki list (Cloudinary URLs + titles). |
| 6 | `/api/v1/forms/submit` | POST | **5 public forms** ki submission (Hunarmand Beti, IT Courses, Employee, Free Education, Quran Academy) — server-side validation + rate limit (10 per 15 min per IP), MongoDB mein save. |
| 7 | `/api/v1/contact` | POST | Contact page ka message — validation + rate limit ke saath MongoDB mein save. |

### B. Auth APIs — login session ke liye (4 endpoints)

| # | Endpoint | Method | Auth | Kaam |
|---|----------|--------|------|------|
| 8 | `/api/v1/auth/login` | POST | public (rate limited 10/15 min) | Admin ka email/password login — HttpOnly cookie mein access + refresh token set karta hai. |
| 9 | `/api/v1/auth/refresh` | POST | refresh cookie (rate limited 30/15 min) | Bina dobara password dale naya access token deta hai (session renew). |
| 10 | `/api/v1/auth/logout` | POST | cookie | Session khatam karke cookies clear karta hai. |
| 11 | `/api/v1/auth/me` | GET | login required | Batata hai abhi logged-in kaun hai (name, email, role) — admin UI session check isi se karta hai. |

### C. Admin APIs — login + role ke saath (25 endpoints)

| # | Endpoints | Kaam (Role) |
|---|-----------|-------------|
| 12–16 | `/api/v1/admins` — `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/status` | Admin accounts banana, dekhna, edit karna, activate/deactivate — **sirf SUPER_ADMIN**. Koi public signup nahi. |
| 17–19 | `/api/v1/site-settings` — `GET /`, `POST /` (initialize), `PATCH /` | Site settings ka singleton document dekhna/pehli baar banana/badalna — **read: ADMIN+SUPER_ADMIN, write: SUPER_ADMIN**. |
| 20–24 | `/api/v1/programs` — `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `PATCH /:id/status` | Programs ke CRUD + status (DRAFT/PUBLISHED/ARCHIVED). Delete route jaan boojh kar nahi — kuch delete hota nahi, sirf archive hota hai. |
| 25–29 | `/api/v1/projects` — `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `PATCH /:id/status` | Projects ke CRUD + status (parent program ke neeche). Wahi "no delete, archive only" policy. |
| 30–34 | `/api/v1/media` — `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | Images ka upload (multer → **Cloudinary**), dekhna, edit, delete — **ADMIN + SUPER_ADMIN** dono. Credentials kabhi client ko nahi jate. |
| 35 | `/api/v1/forms/submission/:id` | GET | Kisi form submission ko padhna — **ADMIN/SUPER_ADMIN only** (personal data hai: name, email, phone). |
| 36 | `/api/v1/contact/:id` | GET | Kisi contact message ko padhna — **ADMIN/SUPER_ADMIN only**. |

**Summary:** Public = 7 · Auth = 4 · Admin = 25 · **Kul = 36 endpoints**. Saare responses ek hi standard format mein hain: `{ success, data | error }`. Public APIs sirf `PUBLISHED` content aur whitelisted fields return karti hain; raw MongoDB documents kabhi nahi jate.

---

## 3. Kitne Pages aur Routes hain

### A. Client (Next.js) — 15 page routes + 404 + icon + middleware

**Public routes (7) — bina login:**

| # | Route | Page ka kaam |
|---|-------|--------------|
| 1 | `/` | Homepage — welcome hero → program chips → 6 featured projects → "Our Project" counters → "Charity Efforts Are For Happiness" (6 service cards) → Our Mission → Media Updates → donate CTA band. |
| 2 | `/about` | About — "Charity Efforts Are For Happiness" hero, "Who we are" story (Orangi Town, 2022 floods), "What We Do" (API se programs grid), "Our Mission" paragraphs, CTA band. |
| 3 | `/projects` | Saare 17 projects — program ke hisaab se filter chips ke saath explorer; har card pe category badge. |
| 4 | `/media` | Media/blog updates — images + titles + excerpts, API se (nahi hone pe local verified stories). |
| 5 | `/donate` | Donation page — amount presets, project selector, WhatsApp/Call CTA, aur asal bank details (Faysal Bank, IBAN, SWIFT, EasyPaisa). |
| 6 | `/forms` | 5 application forms — chip selector, browser validation, `POST /api/v1/forms/submit` pe submit. |
| 7 | `/contact` | Contact details + WhatsApp button + message form (`POST /api/v1/contact`). |

**Admin routes (8) — login ke peeche:**

| # | Route | Kaam |
|---|-------|------|
| 8 | `/admin` | Sirf redirect — logged-in ko `/admin/dashboard` pe bhejta hai. |
| 9 | `/admin/login` | Login form (dynamic/server-rendered). |
| 10 | `/admin/dashboard` | 3 summary cards: total programs, total projects, active admins + quick links. |
| 11 | `/admin/programs` | Programs ki list — search, status filter, create/edit/status change (SUPER_ADMIN). |
| 12 | `/admin/projects` | Projects ki list — program/status filter, create/edit (SUPER_ADMIN). |
| 13 | `/admin/media` | Images library — upload (≤5MB, JPG/PNG/WebP), edit, delete. |
| 14 | `/admin/site-settings` | Org name, contact, social links, footer copy (SUPER_ADMIN). |
| 15 | `/admin/admins` | Admin accounts — create/edit/activate-deactivate (SUPER_ADMIN). |

**Baaki routes:**
- `/_not-found` — 404 page
- `/icon.png` — SM Welfare favicon (metadata)
- **Proxy (middleware)** — `client/src/proxy.ts` har `/admin/*` request pe `smw_access_token` cookie check karta hai; na ho to `/admin/login` pe redirect. (Asal security server pe — JWT verify + role check.)

**Build output:** 18/18 static pages generate, 0 errors.

### B. Server routes — 10 routers (36 endpoints)

`health` · `auth` · `admins` · `site-settings` · `programs` · `projects` · `media` · `public` (4 sub-routers) · `forms` · `contact` — ye sab `server/src/routes/` mein hain aur `/api/v1` pe mount hote hain.

---

## 4. Installed Libraries / Packages aur unka kaam

### Client (`client/package.json`) — 12 dependencies + 9 devDependencies

**Dependencies (website chalne ke liye):**

| # | Package | Kya kaam karta hai |
|---|---------|---------------------|
| 1 | `next` (16.x) | Next.js framework — App Router, pages, server components, build/optimization. |
| 2 | `react` + `react-dom` (19.x) | UI banane ki library — saare components React mein likhe hain. |
| 3 | `@base-ui/react` | Accessible UI primitives (Dialog, Sheet, Select, Button, Toast waghera) — hamare `components/ui/*` (shadcn style) isi pe bane hain. |
| 4 | `@fontsource-variable/inter` | Inter font **locally** (body/UI text) — build mein Google Fonts se network call nahi hoti. |
| 5 | `@fontsource-variable/plus-jakarta-sans` | Plus Jakarta Sans font — headings (`font-heading`) locally. |
| 6 | `class-variance-authority` | Button/card ke variants define karne ke liye (`variant="outline"` waghera). |
| 7 | `clsx` | `className` conditions likhne ka helper (jo true hoga wo class lagegi). |
| 8 | `cn` | `cn()` utility — `components/ui/*` isi se classes merge karta hai. |
| 9 | `tailwind-merge` | Do same/conflicting Tailwind classes ko merge karta hai (override rules saaf rehti hain). |
| 10 | `react-icons` | Saare site icons (hi2, fa6 sets) — hero, cards, footer, nav sab isi se. |
| 11 | `tw-animate-css` | Tailwind ke liye ready animations (dialog/sheet/toast ke enter-exit motion). |

**Removed (useless the):** `@radix-ui/react-dropdown-menu`, `@radix-ui/react-icons`, `@radix-ui/react-slot`, `framer-motion` — zero imports.

**DevDependencies (build/lint ke liye):**

| # | Package | Kaam |
|---|---------|------|
| 1 | `typescript` | TypeScript compiler — type safety (`tsc --noEmit`). |
| 2 | `tailwindcss` (4.x) | Styling framework — poore site ka CSS system. |
| 3 | `@tailwindcss/postcss` | Tailwind v4 ka PostCSS plugin — build step mein styles compile karta hai. |
| 4 | `eslint` | Linting — code quality rules. |
| 5 | `eslint-config-next` | Next.js ke specific lint rules (hooks, images, links waghera). |
| 6 | `shadcn` | shadcn CLI — naye UI components project mein add karne ke liye. |
| 7 | `@types/node`, `@types/react`, `@types/react-dom` | TypeScript types — Node/React APIs ke liye compile-time types. |

### Server (`server/package.json`) — 11 dependencies + 12 devDependencies

**Dependencies (API chalne ke liye):**

| # | Package | Kaam |
|---|---------|------|
| 1 | `express` (5.x) | Web framework — saari REST API isi pe bani hai. |
| 2 | `mongoose` (9.x) | MongoDB ODM — schemas/models (users, programs, projects, media, siteSettings, formSubmissions, contactMessages) aur queries. |
| 3 | `jose` | JWT banana/verify karna — access + refresh tokens (auth isipe hai, bcrypt ke saath). |
| 4 | `bcryptjs` | Passwords ka hash/verify (login + admin provisioning). |
| 5 | `cookie-parser` | Request ki cookies padhna — auth tokens HttpOnly cookies mein aate hain. |
| 6 | `cors` | Cross-origin allowlist — sirf `CORS_ORIGINS` wali origins (client) request kar sakti hain, credentials ke saath. |
| 7 | `helmet` | Security HTTP headers (XSS, clickjacking waghera ke khilaf). |
| 8 | `express-rate-limit` | Rate limiting — login (10/15 min), refresh (30/15 min), forms/contact (10/15 min per IP). |
| 9 | `multer` | Image upload parse karna (media upload — phir Cloudinary pe jata hai). |
| 10 | `cloudinary` | Images ka cloud hosting/CDN — admin uploads isi pe store hoti hain. |
| 11 | `dotenv` | `.env` file se environment variables load karna. |

**DevDependencies:**

| # | Package | Kaam |
|---|---------|------|
| 1 | `typescript` (6.x) | Server ka TypeScript compile (`typecheck` + `build`). |
| 2 | `tsx` | TypeScript runner — dev hot-reload (`tsx watch`) aur scripts (`seed:cms`, `provision:super-admin`) chalata hai. |
| 3 | `eslint` + `@eslint/js` + `typescript-eslint` + `globals` | Linting setup — TS-aware rules, browser/node globals. |
| 4 | `cross-env` | Test script mein `NODE_ENV=test` cross-platform set karna (Windows/Linux dono pe chale). |
| 5 | `rimraf` | `npm run clean` — `dist/` folder cross-platform delete karta hai. |
| 6 | `@types/cookie-parser`, `@types/cors`, `@types/express`, `@types/multer` | In packages ke TypeScript types (compile-time only). |

**Node requirement:** `server/package.json` mein `"engines": { "node": "24.x" }` pin hai.

---

## 5. Verification — koi error/issue nahi raha

| Check | Result |
|-------|--------|
| Client `npm run typecheck` | ✅ 0 errors |
| Client `npm run lint` | ✅ 0 errors, 0 warnings |
| Client `npm run build` | ✅ Next.js 16.3.5 — 18/18 pages, 17 routes + proxy middleware |
| Client `npm install` (4 packages remove karne ke baad) | ✅ lockfile sync, **0 vulnerabilities** |
| Server `npm run typecheck` | ✅ 0 errors |
| Server `npm run lint` | ✅ 0 errors |
| Server `npm run build` | ✅ `dist/` compile |
| Server `npm test` | ✅ **175 pass, 0 fail, 0 skipped** |
| Deleted files ke references | ✅ grep se verify — kahin koi purana reference nahi (jo ek tha `form.ts` mein, wo fix) |
| Git status | ✅ sirf intended changes — `template/` aur `sm-welfare-pics/` bilkul untouched |

---

**Final status:** ✅ Cleanup complete — 10 files + 1 folder delete, 4 unused packages remove, 3 documents update, nayi report banai. 36 APIs, 15 pages + middleware, 21+21 packages — sab documented, sab verified, **0 errors / 0 issues**.
