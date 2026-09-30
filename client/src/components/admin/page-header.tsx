import type { ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * Consistent page header for every admin page.
 *
 * Using one component keeps the title size, spacing and action placement
 * identical across the panel - the "everything looks different" problem the
 * owner flagged.
 */
export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: ElementType;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:flex">
            <Icon className="size-5 text-primary" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
