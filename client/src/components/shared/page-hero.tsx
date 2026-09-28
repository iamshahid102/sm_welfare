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
    <section className="bg-hero-gradient text-white">
      <Container className="flex flex-col items-center gap-5 py-16 text-center sm:py-20">
        <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
