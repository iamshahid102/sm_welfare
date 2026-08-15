import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support SM Welfare Trust — every contribution is receipted and reported.",
};

export default function DonatePage() {
  return (
    <PagePlaceholder
      kicker="Give with confidence"
      title="Choose what your giving builds"
      description="Pick an amount and a project, then confirm with our team. Every contribution is receipted and reported."
      plannedFor="the Donate page phase"
    />
  );
}
