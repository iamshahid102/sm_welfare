import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/constants/site";
import { NAV_ITEMS, DONATE_HREF } from "@/constants/navigation";
import { Container } from "@/components/shared/container";
import { SocialLinks } from "@/components/shared/social-links";

/** Public site footer. Values come from SITE constants (Site Settings later). */
export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-lg font-semibold">{SITE.name}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            One of the most reputable non-profit welfare organisations in
            Pakistan, dedicated to social development and relief for low-income
            families since {SITE.establishedYear}.
          </p>
          <p className="text-xs text-muted-foreground">{SITE.registrationNote}</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Useful links</p>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={DONATE_HREF}
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Donate
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Get in touch</p>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                {SITE.phone}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {SITE.location}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Follow us</p>
          <SocialLinks />
          <p className="mt-2 text-xs text-muted-foreground">
            {SITE.activeProjects} active projects
          </p>
        </div>
      </Container>

      <div className="border-t">
        <Container className="flex h-12 items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.copyrightHolder}. All rights
            reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
