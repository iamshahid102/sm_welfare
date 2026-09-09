import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { ContactForm } from "@/components/sections/contact-form";
import { SITE } from "@/constants/site";
import { getPublicSiteSettings } from "@/services/public-site-settings";
import { cn } from "@/lib/utils";

export default async function ContactPage() {
  // Fetch public site-settings; fall back to static SITE constants
  const settings = await getPublicSiteSettings();

  const email = settings?.contact?.email ?? SITE.email;
  const phone = settings?.contact?.phone ?? SITE.phone;
  const location = settings?.contact?.address ?? SITE.location;

  const phoneDigits = phone.replace(/\D/g, "");

  const contactItems: ReadonlyArray<{
    icon: typeof Mail;
    label: string;
    value: string;
    href?: string;
  }> = [
    {
      icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: location,
    },
  ];

  return (
    <>
      <PageHero
        kicker="Contact"
        title="We answer every message"
        description="Whether you want to donate, volunteer, or request assistance for a family — our team in Karachi is one message away."
      />
      <section className="bg-white">
        <Container className="grid gap-8 py-14 sm:py-16 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Reach us directly */}
          <div className="flex h-fit flex-col gap-6 rounded-2xl border border-border bg-section p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Reach us directly
            </h2>
            <ul className="flex flex-col gap-4">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      className="flex items-center gap-3 rounded-lg p-2 -m-2 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon className="size-4.5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </span>
                        <span className="block text-sm font-semibold">
                          {value}
                        </span>
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon className="size-4.5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </span>
                        <span className="block text-sm font-semibold">
                          {value}
                        </span>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#25D366] hover:bg-[#1fb457]",
              )}
            >
              <MessageCircle className="mr-1.5 size-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>

          <ContactForm />
        </Container>
      </section>
    </>
  );
}
