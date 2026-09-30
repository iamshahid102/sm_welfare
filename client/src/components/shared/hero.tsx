import Image from "next/image";
import Link from "next/link";
import { DONATE_HREF } from "@/constants/navigation";
import { SITE } from "@/constants/site";
import { HERO_IMAGE } from "@/data/site-images";

/**
 * Home hero — full-bleed banner treatment copied from the live site.
 *
 * On smwelfare.charity the homepage's very first element is a container
 * whose background is the designed `web-homepageiamge-1.jpg` artwork
 * (natural 1920×1080, `background-position: center; background-repeat:
 * no-repeat;`) linked to `/donate/`, with empty inner markup — the artwork
 * itself carries the headline, stats and donate button, so nothing may be
 * overlaid on its top/bottom edges.
 *
 * CROP-FREE RENDERING (why not `fill` + `object-cover` + min-heights):
 * `object-cover` scales the image until BOTH box dimensions are covered,
 * which shears the artwork's top and bottom whenever the container is wider
 * than 16:9 (e.g. 1920×950) — cutting the logo and the donate button baked
 * into the banner. Instead the image renders at its intrinsic ratio:
 *   - `w-full h-auto` — the box always follows 16:9, so NOTHING is cropped
 *     at any viewport; the hero height naturally matches the live site's
 *     ~1050px desktop presence (1920w → 1080px tall).
 *   - `max-h-[1080px] object-contain` — above 1920px viewports the box stops
 *     growing and the artwork centers with theme-blue sides, which is exactly
 *     what the live site shows (its background never scales past the natural
 *     1920px size; the container's blue bleeds around it).
 * The section's `bg-primary-deep` paints those letterbox sides (the live
 * site uses its own blue #04469e in the same slot).
 *
 * The live markup ships an empty anchor, which is bad for SEO and screen
 * readers, so an sr-only `h1` preserves the document outline while the link
 * carries an explicit `aria-label`. The image is decorative (`alt=""`) because
 * the heading and label already carry the semantics. Rendered through
 * `next/image` (priority) so the 676 KB source goes through the optimizer.
 */
export function Hero() {
  return (
    <section className="relative isolate bg-primary-deep">
      <h1 className="sr-only">
        Welcome to {SITE.name} — food, education and healthcare in Karachi
      </h1>

      <Link
        href={DONATE_HREF}
        aria-label="Donate now — support SM Welfare Trust programmes"
        className="anim-fade-in group relative block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-primary-deep"
      >
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          width={HERO_IMAGE.width}
          height={HERO_IMAGE.height}
          priority
          fetchPriority="high"
          sizes="100vw"
          className="block h-auto w-full max-h-[1080px] object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        />
        {/* Subtle edge scrim so the banner blends into the page below. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-primary-deep/25 to-transparent"
        />
      </Link>
    </section>
  );
}
