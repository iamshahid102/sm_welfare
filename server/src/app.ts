import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { RequestHandler } from 'express';
import helmetModule from 'helmet';
import type { HelmetOptions } from 'helmet';
import { connectToDatabase } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/index.js';
import { ApiError } from './utils/ApiError.js';

/**
 * Express application assembly.
 * Kept separate from server.ts so the app can be imported and tested
 * without actually listening on a port.
 */

/**
 * helmet ships dual ESM/CJS type declarations (`index.d.mts` + `index.d.cts`)
 * and no `types` condition in its `exports` map. Which one TypeScript picks
 * therefore depends on the consumer's module resolution:
 *
 *   - NodeNext / ESM  -> index.d.mts, where the default import is the callable
 *                        middleware factory
 *   - CommonJS-style  -> index.d.cts, where the default import is typed as the
 *                        module namespace, so `helmet()` reports
 *                        "TS2349: This expression is not callable"
 *
 * Vercel's Express build resolves the CommonJS declarations, so the import is
 * normalised once here. The runtime value is the middleware factory in both
 * cases, which is why the assertion is safe.
 */
const helmet = helmetModule as unknown as (
  options?: Readonly<HelmetOptions>,
) => RequestHandler;

export const app = express();

// Trust a single reverse-proxy hop (e.g. Nginx, Vercel) so that req.ip
// returns the real client address instead of the proxy's — required for
// per-IP rate limiting to work correctly.
app.set('trust proxy', 1);

// Security headers (also removes the X-Powered-By header)
app.use(helmet());

// HttpOnly authentication cookies (read via req.cookies)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cross-origin access for the Next.js client
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);

/**
 * Database bootstrap.
 *
 * The app has to work no matter how it is started. `server.ts` connects before
 * it listens (local, long-running), but a serverless platform imports this module
 * directly, where nothing would open the connection and every query would hang
 * until the request times out.
 *
 * `connectToDatabase()` caches its promise at module scope, so this costs one
 * connection per instance — warm invocations reuse it and pay nothing — while a
 * failed connect clears the cache so the next request retries.
 */
app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    // Log the real cause; return a generic message to the client.
    console.error('[SM Welfare API] MongoDB connection failed:', error);
    next(new ApiError(503, 'Service temporarily unavailable. Please try again.'));
  }
});

// Versioned REST API routes
app.use(apiRouter);

// 404 and centralized error handling - always registered last
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Default export.
 *
 * Vercel's zero-configuration Express support finds the app by looking for a
 * default export in `app`, `index` or `server` at the project root or under
 * `src/`. `app.ts` is one of those recognised entry points, and the named
 * export above is kept so `server.ts` and the tests can keep importing it.
 */
export default app;
