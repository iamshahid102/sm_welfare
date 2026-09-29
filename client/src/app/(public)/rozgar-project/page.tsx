import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBriefcase,
  HiHeart,
  HiScissors,
  HiShoppingBag,
  HiTruck,
  HiUserGroup,
  HiWrenchScrewdriver,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stat } from "@/components/shared/stat";
import { CtaBand } from "@/components/shared/cta-band";
import {
  BTN_OUTLINE_DEFAULT,
  BTN_PRIMARY_BLUE,
} from "@/components/shared/home-styles";
import { ROZGAR_PROJECT } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Rozgar Project — mirrors the live /rozgar-project/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: unemployment in
 * Pakistan growing more serious each day, the nearly 5.5% of people actively
 * seeking jobs without opportunities, the youth as the most affected group
 * with unemployment past 11%, the country's need for employment, skills and
 * opportunities, the "Rozgar Project" as a ray of hope for deserving and
 * hardworking individuals, the goal of dignified employment rather than mere
 * financial aid, the sources of respectable employment matched to each
 * person's skills, interests and circumstances (small businesses such as
 * selling potato chips, sewing machines so women can earn from home, fruit or
 * vegetable carts, and suitable work for those with a skill or professional
 * expertise), the more than 170 individuals employed so far, and the closing
 * invitation to join the journey. The tagline "A Step Towards Self-Reliance!"
 * is the live page's own subtitle.
 *
 * The layout follows the same section flow as the Free Schooling System,
 * Hunarmand Beti, Ambulance Services, Heat Stroke Camp, Sirat ul Quran
 * Academy and Monthly Raashan Support Program pages: PageHero → challenge
 * grid with a sticky image → bg-section livelihood band (heading, copy,
 * employment-source cards, facts panel) → white impact section with the
 * project's own figures as counters → closing card → CtaBand.
 *
 * The kickers, headings, the employment cards, the facts panel and the
 * counters are presentation only — every fact in them (5.5% national
 * unemployment, 11%+ youth unemployment, potato chips and other small
 * businesses, sewing machines, fruit and vegetable carts, skilled work
 * opportunities, more than 170 individuals employed) comes from the same live
 * copy.
 */

/** Live paragraph 1 — unemployment in Pakistan and who it hits hardest. */
const CHALLENGE_PARAGRAPH =
  "Unemployment in Pakistan is becoming more serious with each passing day. According to recent reports, nearly 5.5% of people in the country are unemployed, actively seeking jobs but struggling due to a lack of opportunities. The most affected group is the youth, where the unemployment rate has crossed 11%. These statistics clearly show that a large portion of Pakistan’s population is in dire need of employment, skills, and opportunities.";

/** Live paragraph 2 — the project's purpose: dignified employment, not just aid. */
const PURPOSE_PARAGRAPH =
  "The “Rozgar Project” by Sirat-e-Mustaqeem Welfare Trust is a ray of hope for those deserving and hardworking individuals who are unable to earn a living due to lack of resources. Our goal is not just financial aid, but to provide dignified employment that helps people move towards self-dependence.";

/** Live paragraph 3 — the employment sources matched to each person. */
const LIVELIHOODS_PARAGRAPH =
  "Under this project, we provide individuals with various sources of respectable employment based on their skills, interests, and circumstances. Some people are assisted in starting small businesses such as selling potato chips, while some women are provided with sewing machines so they can earn from home. Many beneficiaries have received fruit or vegetable carts, helping them support their families through hard work. Similarly, those who possess any skill or professional expertise are provided with suitable work opportunities that align with their capabilities, so they can achieve financial independence.";

/** Live paragraph 4 — the more than 170 individuals employed so far. */
const IMPACT_PARAGRAPH =
  "Alhamdulillah! So far, Sirat-e-Mustaqeem Welfare Trust has successfully provided employment to more than 170 individuals, who are now living respectful lives and have become an inspiration for others.";

/** Live closing paragraph inviting readers to join the journey. */
const JOIN_PARAGRAPH =
  "Join us in this journey of goodness, so we can provide even more dignified jobs to those in need, and together, build a prosperous, self-sufficient, and peaceful society.";

/**
 * The sources of livelihood the live copy lists, presented as cards. The
 * titles are the source's own examples; the one-line descriptions are
 * presentation.
 */
const LIVELIHOOD_CARDS: readonly {
  title: string;
  description: string;
  icon: typeof HiShoppingBag;
}[] = [
  {
    title: "Small businesses",
    description:
      "Assistance in starting small businesses — such as selling potato chips.",
    icon: HiShoppingBag,
  },
  {
    title: "Sewing machines",
    description:
      "Women are provided with sewing machines so they can earn from home.",
    icon: HiScissors,
  },
  {
    title: "Fruit & vegetable carts",
    description:
      "Beneficiaries receive carts to support their families through hard work.",
    icon: HiTruck,
  },
  {
    title: "Skilled work opportunities",
    description:
      "Those with a skill or professional expertise are matched to work that fits their capabilities.",
    icon: HiWrenchScrewdriver,
  },
];

/** The project's purpose and the two figures behind it — all from the live copy. */
const PROJECT_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiBriefcase;
}[] = [
  {
    label: "Our approach",
    value: "Dignified employment matched to each person's skills, interests and circumstances",
    icon: HiBriefcase,
  },
  {
    label: "National unemployment",
    value: "Nearly 5.5% of people are unemployed and actively seeking jobs",
    icon: HiUserGroup,
  },
];

/**
 * Impact counters — every value is lifted from the live copy above, so the
 * band reports the page's own figures rather than invented ones.
 */
const ROZGAR_STATS: readonly { value: string; label: string }[] = [
  { value: "170+", label: "Individuals provided employment so far" },
  { value: "11%+", label: "Youth unemployment rate the project responds to" },
  { value: "5.5%", label: "People in Pakistan unemployed and seeking work" },
];

export const metadata: Metadata = {
  title: "Rozgar Project",
  description:
    "A Step Towards Self-Reliance! Sirat-e-Mustaqeem Welfare Trust's Rozgar Project provides dignified employment to deserving, hardworking individuals in Pakistan — small businesses, sewing machines, fruit and vegetable carts and skilled work matched to each person's abilities. Over 170 individuals employed so far.",
  openGraph: {
    title: "Rozgar Project | SM Welfare Trust",
    description:
      "Dignified employment for deserving, hardworking individuals — small businesses, sewing machines, carts and skilled work. More than 170 individuals employed so far.",
  },
  twitter: {
    title: "Rozgar Project | SM Welfare Trust",
    description:
      "Dignified employment for deserving, hardworking individuals — small businesses, sewing machines, carts and skilled work. More than 170 individuals employed so far.",
  },
};

export default function RozgarProjectPage() {
  return (
    <>
      <PageHero
        title="Rozgar Project"
        description="A Step Towards Self-Reliance!"
      />

      {/* Live copy — Pakistan's unemployment figures and the project's
          purpose, beside the client-provided photo (16:9, framed at its
          natural ratio so it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="A large portion of Pakistan is in dire need of employment"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {PURPOSE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={ROZGAR_PROJECT.src}
              alt={ROZGAR_PROJECT.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the employment sources + the livelihood cards and
          the facts panel */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="How we create livelihoods"
            title="Respectable work, matched to every person"
            description="Sources of employment based on each individual's skills, interests and circumstances — from small businesses to carts, sewing machines and skilled trades."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {LIVELIHOODS_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LIVELIHOOD_CARDS.map((item) => (
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

          {/* The live copy's own approach and national unemployment figure */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {PROJECT_FACTS.map((fact) => (
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

      {/* Live \"Alhamdulillah\" impact copy + the page's own figures as
          counters */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Our impact"
              title="More than 170 individuals now live respectful lives"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {IMPACT_PARAGRAPH}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-border bg-section p-6 shadow-sm sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
            {ROZGAR_STATS.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </Container>
      </section>

      {/* Live closing call to action */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join hands with us"
              title="Build a prosperous, self-sufficient and peaceful society"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {JOIN_PARAGRAPH}
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
