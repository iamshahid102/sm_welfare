import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach the SM Welfare Trust team in Karachi — we answer every message.",
};

export default function ContactPage() {
  return (
    <PagePlaceholder
      kicker="We answer every message"
      title="One message away"
      description="Whether you want to donate, volunteer or request assistance for a family — our team in Karachi is one message away."
      plannedFor="the Contact page phase"
    />
  );
}
