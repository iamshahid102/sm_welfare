"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterChipsProps<T extends string> {
  /** All options, first is typically "All". */
  options: readonly T[];
  initial?: T;
  /**
   * Maps an option value to its display label. Lets callers filter by a stable
   * value (e.g. a program slug) while showing something human readable.
   * Defaults to rendering the value itself.
   */
  getLabel?: (value: T) => string;
  onSelect: (value: T) => void;
  className?: string;
}

/**
 * Pill-style filter chips per the Projects/Media templates. Client-side only
 * (UX); data filtering happens in the consuming page via onSelect.
 */
export function FilterChips<T extends string>({
  options,
  initial,
  getLabel,
  onSelect,
  className,
}: FilterChipsProps<T>) {
  const [active, setActive] = useState<T>(initial ?? options[0]);

  return (
    <div
      role="group"
      aria-label="Filter"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => {
        const selected = option === active;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              setActive(option);
              onSelect(option);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {getLabel ? getLabel(option) : option}
          </button>
        );
      })}
    </div>
  );
}
