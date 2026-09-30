import Image from "next/image";
import Link from "next/link";
import { HiArrowRight, HiEye } from "react-icons/hi2";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaBand } from "@/components/shared/cta-band";
import { Reveal } from "@/components/shared/reveal";
import { BTN_PRIMARY_BLUE } from "@/components/shared/home-styles";
import { PROGRAMS, MISSION_PARAGRAPHS } from "@/data/programs";
import { ABOUT_IMAGE } from "@/data/site-images";
import { listPublicPrograms } from "@/services/public-programs";
import type { PublicProgram } from "@/types/public-api";
import { cn } from "@/lib/utils";

/**
 * About page body mirrors the live /about-us/ page: the "Charity Efforts
 * Are For Happiness" heading, the live intro copy (Orangi Town, the project
 * list, the 2022 flood response), the six service cards, and the live
 * /our-mission/ paragraphs under "Our Mission".
 *
 * Headings are split Saylani-style: small kicker line + big display line.
 */
const ABOUT_PARAGRAPHS: readonly string[] = [
  "Sirat e Mustaqeem Welfare Trust is one of the well-known non-profit welfare organizations in Pakistan, working since 2017 to support poor and low-income families. Our main goal is to make life better for people by providing help in health, education, clean water, and other social welfare services. The trust is run by a caring team of doctors, business professionals, and social workers who truly want to make a difference. Together, we are working in Orangi Town, Karachi, one of the largest and most crowded low-income areas in Asia, where nearly 4.2 million people live.",
  "Every day, Sirat e Mustaqeem Welfare Trust helps thousands of people through a wide range of impactful projects, including: Sasta Khana Project, Free Schooling System, Health Care Services, Hunarmaand Beti Project, Marriage Support Program, Rozgaar Project, Ambulance Services, Qurbani Barae Waqf, Monthly Raashan Support Program, Sirat ul Quran Academy, Winter Relief Campaign, Tree for Tomorrow Initiative, Flood Relief Mission, Iftaar Dastarkhawan, Free Eid Shopping, Heat Stroke Camp, Home and Masjid Renovation, Rehmat e Ramdan Rashaan Project, Zahaanat outreach Scholars programe and many more ongoing social services.",
  "In times of trouble, we are always ready to help. During the 2022 floods in Pakistan, our team stood strong and supported many families by providing tents, food, cooking items, temporary schools, medical camps, and medicines. We even built shelter homes for families who lost their houses. Our medical camps helped stop the spread of many diseases caused by contaminated floodwater. With the support of our hardworking volunteers and kind donors, Sirat e Mustaqeem Welfare Trust continues to help poor and needy people every day and during times of emergency.",
];

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Sirat e Mustaqeem Welfare Trust is one of the well-known non-profit welfare organizations in Pakistan, working since 2017 to support poor and low-income families — health, education, clean water and social welfare.",
  openGraph: {
    title: "About Us | SM Welfare Trust",
    description:
      "Sirat e Mustaqeem Welfare Trust — working since 2017 to support poor and low-income families in Orangi Town, Karachi.",
  },
  twitter: {
    title: "About Us | SM Welfare Trust",
    description:
      "Sirat e Mustaqeem Welfare Trust — working since 2017 to support poor and low-income families in Orangi Town, Karachi.",
  },
};

async function fetchPrograms(): Promise<PublicProgram[]> {
  try {
    // 20 > the 13 seeded programs so none is silently dropped by the page limit.
    const result = await listPublicPrograms({ limit: 20 });
    return result.items;
  } catch (err) {
    console.error("[About] Failed to fetch programs:", err);
    return [];
  }
}

export default async function AboutPage() {
  const programs = await fetchPrograms();

  // API programmes win; the curated six keep the section populated (and
  // number-labelled) when the public API is unavailable.
  const areas =
    programs.length > 0
      ? programs.map((program, index) => ({
          key: program.id,
          number: String(index + 1).padStart(2, "0"),
          title: program.title,
          description: program.shortDescription,
        }))
      : PROGRAMS.map((program) => ({
          key: program.number,
          number: program.number,
          title: program.name,
          description: program.description,
        }));

  return (
    <>
      <PageHero
        title="Charity Efforts Are For Happiness"
        description="Sirat e Mustaqeem Welfare Trust is one of the well-known non-profit welfare organizations in Pakistan, working since 2017 to support poor and low-income families."
      />

      {/* Live /about-us/ intro copy */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="flex flex-col gap-5">
            <SectionHeading
              kicker="Who we are"
              title="Serving Orangi Town, Karachi since 2017"
            />
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="text-base leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
            <div>
              <Link
                href="/projects"
                className={cn(buttonVariants(), BTN_PRIMARY_BLUE, "group")}
              >
                <HiEye className="mr-1.5 size-4" aria-hidden="true" />
                See what we run
                <HiArrowRight
                  className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>
          {/* Sticky, so deliberately not wrapped in <Reveal/> (a transformed
              ancestor would break sticky positioning). */}
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={ABOUT_IMAGE.src}
              alt={ABOUT_IMAGE.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </div>
        </Container>
      </section>

      {/* What we do — six service cards from the live homepage */}
      <section id="what-we-do" className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our initiatives"
            title="What We Do"
            description="Areas of focus on the ground — thousands of families reached every month."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area, index) => (
              <Reveal
                as="article"
                key={area.key}
                delay={Math.min(index, 5) * 70}
                className="hover-lift group flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm hover:border-primary/25"
              >
                <span className="font-heading text-3xl font-bold text-primary/30 transition-colors duration-300 group-hover:text-primary/60">
                  {area.number}
                </span>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {area.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {area.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Our Mission — live /our-mission/ copy */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-8 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our vision"
            title="Our Mission"
            description="Beyond the boundaries of caste, sect, or religion."
          />
          <Reveal className="mx-auto flex max-w-3xl flex-col gap-4">
            {MISSION_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="text-base leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
