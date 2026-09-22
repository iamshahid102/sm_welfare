/**
 * Public form domain constants.
 *
 * Shared by the FormSubmission model (schema enum) and the forms router
 * (request validation) so the accepted form types can never drift apart.
 * Mirrors the five application forms offered on the public /forms page.
 */
export const FORM_TYPES = [
  'hunarmand-beti-vocational',
  'it-courses-vocational',
  'employee',
  'free-education',
  'quran-academy',
] as const;

export type FormType = (typeof FORM_TYPES)[number];
