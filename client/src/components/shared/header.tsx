"use client";

import Link from "next/link";
import { HiHeart } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Navigation } from "@/components/shared/navigation";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { BTN_PRIMARY_AMBER } from "@/components/shared/home-styles";
import { DONATE_HREF } from "@/constants/navigation";

/**
 * Public site header — white bar so the brand wordmark stays legible.
 *
 * LAYOUT NOTE
 * The menu switches to the horizontal nav at 980px rather than Tailwind's
 * default `lg` (1024px). Windows display scaling (125%) and browser zoom turn a
 * 1366px laptop into ~1090px of CSS width; at 1024 the nav used to disappear and
 * the site fell back to the hamburger on what users still call "desktop". The
 * nav is ~500px wide and the header still has ~35px of slack at 980px, so this
 * is the narrowest width where all six links fit without touching the CTA.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background shadow-sm shadow-black/5">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Logo />
        <Navigation className="hidden min-[980px]:block" />
        <div className="flex items-center gap-1.5">
          <Link
            href={DONATE_HREF}
            className={cn(
              buttonVariants(),
              BTN_PRIMARY_AMBER,
              "hidden h-10 px-5 sm:inline-flex"
            )}
          >
            <HiHeart className="mr-2 size-4" aria-hidden="true" />
            Donate now
          </Link>
          <div className="min-[980px]:hidden">
            <MobileNavigation />
          </div>
        </div>
      </Container>
    </header>
  );
}
