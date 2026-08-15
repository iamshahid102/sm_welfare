import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Navigation } from "@/components/shared/navigation";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { DONATE_HREF } from "@/constants/navigation";

/** Public site header: logo, navigation, primary CTA. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <Navigation className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <a href={DONATE_HREF} className={buttonVariants()}>
            Donate now
          </a>
          <div className="lg:hidden">
            <MobileNavigation />
          </div>
        </div>
      </Container>
    </header>
  );
}
