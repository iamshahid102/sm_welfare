import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE } from "@/constants/site";

interface LogoProps {
  className?: string;
}

/**
 * Brand lockup — the SM Welfare logo (icon + wordmark).
 *
 * Uses the white smwelfare.png wordmark which is clearly visible on the
 * dark navbar background.
 */
export function Logo({ className }: LogoProps) {
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
        height={134}
        priority
        className="h-7 w-auto sm:h-8"
      />
    </Link>
  );
}
