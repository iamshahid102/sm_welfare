import { api } from "@/lib/api/client";
import type { Media } from "@/types/api";

export type { Media } from "@/types/api";

export interface UploadMediaResult {
  media: Media;
}

export async function uploadMedia(file: File): Promise<Media> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/media`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let message = `Upload failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: { message?: string } };
      if (payload.error?.message) {
        message = payload.error.message;
      }
    } catch {
      // Body was not JSON — keep the generic message.
    }    throw new Error(message);
    }

  const data = (await response.json()) as UploadMediaResult;
  return data.media;
}

// ─── Get media ──────────────────────────────────────────────────────────

export async function getMedia(id: string): Promise<Media> {
  const data = await api.get<{ media: Media }>(`/media/${id}`);
  return data.media;
}

// ─── Delete media ───────────────────────────────────────────────────────

export async function deleteMedia(id: string): Promise<void> {
  await api.delete<{ id: string }>(`/media/${id}`);
}

export interface GetMediaResponse {
  media: Media;
}

export interface DeleteMediaResponse {
  id: string;
}
