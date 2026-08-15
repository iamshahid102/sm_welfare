import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/constants/site";

interface LogoProps {
  className?: string;
}

/**
 * Text-based wordmark. A real logo image can be added later via the
 * Cloudinary media foundation without changing callers.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — home`}
      className={cn(
        "inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <HeartHandshake className="size-4" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-base font-semibold tracking-tight">
          {SITE.name}
        </span>
        <span className="text-[0.65rem] text-muted-foreground">
          Serving since {SITE.establishedYear}
        </span>
      </span>
    </Link>
  );
}
