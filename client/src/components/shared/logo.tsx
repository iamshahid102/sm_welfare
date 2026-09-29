import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE } from "@/constants/site";

interface LogoProps {
  className?: string;
  /**
   * Preload the wordmark. Defaults to true because the header lockup sits
   * above the fold; the footer passes false so the below-the-fold copy is
   * not prioritised.
   */
  priority?: boolean;
}

/**
 * Brand lockup — the SM Welfare logo (icon + wordmark).
 *
 * Uses `public/smwelfare.png` (512×131), the navy wordmark the header
 * renders. It is a DARK mark, so on a dark surface put it on a light chip
 * (the footer does this) rather than straight on the gradient.
 */
export function Logo({ className, priority = true }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — home`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        className,
      )}
    >
      {/* Intrinsic size keeps the aspect ratio; height is scaled responsively. */}
      <Image
        src="/smwelfare.png"
        alt={`${SITE.name} logo`}
        width={512}
        height={131}
        priority={priority}
        className="h-8 w-auto sm:h-9 lg:h-10"
      />
    </Link>
  );
}
