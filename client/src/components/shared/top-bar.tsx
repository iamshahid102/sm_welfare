import { HiEnvelope, HiMapPin, HiPhone } from "react-icons/hi2";
import { SITE } from "@/constants/site";
import { Container } from "@/components/shared/container";
import { SocialLinks } from "@/components/shared/social-links";

/**
 * Top utility bar — dark navy strip per the template.
 * Contact details left, social links right. Values come from the SITE
 * constants (single source of truth) and may later be hydrated from the
 * Site Settings API.
 */
export function TopBar() {
  return (
    <div className="bg-primary-deep text-white">
      <Container className="flex h-10 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5 text-xs text-blue-100">
          <a
            href={`mailto:${SITE.email}`}
            className="hidden items-center gap-1.5 truncate transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex"
          >
            <HiEnvelope className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{SITE.email}</span>
          </a>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <HiPhone className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{SITE.phone}</span>
          </a>
          <a
            href={`tel:${SITE.phone2.replace(/\s/g, "")}`}
            className="hidden items-center gap-1.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:inline-flex"
          >
            <HiPhone className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{SITE.phone2}</span>
          </a>
          <span className="hidden items-center gap-1.5 lg:inline-flex">
            <HiMapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{SITE.location}</span>
          </span>
        </div>
        <SocialLinks light size={14} />
      </Container>
    </div>
  );
}
