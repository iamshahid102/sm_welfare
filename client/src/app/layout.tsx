import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

/**
 * Typography follows the template's modern sans-serif look:
 * - Inter for body/UI text
 * - Plus Jakarta Sans for headings (bold, geometric, NGO-style)
 * Both are loaded once here and exposed as CSS variables.
 */
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smwelfare.charity"),
  title: {
    default: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
    template: "%s | SM Welfare Trust",
  },
  description:
    "Sirat-e-Mustaqeem Welfare Trust (SM Welfare) is a registered welfare organisation in Karachi, Pakistan, serving food, education and healthcare to families in need since 2017.",
  // Browser/title branding: the favicon icon.png is served from app/icon.png
  // (the SM Welfare logo mark) alongside the legacy favicon.ico fallback.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SM Welfare Trust",
    title: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
    description:
      "Sirat-e-Mustaqeem Welfare Trust (SM Welfare) is a registered welfare organisation in Karachi, Pakistan, serving food, education and healthcare to families in need since 2017.",
    images: [{ url: "/icon.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
    description:
      "Sirat-e-Mustaqeem Welfare Trust (SM Welfare) is a registered welfare organisation in Karachi, Pakistan, serving food, education and healthcare to families in need since 2017.",
    images: [{ url: "/icon.png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
