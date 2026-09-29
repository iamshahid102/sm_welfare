import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBanknotes,
  HiBriefcase,
  HiBuildingStorefront,
  HiHeart,
  HiMapPin,
  HiScissors,
  HiShoppingBag,
  HiTruck,
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
import { MONTHLY_RAASHAN_SUPPORT } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Monthly Raashan Support Program — mirrors the live
 * /monthly-raashan-support-program/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: Orangi Town as one of
 * Asia's largest and most densely populated areas, the families crushed by
 * inflation, illness and unemployment, the launch of the "Monthly Rashan
 * Program" as a meaningful and dignified effort beyond short-term relief,
 * the roughly 70 deserving families (widows, the sick and extremely poor
 * individuals) who receive monthly ration packages, the dignity and
 * self-respect the program deliberately preserves, the aim of guiding them
 * toward financial independence, the employment resources — carts, stalls,
 * sewing machines or small-business assistance — provided after a few months,
 * the program as a first step toward poverty eradication, and the closing
 * donation appeal. The tagline "True Help is What Opens the Doors to
 * Self-Reliance!" is the live page's own subtitle.
 *
 * The layout follows the same section flow as the Free Schooling System,
 * Hunarmand Beti, Ambulance Services, Heat Stroke Camp and Sirat ul Quran
 * Academy pages: PageHero → challenge grid with a sticky image → bg-section
 * program band (heading, copy, support cards, facts panel) → white
 * self-reliance section with the employment-resource cards → closing card →
 * CtaBand.
 *
 * The kickers, headings, the support/empowerment cards and the facts panel
 * are presentation only — every fact in them (around 70 families, monthly
 * ration packages, widows, the sick, extremely poor individuals, preserved
 * dignity, employment after a few months, carts, stalls, sewing machines,
 * small-business assistance, Orangi Town) comes from the same live copy.
 */

/** Live paragraph 1 — Orangi Town and the families under economic pressure. */
const CHALLENGE_PARAGRAPH =
  "Orangi Town in Karachi, one of the largest densely populated areas in Asia, is home to people from all walks of life. While some live comfortably, many others struggle severely to meet their daily expenses. Rising inflation, illness, and unemployment have taken away the happiness of countless households. To support these families under economic pressure, Sirat-e-Mustaqeem Welfare Trust launched the “Monthly Rashan Program,” a meaningful and dignified effort that goes beyond short-term relief to offer sustainable support.";

/** Live paragraph 2 — who receives the ration and the dignity it preserves. */
const FAMILIES_PARAGRAPH =
  "Through this platform, around 70 deserving families receive monthly ration packages, including widows, the sick, and extremely poor individuals. Alongside the ration, their dignity and self-respect are carefully preserved so they never feel like a burden on society. Our aim is not just temporary aid but to guide these families toward financial independence.";

/** Live paragraph 3 — the employment resources and the goal of self-reliance. */
const EMPOWERMENT_PARAGRAPH =
  "After a few months, the same beneficiaries are provided with employment resources such as carts, stalls, sewing machines, or financial assistance for small businesses. This initiative is not limited to just food support. It is a comprehensive program, the first step toward poverty eradication and a life of dignity. Our mission is not just to feed the hungry, but to empower them for life.";

/** Live paragraph 4 — what a small donation can become. */
const DONATION_PARAGRAPH =
  "Your small donation can light up someone’s kitchen, become the support of a widow, or provide a source of income to a struggling family.";

/** Live closing paragraph inviting readers to join hands. */
const JOIN_PARAGRAPH =
  "Join hands with Sirat-e-Mustaqeem Welfare Trust to make this mission more impactful and far-reaching with your generous support and compassion.";

/**
 * What the monthly packages reach, presented as cards. The titles are the
 * live copy's own beneficiaries; the one-line descriptions are presentation.
 */
const SUPPORT_ITEMS: readonly {
  title: string;
  description: string;
  icon: typeof HiShoppingBag;
}[] = [
  {
    title: "Monthly ration packages",
    description:
      "Around 70 deserving families receive a full ration package every month.",
    icon: HiShoppingBag,
  },
  {
    title: "Widows",
    description:
      "Widows who carry their households alone are supported with dignity.",
    icon: HiHeart,
  },
  {
    title: "The sick",
    description:
      "Families set back by illness keep food on the table while they recover.",
    icon: HiUserGroup,
  },
  {
    title: "Extremely poor individuals",
    description:
      "Those under the harshest economic pressure are reached first.",
    icon: HiBanknotes,
  },
];

/**
 * The employment resources the live copy lists as the program's next step,
 * presented as cards. The titles are the source's own list items.
 */
const EMPOWERMENT_ITEMS: readonly {
  title: string;
  description: string;
  icon: typeof HiShoppingBag;
}[] = [
  {
    title: "Carts and stalls",
    description:
      "A pushcart or stall becomes a daily source of halal income.",
    icon: HiTruck,
  },
  {
    title: "Sewing machines",
    description:
      "A sewing machine turns a skill into steady work from home.",
    icon: HiScissors,
  },
  {
    title: "Small-business support",
    description:
      "Financial assistance helps a struggling family start a small business.",
    icon: HiBuildingStorefront,
  },
  {
    title: "A step to self-reliance",
    description:
      "Not just food support — the first step toward poverty eradication.",
    icon: HiBriefcase,
  },
];

/** The program's reach, beneficiaries and location — all stated in the live copy. */
const PROGRAM_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiUserGroup;
}[] = [
  {
    label: "Families reached",
    value: "Around 70 deserving families — every month",
    icon: HiUserGroup,
  },
  {
    label: "Who is helped",
    value: "Widows, the sick and extremely poor individuals",
    icon: HiHeart,
  },
  {
    label: "Where",
    value: "Orangi Town, Karachi",
    icon: HiMapPin,
  },
  {
    label: "The next step",
    value: "Employment resources for the same beneficiaries",
    icon: HiBriefcase,
  },
];

export const metadata: Metadata = {
  title: "Monthly Raashan Support Program",
  description:
    "True Help is What Opens the Doors to Self-Reliance! Sirat-e-Mustaqeem Welfare Trust's Monthly Rashan Program delivers monthly ration packages to around 70 deserving families in Orangi Town, Karachi — then helps them toward financial independence with carts, stalls, sewing machines and small-business support.",
  openGraph: {
    title: "Monthly Raashan Support Program | SM Welfare Trust",
    description:
      "Monthly ration packages for around 70 deserving families in Orangi Town, Karachi — widows, the sick and extremely poor individuals — with employment resources that lead to self-reliance.",
  },
  twitter: {
    title: "Monthly Raashan Support Program | SM Welfare Trust",
    description:
      "Monthly ration packages for around 70 deserving families in Orangi Town, Karachi — widows, the sick and extremely poor individuals — with employment resources that lead to self-reliance.",
  },
};

export default function MonthlyRaashanSupportProgramPage() {
  return (
    <>
      <PageHero
        title="Monthly Raashan Support Program"
        description="True Help is What Opens the Doors to Self-Reliance!"
      />

      {/* Live copy — Orangi Town's families under economic pressure and the
          launch of the Monthly Rashan Program, beside the client-provided
          photo (16:9, framed at its natural ratio so it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="When inflation takes away the happiness of countless households"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={MONTHLY_RAASHAN_SUPPORT.src}
              alt={MONTHLY_RAASHAN_SUPPORT.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the families the program reaches + the support cards
          and the facts panel */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our program"
            title="Food support that preserves dignity"
            description="Around 70 deserving families receive monthly ration packages — widows, the sick and extremely poor individuals — with their dignity and self-respect carefully preserved."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {FAMILIES_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_ITEMS.map((item) => (
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

          {/* The live copy's own reach, beneficiaries, location and next step */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {PROGRAM_FACTS.map((fact) => (
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

      {/* Live copy about the employment resources and the road to
          self-reliance, with the source's own list as cards */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Beyond food support"
              title="Empowering families for life, not just for a month"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {EMPOWERMENT_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EMPOWERMENT_ITEMS.map((item) => (
              <article
                key={item.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-section p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
        </Container>
      </section>

      {/* Live closing call to action — what a small donation can become */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join hands with us"
              title="Light up someone's kitchen this month"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {DONATION_PARAGRAPH}
            </p>
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
