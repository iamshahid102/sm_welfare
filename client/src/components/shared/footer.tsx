import Link from "next/link";
import { HiEnvelope, HiMapPin, HiPhone } from "react-icons/hi2";
import { SITE } from "@/constants/site";
import { NAV_ITEMS, DONATE_HREF } from "@/constants/navigation";
import { Container } from "@/components/shared/container";
import { SocialLinks } from "@/components/shared/social-links";

/** Footer heading used in the dark footer. */
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading text-sm font-bold uppercase tracking-wider text-white">
      {children}
    </p>
  );
}

/** Public site footer — dark navy gradient per the template. */
export function Footer() {
  return (
    <footer className="bg-footer-gradient text-blue-100">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <p className="font-heading text-lg font-bold text-white">{SITE.name}</p>
          <p className="text-sm leading-relaxed">
            SM Welfare Trust is one of the most reputable non-profit welfare
            organisations in Pakistan, dedicated to social development and
            providing relief to individuals from low-income groups since{" "}
            {SITE.establishedYear}.
          </p>
          <p className="text-xs text-blue-200">{SITE.registrationNote}</p>
          <SocialLinks light className="mt-1" />
        </div>

        <div className="flex flex-col gap-4">
          <FooterHeading>Useful links</FooterHeading>
          <ul className="flex flex-col gap-2.5 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={DONATE_HREF}
                className="font-semibold text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Donate
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <FooterHeading>Contact Info</FooterHeading>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <HiEnvelope className="size-4 shrink-0 text-accent" aria-hidden="true" />
                {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <HiPhone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE.phone2.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <HiPhone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                {SITE.phone2}
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <FooterHeading>Location</FooterHeading>
          <p className="inline-flex items-start gap-2.5 text-sm leading-relaxed">
            <HiMapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            {SITE.address}
          </p>
          <p className="text-xs text-blue-200">
            {SITE.activeProjects} active projects
          </p>
        </div>
      </Container>

      <div className="border-t border-white/15">
        <Container className="flex h-14 items-center justify-center sm:justify-between">
          <p className="text-xs text-blue-200">
            © {new Date().getFullYear()} {SITE.copyrightHolder}. All rights
            reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
