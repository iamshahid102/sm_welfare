import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsExplorer } from "@/components/sections/projects-explorer";

export const metadata: Metadata = {
  title: "Our Projects",
  description:
    "SM Welfare Trust is one of the most reputable non-profit welfare organisations in Pakistan, dedicated to social development and providing relief to individuals from low-income groups since 2017.",
  openGraph: {
    title: "Our Projects | SM Welfare Trust",
    description:
      "SM Welfare Trust projects — food, education, healthcare, clean water, employment and social welfare programmes serving families in Karachi.",
  },
  twitter: {
    title: "Our Projects | SM Welfare Trust",
    description:
      "SM Welfare Trust projects — food, education, healthcare, clean water, employment and social welfare programmes.",
  },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        kicker="Our projects"
        title="Projects"
        description="SM Welfare Trust is one of the most reputable non-profit welfare organisations in Pakistan, dedicated to social development and providing relief to individuals from low-income groups since 2017."
      />
      {/* ProjectsExplorer reads ?program=<slug> via useSearchParams, which
          requires a Suspense boundary on a statically rendered page. */}
      <Suspense
        fallback={
          <Container className="flex flex-col gap-8 py-14 sm:py-16">
            <Skeleton className="h-10 w-full max-w-md self-center rounded-full" />
            <Skeleton className="aspect-[16/11] rounded-2xl" />
            <Skeleton className="aspect-[16/11] rounded-2xl" />
          </Container>
        }
      >
        <ProjectsExplorer />
      </Suspense>
    </>
  );
}
