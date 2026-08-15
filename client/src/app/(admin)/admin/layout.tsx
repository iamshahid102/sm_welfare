import Link from "next/link";
import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Site settings", href: "/admin/site-settings" },
  { label: "Programs", href: "/admin/programs" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Media", href: "/admin/media" },
] as const;

/**
 * Admin shell — foundation only.
 * Authentication, role-gating and the full sidebar will be added in the
 * dedicated authentication/admin phase. The backend remains the security
 * authority; this UI is purely presentational for now.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background">
        <Container className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
          <span className="font-heading text-sm font-semibold">SM Welfare Admin</span>
          <nav aria-label="Admin">
            <ul className="flex flex-wrap items-center gap-1 text-sm">
              {ADMIN_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View site
          </Link>
        </Container>
      </header>
      <main id="main-content" className="flex-1">
        <Container className="py-10">{children}</Container>
      </main>
    </div>
  );
}
