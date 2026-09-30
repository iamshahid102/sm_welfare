import Link from "next/link";
import { HiHeart, HiPhone } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SITE } from "@/constants/site";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import {
  BTN_PRIMARY_BLUE,
  BTN_OUTLINE_DEFAULT,
} from "@/components/shared/home-styles";

/**
 * Donation call-to-action panel per the Home template ("Your donation starts
 * today's meal") — a light panel on white with a Donate now + Talk to our
 * team pair.
 */
export function CtaBand() {
  return (
    <section className="bg-white">
      <Container className="py-14 sm:py-16">
        <Reveal className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-section px-6 py-12 text-center sm:px-12 sm:py-14">
          <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Your donation starts today&apos;s meal
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Every rupee is spent with transparency and accounted for. Choose an
            amount, or speak to our team directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={DONATE_HREF} className={cn(buttonVariants(), BTN_PRIMARY_BLUE)}>
              <HiHeart className="mr-1.5 size-4" aria-hidden="true" />
              Donate now
            </Link>
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT)}
            >
              <HiPhone className="mr-1.5 size-4" aria-hidden="true" />
              Talk to our team
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
