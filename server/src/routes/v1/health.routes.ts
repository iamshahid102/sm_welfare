import { Router } from 'express';
import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import { APP_NAME } from '../../constants/index.js';
import type { ApiSuccessResponse } from '../../types/index.js';

// Order matches Mongoose `readyState` values (0-3). Anything else (e.g. 99
// "uninitialized") falls back to 'disconnected'.
const DATABASE_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'] as const;

type DatabaseState = (typeof DATABASE_STATES)[number];

interface HealthData {
  service: string;
  status: 'ok';
  environment: string;
  database: {
    state: DatabaseState;
  };
  uptime: number;
  timestamp: string;
}

function databaseState(readyState: number): DatabaseState {
  return DATABASE_STATES[readyState] ?? 'disconnected';
}

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const payload: ApiSuccessResponse<HealthData> = {
    success: true,
    data: {
      service: APP_NAME,
      status: 'ok',
      environment: env.nodeEnv,
      database: {
        state: databaseState(mongoose.connection.readyState),
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  };
  res.status(200).json(payload);
});

export { healthRouter };
