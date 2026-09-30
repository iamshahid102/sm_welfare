import mongoose from 'mongoose';
import { APP_NAME } from '../constants/index.js';
import { env } from './env.js';

const SERVER_SELECTION_TIMEOUT_MS = 10_000;

/**
 * Connection-pool ceiling per serverless instance.
 *
 * Mongoose defaults to 100 connections per pool. On a serverless platform many
 * instances run in parallel, so the default can exhaust the database's
 * connection limit under load. 10 per instance is plenty for this API and
 * keeps the total bounded.
 */
const MAX_POOL_SIZE = 10;

let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Connects to MongoDB through Mongoose and returns a promise for the shared
 * connection. The promise is cached so every caller reuses the same
 * connection instead of creating a new one.
 *
 * On failure the cache is cleared and the error rethrown, so a later call
 * (e.g. after a hot reload) can attempt to connect again. The caller is
 * responsible for handling the rejection.
 */
export function connectToDatabase(): Promise<typeof mongoose> {
  if (!env.mongodbUri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to server/.env (see .env.example).',
    );
  }

  if (connectionPromise === null) {
    connectionPromise = mongoose
      .connect(env.mongodbUri, {
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
        maxPoolSize: MAX_POOL_SIZE,
      })
      .catch((error: unknown) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

/** Closes the shared MongoDB connection. Safe to call when nothing is connected. */
export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}

// Surface connection errors that happen after the initial connect so they are
// visible in the server console instead of being silently swallowed.
mongoose.connection.on('error', (error) => {
  console.error(`[${APP_NAME}] MongoDB connection error:`, error);
});
