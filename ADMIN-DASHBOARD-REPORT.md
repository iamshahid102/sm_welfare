# SM Welfare — Admin Dashboard & API Integration Report (Roman Urdu)

**Tareekh:** 22 September 2026
**Kaam:** Saari APIs ko admin dashboard se sahi se integrate karna, gaps fix karna, aur har section ka kaam + workflows document karna.

---

## 1. Is round mein kya KIA GAYA (integration fixes)

### Fix 1 — Dashboard ka ADMIN role pe crash (bada bug)

**Problem:** Dashboard teeno cards ke liye `Promise.all` mein `GET /admins` bhi bulata tha. Lekin server pe `/admins` endpoints **sirf SUPER_ADMIN** ke hain — jab ek normal **ADMIN** dashboard kholta, server **403** deta, `Promise.all` reject hota, aur **poora dashboard error dikhata** (teeno cards gayab).

**Fix:** Teesra card ab **role-aware** ho gaya:
- **SUPER_ADMIN** → "Administrators" card (aur ab `status=ACTIVE` filter ke saath, taaki "Active admin accounts" label ka number sach mein active accounts ko dikhaye)
- **ADMIN** → "Media" card (media list dono roles ko allowed hai — koi403 nahi)

### Fix 2 — Forms/Contact submissions ka dashboard se bilkul connection nahi tha (bada gap)

**Problem:** Public website ki 2 write APIs (`POST /forms/submit`, `POST /contact`) MongoDB mein data save kar rahi thin, lekin:
- Server pe **LIST endpoint hi nahi tha** (sirf `GET …/:id` tha — aur admin ko ID pata hi nahi hoti, matlab data padha hi nahi ja sakta tha)
- Dashboard mein koi page hi nahi tha

**Fix (poora stack):**
1. **Server — 2 naye endpoints:**
   - `GET /api/v1/forms/submissions` — ADMIN+SUPER_ADMIN, newest-first, paginated, `formType` filter ke saath
   - `GET /api/v1/contact` — ADMIN+SUPER_ADMIN, newest-first, paginated
   - Dono mein query validation (page ≤ 10000, limit1–100) baaki list endpoints jaisi hi
2. **Client service:** `services/submissions.ts` — `listFormSubmissions()` + `listContactMessages()`
3. **Types:** `FormSubmission`, `ContactMessage` + dono ke `ListResponse` (`types/api.ts`)
4. **Naya page:** `/admin/submissions` — do tabs wala inbox (niche section4 mein detail)
5. **Nav:** "Submissions" menu item (dono roles ko visible) + Dashboard ke Quick Actions mein "View submissions" link

### Fix 3 — Documentation stale thi
- `README.md` — API table mein2 naye list endpoints add kiye + inbox explanation
- `USER-GUIDE.md` — Dashboard ka third card ab role-aware (docs update), Submissions page ki nayi section, public write/read endpoints ka note update

---

## 2. Admin Dashboard ke SECTIONS aur har section ka kaam

**Entry flow:** Site pe `/admin/*` pe aate hi `proxy.ts` (middleware) cookie check karta hai — `smw_access_token` ya `smw_refresh_token` cookie na ho to `/admin/login?from=…` pe redirect. Phir `AuthProvider` `GET /auth/me` se session hydrate karta hai. Asal security (JWT verify + role check) server pe hoti hai.

### 2.1 Login (`/admin/login`)
| Kya hota hai | API |
|---|---|
| Email/password submit → session cookie set | `POST /api/v1/auth/login` |
| Page load pe session check | `GET /api/v1/auth/me` |
| Errors user-friendly (401→"Invalid email or password",429→"Too many attempts") | — |

Tokens **HttpOnly cookies** mein hain — JavaScript kabhi token nahi padhta. Access token15 min ka hai; expire hone pe API client khud `POST /auth/refresh` se naya token bana ke request retry karta hai (user ko pata bhi nahi chalta). Logout → `POST /auth/logout`.

### 2.2 Dashboard (`/admin/dashboard`)
| Card / Action | API | Note |
|---|---|---|
| Total programs | `GET /api/v1/programs?page=1&limit=1` | sirf `total` chahiye |
| Total projects | `GET /api/v1/projects?page=1&limit=1` | sirf `total` |
| Administrators (SUPER_ADMIN) **ya** Media (ADMIN) | `GET /admins?status=ACTIVE` **ya** `GET /media` | role-aware — Fix1 |
| Quick actions | programs / projects / media / **submissions** / site-settings / admins ke links | — |

### 2.3 Programs (`/admin/programs`)
| Kaam | API | Role |
|---|---|---|
| List (pagination + search + status filter) | `GET /api/v1/programs?page&limit&search&status` | ADMIN + SUPER_ADMIN |
| Create (DRAFT banta hai) | `POST /api/v1/programs` | **SUPER_ADMIN** |
| Edit | `PATCH /api/v1/programs/:id` | **SUPER_ADMIN** |
| Status change (DRAFT/PUBLISHED/ARCHIVED) | `PATCH /api/v1/programs/:id/status` | **SUPER_ADMIN** |

> Delete route **jaan boojh kar nahi hai** — kuch permanently delete nahi hota, sirf ARCHIVED hota hai (data safe rehta hai).

### 2.4 Projects (`/admin/projects`)
| Kaam | API | Role |
|---|---|---|
| List (+ program filter) | `GET /api/v1/projects?page&limit&search&status&programId` | ADMIN + SUPER_ADMIN |
| Program dropdown (parent choose karne ke liye) | `GET /api/v1/programs?limit=100` | ADMIN + SUPER_ADMIN |
| Create (DRAFT) | `POST /api/v1/projects` | **SUPER_ADMIN** |
| Edit (parent program bhi badal sakte) | `PATCH /api/v1/projects/:id` | **SUPER_ADMIN** |
| Status change | `PATCH /api/v1/projects/:id/status` | **SUPER_ADMIN** |

### 2.5 Media (`/admin/media`)
| Kaam | API | Role |
|---|---|---|
| Upload image (≤5MB, JPG/PNG/WebP, magic-byte check) | `POST /api/v1/media` (multipart FormData, field name = `file`) | ADMIN + SUPER_ADMIN |
| Grid list (paginated) | `GET /api/v1/media?page&limit` | ADMIN + SUPER_ADMIN |
| Title/description edit | `PATCH /api/v1/media/:id` | ADMIN + SUPER_ADMIN |
| Delete (Cloudinary + DB dono se) | `DELETE /api/v1/media/:id` | ADMIN + SUPER_ADMIN |

### 2.6 Submissions — naya inbox (`/admin/submissions`)
| Tab | API | Kya dikhta hai |
|---|---|---|
| Form submissions | `GET /api/v1/forms/submissions?page&limit&formType` | Date/time, form ka badge, name, email+phone, message — form-type filter + pagination |
| Contact messages | `GET /api/v1/contact?page&limit` | Date/time, name, email, topic, message — pagination |

Dono tabs **newest-first**, 10 per page, **read-only by design** (personal data hai — sirf review). Dono roles kholein ge.

### 2.7 Site Settings (`/admin/site-settings`) — SUPER_ADMIN only
| Kaam | API |
|---|---|
| Load (agar initialized hai) | `GET /api/v1/site-settings` |
| Pehli baar banana (404 aane pe "Initialize settings" form) | `POST /api/v1/site-settings` |
| Save changes | `PATCH /api/v1/site-settings` |

Org name, tagline, description, contact, social links, footer — **yahi se public site ka header/footer/contact block update hota hai** (public API: `GET /api/v1/public/site-settings`).

### 2.8 Admins (`/admin/admins`) — SUPER_ADMIN only
| Kaam | API |
|---|---|
| List (search + status) | `GET /api/v1/admins?page&limit&search&status` |
| Create (role hamesha ADMIN, ACTIVE) | `POST /api/v1/admins` |
| Edit name/email | `PATCH /api/v1/admins/:id` |
| Activate/Deactivate | `PATCH /api/v1/admins/:id/status` |

Koi public signup nahi — pehla SUPER_ADMIN CLI se banta hai (`npm run provision:super-admin`).

---

## 3. PROJECTS kaise handle hote hain (admin se public site tak — pura flow)

```
Step1: Admin /admin/projects khole → page GET /api/v1/projects?… bulata hai
       (service: services/projects.ts → listProjects)
Step2: "Create project" → SUPER_ADMIN form bharta hai:
       parent program (dropdown = GET /programs), title, slug (auto), short
       description, description, display order
Step3: POST /api/v1/projects → server validate karta hai (Zod-jaisa inline
       validation) → MongoDB mein DRAFT status ke saath save
Step4: Admin edit/status change karta hai → PATCH /:id ya PATCH /:id/status
       → PUBLISHED karte hi…
Step5: Public site: homepage "Our Projects" grid aur /projects page
       GET /api/v1/public/projects bulata hai → SIRF PUBLISHED projects
       aate hain (parent program bhi published hona chahiye)
Step6: Agar API fail/reach na ho → client apna curated fallback data
       (client/src/data/projects.ts) dikhata hai — page kabhi khaali nahi
```

**Visibility rules:** DRAFT/ARCHIVED public ko kabhi nahi dikhte. Slug unique (program + slug pair). Delete = ARCHIVED (kabhi permanent delete nahi).

---

## 4. MEDIA kaise handle hota hai (upload se website tak — pura flow)

```
Step1: Admin /admin/media → "Image file" choose karta hai (client pe hi
       title/description validate hote hain)
Step2: uploadMedia() → POST /api/v1/media (FormData, field "file",
       HttpOnly cookie ke saath;401 aane pe ek baar khud refresh + retry)
Step3: Server: requireAuth + requireRole(ADMIN/SUPER_ADMIN) → multer
       memory-magic bytes check (sirf JPG/PNG/WebP, ≤5MB) → Cloudinary pe
       upload → URL/width/height/bytes ke saath MongoDB mein save
       (Cloudinary credentials server ke andar, kabhi client ko nahi)
Step4: Grid mein next/image thumbnails (Cloudinary URLs next.config mein
       allowed hain) → edit (PATCH) / delete (DELETE — Cloudinary + DB dono)
Step5: Public site: "Media Updates" section GET /api/v1/public/media se
       cards dikhata hai → nayi image upload karte hi public site pe aa jati
       hai (homepage row aur /media page dono)
```

---

## 5. Authentication / Security layers (integration ka backbone)

| Layer | Kya karta hai |
|---|---|
| `proxy.ts` (Next middleware) | `/admin/*` pe cookie presence check → warna login pe redirect (sirf gate hai, JWT verify nahi karta) |
| HttpOnly cookies | `smw_access_token` (15 min) + `smw_refresh_token` (7 din) — JS se readable nahi |
| API client (`lib/api/client.ts`) | Har request `credentials: include`, `{success,data}` unwrap,401 pe ek baar refresh + retry, session dead hone pe AuthProvider ko notify |
| Server `requireAuth` | JWT verify (jose) — asal security authority |
| Server `requireRole('SUPER_ADMIN')` | Mutations + admins/site-settings — ADMIN ko403 |
| Rate limiting | login10/15min, refresh30/15min, forms/contact10/15min per IP |
| CORS | Sirf allowlisted origins (`CORS_ORIGINS`), credentials ke saath |

**Frontend role checks sirf UX hain** (menu hide, buttons hide) — server har endpoint pe dobara check karta hai.

---

## 6. Ab total API ↔ Dashboard wiring (summary)

| Admin section | Client service | Server endpoints | Roles |
|---|---|---|---|
| Login/Session | `services/auth.ts` + AuthProvider | `auth`: login, refresh, logout, me (4) | public + auth |
| Dashboard | programs + projects + admins/media | `GET /programs`, `GET /projects`, `GET /admins`, `GET /media` | ADMIN + SUPER_ADMIN |
| Programs | `services/programs.ts` | `GET/POST /programs`, `PATCH /:id`, `PATCH /:id/status`, `GET /:id` (5) | read: both, write: SUPER |
| Projects | `services/projects.ts` | `GET/POST /projects`, `PATCH /:id`, `PATCH /:id/status`, `GET /:id` (5) | read: both, write: SUPER |
| Media | `services/media.ts` | `GET/POST /media`, `GET/PATCH/DELETE /:id` (5) | both |
| **Submissions (naya)** | **`services/submissions.ts`** | **`GET /forms/submissions`**, **`GET /contact`** (+ purane by-id:2) | both |
| Site Settings | `services/site-settings.ts` | `GET / POST / PATCH /site-settings` (3) | read: both, write: SUPER |
| Admins | `services/admins.ts` | `GET/POST /admins`, `GET/PATCH /:id`, `PATCH /:id/status` (5) | SUPER only |
| Public website (read) | `services/public-*.ts` | `public/programs`, `public/projects`, `public/site-settings`, `public/media` (4) + forms/contact POST (2) | none |

**Kul38 endpoints** (pehle36 the —2 naye list endpoints add hue).

---

## 7. Verification — koi error/issue nahi raha

| Check | Result |
|---|---|
| Server `typecheck` / `lint` / `build` | ✅ 0 errors |
| Server `npm test` | ✅ **182 pass, 0 fail** (pehle175 the — naye7 validator tests bhi green) |
| Client `typecheck` / `lint` / `build` | ✅0 errors, **19/19 pages** (naya `/admin/submissions` route bhi) |
| **Runtime smoke test** (asli server chala ke) | ✅ health200 · `GET /forms/submissions` → **401** (guarded) · `GET /contact` → **401** (guarded) · invalid submit → **400** (bina DB write) |
| Dashboard ADMIN-role bug | ✅ fix — ADMIN pe ab Media card (403 nahi), SUPER_ADMIN pe ACTIVE admins count |
| Docs | ✅ README API table + USER-GUIDE (Dashboard cards, Submissions section) update |

**Nayi files:** `server/src/routes/api/form.routes.ts` (list endpoint), `contact.routes.ts` (list endpoint) + dono ke tests · `client/src/services/submissions.ts` · `client/src/app/(admin)/admin/(protected)/submissions/page.tsx` · types (`FormSubmission`, `ContactMessage`)

**Modified:** dashboard (role-aware metric), layout (nav item), `types/api.ts`, `README.md`, `USER-GUIDE.md`
