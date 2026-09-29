import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBanknotes,
  HiHandRaised,
  HiHeart,
  HiSparkles,
  HiUserGroup,
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
import { MARRIAGE_SUPPORT } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Marriage Support Program — mirrors the live WordPress category page at
 * /category/marriage-support-program/.
 *
 * Every paragraph below is reproduced from the live page so the rebuild says
 * exactly what the site it replaces says: how poverty turns the dream of
 * happiness into a heavy burden, the nearly 40% of Pakistan's population
 * living below the poverty line according to United Nations development
 * experts, the challenge this makes of the sacred duty of marriage, the
 * Marriage Support Program as a ray of hope that eases a social burden and
 * lets families begin a new chapter with dignity and respect, poor parents
 * unable to bear even the basic costs or modest dowries, the essential
 * wedding support given with compassion, care and respect, the special focus
 * on orphan girls whose fathers are no longer alive, the belief that marriage
 * is a sacred blessing that should never become a financial burden, the
 * mission that no daughter's wedding be delayed because of poverty, the
 * nearly 15 families' daughters married with dignity so far, and the closing
 * invitation. The tagline "A Dignified Marriage is Every Daughter's Right!"
 * is the live page's own subtitle.
 *
 * The layout follows the same section flow as the other project pages (Free
 * Schooling System, Hunarmand Beti, Ambulance Services, Heat Stroke Camp,
 * Sirat ul Quran Academy, Monthly Raashan Support Program, Rozgar Project):
 * PageHero → challenge grid with a sticky image → bg-section program band
 * (heading, copy, support cards, facts panel, belief callout) → white impact
 * section with the page's own figures as counters → closing card → CtaBand.
 */

/** Live paragraph 1 — poverty and the burden it puts on marriage. */
const CHALLENGE_PARAGRAPH =
  "When a large portion of society is deprived of necessities, even the dreams of happiness can become a heavy burden. According to recent reports by United Nations development experts, nearly 40% of Pakistan’s population lives below the poverty line. In such harsh economic conditions, fulfilling the sacred duty of marriage has become an extremely difficult challenge for countless families.";

/** Live paragraph 2 — the program as a ray of hope. */
const HOPE_PARAGRAPH =
  "The Marriage Support Program by Sirat-e-Mustaqeem Welfare Trust serves as a ray of hope for such deserving families. By easing this social burden, the program helps them begin a new chapter of life with dignity and respect. Many poor parents are unable to bear the basic costs of their daughters’ weddings or arrange even modest dowries. Through this initiative, Sirat-e-Mustaqeem Welfare Trust strives to support these families with compassion, care, and respect.";

/** Live paragraph 3a — the help the program provides and who it focuses on. */
const SUPPORT_PARAGRAPH =
  "This charitable marriage program assists eligible families by providing essential wedding support, especially focusing on orphan girls whose fathers are no longer alive and whose families are financially incapable of arranging their weddings.";

/** Live paragraph 3b — the belief and the mission behind the program. */
const BELIEF_PARAGRAPH =
  "We strongly believe that marriage is a sacred blessing and should never become a financial burden. Our mission is to ensure that no daughter’s wedding is delayed just because of poverty.";

/** Live paragraph 4 — the families' daughters married with dignity so far. */
const IMPACT_PARAGRAPH =
  "Alhamdulillah, with the generous support of our donors and the tireless efforts of our team, Sirat-e-Mustaqeem Welfare Trust has successfully arranged dignified marriages for nearly 15 families’ daughters so far.";

/** Live closing paragraph inviting readers to join the noble cause. */
const JOIN_PARAGRAPH =
  "Join us in this noble cause. Your small contribution can help someone begin a new life with dignity.";

/**
 * What the program does, presented as cards. The titles condense the live
 * copy's own points; the one-line descriptions are presentation.
 */
const SUPPORT_CARDS: readonly {
  title: string;
  description: string;
  icon: typeof HiSparkles;
}[] = [
  {
    title: "Essential wedding support",
    description:
      "Eligible families are assisted with the essential costs of the wedding.",
    icon: HiSparkles,
  },
  {
    title: "Focus on orphan girls",
    description:
      "Especially orphan girls whose fathers are no longer alive and whose families cannot afford a wedding.",
    icon: HiUserGroup,
  },
  {
    title: "Dignity, care and respect",
    description:
      "Support given with compassion and honour — easing a social burden, never adding to it.",
    icon: HiHandRaised,
  },
];

/**
 * The two facts stated in the live copy, shown as the program's facts panel.
 * Both are lifted from the live page — no other figure is claimed.
 */
const NEED_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiBanknotes;
}[] = [
  {
    label: "The burden",
    value:
      "Many poor parents cannot bear even the basic costs of their daughters' weddings or arrange a modest dowry.",
    icon: HiBanknotes,
  },
  {
    label: "Who we help",
    value:
      "Deserving families — especially orphan girls whose fathers are no longer alive.",
    icon: HiUserGroup,
  },
];

/**
 * Impact counters — every value is lifted from the live copy above, so the
 * band reports the page's own figures rather than invented ones.
 */
const MARRIAGE_STATS: readonly { value: string; label: string }[] = [
  {
    value: "Nearly 15",
    label: "Families' daughters given dignified marriages so far",
  },
  {
    value: "40%",
    label: "Pakistan's population living below the poverty line",
  },
];

export const metadata: Metadata = {
  title: "Marriage Support Program",
  description:
    "A Dignified Marriage is Every Daughter's Right! Sirat-e-Mustaqeem Welfare Trust's Marriage Support Program helps deserving families — especially orphan girls — with essential wedding support, so that no daughter's wedding is delayed just because of poverty. Nearly 15 families' daughters married with dignity so far.",
  openGraph: {
    title: "Marriage Support Program | SM Welfare Trust",
    description:
      "Essential wedding support for deserving families and orphan girls — because marriage is a sacred blessing that should never become a financial burden.",
  },
  twitter: {
    title: "Marriage Support Program | SM Welfare Trust",
    description:
      "Essential wedding support for deserving families and orphan girls — because marriage is a sacred blessing that should never become a financial burden.",
  },
};

export default function MarriageSupportProgramPage() {
  return (
    <>
      <PageHero
        title="Marriage Support Program"
        description="A Dignified Marriage is Every Daughter's Right!"
      />

      {/* Live copy — poverty's burden on marriage and the program as a ray of
          hope, beside the client-provided photo (3:2, framed at its natural
          ratio so it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="When poverty turns a sacred duty into a heavy burden"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {HOPE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={MARRIAGE_SUPPORT.src}
              alt={MARRIAGE_SUPPORT.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the support provided + the support cards and the
          belief callout */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our program"
            title="Helping families begin a new chapter with dignity"
            description="Essential wedding support with compassion, care and respect — especially for orphan girls whose families are financially incapable of arranging their weddings."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {SUPPORT_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORT_CARDS.map((item) => (
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

          {/* The live copy's own "need" facts, as the program's facts panel */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {NEED_FACTS.map((fact) => (
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

          {/* The live copy's own belief and mission, shown as a callout */}
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <span className="h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
            <p className="font-heading text-xl font-bold leading-snug tracking-tight text-balance sm:text-2xl">
              {BELIEF_PARAGRAPH}
            </p>
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
              title="Dignified marriages for nearly 15 families' daughters"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {IMPACT_PARAGRAPH}
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 rounded-2xl border border-border bg-section p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {MARRIAGE_STATS.map((stat) => (
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
              title="Help someone begin a new life with dignity"
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
