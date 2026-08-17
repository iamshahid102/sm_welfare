import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { DonationBuilder } from "@/components/sections/donation-builder";

export default function DonatePage() {
  return (
    <>
      <PageHero
        kicker="Donate"
        title="Choose what your giving builds"
        description="Pick an amount and a project, then confirm with our team on WhatsApp or by phone. Every contribution is receipted and reported."
      />
      <section className="bg-white">
        <Container className="py-14 sm:py-16">
          <DonationBuilder />
        </Container>
      </section>
    </>
  );
}
