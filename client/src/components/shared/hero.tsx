import Link from "next/link";
import { HiArrowRight, HiEye, HiHeart } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Kicker } from "@/components/shared/kicker";
import { Stat } from "@/components/shared/stat";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import {
  BTN_PRIMARY_AMBER,
  BTN_OUTLINE_WHITE,
} from "@/components/shared/home-styles";

/**
 * Home hero — blue gradient per the template: amber "Serving since 2017"
 * badge, bold white headline, dual CTAs and a light stat card.
 */
export function Hero() {
  return (
    /*
     * The header is primary-blue on every page (template identity), so the
     * hero sits directly below it as one continuous blue gradient.
     */
    <section className="bg-hero-gradient text-white">
      <Container className="grid items-center gap-12 py-14 pt-16 sm:py-20 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-24 lg:pt-28">
        <div className="flex max-w-xl flex-col items-start gap-5">
          <Kicker pill className="border border-white bg-transparent text-white">Serving since 2017</Kicker>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            From a thought to
            <br className="hidden sm:block" /> a built future
          </h1>
          <p
            lang="ur"
            dir="ltr"
            className="font-heading text-lg font-semibold tracking-wide text-accent/90"
          >
            سوچ سے تعمیر تک
          </p>
          <p className="text-base leading-relaxed text-blue-100 sm:text-lg">
            Sirat-e-Mustaqeem Welfare Trust brings food, education, healthcare
            and skills to families in Karachi who fight each day just to survive
            — so they can live with dignity, confidence and independence.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={DONATE_HREF}
              className={cn(buttonVariants(), BTN_PRIMARY_AMBER, "p-6")}
            >
              <HiHeart className="ml-1.5 size-4" aria-hidden="true" />
              Donate now
              <HiArrowRight className="ml-1.5 size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/projects"
              className={cn(buttonVariants(), BTN_OUTLINE_WHITE, "p-6")}
            >
              <HiEye className="mr-1.5 size-4" aria-hidden="true" />
              Explore our projects
              <HiArrowRight className="ml-1.5 size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Light stat card — hero photo arrives later via Cloudinary. */}
        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <div className="overflow-hidden rounded-2xl bg-white text-foreground shadow-2xl shadow-black/25">
            <div
              className="photo-placeholder aspect-[4/3]"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between gap-4 p-6">
              <Stat value="12,000+" label="Lives touched" />
              <Link
                href="/about"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "shrink-0 rounded-full px-5 py-2 text-xs font-semibold",
                )}
              >
                About us
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
