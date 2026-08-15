import { TopBar } from "@/components/shared/top-bar";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/** Public marketing-site shell shared by all public pages. */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TopBar />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
