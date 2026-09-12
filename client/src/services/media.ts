import { API_BASE_URL } from "@/lib/api/config";
import { api } from "@/lib/api/client";
import type { Media, MediaListResponse } from "@/types/api";

export type { Media } from "@/types/api";

export interface UploadMediaResult {
  media: Media;
}

/**
 * Shared refresh state — prevents concurrent refresh requests.
 * Mirrors the logic in api client but kept local because upload uses
 * raw fetch (FormData cannot set Content-Type: application/json).
 */
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function triggerRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = attemptRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Execute the upload fetch. Separated so it can be retried once on 401.
 */
async function executeUpload(
  file: File,
  meta?: { title?: string; description?: string },
): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file);
  if (meta?.title) formData.append("title", meta.title);
  if (meta?.description) formData.append("description", meta.description);

  return fetch(`${API_BASE_URL}/media`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

async function parseUploadError(response: Response): Promise<Error> {
  let message = `Upload failed with status ${response.status}`;
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
    };
    if (payload.error?.message) {
      message = payload.error.message;
    }
  } catch {
    // Body was not JSON — keep the generic message.
  }
  return new Error(message);
}

export async function uploadMedia(
  file: File,
  meta?: { title?: string; description?: string },
): Promise<Media> {
  let response = await executeUpload(file, meta);

  // On 401: attempt a single session refresh, then retry once.
  if (response.status === 401) {
    const refreshSucceeded = await triggerRefresh();
    if (refreshSucceeded) {
      response = await executeUpload(file, meta);
    }
  }

  if (!response.ok) {
    throw await parseUploadError(response);
  }

  const envelope = (await response.json()) as { data: UploadMediaResult };
  return envelope.data.media;
}

// ─── List media ─────────────────────────────────────────────────────────

export async function listMedia(
  query: { page?: number; limit?: number } = {},
): Promise<MediaListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());

  const qs = params.toString();
  const data = await api.get<MediaListResponse>(
    `/media${qs ? `?${qs}` : ""}`,
  );
  return data;
}

// ─── Get media ──────────────────────────────────────────────────────────

export async function getMedia(id: string): Promise<Media> {
  const data = await api.get<{ media: Media }>(`/media/${id}`);
  return data.media;
}

// ─── Update media ───────────────────────────────────────────────────────

export async function updateMedia(
  id: string,
  updates: { title?: string; description?: string },
): Promise<Media> {
  const data = await api.patch<{ media: Media }>(`/media/${id}`, updates);
  return data.media;
}

// ─── Delete media ───────────────────────────────────────────────────────

export async function deleteMedia(id: string): Promise<void> {
  await api.delete<{ id: string }>(`/media/${id}`);
}
