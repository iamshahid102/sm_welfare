import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
// import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { apiRouter } from "./routes/index.js";

/**
 * Express application assembly.
 * Kept separate from server.ts so the app can be imported and tested
 * without actually listening on a port.
 */
export const app = express();

// Security headers (also removes the X-Powered-By header)
// app.use(helmet());

// Cross-origin access for the Next.js client
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);

// HttpOnly authentication cookies (read via req.cookies)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Versioned REST API routes
app.use(apiRouter);

// 404 and centralized error handling - always registered last
app.use(notFoundHandler);
app.use(errorHandler);
