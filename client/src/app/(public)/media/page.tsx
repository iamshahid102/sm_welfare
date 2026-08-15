import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "Media Updates",
  description:
    "Reports, field notes and photographs from the communities we serve across Karachi.",
};

export default function MediaPage() {
  return (
    <PagePlaceholder
      kicker="Stories from the field"
      title="What changed this month, in their words"
      description="Reports, field notes and photographs from the communities we serve across Karachi."
      plannedFor="the Media page phase"
    />
  );
}
