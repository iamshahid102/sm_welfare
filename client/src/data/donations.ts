/**
 * Donation content for the Donate page.
 *
 * The bank and wallet details are copied verbatim from the live /donate/
 * page — Account Title, Account Number, IBAN, Swift Code and the Easy Paisa
 * Account No are exactly the values that page prints, and they are the only
 * facts the Donate page presents. The two provider logos that page renders
 * (Faysal Bank above the account details, EasyPaisa above the wallet number)
 * live in `data/site-images.ts` and are shown beside them here.
 *
 * The amount presets and their labels come from the Donate mockup (Phase 14),
 * not from the live page, and are presentation only: donation execution,
 * payment gateways and donation APIs are out of scope.
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
  /** Whether the value gets a copy-to-clipboard control on the Donate page. */
  copyable?: boolean;
}

/**
 * Bank transfer details — the live page's own four facts, plus the bank name
 * the live page conveys with its Faysal Bank logo.
 */
export const BANK_DETAILS: readonly BankDetail[] = [
  { label: "Account title", value: "Sirat e mustaqeem welfare trust" },
  { label: "Bank", value: "Faysal Bank" },
  {
    label: "Account number",
    value: "355430100008288",
    copyable: true,
  },
  { label: "IBAN", value: "PK48FAYS355430100008288", copyable: true },
  { label: "Swift code", value: "FAYSPKKA", copyable: true },
] as const;

/** Mobile wallet details — the live page's own Easy Paisa account number. */
export const WALLET_DETAILS: readonly BankDetail[] = [
  {
    label: "Easy Paisa account",
    value: "03152616482",
    copyable: true,
  },
] as const;

export const ZAKAT_NOTE =
  "Ration, education and medical funds are distributed to Zakat-eligible families. Tell our team if your donation is Zakat, Sadaqah or general so it is allocated correctly.";
