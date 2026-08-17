"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
 * The home page shows the nav overlaid on the blue hero (template look); all
 * other pages use a solid white header. When the overlay header is scrolled
 * it falls back to a solid white bar so links stay readable.
 */
export function Header() {
  const pathname = usePathname();
  const overlay = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const solid = !overlay || scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-200",
        solid
          ? "border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
          : "bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo light={!solid} />
        <Navigation light={!solid} className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <a
            href={DONATE_HREF}
            className={cn(
              buttonVariants(),
              !solid &&
                "border border-white/30 bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            Donate now
          </a>
          <div className="lg:hidden">
            <MobileNavigation light={!solid} />
          </div>
        </div>
      </Container>
    </header>
  );
}
