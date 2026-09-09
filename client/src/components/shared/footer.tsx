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
            One of the most reputable non-profit welfare organisations in
            Pakistan, dedicated to social development and relief for low-income
            families since {SITE.establishedYear}.
          </p>
          <p className="text-xs text-blue-200">{SITE.registrationNote}</p>
          <SocialLinks light className="mt-1" />
        </div>

        <div className="flex flex-col gap-4">
          <FooterHeading>Useful links</FooterHeading>
          <ul className="flex flex-col gap-2.5 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={DONATE_HREF}
                className="font-semibold text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Donate
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <FooterHeading>Get in touch</FooterHeading>
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
            <li className="inline-flex items-center gap-2.5">
              <HiMapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
              {SITE.location}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed">
            {SITE.activeProjects} active projects
          </p>
          <p className="text-xs text-blue-200">{SITE.registrationNote}</p>
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
