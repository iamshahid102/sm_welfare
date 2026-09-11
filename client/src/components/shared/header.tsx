"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Navigation } from "@/components/shared/navigation";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { DONATE_HREF } from "@/constants/navigation";

/**
 * Public site header: logo, navigation, primary CTA.
 *
 * The header is primary-blue on every page (matching the template, whose logo
 * wordmark is white and only reads on a dark header) and flows seamlessly into
 * the blue hero / page heroes below it. The nav and logo use the white "light"
 * treatment at all times.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-hero-gradient">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <Navigation light className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <Link
            href={DONATE_HREF}
            className={cn(
              buttonVariants(),
              "bg-accent text-accent-foreground hover:bg-accent/90",
            )}
          >
            Donate now
          </Link>
          <div className="lg:hidden">
            <MobileNavigation light />
          </div>
        </div>
      </Container>
    </header>
  );
}