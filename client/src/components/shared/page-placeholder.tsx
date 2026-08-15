import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";

interface PagePlaceholderProps {
  kicker?: string;
  title: string;
  description?: string;
  /** Which phase will build the real page (shown as a subtle note). */
  plannedFor?: string;
}

/**
 * Lightweight foundation placeholder rendered by Phase 13 stub routes.
 * Replaced with real page sections in the next frontend phase.
 */
export function PagePlaceholder({
  kicker,
  title,
  description,
  plannedFor,
}: PagePlaceholderProps) {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading kicker={kicker} title={title} description={description} center />
      {plannedFor ? (
        <p className="mt-8 text-center">
          <Badge variant="secondary">Coming in {plannedFor}</Badge>
        </p>
      ) : null}
    </Container>
  );
}
