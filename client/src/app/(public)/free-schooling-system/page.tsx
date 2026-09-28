import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiHeart,
  HiMapPin,
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
import { resolveProjectImage } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Free Schooling System — mirrors the live /free-schooling-system/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: the UNICEF / Economic
 * Survey 2024–2025 figures, the 2018 launch in Raees Amrohi, the
 * Activity-Based Learning programme, the 170+ enrolled children, and the
 * closing appeal. As on the Founder's Profile and Hunarmand Beti pages,
 * line-wrap artifacts from the source ("2024–\n2025") are rejoined.
 *
 * The kickers, the impact counters and the address panel are presentation
 * only — every number in them (25 million children, 61% literacy, 2018,
 * 170+ enrolled) is taken from the same live copy, and the address is the
 * live page's own "Address" line.
 */

/** Live paragraph 1 — the national education crisis. */
const CRISIS_PARAGRAPH =
  "According to UNICEF and the Government of Pakistan's Economic Survey 2024–2025, over 25 million children in Pakistan are still deprived of education. The national literacy rate stands at only 61%, which is significantly lower than many other South Asian countries. In such circumstances, providing education is not just a necessity, it is a national responsibility.";

/** Live paragraph 2 — the 2018 launch and the school's mission. */
const LAUNCH_PARAGRAPH =
  "In response to this crisis, Sirat-e-Mustaqeem Welfare Trust launched a Free Schooling System back in 2018 in the underserved area of Raees Amrohi, Orangi Town, Karachi. Our mission is to provide quality education to those children whose parents cannot afford the costs of schooling.";

/** Live paragraph 3 — levels, learning system and computer classes. */
const PROGRAMME_PARAGRAPH =
  "Currently, our school offers education from pre-primary to primary levels, fully based on an Activity-Based Learning system. We also plan to expand to secondary-level education in the near future, so that these children can continue their academic journey without interruption. To promote cognitive and creative growth, we also offer computer classes, ensuring that students stay aligned with the demands of the modern era.";

/** Live paragraph 4 — enrolment, supplies and trips. */
const ENROLMENT_PARAGRAPH =
  "At present, over 170 children are enrolled in our school. These children not only receive classroom education, but are also provided with free stationery, notebooks, school bags, and other educational supplies. Additionally, we organize annual picnics and educational trips to help children learn through observation and real-world experiences.";

/** Live paragraph 5 — the promise made to these children. */
const PROMISE_PARAGRAPH =
  "These are the same children who were once kept away from education by poverty, deprivation, and lack of opportunity. But we have made a promise to open the doors of learning for them.";

/** Live closing paragraph inviting readers to join the cause. */
const JOIN_PARAGRAPH =
  "Join us in this noble cause so we can reach even more children with the light of education. Because education is the power that can erase the darkness of poverty, ignorance, and hopelessness.";

/** Live "Address" line shown in the visit panel at the end of the page. */
const SCHOOL_ADDRESS =
  "Gali No. 11, Raees Amrohi, Sadiqabad, Orangi Town, Karachi.";

/**
 * Impact counters — every value is lifted from the live copy above, so the
 * band reports the page's own figures rather than invented ones.
 */
const SCHOOL_STATS: readonly { value: string; label: string }[] = [
  { value: "25M+", label: "Children in Pakistan deprived of education (UNICEF)" },
  { value: "61%", label: "National literacy rate — below many South Asian countries" },
  { value: "2018", label: "Free Schooling System launched in Raees Amrohi" },
  { value: "170+", label: "Children currently enrolled in our school" },
];

/**
 * Byte-verified project photograph from the curated image set
 * (`project-free-schooling.jpg`) — the same resolver the Projects page uses,
 * so this page never drifts from the shared imagery.
 */
const PROJECT_IMAGE = resolveProjectImage({ slug: "free-schooling" });

export const metadata: Metadata = {
  title: "Free Schooling System",
  description:
    "Education is every child's basic right! Launched in 2018 in Raees Amrohi, Orangi Town, our Free Schooling System offers free, Activity-Based Learning from pre-primary to primary level to children whose parents cannot afford the cost of schooling.",
  openGraph: {
    title: "Free Schooling System | SM Welfare Trust",
    description:
      "Free, Activity-Based Learning for children in Orangi Town — over 170 children enrolled with free books, stationery, bags and educational trips.",
  },
  twitter: {
    title: "Free Schooling System | SM Welfare Trust",
    description:
      "Free, Activity-Based Learning for children in Orangi Town — over 170 children enrolled with free books, stationery, bags and educational trips.",
  },
};

export default function FreeSchoolingSystemPage() {
  return (
    <>
      <PageHero
        title="Free Schooling System"
        description="Education is every child's basic right!"
      />

      {/* Live crisis copy — the 25 million children left out of school */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="Education is every child's basic right!"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CRISIS_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {LAUNCH_PARAGRAPH}
            </p>
          </div>
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24",
              !PROJECT_IMAGE && "photo-placeholder"
            )}
            aria-hidden={PROJECT_IMAGE ? undefined : "true"}
          >
            {PROJECT_IMAGE ? (
              <Image
                src={PROJECT_IMAGE.src}
                alt={PROJECT_IMAGE.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </Container>
      </section>

      {/* Live copy about the school itself + the page's own figures */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our school"
            title="Activity-Based Learning, pre-primary to primary"
            description="Raees Amrohi, Orangi Town, Karachi — with a plan to expand to secondary level."
          />

          <div className="grid grid-cols-2 gap-8 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-4">
            {SCHOOL_STATS.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {PROGRAMME_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {ENROLMENT_PARAGRAPH}
            </p>
          </div>
        </Container>
      </section>

      {/* Live "we have made a promise" copy */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Our promise"
              title="We have promised to open the doors of learning"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {PROMISE_PARAGRAPH}
            </p>
          </div>
        </Container>
      </section>

      {/* Live closing call to action + the page's own "Address" line */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join us"
              title="Let's reach even more children with the light of education"
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
                Free education form
              </Link>
            </div>

            <div className="mt-2 flex items-start gap-4 rounded-2xl border border-border bg-section p-5 text-left sm:p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HiMapPin className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Address
                </span>
                <span className="text-sm font-semibold">{SCHOOL_ADDRESS}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
