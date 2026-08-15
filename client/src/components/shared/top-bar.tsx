import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/constants/site";
import { Container } from "@/components/shared/container";
import { SocialLinks } from "@/components/shared/social-links";

/**
 * Top utility bar: contact details + social links.
 * Values come from the SITE constants (single source of truth) and may later
 * be hydrated from the Site Settings API.
 */
export function TopBar() {
  return (
    <div className="border-b bg-primary text-primary-foreground">
      <Container className="flex h-9 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 text-xs">
          <a
            href={`mailto:${SITE.email}`}
            className="hidden items-center gap-1.5 truncate transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          >
            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{SITE.email}</span>
          </a>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{SITE.phone}</span>
          </a>
          <span className="hidden items-center gap-1.5 lg:inline-flex">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{SITE.location}</span>
          </span>
        </div>
        <SocialLinks
          className="[&_a]:text-primary-foreground [&_a:hover]:bg-primary-foreground/10 [&_a:hover]:text-primary-foreground"
          size={14}
        />
      </Container>
    </div>
  );
}
