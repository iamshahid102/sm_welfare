import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SectionHeadingProps {
  /** Small overline/kicker badge text. */
  kicker?: string;
  title: string;
  description?: string;
  /** Center the block (default is left-aligned). */
  center?: boolean;
  className?: string;
}

/** Consistent section header used across public pages. */
export function SectionHeading({
  kicker,
  title,
  description,
  center,
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
        <Badge variant="secondary" className="w-fit">
          {kicker}
        </Badge>
      ) : null}
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
