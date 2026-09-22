import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { DonationBuilder } from "@/components/sections/donation-builder";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support SM Welfare Trust — donate to food, education, healthcare and social welfare projects serving families in need across Karachi.",
  openGraph: {
    title: "Donate | SM Welfare Trust",
    description:
      "Donate to SM Welfare Trust — Faysal Bank, IBAN PK48FAYS355430100008288, EasyPaisa 03152616482.",
  },
  twitter: {
    title: "Donate | SM Welfare Trust",
    description:
      "Donate to SM Welfare Trust — food, education, healthcare and social welfare projects serving families in need.",
  },
};

export default function DonatePage() {
  return (
    <>
      <PageHero
        kicker="Donate"
        title="Donate Now"
        description="Choose what your giving builds — then pay directly into our Faysal Bank account or EasyPaisa wallet, or confirm with our team on WhatsApp. Every contribution is receipted and reported."
      />
      <section className="bg-white">
        <Container className="py-14 sm:py-16">
          <DonationBuilder />
        </Container>
      </section>
    </>
  );
}
