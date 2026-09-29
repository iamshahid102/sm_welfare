import Link from "next/link";
import {
  HiArrowRight,
  HiCheckBadge,
  HiChatBubbleLeftRight,
  HiEnvelope,
  HiHeart,
  HiMapPin,
  HiPhone,
  HiSparkles,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/constants/site";
import { NAV_ITEMS, DONATE_HREF } from "@/constants/navigation";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { SocialLinks } from "@/components/shared/social-links";
import { BTN_PRIMARY_AMBER } from "@/components/shared/home-styles";
import { cn } from "@/lib/utils";

/**
 * Public site footer — dark navy gradient per the template.
 *
 * BRAND LOCKUP
 * The brand column used to print the organisation name as text. It now renders
 * the same wordmark the header uses (`Logo`, i.e. `public/smwelfare.png`).
 * That file is a DARK mark (it is built to sit on the header's white bar), so
 * on this gradient it is placed on a white rounded chip — legible exactly as
 * it is in the navbar, without needing a second, white-only logo file.
 *
 * CONTENT
 * Everything the footer already carried is still here — the organisation
 * description, the full menu as "Useful links", both phone numbers, the email
 * address and the postal address. The redesign is presentation only: an amber
 * accent rule, headings with an accent underline, icon tiles for the contact
 * details, a WhatsApp shortcut, the Donate CTA and a registration badge in the
 * bottom bar. No new claims are made about the Trust.
 */

/** Section heading with the amber accent underline used across the footer. */
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">
        {children}
      </p>
      <span className="h-0.5 w-8 rounded-full bg-accent" aria-hidden="true" />
    </div>
  );
}

/** Icon tile + label + value row shared by the contact and location columns. */
function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof HiEnvelope;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-accent transition-colors group-hover:border-accent/40 group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200/70">
          {label}
        </span>
        <span className="break-words text-sm font-medium text-blue-50 transition-colors group-hover:text-white">
          {value}
        </span>
      </span>
    </>
  );

  const classes =
    "group -m-1.5 flex items-start gap-3 rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

  if (!href) {
    return <div className={classes}>{body}</div>;
  }

  return (
    <a href={href} className={cn(classes, "hover:bg-white/5")}>
      {body}
    </a>
  );
}

export function Footer() {
  const phoneHref = `tel:${SITE.phone.replace(/\s/g, "")}`;
  const phone2Href = `tel:${SITE.phone2.replace(/\s/g, "")}`;
  const whatsappHref = `https://wa.me/${SITE.phone.replace(/\D/g, "")}`;

  return (
    <footer className="bg-footer-gradient text-blue-100">
      {/* Amber accent rule separating the page from the footer */}
      <div
        className="h-px w-full bg-linear-to-r from-transparent via-accent/60 to-transparent"
        aria-hidden="true"
      />

      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1.15fr_1.1fr] lg:gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-5">
          {/* The navbar wordmark on a light chip so it stays legible here. */}
          <div className="inline-flex w-fit items-center rounded-xl bg-white px-4 py-3 shadow-lg shadow-black/20 ring-1 ring-white/25">
            <Logo priority={false} />
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-blue-100/85">
            SM Welfare Trust is one of the most reputable non-profit welfare
            organisations in Pakistan, dedicated to social development and
            providing relief to individuals from low-income groups since{" "}
            {SITE.establishedYear}.
          </p>

          <SocialLinks light className="-ml-1.5" />
        </div>

        {/* Useful links — the full menu, in two compact columns */}
        <div className="flex flex-col gap-5">
          <FooterHeading>Useful links</FooterHeading>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm lg:grid-cols-1 xl:grid-cols-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 rounded-sm text-blue-100/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {item.label}
                  <HiArrowRight
                    className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={DONATE_HREF}
                className="group inline-flex items-center gap-1.5 rounded-sm font-semibold text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Donate
                <HiArrowRight
                  className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-5">
          <FooterHeading>Contact info</FooterHeading>
          <div className="flex flex-col gap-4">
            <ContactRow
              icon={HiEnvelope}
              label="Email"
              value={SITE.email}
              href={`mailto:${SITE.email}`}
            />
            <ContactRow
              icon={HiPhone}
              label="Phone"
              value={SITE.phone}
              href={phoneHref}
            />
            <ContactRow
              icon={HiPhone}
              label="Phone 2"
              value={SITE.phone2}
              href={phone2Href}
            />
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-blue-50 transition-colors hover:border-accent/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <HiChatBubbleLeftRight className="size-4 text-accent" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Location + giving */}
        <div className="flex flex-col gap-5">
          <FooterHeading>Location</FooterHeading>
          <ContactRow
            icon={HiMapPin}
            label="Address"
            value={SITE.address}
          />
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-blue-50">
            <HiSparkles className="size-4 text-accent" aria-hidden="true" />
            {SITE.activeProjects} active projects
          </p>
          <Link
            href={DONATE_HREF}
            className={cn(buttonVariants(), BTN_PRIMARY_AMBER, "group w-fit")}
          >
            <HiHeart className="mr-2 size-4" aria-hidden="true" />
            Donate now
            <HiArrowRight
              className="ml-2 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/15">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-blue-100/80">
            © {new Date().getFullYear()} {SITE.copyrightHolder}. All rights
            reserved.
          </p>
          <p className="inline-flex items-center gap-2 text-xs text-blue-100/80">
            <HiCheckBadge className="size-4 text-accent" aria-hidden="true" />
            {SITE.registrationNote}
          </p>
        </Container>
      </div>
    </footer>
  );
}
