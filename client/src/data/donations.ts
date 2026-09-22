/**
 * Template-derived donation content (Phase 14).
 *
 * Amount presets and bank/wallet details from the Donate PDF mockup.
 * Presentation data only — donation execution, payment gateways and
 * backend donation APIs are out of scope for this phase.
 */

export interface DonationPreset {
  amount: string;
  label: string;
}

export const DONATION_PRESETS: readonly DonationPreset[] = [
  { amount: "PKR 1,500", label: "Feeds a family for a week" },
  { amount: "PKR 3,500", label: "One month of school for a child" },
  { amount: "PKR 7,500", label: "A full monthly ration pack" },
  { amount: "PKR 25,000", label: "Sponsors a vocational course" },
] as const;

/** Suggested example for the "own amount" input. */
export const CUSTOM_AMOUNT_PLACEHOLDER = "e.g. 10000";

export interface BankDetail {
  label: string;
  value: string;
}

/* Bank & wallet details copied verbatim from the live /donate/ page. */
export const BANK_DETAILS: readonly BankDetail[] = [
  { label: "Account title", value: "Sirat e mustaqeem welfare trust" },
  { label: "Bank", value: "Faysal Bank" },
  { label: "Account number", value: "355430100008288" },
  { label: "IBAN", value: "PK48FAYS355430100008288" },
  { label: "SWIFT code", value: "FAYSPKKA" },
  { label: "EasyPaisa account", value: "03152616482" },
] as const;

export const ZAKAT_NOTE =
  "Ration, education and medical funds are distributed to Zakat-eligible families. Tell our team if your donation is Zakat, Sadaqah or general so it is allocated correctly.";
