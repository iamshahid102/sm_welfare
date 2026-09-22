import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { FormsExplorer } from "@/components/sections/forms-explorer";

export const metadata: Metadata = {
  title: "Forms",
  description:
    "SM Welfare Trust is one of the most reputable non-profit welfare organisations in Pakistan — apply online for vocational admission, IT and vocational training, employment, free education and Sirat ul Quran Academy.",
  openGraph: {
    title: "Forms | SM Welfare Trust",
    description:
      "Apply and register online with SM Welfare Trust — vocational admission, IT and vocational training, employment, free education and Sirat ul Quran Academy forms.",
  },
  twitter: {
    title: "Forms | SM Welfare Trust",
    description:
      "Apply and register online with SM Welfare Trust — vocational admission, IT and vocational training, employment, free education and Sirat ul Quran Academy forms.",
  },
};

export default function FormsPage() {
  return (
    <>
      <PageHero
        kicker="Forms"
        title="Forms"
        description="Choose the programme you are interested in, fill in the form and our team in Karachi will get back to you."
      />
      <FormsExplorer />
    </>
  );
}
