# SM WELFARE — Vercel Helmet TypeScript Build Fix Report

**Date:** September 11, 2026  
**Status:** ✅ RESOLVED  
**Files Changed:** 2 (`server/package.json`, `server/package-lock.json`)

---

## 1. Exact Vercel Error

```
src/app.ts(17,9): error TS2349: This expression is not callable.
Type 'typeof import("/vercel/path0/server/node_modules/helmet/index")' has no call signatures.
```

Accompanied by:
```
npm warn deprecated @types/helmet@4.0.0:
This is a stub types definition. helmet provides its own type definitions,
so you do not need this installed.
```

---

## 2. Actual Root Cause

**`@types/helmet@4.0.0`** — a deprecated stub type package — was installed in `server/devDependencies`. This package has `"typings": null` in its `package.json`, meaning it provides **no actual type definitions**.

When TypeScript 6.0.3 resolves `import helmet from 'helmet'`, it finds `@types/helmet` in `node_modules/@types/` (TypeScript auto-includes `@types/*` packages). The stub creates an empty module declaration that **shadows** helmet's own built-in types (from `helmet/index.d.mts`). The result is that the `helmet` import has no callable signature, producing the `TS2349` error.

Helmet 8.3.0 ships its own TypeScript types via:
- `index.d.mts` (ESM types, with `export { helmet as default }`)
- `index.d.cts` (CJS types, same exports)
- Declared in `package.json` as `"types": "./index.d.cts"`

With `@types/helmet` removed, TypeScript resolves directly to helmet's own types, where `helmet` is typed as a callable function (`Helmet` type) — the `import helmet from 'helmet'` + `helmet()` pattern works correctly.

---

## 3. Helmet Version

| | Before | After |
|---|---|---|
| **helmet** | 8.3.0 | 8.3.0 (unchanged) |
| **@types/helmet** | 4.0.0 (deprecated stub) | **REMOVED** |

---

## 4. Final Helmet Import (unchanged)

```typescript
import helmet from 'helmet';
// ...
app.use(helmet());
```

No code change needed. The import `import helmet from 'helmet'` is the **correct official syntax** for helmet 8.x. The issue was purely a type resolution conflict caused by `@types/helmet`.

---

## 5. TypeScript Configuration Involved

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "verbatimModuleSyntax": true,
  "esModuleInterop": true,
  "strict": true
}
```

Helmet's `index.d.mts` uses `export { helmet as default }`, which is fully compatible with `verbatimModuleSyntax` and `module: "NodeNext"` in an ESM project (`"type": "module"` in `package.json`).

---

## 6. package.json Changes

```diff
 "devDependencies": {
     "@eslint/js": "^10.0.1",
     "@types/cookie-parser": "^1.4.10",
     "@types/cors": "^2.8.19",
     "@types/express": "^5.0.6",
-    "@types/helmet": "^4.0.0",
     "@types/multer": "^2.2.0",
```

**1 line removed.** No other changes.

---

## 7. package-lock.json Changes

12 lines removed — the `@types/helmet` lock entry and its dependency reference.

---

## 8. Clean Install Result

```bash
cd server && rm -rf node_modules && npm ci
# added 219 packages, and audited 220 packages
# found 0 vulnerabilities
```

✅ `npm ci` succeeds from a completely clean installation.

---

## 9. Production Build Result

```bash
cd server && npm run build
# > tsc -p tsconfig.build.json
# (exit code 0, zero errors)
```

✅ `TS2349: has no call signatures` is completely gone. TypeScript compilation succeeds with 0 errors.

---

## 10. Server Validation

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors |
| `npm run build` | ✅ PASS |
| `npm test` | ✅ All runnable tests pass (db tests need MongoDB; not run in Vercel) |
| `npm audit` | ✅ 0 vulnerabilities |

---

## 11. Client Validation

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (10 pre-existing warnings — React hooks / `<img>` element) |
| `npm run build` | ✅ PASS (Next.js 16.3.4, Turbopack, 18 pages generated) |
| `npm audit` | ✅ 0 vulnerabilities |

---

## 12. npm Audit Result

- **Server:** 0 vulnerabilities
- **Client:** 0 vulnerabilities

---

## 13. Vercel Configuration Verification

- **No `vercel.json` exists** anywhere in the repository
- **No `functions.*.node` configuration** exists
- Vercel uses zero-config detection (Node.js server with `"main": "dist/server.js"`)

---

## 14. Git Safety

```bash
git diff --stat
# server/package-lock.json | 12 ------------
# server/package.json      |  1 -
# 2 files changed, 13 deletions(-)
```

- ✅ No `git push`
- ✅ No `git commit`
- ✅ No `git pull`, `git reset`, `git checkout`, `git clean`
- ✅ Only `server/package.json` and `server/package-lock.json` modified

---

## 15. Template Protection

```bash
git diff template/
# (no changes)
```

- ✅ No template file changed
- ✅ No template file deleted
- ✅ No template file renamed
- Template directory contains 6 PDF files — all untouched

---

## 16. Remaining Warnings

**None related to this fix.** The only warnings are:

- **Client ESLint:** 10 pre-existing warnings (React hooks exhaustive-deps, `<img>` element usage) — these exist independently of the Helmet fix.
- **Server npm test:** Some `*.db.test.ts` files require a running MongoDB instance. These are integration tests that would run in a CI environment with MongoDB, not relevant to the Vercel build.

---

## 17. Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Exact Helmet TS2349 error is fixed | ✅ |
| `@types/helmet` is removed | ✅ |
| Helmet's official/current types are used | ✅ |
| No `any` workaround introduced | ✅ |
| No `ts-ignore` workaround introduced | ✅ |
| Helmet security middleware remains enabled | ✅ |
| `npm ci` succeeds from clean server installation | ✅ |
| `npm run build` succeeds after clean installation | ✅ |
| Server typecheck passes | ✅ |
| Server lint passes | ✅ |
| Server tests pass (where runnable) | ✅ |
| Server npm audit passes | ✅ |
| Client typecheck passes | ✅ |
| Client lint passes | ✅ |
| Client build passes | ✅ |
| Client npm audit passes | ✅ |
| No invalid Vercel `functions.*.node` config | ✅ |
| No business logic changed | ✅ |
| Authentication/RBAC intact | ✅ |
| MongoDB intact | ✅ |
| Cloudinary intact | ✅ |
| `template/` untouched | ✅ |
| No GitHub push | ✅ |
| No Git commit | ✅ |

**VERDICT: ALL CRITERIA PASS** ✅
