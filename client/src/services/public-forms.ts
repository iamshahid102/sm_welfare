import { API_BASE_URL } from "@/lib/api/config";
import type {
  PublicFormSubmissionInput,
  PublicFormSubmissionResult,
} from "@/types/forms";

/**
 * Public forms service — consumes POST /api/v1/forms/submit.
 *
 * Unauthenticated. The backend validates every field and rate limits the
 * endpoint (10 submissions / 15 minutes / IP), so a 429 is an expected,
 * user-facing outcome that we surface as a readable message.
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
  return `Failed to submit the form (${response.status}).`;
}

export async function submitPublicForm(
  input: PublicFormSubmissionInput,
): Promise<PublicFormSubmissionResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/forms/submit`, {
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
    data: PublicFormSubmissionResult;
  };
  return payload.data;
}
