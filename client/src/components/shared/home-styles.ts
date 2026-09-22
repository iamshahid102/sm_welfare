/**
 * Shared button / CTA styling derived from the hero design.
 *
 * The hero uses pill-shaped buttons with generous padding and icons.
 * These class strings standardize that look across every CTA on the site
 * while keeping shadcn Button as the underlying component.
 *
 * IMPORTANT: the shadcn Button `size` variants are compact (`h-8 px-2.5`).
 * Every string below must therefore re-declare BOTH the height and the
 * padding — adding only padding (e.g. the old `p-6` overrides) crashed the
 * text against a 32px-tall button and made CTAs render cramped/cut.
 * `cn()` is tailwind-merge, so these later values win over the variant ones.
 */

/** Pill geometry shared by all CTAs — 44px tall, roomy horizontal padding. */
const BTN_PILL =
  "h-11 rounded-full px-7 text-sm font-semibold whitespace-nowrap";

/** Pill-shaped primary CTA — solid amber (hero, header Donate now). */
export const BTN_PRIMARY_AMBER = `${BTN_PILL} bg-accent text-accent-foreground shadow-sm hover:bg-accent/90`;

/** Pill-shaped primary CTA — solid blue (CTA band, mission More about us). */
export const BTN_PRIMARY_BLUE = `${BTN_PILL} bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`;

/** Pill-shaped secondary/outline CTA — default border on light background. */
export const BTN_OUTLINE_DEFAULT = `${BTN_PILL} border border-border bg-background text-foreground hover:bg-muted hover:text-foreground`;
