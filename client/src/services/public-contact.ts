import { API_BASE_URL } from "@/lib/api/config";
import type {
  PublicContactMessageInput,
  PublicContactMessageResult,
} from "@/types/forms";

/**
 * Public contact service — consumes POST /api/v1/contact.
 *
 * Unauthenticated. Messages are validated server-side and stored; the
 * endpoint is rate limited (10 submissions / 15 minutes / IP).
 */

/** Extracts the backend's safe error message from a non-2xx response. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
    };
    if (payload.error?.message) {
      return payload.error.message;
    }
  } catch {
    // Body was not JSON — fall through to the generic message.
  }
  return `Failed to send the message (${response.status}).`;
}

export async function sendContactMessage(
  input: PublicContactMessageInput,
): Promise<PublicContactMessageResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: PublicContactMessageResult;
  };
  return payload.data;
}
