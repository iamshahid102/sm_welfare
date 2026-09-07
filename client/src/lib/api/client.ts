import { API_BASE_URL } from "@/lib/api/config";
import type { ApiErrorResponse } from "@/types/api";

/**
 * Error thrown for any non-2xx API response (or network failure).
 * The backend's authentication uses HttpOnly cookies, so requests always
 * send `credentials: "include"` — tokens are never stored client-side.
 */
export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body — serialized automatically. */
  body?: unknown;
  /** Skip the automatic 401 refresh-retry flow (used for the refresh request itself). */
  _skipRefresh?: boolean;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    if (payload.error?.message) {
      message = payload.error.message;
    }
  } catch {
    // Body was not JSON — keep the generic message.
  }
  return new ApiError(response.status, message);
}

/**
 * Shared refresh state — prevents concurrent refresh requests.
 * Only one refresh flow can be in flight at a time; others await
 * the same promise.
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Registered by the AuthProvider. Invoked when the backend declares the
 * session unusable (refresh failed, or a retried request still gets 401)
 * so the frontend can clear state and route the user to login.
 */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

/**
 * Attempts to refresh the session via POST /auth/refresh.
 * Returns true if the refresh succeeded, false otherwise.
 */
async function attemptRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Triggers a refresh if one isn't already in flight.
 * Returns the same promise for concurrent callers.
 */
function triggerRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = attemptRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** The login endpoint is the one 401 that means "bad credentials", not "expired session". */
function isLoginRequest(path: string): boolean {
  return path === "/auth/login";
}

/**
 * Typed fetch wrapper around the Express API.
 * - Always sends cookies (HttpOnly auth).
 * - Deserializes the `{ success, data }` envelope.
 * - Throws ApiError on failure with the backend's message.
 * - Automatically retries once on 401 after a single shared refresh attempt.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, _skipRefresh, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    throw new ApiError(0, "Unable to reach the server. Please try again.");
  }

  // If the request succeeded, unwrap and return.
  if (response.ok) {
    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  // On 401 (excluding login and already-refreshed requests): attempt a single
  // shared refresh, then retry the original request once.
  if (response.status === 401 && !_skipRefresh && !isLoginRequest(path)) {
    const refreshSucceeded = await triggerRefresh();

    if (refreshSucceeded) {
      // Retry the original request ONCE.
      return apiRequest<T>(path, { ...options, _skipRefresh: true });
    }

    // Refresh failed — the session is unusable.
    notifyUnauthorized();
  }

  // A retried request that still gets 401 (or the refresh request itself)
  // means the session is genuinely invalid.
  if (response.status === 401 && _skipRefresh && !isLoginRequest(path)) {
    notifyUnauthorized();
  }

  throw await parseError(response);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};