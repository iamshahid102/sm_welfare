import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about the mission, vision and promise of Sirat-e-Mustaqeem Welfare Trust.",
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      kicker="Who we are"
      title="A society where no one is left behind"
      description="Our mission is a ray of light in education, healthcare, employment and social welfare for people who fight each day just to survive."
      plannedFor="the About page phase"
    />
  );
}
