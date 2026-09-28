import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { MediaExplorer } from "@/components/sections/media-explorer";

export const metadata: Metadata = {
  title: "Media Updates",
  description:
    "SM Welfare Trust is one of the most reputable non-profit welfare organisations in Pakistan, dedicated to social development and providing relief to individuals from low-income groups since 2017.",
  openGraph: {
    title: "Media Updates | SM Welfare Trust",
    description:
      "Field reports, blog posts and photographs from the communities SM Welfare Trust serves across Karachi.",
  },
  twitter: {
    title: "Media Updates | SM Welfare Trust",
    description:
      "Field reports, blog posts and photographs from the communities SM Welfare Trust serves across Karachi.",
  },
};

export default function MediaPage() {
  return (
    <>
      <PageHero
        title="Media Updates"
        description="Field reports, blog posts and photographs from the communities we serve across Karachi."
      />
      <MediaExplorer />
    </>
  );
}
