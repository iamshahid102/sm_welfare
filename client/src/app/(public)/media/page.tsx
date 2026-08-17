import { PageHero } from "@/components/shared/page-hero";
import { MediaExplorer } from "@/components/sections/media-explorer";

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
