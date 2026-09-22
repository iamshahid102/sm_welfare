import {
  CORE_FIELD_NAMES,
  type FormFieldDefinition,
  type PublicFormDefinition,
} from "@/constants/forms";

/**
 * Pure helpers for the public forms.
 *
 * Validation mirrors the backend rules (email/phone/required/lengths) so the
 * user gets instant feedback, while the server remains the source of truth.
 * Extra fields are folded into the single `message` body the API accepts.
 */

/** The API's maximum message length (server MAX_MESSAGE_LENGTH). */
const MAX_MESSAGE_LENGTH = 2_000;

// Mirrors the server's email/phone rules exactly.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s-]{7,32}$/;

export type FormValues = Record<string, string>;
export type FormErrors = Record<string, string>;

/** Fresh, empty value map for a definition. */
export function emptyFormValues(definition: PublicFormDefinition): FormValues {
  return Object.fromEntries(definition.fields.map((field) => [field.name, ""]));
}

/** Strips the "(optional)" hint before a label is reused in an error message. */
function errorLabel(field: FormFieldDefinition): string {
  return field.label.replace(/\s*\(optional\)\s*$/i, "");
}

/** Validates all values; returns a field -> message map (empty when valid). */
export function validateFormValues(
  definition: PublicFormDefinition,
  values: FormValues,
): FormErrors {
  const errors: FormErrors = {};

  for (const field of definition.fields) {
    const value = (values[field.name] ?? "").trim();
    const label = errorLabel(field);

    if (value.length === 0) {
      if (field.required) {
        errors[field.name] = `${label} is required.`;
      }
      continue;
    }

    if (field.type === "email" && !EMAIL_PATTERN.test(value)) {
      errors[field.name] = "Provide a valid email address.";
      continue;
    }

    if (field.type === "tel" && !PHONE_PATTERN.test(value)) {
      errors[field.name] = "Provide a valid phone number (e.g. +92 315 2616482).";
      continue;
    }

    if (field.type === "number") {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.name] = "Enter a valid number.";
        continue;
      }
      if (field.min !== undefined && numeric < field.min) {
        errors[field.name] = `Must be ${field.min} or more.`;
        continue;
      }
      if (field.max !== undefined && numeric > field.max) {
        errors[field.name] = `Must be ${field.max} or less.`;
        continue;
      }
    }

    if (field.maxLength !== undefined && value.length > field.maxLength) {
      errors[field.name] = `Must not exceed ${field.maxLength} characters.`;
      continue;
    }

    if (field.minLength !== undefined && value.length < field.minLength) {
      errors[field.name] = `Please write at least ${field.minLength} characters.`;
    }
  }

  return errors;
}

/**
 * Builds the API `message` body from the non-core fields.
 * The form title is always included, so the message is never empty.
 */
export function composeSubmissionMessage(
  definition: PublicFormDefinition,
  values: FormValues,
): string {
  const lines = [`Form: ${definition.title}`];

  for (const field of definition.fields) {
    if (CORE_FIELD_NAMES.has(field.name)) continue;
    const value = (values[field.name] ?? "").trim();
    if (value.length === 0) continue;
    lines.push(`${errorLabel(field)}: ${value}`);
  }

  return lines.join("\n").slice(0, MAX_MESSAGE_LENGTH);
}
