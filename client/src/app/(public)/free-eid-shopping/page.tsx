import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBanknotes,
  HiGift,
  HiHeart,
  HiShoppingBag,
  HiSparkles,
  HiUserGroup,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaBand } from "@/components/shared/cta-band";
import {
  BTN_OUTLINE_DEFAULT,
  BTN_PRIMARY_BLUE,
} from "@/components/shared/home-styles";
import { FREE_EID_SHOPPING } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Free Eid Shopping — mirrors the live /free-eid-shopping/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: Eid as a festival of
 * happiness, love and togetherness rather than only a religious celebration,
 * the new clothes, shoes, jewelry, perfumes and gifts desired in every heart,
 * the faces deprived of those joys, the widows, orphaned children and
 * struggling families for whom Eid feels more like a burden than a
 * celebration, the Trust's "Free Eid Shopping" initiative that invites
 * widows, orphans and deserving individuals to do their complete Eid shopping
 * for just Rs. 10 while preserving their dignity and self-respect, sharing
 * happiness with respect and compassion rather than merely distributing items,
 * the specially arranged shopping space where families freely choose Eid
 * clothes, shoes, sandals, bangles, jewelry, mehndi (henna) and other
 * essentials just like regular shoppers, how everything is organised so no one
 * feels like a receiver but rather a valued guest with real Eid cheer and a
 * heart full of self-worth, and the closing appeal to donors. The tagline
 * "Bringing Eid Joy to Every Home!" is the live page's own subtitle.
 *
 * The layout follows the same section flow as the other project pages (Free
 * Schooling System, Hunarmand Beti, Ambulance Services, Heat Stroke Camp,
 * Sirat ul Quran Academy, Monthly Raashan Support Program, Rozgar Project,
 * Marriage Support Program): PageHero → challenge grid with a sticky image →
 * bg-section initiative band (heading, copy, shopping cards, facts panel) →
 * white "valued guest" section → closing card with the live page's own last
 * line as its headline → CtaBand.
 *
 * The kickers, headings, the shopping cards and the facts panel are
 * presentation only — every fact in them (Rs. 10, widows, orphans, Eid
 * clothes, shoes, sandals, bangles, jewelry, mehndi, the arranged shopping
 * space and the dignity it preserves) comes from the same live copy.
 */

/** Live paragraph 1 — what Eid means and who is deprived of its joys. */
const CHALLENGE_PARAGRAPH =
  "Eid is not just a religious celebration, it is a festival of happiness, love, and togetherness. New clothes, shiny shoes, jewelry, perfumes, and gifts are desires found in every heart. But sadly, there are faces around us that remain deprived of these joys. For widows, orphaned children, and financially struggling families, Eid can feel more like a burden than a celebration.";

/** Live paragraph 2 — the initiative and the Rs. 10 complete Eid shopping. */
const INITIATIVE_PARAGRAPH =
  "Feeling this silent pain, Sirat-e-Mustaqeem Welfare Trust launched a heartwarming initiative called “Free Eid Shopping”. Under this program, widows, orphans, and deserving individuals are invited to do their complete Eid shopping for just Rs. 10, preserving their dignity and self-respect, while allowing them to celebrate Eid with pride and joy.";

/** Live paragraph 3 — the shopping space and the feeling of being a valued guest. */
const EXPERIENCE_PARAGRAPH =
  "This is not merely about distributing items, it is a beautiful experience of sharing happiness with respect and compassion. Eligible women, children, and families walk through a specially arranged shopping space where they can freely choose Eid clothes, shoes, sandals, bangles, jewelry, mehndi (henna), and other essentials just like regular shoppers. Everything is thoughtfully organized to make sure no one feels like a receiver, but rather a valued guest, smiling with real Eid cheer and a heart full of self-worth.";

/** Live paragraph 4 — the short invitation to spread Eid joy. */
const SPREAD_JOY_PARAGRAPH = "Let’s spread Eid joy together.";

/** Live paragraph 5 — how the project is funded and the appeal to join. */
const DONORS_PARAGRAPH =
  "This project is made possible through the support of generous donors like you. If you wish to bring a smile to the face of an orphan child or a widowed mother this Eid, then join this noble mission today.";

/** Live closing line — the page's own last sentence. */
const CLOSING_LINE = "Be the reason someone truly celebrates Eid.";

/**
 * What families can choose in the shopping space, presented as cards. The
 * titles group the live copy's own list of items; the one-line descriptions
 * are presentation.
 */
const SHOPPING_CARDS: readonly {
  title: string;
  description: string;
  icon: typeof HiGift;
}[] = [
  {
    title: "Eid clothes & footwear",
    description:
      "Eid clothes, shoes and sandals to choose from freely, just like regular shoppers.",
    icon: HiGift,
  },
  {
    title: "Bangles & jewelry",
    description:
      "Bangles, jewelry and accessories that make the day feel like a real celebration.",
    icon: HiSparkles,
  },
  {
    title: "Mehndi & essentials",
    description:
      "Mehndi (henna) and other essentials to complete every Eid preparation.",
    icon: HiHeart,
  },
  {
    title: "A real shopping space",
    description:
      "A specially arranged space where eligible women, children and families choose for themselves.",
    icon: HiShoppingBag,
  },
];

/**
 * The two facts stated in the live copy, shown as the initiative's facts
 * panel. Both are lifted from the live page — no other figure is claimed.
 */
const INITIATIVE_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiBanknotes;
}[] = [
  {
    label: "Complete Eid shopping",
    value: "For just Rs. 10 — dignity and self-respect preserved",
    icon: HiBanknotes,
  },
  {
    label: "Who is invited",
    value: "Widows, orphans and deserving individuals",
    icon: HiUserGroup,
  },
];

export const metadata: Metadata = {
  title: "Free Eid Shopping",
  description:
    "Bringing Eid Joy to Every Home! Sirat-e-Mustaqeem Welfare Trust invites widows, orphans and deserving individuals to do their complete Eid shopping for just Rs. 10 — choosing Eid clothes, shoes, bangles, jewelry, mehndi and more in a specially arranged shopping space that preserves their dignity.",
  openGraph: {
    title: "Free Eid Shopping | SM Welfare Trust",
    description:
      "Complete Eid shopping for just Rs. 10 — widows, orphans and deserving families choose Eid clothes, shoes, bangles, jewelry and mehndi with dignity and self-respect.",
  },
  twitter: {
    title: "Free Eid Shopping | SM Welfare Trust",
    description:
      "Complete Eid shopping for just Rs. 10 — widows, orphans and deserving families choose Eid clothes, shoes, bangles, jewelry and mehndi with dignity and self-respect.",
  },
};

export default function FreeEidShoppingPage() {
  return (
    <>
      <PageHero
        title="Free Eid Shopping"
        description="Bringing Eid Joy to Every Home!"
      />

      {/* Live copy — what Eid means and who is deprived of its joys, beside the
          client-provided photo (16:9, framed at its natural ratio so it is
          never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="For many families, Eid feels more like a burden than a celebration"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={FREE_EID_SHOPPING.src}
              alt={FREE_EID_SHOPPING.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the initiative + the shopping cards and the facts
          panel */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our initiative"
            title="Complete Eid shopping for just Rs. 10"
            description="Widows, orphans and deserving individuals are invited to shop for Eid with dignity and self-respect — celebrating with pride and joy, exactly like everyone else."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {INITIATIVE_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SHOPPING_CARDS.map((item) => (
              <article
                key={item.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>

          {/* The live copy's own Rs. 10 figure and who the program invites */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {INITIATIVE_FACTS.map((fact) => (
              <div key={fact.label} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <fact.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {fact.label}
                  </span>
                  <span className="text-sm font-semibold">{fact.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Live copy about the shopping space and the feeling of being a valued
          guest rather than a receiver */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="An experience of respect"
              title="No one feels like a receiver — everyone is a valued guest"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {EXPERIENCE_PARAGRAPH}
            </p>
          </div>
        </Container>
      </section>

      {/* Live closing appeal — the page's own last line is the headline */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join hands with us"
              title={CLOSING_LINE}
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {SPREAD_JOY_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {DONORS_PARAGRAPH}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={DONATE_HREF}
                className={cn(buttonVariants(), BTN_PRIMARY_BLUE, "group")}
              >
                <HiHeart className="mr-1.5 size-4" aria-hidden="true" />
                Donate now
                <HiArrowRight
                  className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/contact"
                className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT)}
              >
                Contact us
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
