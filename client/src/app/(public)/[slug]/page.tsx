import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPage } from "@/services/public-pages";
import { DetailPage, type DetailPageData } from "@/components/public/detail-page";
import type { PublicProgram, PublicProject } from "@/types/public-api";

/**
 * Dynamic program / project detail route.
 *
 * Every main welfare initiative and every sub-project lives under its own slug
 * (e.g. /hunarmand-beti-project, /ambulance-services). This route resolves the
 * slug against the CMS — programs first, then projects — and renders the rich
 * page the admin edits. Unknown or unpublished slugs fall through to the
 * not-found page.
 *
 * Static routes (about, contact, media, projects, donate, forms, …) always win
 * over this dynamic segment, so they are unaffected.
 */

export const dynamic = "force-dynamic";

type PageRecord = PublicProgram | PublicProject;

async function loadPage(slug: string) {
  try {
    return await getPublicPage(slug);
  } catch {
    return null;
  }
}

function recordOf(page: { program: PublicProgram | null; project: PublicProject | null }): PageRecord | null {
  return page.program ?? page.project;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) {
    return { title: "Page not found" };
  }
  const record = recordOf(page);
  if (!record) {
    return { title: "Page not found" };
  }
  return {
    title: record.title,
    description: record.shortDescription,
    openGraph: {
      title: `${record.title} | SM Welfare Trust`,
      description: record.shortDescription,
    },
    twitter: {
      title: `${record.title} | SM Welfare Trust`,
      description: record.shortDescription,
    },
  };
}

export default async function DynamicPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await loadPage(slug);
  const record = page ? recordOf(page) : null;
  if (!record) {
    notFound();
  }

  const data: DetailPageData = {
    title: record.title,
    tagline: record.tagline,
    shortDescription: record.shortDescription,
    description: record.description,
    coverImage: record.coverImage,
    gallery: record.gallery,
    sections: record.sections,
    highlights: record.highlights,
    facts: record.facts,
    cta: record.cta,
  };

  return <DetailPage data={data} />;
}
