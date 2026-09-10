import { createServer } from 'node:http';
import { app } from './app.js';
import { connectToDatabase } from './config/database.js';
import { env } from './config/env.js';
import { APP_NAME } from './constants/index.js';

/**
 * Vercel serverless function handler.
 * Vercel automatically creates a Node.js serverless function from this export.
 * The Express `app` is used directly — no duplication of route logic.
 * @param req - Incoming request
 * @param res - Outgoing response
 */
export default function handler(req: unknown, res: unknown) {
  // The Express app handles routing, middleware, CORS, cookies, authentication
  // @ts-expect-error - Vercel runtime provides req/res at runtime
  app(req, res);
}

/**
 * Local development HTTP server bootstrap.
 * Kept separate from the Vercel handler so the app can be imported and tested
 * without actually listening on a port.
 */
export async function startServer(): Promise<void> {
  await connectToDatabase();
  console.log(`[${APP_NAME}] connected to MongoDB`);

  const server = createServer(app);

  server.listen(env.port, env.host, () => {
    console.log(
      `[${APP_NAME}] listening on http://${env.host}:${env.port} (${env.nodeEnv})`,
    );
  });
}

/**
 * Graceful shutdown lifecycle.
 * For Vercel serverless, the platform handles connection management.
 * For local development, closes the createServer instance.
 */
async function shutdown(_signal: string): Promise<void> {
  // No-op for Vercel; local dev would close server here
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));