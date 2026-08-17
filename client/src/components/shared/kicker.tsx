import { cn } from "@/lib/utils";

interface KickerProps {
  children: React.ReactNode;
  /** Pill badge style (template home hero) vs. plain overline. */
  pill?: boolean;
  /** For use on dark/blue backgrounds. */
  light?: boolean;
  className?: string;
}

/**
 * Small overline label used above section/page headings.
 * Amber accent per the template's badge treatment.
 */
export function Kicker({ children, pill, light, className }: KickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.18em]",
        pill &&
          "rounded-full px-3.5 py-1.5 normal-case tracking-normal",
        pill ? "bg-accent text-accent-foreground" : "text-accent-strong",
        light && !pill && "text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
