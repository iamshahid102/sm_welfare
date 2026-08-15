import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "Food, Education & Healthcare in Karachi",
  description:
    "SM Welfare Trust provides food, education and healthcare to families in need across Karachi since 2017.",
};

export default function HomePage() {
  return (
    <PagePlaceholder
      kicker="Serving Karachi since 2017"
      title="Charity efforts that are for happiness"
      description="At SM Welfare Charity we believe true happiness lies in giving — food for the hungry, education for orphans and healthcare for those who cannot afford it."
      plannedFor="the Home page phase"
    />
  );
}
