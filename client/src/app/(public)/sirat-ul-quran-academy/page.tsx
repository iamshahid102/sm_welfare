import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiAcademicCap,
  HiArrowRight,
  HiBanknotes,
  HiBookOpen,
  HiCalendarDays,
  HiClock,
  HiHeart,
  HiMapPin,
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
import { SIRAT_UL_QURAN_ACADEMY } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Sirat ul Quran Academy (Taleem e Baligaat) — mirrors the live
 * /sirat-ul-quran-academy/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: the value of religious
 * education in a world racing for worldly education, the launch of
 * "Sirat-ul-Quran Academy" as a non-profit welfare institution, Quran
 * teaching with proper Tajweed alongside weekly Islamic lessons, festival
 * celebrations and Seerat-un-Nabi programs, the women's Adult Islamic
 * Education Program, the basic secular education for children, the Rs. 50
 * monthly fee, and the closing invitation. The tagline "The Light of Islamic
 * Knowledge, A Guarantee for a Better Generation." is the live page's own
 * subtitle.
 *
 * The layout follows the same section flow as the Free Schooling System,
 * Hunarmand Beti, Ambulance Services and Heat Stroke Camp pages: PageHero →
 * challenge grid with a sticky image → bg-section academy band (heading,
 * copy, program cards, facts panel) → white fee section → closing card →
 * CtaBand.
 *
 * The kickers, headings, program cards and the facts panel are presentation
 * only — every fact in them (Tajweed, weekly lessons, festivals, Seerat-un-Nabi,
 * the women's program, basic secular education, Rs. 50 per month, 2:00 PM to
 * 5:00 PM, Liaquat Chowk) comes from the same live copy.
 */

/** Live paragraph 1 — why religious education matters. */
const CHALLENGE_PARAGRAPH =
  "Religious education is the light that guides a person through every stage of life. It's not just about teaching prayers and rituals, it's a complete code of life that shapes our character, ethics, dealings, and social behavior. In today's world, where there is a constant race for worldly education, delivering authentic Islamic education remains our true responsibility.";

/** Live paragraph 2 — the Trust's launch of the academy. */
const LAUNCH_PARAGRAPH =
  "To fulfill this important duty, Sirat-e-Mustaqeem Welfare Trust has launched a remarkable initiative called “Sirat-ul-Quran Academy” a non-profit welfare institution working on various projects related to education, employment, health, and welfare for the underprivileged segments of society.";

/** Live paragraph 3 — what children learn at the academy. */
const CHILDREN_PARAGRAPH =
  "At Sirat-ul-Quran Academy, children are taught the Holy Quran with proper Tajweed. In addition, weekly Islamic lessons, celebrations of Islamic festivals, and special programs based on the Seerat-un-Nabi صلى الله عليه وسلم (Life of the Prophet صلى الله عليه وسلم) are regularly organized.";

/** Live paragraph 4 — the women's program and basic secular education. */
const WOMEN_PARAGRAPH =
  "For women, a dedicated Adult Islamic Education Program is offered, where they learn solutions to everyday life issues through the Quran and Hadith, along with moral and social training. Keeping in view the modern needs of children, the academy also provides basic secular education, enabling them to progress confidently in both religious and worldly fields.";

/** Live paragraph 5 — the monthly fee. */
const FEE_PARAGRAPH =
  "All of this education and training is offered for just a monthly fee of Rs. 50, ensuring that every child can benefit from this light of knowledge.";

/** Live closing paragraph inviting readers to join. */
const JOIN_PARAGRAPH =
  "Come forward and make your children part of this beautiful journey of Islamic and moral education.";

/**
 * The academy's programs, presented as cards. The titles condense the live
 * copy's own list of activities; the one-line descriptions are presentation.
 */
const PROGRAMS: readonly {
  title: string;
  description: string;
  icon: typeof HiBookOpen;
}[] = [
  {
    title: "Quran with Tajweed",
    description:
      "Children are taught the Holy Quran with proper Tajweed.",
    icon: HiBookOpen,
  },
  {
    title: "Weekly Islamic lessons",
    description:
      "Weekly Islamic lessons that strengthen faith and understanding.",
    icon: HiCalendarDays,
  },
  {
    title: "Festivals & Seerat programs",
    description:
      "Celebrations of Islamic festivals and special programs based on the Seerat-un-Nabi (ﷺ).",
    icon: HiSparkles,
  },
  {
    title: "Adult Islamic Education",
    description:
      "A dedicated program for women — everyday life solutions from the Quran and Hadith, with moral and social training.",
    icon: HiUserGroup,
  },
  {
    title: "Basic secular education",
    description:
      "Modern, basic secular education so children progress confidently in both religious and worldly fields.",
    icon: HiAcademicCap,
  },
];

/** The fee, timings and location — all stated in the live copy. */
const ACADEMY_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiBanknotes;
}[] = [
  {
    label: "Monthly fee",
    value: "Just Rs. 50 — every child can benefit",
    icon: HiBanknotes,
  },
  {
    label: "Timings",
    value: "2:00 PM to 5:00 PM",
    icon: HiClock,
  },
  {
    label: "Location",
    value: "Liaquat Chowk, Gulshan-e-Zia, Orangi Town, Karachi.",
    icon: HiMapPin,
  },
];

export const metadata: Metadata = {
  title: "Sirat ul Quran Academy (Taleem e Baligaat)",
  description:
    "The Light of Islamic Knowledge, A Guarantee for a Better Generation! Sirat-ul-Quran Academy teaches the Holy Quran with proper Tajweed, weekly Islamic lessons, an Adult Islamic Education Program for women and basic secular education — for just Rs. 50 a month in Orangi Town, Karachi.",
  openGraph: {
    title: "Sirat ul Quran Academy (Taleem e Baligaat) | SM Welfare Trust",
    description:
      "Quran with Tajweed, weekly Islamic lessons, women's Islamic education and basic secular education for just Rs. 50 a month — Liaquat Chowk, Orangi Town, Karachi.",
  },
  twitter: {
    title: "Sirat ul Quran Academy (Taleem e Baligaat) | SM Welfare Trust",
    description:
      "Quran with Tajweed, weekly Islamic lessons, women's Islamic education and basic secular education for just Rs. 50 a month — Liaquat Chowk, Orangi Town, Karachi.",
  },
};

export default function SiratUlQuranAcademyPage() {
  return (
    <>
      <PageHero
        title="Sirat ul Quran Academy"
        description="The Light of Islamic Knowledge, A Guarantee for a Better Generation."
      />

      {/* Live copy — the value of religious education and the Trust's launch
          of the academy, beside the client-provided photo (16:9, framed at
          its natural ratio so it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="When the race for worldly education leaves faith behind"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {LAUNCH_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={SIRAT_UL_QURAN_ACADEMY.src}
              alt={SIRAT_UL_QURAN_ACADEMY.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about what the academy teaches + the program cards and
          the facts panel */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our academy"
            title="Sirat-ul-Quran Academy"
            description="A non-profit welfare institution — the Holy Quran with Tajweed, weekly Islamic lessons and modern education in Orangi Town."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHILDREN_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {WOMEN_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program) => (
              <article
                key={program.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <program.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {program.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </article>
            ))}
          </div>

          {/* The live copy's own fee, timings and location */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {ACADEMY_FACTS.map((fact) => (
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

      {/* Live fee copy — Rs. 50 a month */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Affordable for everyone"
              title="Every child can benefit from this light of knowledge"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {FEE_PARAGRAPH}
            </p>
          </div>
        </Container>
      </section>

      {/* Live closing call to action */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join us"
              title="Make your children part of this beautiful journey"
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
                href="/forms"
                className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT)}
              >
                Academy admission form
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
