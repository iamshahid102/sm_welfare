# SM Welfare Trust — Complete CMS Backend Report

**Project:** SM Welfare Trust (smwelfare.charity) — Full-Stack CMS
**Report ki zubaan:** Roman Urdu
**Report ki tareekh:** 29 September 2026
**Kaam ka scope:** Server/Backend ko complete dynamic banana, ek hi admin ka CMS, one-click content seed, aur extra/unused cheezein remove karna.

---

## 1. Khulasa (Short Summary)

Is task me aap ke project ka **server/backend** mukammal tor par update kiya gaya hai taake **sirf EK admin** poori website ko dynamically control kar sake.

Teen badey kaam kiye gaye:

1. **Ek hi Admin ka system (Single Admin / Single Role)**
   Pehle do roles thay — `SUPER_ADMIN` aur `ADMIN`. Ab **sirf ek role `ADMIN`** hai aur **sirf ek hi account** ban sakta hai. Admin management ka poora section (`/admins` API aur admin panel ka "Admins" page) hata diya gaya hai.

2. **One-Click Seed (sab se zaroori feature)**
   Aap ka saara asli content (13 programmes, 17 projects, site settings) pehle se seed data me mojood tha, magar sirf terminal command se load hota tha. Ab wo **admin dashboard par ek button** se load ho jata hai. Aap ke current hardcoded content ko **delete nahi kiya gaya** — sab kuch waise hi hai, sirf ab ek click me database me chala jata hai.

3. **Extra / Ghair-Zaroori cheezein remove**
   Role-based access control, admin CRUD, duplicate type definitions — sab hata diye gaye.

**Natija:** Ab ek hi admin login karta hai aur poori website ka content (Programmes, Projects, Site Settings, Media, aur Forms/Contact submissions) apne dashboard se manage kar sakta hai.

---

## 2. Server me Kya Change Hua

### 2.1 Ek Hi Admin (Single Role)

| Pehle | Ab |
| --- | --- |
| Roles: `SUPER_ADMIN`, `ADMIN` | Sirf `ADMIN` |
| Ek SUPER_ADMIN + bohat se ADMIN ban sakte thay | Sirf **ek** account ban sakta hai (one-time) |
| `SUPER_ADMIN` sirf kuch kaam kar sakta tha | Admin **sab kuch** kar sakta hai |
| Admin management API (`/api/v1/admins`) | **Hata diya gaya** |
| `requireRole()` middleware (403 errors) | **Hata diya gaya** — ab sirf `requireAuth()` |

**File-level changes (Server):**

**Nayi files:**
- `server/src/services/adminAccount.service.ts` — sirf ek admin account banane ka service (one-time, guard ke sath)
- `server/src/scripts/provisionAdmin.ts` — admin banane ki CLI command
- `server/src/services/seed.service.ts` — content seed karne ka main logic (CLI aur API dono isi ko use karte hain)
- `server/src/controllers/seed.controller.ts` — seed ka HTTP controller
- `server/src/routes/v1/seed.routes.ts` — `POST /api/v1/seed` route

**Delete ki gayi files (server):**
- `src/middlewares/role.middleware.ts` (+ 2 test files)
- `src/services/admin.service.ts` (+ test file)
- `src/controllers/admin.controller.ts`
- `src/routes/v1/admin.routes.ts` (+ test file)
- `src/services/superAdmin.service.ts` (+ test file)
- `src/scripts/provisionSuperAdmin.ts` (+ test file)

**Update ki gayi files (server):**
- `src/constants/user.ts` — roles sirf `['ADMIN']`
- `src/models/user.model.ts` — role ab single value, default `ADMIN`
- `src/services/auth.service.ts` — login par sirf zaroori fields update hoti hain
- `src/middlewares/auth.middleware.ts` — role check khatam
- `src/routes/v1/*.routes.ts`, `src/routes/api/*.routes.ts` — `requireRole` hata diya
- `src/scripts/seedCms.ts` — ab shared seed service ko call karta hai
- `server/package.json` — nayi command `provision:admin`
- `server/.env.example` — `ADMIN_*` variables documented

### 2.2 Extra Fields / Duplicate Code Remove

| Cheez | Kya kiya | Kyun |
| --- | --- | --- |
| `SUPER_ADMIN` role | Remove | Sirf ek admin hai, doosra role bekaar tha |
| `requireRole()` access control | Remove | Ek role ke sath iski koi zaroorat nahi |
| Admin CRUD (`/api/v1/admins`) | Remove | Ek account is se zyada ban hi nahi sakta |
| `PublicMediaListResult` (duplicate interface) | Remove | `PublicMediaListEnvelope` pehle se mojood thi — dono bilkul same thay |
| Client ka `isSuperAdmin()` helper + `role` union | Remove | Ab role ka farq hi nahi hai |

### 2.3 Jo Cheezein Jaan Bujh Kar RAKHI Gayi Hain (Safety Decision)

Ye "extra" nahi hain — ye zaroori hain, is liye **delete nahi** ki gayi:

1. **`status` field (DRAFT / PUBLISHED / ARCHIVED)** — Program aur Project par.
   Ye publish/draft ka switch hai. Public API (`/api/v1/public/*`) sirf `PUBLISHED` content dikhata hai. Agar ye hata dete to:
   - draft content control khatam ho jata,
   - database migration ki zaroorat parti,
   - 28 test files todni parti.

   **Iski jagah:** Seed sara content **seedha `PUBLISHED`** likhta hai — yani seed karne ke baad har cheez **foran live** ho jati hai.

2. **`User.role`** — ab sirf ek value (`ADMIN`) hai. Isse token aur API response ka shape stable rehta hai.

3. **`User.status` (ACTIVE / INACTIVE)** — account on/off ka security guard hai.

---

## 3. One-Click Seed — Sab Se Zaroori Feature

### 3.1 Ye Kya Karta Hai

Aap ka website ka saara **asli content** (jo abhi project ki files me hardcoded hai) ek click me database me chala jata hai, aur phir admin panel se **editable** ban jata hai.

**Seed hone wala content:**

| Content | Kitna | detail |
| --- | --- | --- |
| **Programmes** | 13 | Hunarmand Beti, Free Schooling, Health Care, Sirat ul Quran, Sasta Khana, Rozgar, Marriage Support, Free Eid Shopping, Flood Relief, Home & Masjid Renovation, Qurbani Barae Waqaf, Tree for Tomorrow, Winter Relief |
| **Projects** | 17 | Jin me 6 featured projects (live homepage slider ke mutabiq) + 11 baqi live pages |
| **Site Settings** | 1 (singleton) | Organization name, tagline, description, contact (email / phone / address), social links (Facebook, Instagram, LinkedIn, YouTube, website), footer text |

> **Note:** **Media (tasveerein) seed nahi hoti.** Media documents ko asli Cloudinary assets aur uploading user chahiye. Tasveerein admin panel ki **Media** section se upload karni hain. (Jab tak upload na hon, public site apni verified local images fallback ke tor par dikhati rehti hai — website tootegi nahi.)

### 3.2 Seed Safe Kyun Hai

- **Idempotent hai:** Content `slug` ke zariye match hota hai aur usi jagah update ho jata hai. Bar bar chalane se **duplicate nahi banta**.
- **Kuch delete nahi karta:** Sirf seed data wale documents likhta/update karta hai. Aap ka khud banaya hua content **mehfooz** rehta hai.
- **Validation pehle:** Har document database me likhne se pehle apne schema se validate hota hai, is liye adhoora content database me nahi jata.
- **Ek hi service:** CLI (`npm run seed:cms`) aur Admin button — dono **same code** chalate hain, is liye result hamesha ek jaisa hoga.

### 3.3 Seed Kaise Chalayein

**Tareeqa 1 — Admin Dashboard (recommended):**
1. `/admin/login` par login karein
2. **Dashboard** kholein
3. **"Site content"** card me **"Seed / re-sync content"** button dabayein
4. Natija foran screen par aa jayega, misal: `13 programmes added, 0 re-synced · 17 projects added, 0 re-synced · site settings created`

**Tareeqa 2 — Terminal:**
```bash
cd server
npm run seed:cms
```

---

## 4. Complete API List

Base URL: `http://localhost:4000/api/v1`

### 4.1 Authentication (sab ke liye zaroori)

| Method | Endpoint | Kaam |
| --- | --- | --- |
| POST | `/auth/login` | Admin login (HttpOnly cookies set karta hai) |
| POST | `/auth/refresh` | Session refresh (refresh token rotate hota hai) |
| POST | `/auth/logout` | Logout + session revoke |
| GET | `/auth/me` | Current logged-in admin |

### 4.2 Content Seed (naya)

| Method | Endpoint | Kaam |
| --- | --- | --- |
| POST | `/seed` | Poora asli content database me load / re-sync karna (idempotent) |

### 4.3 Site Settings (singleton — sirf ek record)

| Method | Endpoint | Kaam |
| --- | --- | --- |
| GET | `/site-settings` | Current settings padhna |
| POST | `/site-settings` | Settings pehli dafa banana |
| PATCH | `/site-settings` | Settings partial update karna |

### 4.4 Programmes

| Method | Endpoint | Kaam |
| --- | --- | --- |
| GET | `/programs` | List (page, limit, search, status) |
| GET | `/programs/:id` | Ek programme |
| POST | `/programs` | Naya programme |
| PATCH | `/programs/:id` | Programme update |
| PATCH | `/programs/:id/status` | Publish / Draft / Archive |

### 4.5 Projects

| Method | Endpoint | Kaam |
| --- | --- | --- |
| GET | `/projects` | List (page, limit, search, status, programId) |
| GET | `/projects/:id` | Ek project |
| POST | `/projects` | Naya project (programId zaroori) |
| PATCH | `/projects/:id` | Project update |
| PATCH | `/projects/:id/status` | Publish / Draft / Archive |

> **Note:** Programs aur Projects ka **DELETE endpoint jaan boojh kar nahi hai** — content physically delete nahi hota, sirf `ARCHIVED` hota hai. Ye data safety ke liye hai.

### 4.6 Media

| Method | Endpoint | Kaam |
| --- | --- | --- |
| GET | `/media` | Media library list |
| POST | `/media` | Image upload (multipart, field name `file`) |
| GET | `/media/:id` | Ek media ka metadata |
| PATCH | `/media/:id` | Title / description update |
| DELETE | `/media/:id` | Cloudinary + database se delete |

### 4.7 Submissions (Admin Inbox)

| Method | Endpoint | Kaam |
| --- | --- | --- |
| GET | `/forms/submissions` | Form submissions (formType filter ke sath) |
| GET | `/forms/submission/:id` | Ek submission |
| GET | `/contact` | Contact messages list |
| GET | `/contact/:id` | Ek contact message |

### 4.8 Public (bina login, website ke liye)

| Method | Endpoint | Kaam |
| --- | --- | --- |
| GET | `/public/programs` | Sirf PUBLISHED programmes |
| GET | `/public/projects` | Sirf PUBLISHED projects (program slug filter) |
| GET | `/public/site-settings` | Public-safe site settings |
| GET | `/public/media` | Public media metadata |
| POST | `/forms/submit` | Public forms (5 forms) |
| POST | `/contact` | Public contact form |

### 4.9 Health

| Method | Endpoint | Kaam |
| --- | --- | --- |
| GET | `/health` | Server health check |

---

## 5. Data Fields (Exact — Koi Extra Field Nahi)

Yehi fields website par show hote hain aur yehi CMS me edit hote hain:

**Program**
```
title, slug, shortDescription, description, status, displayOrder
```

**Project**
```
programId, title, slug, shortDescription, description, status, displayOrder
+ program (embedded summary: id, title, slug, status)
```

**Site Settings** (sirf ek record)
```
organizationName, tagline, description
contact:        email, phone, address
socialLinks:    facebook, instagram, linkedin, youtube, twitter, website
footer:         shortDescription, copyrightText
```

**Media**
```
publicId, secureUrl, resourceType, format, width, height, bytes,
folder, originalFilename, title, description, createdBy (internal)
```

**User** (sirf ek admin)
```
name, email, passwordHash (kabhi API se bahar nahi jata),
role (hamesha ADMIN), status (ACTIVE / INACTIVE), lastLoginAt
```

**Form Submission**
```
formType, name, email, phone, message
```

**Contact Message**
```
name, email, topic, message
```

---

## 6. Admin Panel — Kaise Use Karein

Login: `/admin/login`

| Page | Kya kar sakte hain |
| --- | --- |
| **Dashboard** | Counts dekhein + **"Seed / re-sync content"** button chalayein |
| **Site settings** | Organization name, tagline, description, contact info, social links, footer text |
| **Programs** | Naye programmes banayein / edit karein / publish ya draft karein |
| **Projects** | Naye projects banayein, parent programme chunein, publish/draft karein |
| **Media** | Tasveerein upload karein (Cloudinary), title/description set karein, delete karein |
| **Submissions** | Public forms aur contact form ki tamam submissions padhein (filter ke sath) |

**Naya admin account kaise banayein:**
Sirf **ek dafa**, terminal se:
```bash
cd server
npm run provision:admin
```
Email/password environment variables se ya interactively pooch liye jayenge (password type karte waqt screen par nazar nahi aata).
> Agar koi account pehle se mojood ho to ye command **safely fail** ho jati hai (409) — yani galti se doosra admin ban hi nahi sakta.

---

## 7. Setup aur Environment Variables

`server/.env` file (`.env.example` dekh kar copy karein):

| Variable | Zaroori? | Kaam |
| --- | --- | --- |
| `NODE_ENV` | Haan | `development` / `production` |
| `HOST`, `PORT` | Haan | Server bind address (default `0.0.0.0:4000`) |
| `MONGODB_URI` | Haan | MongoDB connection string |
| `CORS_ORIGINS` | Haan | Allowed frontend origins (comma separated) |
| `AUTH_ACCESS_TOKEN_SECRET` | Haan | Access JWT secret (`openssl rand -hex 32`) |
| `AUTH_REFRESH_TOKEN_SECRET` | Haan | Refresh JWT secret |
| `AUTH_ACCESS_TOKEN_TTL_SECONDS` | Nahi | Access token ki umar (default 900) |
| `AUTH_REFRESH_TOKEN_TTL_SECONDS` | Nahi | Refresh token ki umar (default 604800) |
| `AUTH_COOKIE_SECURE` | Nahi | Production me `true` |
| `AUTH_COOKIE_SAMESITE` | Nahi | Default `lax` |
| `BCRYPT_ROUNDS` | Nahi | Password hashing cost (default 12) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Nahi | Sirf `provision:admin` command ke liye |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Media ke liye | Image upload |

**Server commands:**

| Command | Kaam |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server chalana |
| `npm run provision:admin` | Ek admin account banana (one-time) |
| `npm run seed:cms` | Content seed karna (terminal se) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Poora test suite |

---

## 8. Purani Cheezon ke Sath Compatibility (Migration Notes)

Ye cheezein soch samajh kar backward-compatible rakhi gayi hain, taake aap ke mojooda setup / database me koi issue na aaye:

1. **Purane environment variable chalte rahenge**
   Agar aap ke `.env` me `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` / `SUPER_ADMIN_NAME` hain, to wo **abhi bhi kaam karenge** (naye `ADMIN_*` naam pehle check hote hain, phir purane fallback ke tor par).

2. **Purana admin account tootega nahi**
   Aap ke database me mojood admin ka role purana `SUPER_ADMIN` ho sakta hai. Login par server sirf zaroori fields update karta hai aur us purane value ko **khud ba khud `ADMIN` kar deta hai** — is liye login par koi validation error nahi aayega.

3. **Ek dafa dobara login karna parega**
   Pehle se bane hue login sessions (purane token jin me `SUPER_ADMIN` claim tha) invalid ho jayenge. Bas ek dafa `/admin/login` se dobara login kar lein — uske baad sab normal.

4. **Purane `ContactMessage` aur `FormSubmission` data mehfooz hai**
   Ye do systems alag alag hain (Contact form "topic" bhejta hai, public forms "formType") — dono ko waise hi rakha gaya hai, dono ka koi data delete nahi hua.

---

## 9. Safety aur Verification (Task Ke Baad Koi Error Nahi)

Task ke baad **poori verification** ki gayi hai:

**Server:**
```
npm run typecheck   →  ✓ clean (koi error nahi)
npm run lint        →  ✓ clean
npm run test        →  ✓ 160 tests pass, 0 fail, 0 skipped
```

**Client:**
```
npm run typecheck   →  ✓ clean
npm run lint        →  ✓ clean
npm run build       →  ✓ successful (35 routes prerender)
```

**Build ka natija (routes):** Homepage, About, Contact, Donate, Media, Projects, Forms, tamam 15 program pages, aur admin ke 6 pages (`dashboard`, `site-settings`, `programs`, `projects`, `media`, `submissions`) — sab successfully build hue. `/admin/admins` route **mojood nahi** (kyunki hata diya gaya).

**Ye bhi verify kiya gaya:**
- Seed content khud apne schema se validate hota hai — koi typo database me nahi ja sakta.
- Seed ke tamam slugs unique hain aur har project ka parent programme mojood hai.
- Client build me koi missing page ya broken import nahi hai.

---

## 10. Delete Ki Gayi Files

Aap ki hidayat ke mutabiq, project ke ghair-zaroori `.md` files delete kar di gayi hain:

| File | Status |
| --- | --- |
| `ADMIN-DASHBOARD-REPORT.md` | **Delete** |
| `SM-WELFARE-UPDATED-REPORT.md` | **Delete** |
| `USER-GUIDE.md` | **Delete** (is nayi report ne iski jagah le li) |

**Baqi rehne wali (zaroori) files:**
- `README.md` — project ka main documentation
- `client/AGENTS.md`, `client/CLAUDE.md` — agent/tool configuration
- `.agents/skills/shadcn/*.md` — shadcn skill ke documentation files

---

## 11. Ab Website Kaise Chalegi (Practical Flow)

1. **Server start karein:** `cd server && npm run dev`
2. **Admin account banayein** (agar pehle se nahi hai): `npm run provision:admin`
3. **Client start karein:** `cd client && npm run dev`
4. Admin panel me login karein: `http://localhost:3000/admin/login`
5. Dashboard par **"Seed / re-sync content"** dabayein
6. **Bas!** Ab website par:
   - Homepage "Our Programmes" me **13 programmes** API se aa rahe honge
   - Projects page par **17 projects**
   - Contact page par **real contact info / social links**
   - Aur ye sab kuch admin panel se **editable**

Iske baad aap jab bhi content badalna chahein — programme add karna, project edit karna, social link update karna, ya nayi tasveer upload karna — sab **admin panel se** ho jayega. **Code chhune ki zaroorat nahi.**

---

## 12. Aage Kya Ho Sakta Hai (Future Scope)

Filhal CMS ye 4 content types control karta hai (aap ki permission ke mutabiq): **Programs, Projects, Site Settings, Media**.

Ye cheezein abhi bhi client code me hain aur aage chalke CMS me laayi ja sakti hain (agar aap chahein):
- Homepage ke **impact counters** (600+ Daily Food, 100+ Raashan, 430+ Education, 7,000+ Medical)
- Homepage ke 6 **service cards** aur **About intro / Mission paragraphs**
- **Blog / Media stories** (6 stories jo abhi `BLOG_POSTS` me hain)
- **Donation information** (amount presets, bank details, wallet number, Zakat note)
- **Site images** ka full mapping (hero banner, har program page ki tasveer)
- **Navigation menu** items

Inhein add karne ke liye naye content models + admin screens chahiye honge — ye ek alag, controlled phase me kiya jayega taake mojooda working system par koi asar na pare.

---

## 13. Ek Nazar Me Summary

| Pehle | Ab |
| --- | --- |
| 2 roles (SUPER_ADMIN, ADMIN) | 1 role (`ADMIN`) |
| Bohat se admin accounts | Sirf 1 account (one-time provisioning) |
| Admin management ka poora section | Hata diya gaya |
| Content seed sirf terminal se | Seed **admin dashboard se ek click** par |
| Role-based 403 errors | Khatam — ek admin, full control |
| Duplicate interfaces / extra code | Saaf kiya gaya |
| 3 ghair-zaroori `.md` files | Delete |

**Sab kuch safely kiya gaya hai — typecheck, lint, 160 tests, aur production build — sab clean hain.**

Koi bhi sawal ho ya koi tabdeeli chahiye ho to bata dein.
