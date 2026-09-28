import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaBand } from "@/components/shared/cta-band";

/**
 * Our Mission — mirrors the live /our-mission/ page.
 *
 * The live page is exactly two sections, both kickered "We Provide":
 * "Our Mission" (three paragraphs) and "Our Vision" (two paragraphs) —
 * copied verbatim below so the rebuild says what the WordPress site says.
 *
 * IMAGES: `image-1.png` and `image2.jpg` are the client-provided files,
 * byte-moved to public/images. Both match the media the client uploaded to
 * the ORIGINAL site's own "Our Mission" page media library (WP media 5372
 * `IMG_2565 (1)`, 1417×1473, and 5370 `download (6)`, 736×699 — both attached
 * to page 3263 `our-mission`), which the live page does not render yet.
 * Assignment: the photo (image-1.png) illustrates Mission, the graphic
 * (image2.jpg) illustrates Vision — one per section as requested.
 */

/** Live "Our Mission" copy — three paragraphs in page order. */
const MISSION_PARAGRAPHS: readonly string[] = [
  "We aim to bring hope and smiles to lives filled with sadness and struggle by becoming a ray of light in areas like education, healthcare, employment, and social welfare. We want to help those who fight each day just to survive so that they can live with dignity, confidence, and independence.",
  "We stand with families who face growing challenges with each passing day. Our goal is to brighten their tomorrow, give them practical opportunities, and help them move toward a better and successful future.",
  "Your generosity is the foundation of our mission's success. Just one act of kindness from you can light up a new path in someone's dark and hopeless life. Because when you give from the heart, it doesn't just change a hand, it changes a life.",
];

/** Live "Our Vision" copy — two paragraphs in page order. */
const VISION_PARAGRAPHS: readonly string[] = [
  "We believe in serving humanity beyond the boundaries of caste, sect, or religion. Our vision is of a world where no one is deprived of necessities like healthcare, education, or a dignified life due to poverty or personal hardship.",
  "We are inspired and guided by the teachings of our Prophet Muhammad (PBUH), which emphasize love, equality, and compassionate service to humanity. This mission drives us to bring hope and support where it's needed most, creating impact through charity, social welfare, and community support programs.",
];

/** Mission section image (client-provided, 1417×1473 PNG). */
const MISSION_IMAGE = {
  src: "/images/image-1.png",
  alt: "SM Welfare Trust bringing hope to families through education, healthcare, employment and social welfare",
  width: 1417,
  height: 1473,
};

/** Vision section image (client-provided, 736×699 JPEG). */
const VISION_IMAGE = {
  src: "/images/image2.jpg",
  alt: "Serving humanity beyond the boundaries of caste, sect or religion",
  width: 736,
  height: 699,
};

export const metadata: Metadata = {
  title: "Our Mission",
  description:
    "We aim to bring hope and smiles to lives filled with sadness and struggle through education, healthcare, employment and social welfare — and we believe in serving humanity beyond the boundaries of caste, sect, or religion.",
  openGraph: {
    title: "Our Mission | SM Welfare Trust",
    description:
      "Our mission and vision — bringing hope to families in need and serving humanity beyond the boundaries of caste, sect, or religion.",
  },
  twitter: {
    title: "Our Mission | SM Welfare Trust",
    description:
      "Our mission and vision — bringing hope to families in need and serving humanity beyond the boundaries of caste, sect, or religion.",
  },
};

export default function OurMissionPage() {
  return (
    <>
      <PageHero
        title="Our Mission"
        description="Bringing hope and smiles to lives filled with sadness and struggle — through education, healthcare, employment and social welfare."
      />

      {/* Live section 1 — kicker "We Provide" / "Our Mission" + photo */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading kicker="We Provide" title="Our Mission" />
            {MISSION_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="text-base leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div className="relative aspect-[1417/1473] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={MISSION_IMAGE.src}
              alt={MISSION_IMAGE.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live section 2 — kicker "We Provide" / "Our Vision", reversed layout */}
      <section className="border-t border-border bg-section">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative aspect-[736/699] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={VISION_IMAGE.src}
              alt={VISION_IMAGE.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-5">
            <SectionHeading kicker="We Provide" title="Our Vision" />
            {VISION_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="text-base leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
