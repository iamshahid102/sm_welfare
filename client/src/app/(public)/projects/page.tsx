import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { ProjectsExplorer } from "@/components/sections/projects-explorer";

export const metadata: Metadata = {
  title: "Our Projects",
  description:
    "Explore SM Welfare Trust projects — food, education, healthcare, clean water, employment and social welfare programmes serving families in Karachi.",
  openGraph: {
    title: "Our Projects | SM Welfare Trust",
    description:
      "Explore SM Welfare Trust projects — food, education, healthcare, clean water, employment and social welfare programmes.",
  },
  twitter: {
    title: "Our Projects | SM Welfare Trust",
    description:
      "Explore SM Welfare Trust projects — food, education, healthcare, clean water, employment and social welfare programmes.",
  },
};

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
