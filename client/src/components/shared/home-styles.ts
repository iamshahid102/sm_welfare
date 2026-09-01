/**
 * Shared Home-page button / CTA styling derived from the template PDF.
 *
 * The template uses pill-shaped (heavily rounded) buttons throughout.
 * These class strings override the shadcn defaults to match that look
 * while keeping shadcn Button as the underlying component.
 */

/** Pill-shaped primary CTA — solid amber (hero, header Donate now). */
export const BTN_PRIMARY_AMBER =
  "rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90";

/** Pill-shaped primary CTA — solid blue (CTA band, mission More about us). */
export const BTN_PRIMARY_BLUE =
  "rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90";

/** Pill-shaped secondary/outline CTA — white border on dark background (hero). */
export const BTN_OUTLINE_WHITE =
  "rounded-full border border-white/50 bg-transparent px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:text-white";

/** Pill-shaped secondary/outline CTA — default border on light background. */
export const BTN_OUTLINE_DEFAULT =
  "rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground hover:bg-muted hover:text-foreground";
