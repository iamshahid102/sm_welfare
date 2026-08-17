import { cn } from "@/lib/utils";
import { Kicker } from "@/components/shared/kicker";

interface SectionHeadingProps {
  /** Small overline/kicker label. */
  kicker?: string;
  title: string;
  description?: string;
  /** Center the block (default is left-aligned). */
  center?: boolean;
  /** White-on-blue variant for use on gradient/hero sections. */
  light?: boolean;
  className?: string;
}

/** Consistent section header used across public pages (template style). */
export function SectionHeading({
  kicker,
  title,
  description,
  center,
  light,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        center && "mx-auto items-center text-center",
        className
      )}
    >
      {kicker ? (
        <Kicker light={light} className="mb-1">
          {kicker}
        </Kicker>
      ) : null}
      <h2
        className={cn(
          "font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl",
          light ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-base leading-relaxed",
            light ? "text-blue-100" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
