import { Container } from "@/components/shared/container";

interface QuoteProps {
  text: string;
  attribution: string;
}

/** Full-width quote with amber accent per the Home template. */
export function Quote({ text, attribution }: QuoteProps) {
  return (
    <section className="border-y border-border bg-white">
      <Container className="flex flex-col items-center gap-4 py-14 text-center sm:py-16">
        <span
          className="h-1 w-12 rounded-full bg-accent"
          aria-hidden="true"
        />
        <blockquote className="max-w-2xl font-heading text-2xl font-bold leading-snug tracking-tight text-balance text-foreground sm:text-3xl">
          “{text}”
        </blockquote>
        <cite className="text-sm font-semibold uppercase tracking-wider text-primary not-italic">
          {attribution}
        </cite>
      </Container>
    </section>
  );
}
