import Image from "next/image";
import type { Metadata } from "next";
import { HiPhone } from "react-icons/hi2";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaBand } from "@/components/shared/cta-band";
import { Reveal } from "@/components/shared/reveal";
import {
  CertificateGallery,
  type CertificateItem,
} from "@/components/shared/certificate-gallery";
import { CERTIFICATES, CERTIFICATES_FOLDER } from "@/data/certificates";
import { listPublicMedia } from "@/services/public-media";
import { SITE } from "@/constants/site";

/**
 * Founder's Profile — mirrors the live /founders-profile/ page.
 *
 * All body copy is reproduced from the live WordPress page so the rebuild
 * says exactly what the site it replaces says: the intro, the seven profile
 * sections, "Achievements and Impact" and the contact line. The only
 * presentation additions are kickers/section labels in the site's template
 * style and the "At a glance" card, whose facts are all drawn from the same
 * live copy. Line-wrap artifacts from the source (e.g. "Sirat-eMustaqeem")
 * are restored to the standard "Sirat-e-Mustaqeem" spelling.
 */

/** Intro paragraph under the live page's "Founder's Profile" heading. */
const FOUNDER_INTRO =
  "Hafiz Muzammil Malik is the visionary founder of Sirat e Mustaqeem Welfare Trust. A Hafiz-e-Quran by heart and a diploma holder in Mechanical Engineering, he combines spiritual values with practical knowledge. With a varied professional background, including work in FM radio and appearances as a model and host on various radio and TV platforms, he has always used his voice and presence to positively influence society. Hafiz Muzammil Malik, deeply connected to his hometown and its people, started this welfare mission out of genuine concern to address real-life challenges and create lasting change in his community.";

/** The seven profile sections, in live-page order (headings without the colon). */
const PROFILE_SECTIONS: readonly {
  title: string;
  paragraphs: readonly string[];
}[] = [
  {
    title: "Motivation and Vision",
    paragraphs: [
      "Muzammil founded Sirat e Mustaqeem Welfare Trust in 2017 with a strong passion to support the less fortunate people in his hometown. His vision is to guide and empower the youth by helping them set clear goals in life and use their skills to earn a living. At the same time, he believes in using those talents to bring positive change to the community. His mission focuses on youth development, self-reliance, and creating a better future for all.",
    ],
  },
  {
    title: "Skills and Experience",
    paragraphs: [
      "With a strong background in media and public speaking, Muzammil brings important skills to Sirat-e-Mustaqeem Welfare Trust. His caring nature and dedication help guide the organization's plans and work. His experience ensures that the trust runs effectively and reaches those who need help the most.",
    ],
  },
  {
    title: "Strong Leadership and Teamwork",
    paragraphs: [
      "Muzammil is a true leader known for his clear communication and ability to motivate others. He guides Sirat-e-Mustaqeem Welfare Trust with a clear vision, strong determination, and a teamwork-focused style. His leadership inspires both the team and donors to join hands and work towards the shared mission of reducing poverty and empowering young people in the community.",
    ],
  },
  {
    title: "Building Connections and Promoting Change",
    paragraphs: [
      "Muzammil is a strong supporter of fighting poverty and empowering young people. He actively works with important leaders and officials in his community to create positive change. Through his efforts in forming valuable partnerships, he has helped the Sirat-e-Mustaqeem Welfare Trust reach more people and make a bigger difference in the lives of those in need.",
    ],
  },
  {
    title: "Community Support and Fundraising",
    paragraphs: [
      "Muzammil is deeply committed to sustainable social development. He has played a key role in raising funds for Sirat-e-Mustaqeem Welfare Trust by engaging local donors. His consistent efforts have helped maintain the financial stability of the organization, ensuring that its welfare projects continue without interruption.",
    ],
  },
  {
    title: "Overcoming Struggles with Strength and Patience",
    paragraphs: [
      "Muzammil has faced many challenges, including resistance and setbacks during his welfare journey. But with a positive mindset and flexible approach, he always found solutions. His strong will and never-give-up attitude have helped Sirat-e-Mustaqeem Welfare Trust grow and continue its mission to support poor and deserving families.",
    ],
  },
  {
    title: "Future Goals and Community Vision",
    paragraphs: [
      "Muzammil dreams of seeing Orangi Town and all of Pakistan grow stronger, with less poverty and more opportunities for everyone. He believes the youth hold the power to bring real change. With this hope, he stays dedicated to Sirat-e-Mustaqeem Welfare Trust's mission and plans to expand its work so even more lives can be improved across the country.",
    ],
  },
];

/** Live "Achievements and Impact" copy — both paragraphs. */
const ACHIEVEMENTS_PARAGRAPHS: readonly string[] = [
  "Under the leadership of Hafiz Muzammil Malik, Sirat-e-Mustaqeem Welfare Trust has made a real difference in the lives of people, especially in his hometown and underprivileged villages across Pakistan. Through his vision and hard work, the Trust has launched several impactful projects like the Sasta Khana Project, Free Schooling System, Health Care Services, Hunarmand Beti Project, Marriage Support Program, Rozgar Project, Ambulance Services, Qurbani Barae Waqaf, Monthly Raashan Support Program, Sirat ul Quran Academy, Winter Relief, Tree for Tomorrow (Plantation Campaign), Flood Relief Mission, Iftaar Dastarkhawan, Free Eid Shopping, Heat Stroke Camp, Home & Masjid Renovation, Rehmat-e-Ramadan Rashan Program, Zahanat Outreached Scholars Program. These efforts have earned national recognition and touched thousands of lives.",
  "During the COVID-19 crisis, Muzammil and his dedicated team stepped up to support daily wage earners who were struggling to feed their families. Again, during the 2022 floods, they reached out to flood-hit villages with essential supplies like food, medicines, winter clothing, and daily use items, standing beside those who needed it most.",
];

/**
 * Founder portrait — client-provided photo of Hafiz Muzammil Malik
 * (`muzammil-smwelfare.jpg`, 1200×750 JPEG) served from public/images.
 */
const FOUNDER_IMAGE = {
  src: "/images/muzammil-smwelfare.jpg",
  alt: "Hafiz Muzammil Malik, founder of Sirat e Mustaqeem Welfare Trust",
  width: 1200,
  height: 750,
};

/** "At a glance" sidebar — every value is drawn from the live copy above. */
const FOUNDER_FACTS: readonly { label: string; value: React.ReactNode }[] = [
  { label: "Role", value: "Founder, Sirat e Mustaqeem Welfare Trust" },
  { label: "Founded", value: "Sirat e Mustaqeem Welfare Trust, 2017" },
  {
    label: "Education",
    value: "Hafiz-e-Quran · Diploma in Mechanical Engineering",
  },
  { label: "Background", value: "FM radio, model and TV host" },
  { label: "Hometown", value: "Orangi Town, Karachi" },
  {
    label: "Contact",
    value: (
      <a
        href={`tel:${SITE.phone2.replace(/\s/g, "")}`}
        className="text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {SITE.phone2}
      </a>
    ),
  },
];

/**
 * Certificate fallback — the curated local copies of the live /about-us/
 * certificates, used when the public media API is unreachable so the section
 * is never left empty.
 */
const FALLBACK_CERTIFICATES: readonly CertificateItem[] = CERTIFICATES.map(
  (certificate) => ({
    id: certificate.slug,
    title: certificate.title,
    description: certificate.description,
    src: certificate.image.src,
    width: certificate.image.width,
    height: certificate.image.height,
  }),
);

/**
 * Live-page order for the certificates, keyed by the stored original filename.
 * The media list is returned newest-first, so the API result is re-sorted to
 * match the curated (live) order instead of showing it reversed.
 */
const CERTIFICATE_ORDER = new Map(
  CERTIFICATES.map((certificate, index) => [certificate.file, index]),
);

/**
 * Loads the trust's certificates from the public media API, scoped to the
 * certificates Cloudinary folder. Falls back to the curated local copies when
 * the API is unavailable (e.g. during a build without the server running).
 */
async function fetchCertificates(): Promise<readonly CertificateItem[]> {
  try {
    const result = await listPublicMedia({
      folder: CERTIFICATES_FOLDER,
      limit: 40,
      page: 1,
    });
    const items = [...result.items]
      .sort(
        (a, b) =>
          (CERTIFICATE_ORDER.get(a.originalFilename ?? "") ??
            Number.MAX_SAFE_INTEGER) -
          (CERTIFICATE_ORDER.get(b.originalFilename ?? "") ??
            Number.MAX_SAFE_INTEGER),
      )
      .map((media) => ({
        id: media.id,
        title: media.title ?? media.originalFilename ?? "Certificate",
        description: media.description ?? "",
        src: media.secureUrl,
        width: media.width,
        height: media.height,
      }));
    return items.length > 0 ? items : FALLBACK_CERTIFICATES;
  } catch (err) {
    console.error("[Founder's Profile] Failed to fetch certificates:", err);
    return FALLBACK_CERTIFICATES;
  }
}

export const metadata: Metadata = {
  title: "Founder's Profile",
  description:
    "Hafiz Muzammil Malik is the visionary founder of Sirat e Mustaqeem Welfare Trust — a Hafiz-e-Quran and diploma holder in Mechanical Engineering who started this welfare mission in 2017 to create lasting change for poor and deserving families.",
  openGraph: {
    title: "Founder's Profile | SM Welfare Trust",
    description:
      "Meet Hafiz Muzammil Malik — the visionary founder of Sirat e Mustaqeem Welfare Trust, serving poor and deserving families since 2017.",
  },
  twitter: {
    title: "Founder's Profile | SM Welfare Trust",
    description:
      "Meet Hafiz Muzammil Malik — the visionary founder of Sirat e Mustaqeem Welfare Trust, serving poor and deserving families since 2017.",
  },
};

export default async function FoundersProfilePage() {
  const certificates = await fetchCertificates();

  return (
    <>
      <PageHero
        title="Founder's Profile"
        description="Hafiz Muzammil Malik is the visionary founder of Sirat e Mustaqeem Welfare Trust — a Hafiz-e-Quran and diploma holder in Mechanical Engineering who started this welfare mission in 2017 to create lasting change in his community."
      />

      {/* Live intro copy + at-a-glance facts card */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="flex flex-col gap-5">
            <SectionHeading
              kicker="Our founder"
              title="Hafiz Muzammil Malik"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {FOUNDER_INTRO}
            </p>
          </Reveal>

          <div className="flex h-fit flex-col gap-6 lg:sticky lg:top-24">
            {/* Founder portrait — same rounded-frame treatment as the About page image */}
            <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={FOUNDER_IMAGE.src}
                alt={FOUNDER_IMAGE.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-section p-6 shadow-sm sm:p-8">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                At a glance
              </h2>
              <ul className="flex flex-col gap-4">
                {FOUNDER_FACTS.map((fact) => (
                  <li key={fact.label} className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {fact.label}
                    </span>
                    <span className="text-sm font-semibold">{fact.value}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Container>
      </section>

      {/* The seven profile sections as numbered editorial rows */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="The journey"
            title="What drives the mission"
            description="Motivation and vision, skills and experience, leadership, partnerships, fundraising, resilience and future goals."
          />
          <div className="mx-auto flex w-full max-w-4xl flex-col">
            {PROFILE_SECTIONS.map((section, index) => (
              <Reveal
                as="article"
                key={section.title}
                // The row itself is the reveal element (not a wrapper), so the
                // `first:`/`last:` border and padding rules keep matching the
                // real siblings inside this list.
                className="grid gap-4 border-b border-border py-8 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-3xl font-bold text-primary/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    {section.title}
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="text-base leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Live "Achievements and Impact" copy */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-8 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Recognition"
            title="Achievements and Impact"
          />
          <Reveal className="mx-auto flex max-w-3xl flex-col gap-4">
            {ACHIEVEMENTS_PARAGRAPHS.map((paragraph) => (
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

      {/* Certificates & registrations — the four certificates the live
          /about-us/ page publishes, served from Cloudinary via the public
          media API (curated local images as fallback). */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Registered & recognized"
            title="Certificates"
            description="Official registrations and recognition certificates of Sirat-e-Mustaqeem Welfare Trust."
          />
          <div className="mx-auto w-full max-w-6xl">
            <CertificateGallery certificates={certificates} />
          </div>
        </Container>
      </section>

      {/* Live "Contact Information" line — same number as the site constants */}
      <section className="border-t border-border bg-section">
        <Container className="py-14 sm:py-16">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-white px-6 py-10 text-center shadow-sm sm:px-12">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HiPhone className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Contact Information
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              For inquiries or collaboration opportunities, Muzammil can be
              contacted at{" "}
              <a
                href={`tel:${SITE.phone2.replace(/\s/g, "")}`}
                className="font-semibold text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SITE.phone2}
              </a>
              .
            </p>
          </Reveal>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
