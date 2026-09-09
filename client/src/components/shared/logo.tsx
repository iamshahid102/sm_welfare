import Link from "next/link";
import { LuHeartHandshake } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { SITE } from "@/constants/site";

interface LogoProps {
  className?: string;
  /** White text variant for use on the blue overlay header/hero. */
  light?: boolean;
}

/**
 * Text-based wordmark. A real logo image can be added later via the
 * Cloudinary media foundation without changing callers.
 */
export function Logo({ className, light }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — home`}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-md",
          light ? "bg-white/15 text-white" : "bg-primary text-primary-foreground"
        )}
      >
        <LuHeartHandshake className="size-4.5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-lg font-bold tracking-tight",
            light ? "text-white" : "text-foreground"
          )}
        >
          {SITE.name}
        </span>
        <span
          className={cn(
            "mt-1 text-[0.65rem] font-medium uppercase tracking-[0.14em]",
            light ? "text-blue-200" : "text-muted-foreground"
          )}
        >
          {SITE.legalShortName}
        </span>
      </span>
    </Link>
  );
}
