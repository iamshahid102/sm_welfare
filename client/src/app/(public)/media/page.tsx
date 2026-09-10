import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { MediaExplorer } from "@/components/sections/media-explorer";

export const metadata: Metadata = {
  title: "Media Updates",
  description:
    "Reports, field notes and photographs from the communities SM Welfare Trust serves across Karachi.",
  openGraph: {
    title: "Media Updates | SM Welfare Trust",
    description:
      "Reports, field notes and photographs from the communities SM Welfare Trust serves across Karachi.",
  },
  twitter: {
    title: "Media Updates | SM Welfare Trust",
    description:
      "Reports, field notes and photographs from the communities SM Welfare Trust serves across Karachi.",
  },
};

export default function MediaPage() {
  return (
    <>
      <PageHero
        kicker="Media updates"
        title="What changed this month, in their words"
        description="Reports, field notes and photographs from the communities we serve across Karachi."
      />
      <MediaExplorer />
    </>
  );
}
