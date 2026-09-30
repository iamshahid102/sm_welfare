import { Container } from "@/components/shared/container";

interface PageHeroProps {
  title: string;
  description?: string;
}

/**
 * Subpage hero — blue gradient per the template, centered kicker + heading
 * + intro in white.
 */
export function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-hero-gradient text-white">
      {/* Dot texture matching the homepage band, softly drifting in. */}
      <div
        aria-hidden="true"
        className="hero-dots anim-fade-in pointer-events-none absolute inset-0 opacity-25"
      />
      <Container className="relative flex flex-col items-center gap-5 py-16 text-center sm:py-20">
        <h1 className="anim-fade-down max-w-3xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="anim-fade-up anim-delay-2 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
