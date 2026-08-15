import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "Our Projects",
  description:
    "Programmes built around real, daily needs — Sasta Khana, free schooling, healthcare, vocational training and more.",
};

export default function ProjectsPage() {
  return (
    <PagePlaceholder
      kicker="What we run"
      title="Programmes built around real, daily needs"
      description="Each project answers a problem our team sees on the ground in Karachi — a missed meal, a lost school year, an untreated illness, a skill never learned."
      plannedFor="the Projects page phase"
    />
  );
}
