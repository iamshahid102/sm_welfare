/**
 * Vercel serverless entry point.
 *
 * Vercel turns every file in `api/` into a function; `vercel.json` rewrites all
 * inbound paths here, and the rewrite preserves the original URL, so the
 * Express app keeps receiving its real paths (`/api/v1/...`).
 *
 * WHY THIS IMPORTS FROM `dist/`
 * The server's internal imports use NodeNext-style `.js` specifiers that point
 * at `.ts` sources (`import { app } from './app.js'`). Only `tsc` remaps those
 * to real `.js` files, so the function runs the compiled output produced by
 * `npm run build` (Vercel runs it via `buildCommand`). `vercel.json` also
 * lists `dist/**` in the function's `includeFiles` so the compiled tree is
 * always bundled.
 *
 * MongoDB is connected before the app handles the request. `connectToDatabase`
 * caches its promise at module scope, so a warm serverless instance reuses the
 * existing pool instead of opening a new connection per request.
 */
import { app } from '../dist/app.js';
import { connectToDatabase } from '../dist/config/database.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
  } catch (error) {
    // Fail with a clean JSON envelope instead of an unhandled rejection, so
    // the client's error handling shows a readable message.
    console.error('[SM Welfare API] MongoDB connection failed:', error);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: {
          statusCode: 503,
          message: 'Service temporarily unavailable. Please try again.',
        },
      }),
    );
    return;
  }

  // Express is itself a (req, res) handler; hand the request straight over.
  return app(req, res);
}
