"use client";

import Link from "next/link";
import { HiHeart } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Navigation } from "@/components/shared/navigation";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { DONATE_HREF } from "@/constants/navigation";

/**
 * Public site header — dark navy gradient matching the hero.
 * White logo wordmark and white navigation links for clear contrast.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a1a1a]">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <Navigation light className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <Link
            href={DONATE_HREF}
            className={cn(
              buttonVariants(),
              "rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90",
            )}
          >
            <HiHeart className="mr-1.5 size-4" aria-hidden="true" />
            Donate now
          </Link>
          <div className="lg:hidden">
            <MobileNavigation />
          </div>
        </div>
      </Container>
    </header>
  );
}