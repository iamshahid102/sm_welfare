import type { Metadata } from "next";
import { HiReceiptPercent, HiScale, HiShieldCheck } from "react-icons/hi2";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { DonationBuilder } from "@/components/sections/donation-builder";

/**
 * Donate page — mirrors the live /donate/ page.
 *
 * The live page carries exactly the heading "Donate Now", the Faysal Bank
 * logo, its account details (Account Title, Account Number, IBAN, Swift Code),
 * the EasyPaisa logo and the Easy Paisa Account No. Every one of those values
 * is reproduced in the donation builder beside those same two logos (see
 * `data/donations.ts` and `data/site-images.ts`) — nothing new is claimed
 * here. The builder's amount presets, project selector and monthly option come
 * from the Donate mockup and are presentation/UX only.
 *
 * The closing band restates the two claims this project already makes about
 * giving — that contributions are receipted and reported, and that funds reach
 * Zakat-eligible families — as three cards, matching the sectioned layout of
 * the rest of the public site.
 */

/**
 * What the page already promises donors, shown as cards. Each point restates
 * copy that was already on this page or in its call-to-action band.
 */
const TRUST_POINTS: readonly {
  title: string;
  description: string;
  icon: typeof HiShieldCheck;
}[] = [
  {
    title: "Receipted",
    description:
      "Every contribution is receipted, so your giving is properly documented.",
    icon: HiReceiptPercent,
  },
  {
    title: "Accounted for",
    description:
      "Every rupee is spent with transparency and accounted for, project by project.",
    icon: HiScale,
  },
  {
    title: "Zakat eligible",
    description:
      "Ration, education and medical funds are distributed to Zakat-eligible families.",
    icon: HiShieldCheck,
  },
];

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Donate to SM Welfare Trust — Faysal Bank account 355430100008288 (IBAN PK48FAYS355430100008288, Swift FAYSPKKA) or EasyPaisa 03152616482. Support food, education, healthcare and social welfare projects serving families across Karachi.",
  openGraph: {
    title: "Donate | SM Welfare Trust",
    description:
      "Give directly — Faysal Bank account 355430100008288, IBAN PK48FAYS355430100008288, Swift FAYSPKKA, or EasyPaisa 03152616482.",
  },
  twitter: {
    title: "Donate | SM Welfare Trust",
    description:
      "Give directly — Faysal Bank account 355430100008288, IBAN PK48FAYS355430100008288, or EasyPaisa 03152616482.",
  },
};

export default function DonatePage() {
  return (
    <>
      <PageHero
        title="Donate Now"
        description="Choose what your giving builds — then pay directly into our Faysal Bank account or EasyPaisa wallet, or confirm with our team on WhatsApp. Every contribution is receipted and reported."
      />

      <section className="bg-white">
        <Container className="py-14 sm:py-16">
          <DonationBuilder />
        </Container>
      </section>

      {/* What this page already promises donors */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Your trust"
            title="Every rupee, accounted for"
            description="Giving through Sirat-e-Mustaqeem Welfare Trust is documented, reported and directed to the families who need it most."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_POINTS.map((point, index) => (
              <Reveal
                as="article"
                key={point.title}
                delay={index * 90}
                className="hover-lift group flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm hover:border-primary/25"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <point.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {point.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
