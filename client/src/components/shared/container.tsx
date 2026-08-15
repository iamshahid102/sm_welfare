import { cn } from "@/lib/utils";

interface ContainerProps extends React.ComponentProps<"div"> {
  /** Constrain to a narrower measure (e.g. article-style content). */
  narrow?: boolean;
}

/**
 * Consistent horizontal page container. Mobile-first with a fluid padding
 * that steps up at larger breakpoints.
 */
export function Container({ className, narrow, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className
      )}
      {...props}
    />
  );
}
