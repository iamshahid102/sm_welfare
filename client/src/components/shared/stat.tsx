import { cn } from "@/lib/utils";

interface StatProps {
  value: string;
  label: string;
  /** Light variant for dark/blue backgrounds. */
  light?: boolean;
  className?: string;
}

/** A single impact statistic (e.g. "1,200+", "daily meals served"). */
export function Stat({ value, label, light, className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span
        className={cn(
          "font-heading text-3xl font-bold tracking-tight sm:text-4xl",
          light ? "text-white" : "text-primary"
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-sm",
          light ? "text-blue-100" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
