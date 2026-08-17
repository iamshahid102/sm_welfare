import { PageHero } from "@/components/shared/page-hero";
import { ProjectsExplorer } from "@/components/sections/projects-explorer";

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        kicker="Our projects"
        title="Programmes built around real, daily needs"
        description="Each project answers a problem our team sees on the ground in Karachi — a missed meal, a lost school year, an untreated illness, a skill never learned."
      />
      <ProjectsExplorer />
    </>
  );
}
