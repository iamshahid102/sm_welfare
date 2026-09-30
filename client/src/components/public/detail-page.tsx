import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaBand } from "@/components/shared/cta-band";
import { Reveal } from "@/components/shared/reveal";
import { buttonVariants } from "@/components/ui/button";
import { BTN_PRIMARY_BLUE } from "@/components/shared/home-styles";
import { CONTENT_ICONS } from "@/lib/content-icons";
import { cn } from "@/lib/utils";
import { HiArrowRight, HiHeart } from "react-icons/hi2";
import type {
  ContentCta,
  ContentFact,
  ContentHighlight,
  ContentImage,
  ContentSection,
} from "@/types/content";

/**
 * The single renderer every program and project detail page uses.
 *
 * It renders exactly the blocks the admin editor exposes: hero (title +
 * tagline), the narrative sections with their optional photos, the highlight
 * cards, the quick facts, the gallery and the closing call to action. Because
 * both content types share the same shape, one component serves them all.
 */

export interface DetailPageData {
  title: string;
  tagline: string | null;
  shortDescription: string;
  description: string;
  coverImage: ContentImage | null;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta: ContentCta | null;
}

function Figure({
  image,
  className,
  sizes = "(max-width: 1024px) 100vw, 45vw",
}: {
  image: ContentImage;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "group/fig relative overflow-hidden rounded-2xl border border-border bg-muted shadow-lg",
        className,
      )}
    >
      <Image
        src={image.url}
        alt={image.alt ?? ""}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover/fig:scale-[1.04]"
      />
    </div>
  );
}

function Section({
  section,
  fallbackImage,
  index,
}: {
  section: ContentSection;
  fallbackImage?: ContentImage | null;
  index: number;
}) {
  const image = section.image ?? (index === 0 ? fallbackImage ?? undefined : undefined);
  const reversed = section.imageSide === "left";

  if (!image) {
    return (
      <Reveal className="mx-auto flex max-w-3xl flex-col gap-3">
        {section.kicker ? (
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {section.kicker}
          </span>
        ) : null}
        {section.title ? (
          <h2 className="font-heading text-2xl font-bold tracking-tight text-balance">
            {section.title}
          </h2>
        ) : null}
        {section.body ? (
          <p className="text-base leading-relaxed text-muted-foreground">
            {section.body}
          </p>
        ) : null}
      </Reveal>
    );
  }

  return (
    <div
      className={cn(
        "grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14",
        reversed && "lg:grid-cols-[0.85fr_1.15fr]",
      )}
    >
      <Reveal className={cn("flex flex-col gap-4", reversed && "lg:order-2")}>
        {section.kicker ? (
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {section.kicker}
          </span>
        ) : null}
        {section.title ? (
          <h2 className="font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {section.title}
          </h2>
        ) : null}
        {section.body ? (
          <p className="text-base leading-relaxed text-muted-foreground">
            {section.body}
          </p>
        ) : null}
      </Reveal>
      {/* NOTE: the figure is deliberately NOT wrapped in <Reveal/> — it is
          `lg:sticky`, and a transformed ancestor would break that sticky
          behaviour. Its hover zoom gives it motion instead. */}
      <Figure
        image={image}
        className={cn("aspect-[4/3] lg:sticky lg:top-24", reversed && "lg:order-1")}
      />
    </div>
  );
}

export function DetailPage({ data }: { data: DetailPageData }) {
  const { sections, highlights, facts, gallery, cta, coverImage } = data;

  return (
    <>
      <PageHero
        title={data.title}
        description={data.tagline ?? data.shortDescription}
      />

      {/* Narrative sections */}
      {sections.length > 0 ? (
        <section className="bg-white">
          <Container className="flex flex-col gap-16 py-16 sm:py-20">
            {sections.map((section, index) => (
              <Section
                key={index}
                section={section}
                fallbackImage={coverImage}
                index={index}
              />
            ))}
          </Container>
        </section>
      ) : (
        <section className="bg-white">
          <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-5">
              <SectionHeading
                kicker="Overview"
                title={data.title}
                description={data.tagline ?? undefined}
              />
              <p className="text-base leading-relaxed text-muted-foreground">
                {data.description}
              </p>
            </div>
            {coverImage ? <Figure image={coverImage} className="aspect-[4/3]" /> : null}
          </Container>
        </section>
      )}

      {/* Highlight cards */}
      {highlights.length > 0 ? (
        <section className="border-t border-border bg-section">
          <Container className="flex flex-col gap-10 py-16 sm:py-20">
            <SectionHeading
              center
              kicker="Highlights"
              title={`What ${data.title} offers`}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((highlight, index) => {
                const Icon =
                  CONTENT_ICONS[
                    (highlight.icon as keyof typeof CONTENT_ICONS) ?? "sparkles"
                  ] ?? CONTENT_ICONS.sparkles;
                return (
                  <Reveal
                    as="article"
                    key={index}
                    delay={index * 80}
                    className="hover-lift group/card flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm hover:border-primary/25"
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors duration-300 group-hover/card:bg-primary group-hover/card:text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading text-lg font-bold tracking-tight">
                      {highlight.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {highlight.description}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Quick facts */}
      {facts.length > 0 ? (
        <section className="bg-white">
          <Container className="py-16 sm:py-20">
            <Reveal className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
              {facts.map((fact, index) => {
                const Icon =
                  CONTENT_ICONS[
                    (fact.icon as keyof typeof CONTENT_ICONS) ?? "map-pin"
                  ] ?? CONTENT_ICONS["map-pin"];
                return (
                  <div
                    key={index}
                    className="group/fact flex items-start gap-4 rounded-xl p-2 transition-colors duration-300 hover:bg-secondary/60"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover/fact:scale-105">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {fact.label}
                      </span>
                      <span className="text-sm font-semibold">{fact.value}</span>
                    </div>
                  </div>
                );
              })}
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="border-t border-border bg-section">
          <Container className="flex flex-col gap-8 py-16 sm:py-20">
            <SectionHeading center kicker="Gallery" title="Moments from the field" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <Reveal
                  key={index}
                  delay={index * 70}
                  scale={0.97}
                  className="rounded-2xl"
                >
                  <Figure
                    image={image}
                    className="aspect-[4/3]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Closing call to action */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join hands with us"
              title={cta?.title ?? `Support ${data.title}`}
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {cta?.body ?? data.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={cta?.buttonHref ?? "/donate"}
                className={cn(buttonVariants(), BTN_PRIMARY_BLUE, "group")}
              >
                <HiHeart className="mr-1.5 size-4" aria-hidden="true" />
                {cta?.buttonLabel ?? "Donate now"}
                <HiArrowRight
                  className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
