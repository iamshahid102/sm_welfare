import { createServer } from 'node:http';
import { app } from './app.js';
import { connectToDatabase, disconnectFromDatabase } from './config/database.js';
import { env } from './config/env.js';
import { APP_NAME } from './constants/index.js';

const server = createServer(app);

/**
 * Local / long-running HTTP server bootstrap:
 *   1. connect to MongoDB (fails fast with a clear error -> no HTTP server)
 *   2. start the HTTP server
 *
 * This file is for `npm run dev` and `npm start` only. On Vercel the platform
 * imports `app.ts` directly (zero-configuration Express support) and manages
 * the HTTP layer itself, so this module is never used there — the app opens
 * its own database connection, which is why it works with either entry point.
 */
export async function startServer(): Promise<void> {
  await connectToDatabase();
  console.log(`[${APP_NAME}] connected to MongoDB`);

  server.listen(env.port, env.host, () => {
    console.log(
      `[${APP_NAME}] listening on http://${env.host}:${env.port} (${env.nodeEnv})`,
    );
  });
}

let shuttingDown = false;

/**
 * Graceful shutdown lifecycle:
 *   1. stop accepting connections (close HTTP server)
 *   2. close the MongoDB connection
 *   3. exit
 */
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`[${APP_NAME}] received ${signal}, shutting down...`);

  // Force-exit if open connections prevent a graceful shutdown.
  setTimeout(() => process.exit(1), 10_000).unref();

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    console.log(`[${APP_NAME}] HTTP server closed`);

    await disconnectFromDatabase();
    console.log(`[${APP_NAME}] MongoDB connection closed`);
    process.exit(0);
  } catch (error) {
    console.error(`[${APP_NAME}] error during shutdown:`, error);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

// Start listening immediately. Vercel never runs this module.
startServer().catch((error) => {
  console.error(`[${APP_NAME}] failed to start:`, error);
  process.exit(1);
});
