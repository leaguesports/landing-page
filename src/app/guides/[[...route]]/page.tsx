import { urlFor } from "@/sanity/client";
import { notFound } from "next/navigation";
import { GuideDetail } from "./_components/GuideDetail";
import { GuidesIndex } from "./_components/GuidesIndex";
import { getGuideBySlug, listGuides } from "./actions";

type GuidesPageParams = { route?: string[] };

const INDEX_DESCRIPTION =
  "Local tips for fans and players across South Africa.";

export async function generateMetadata({
  params,
}: {
  params: Promise<GuidesPageParams>;
}) {
  const guideSlug = (await params).route?.[0];

  if (!guideSlug) {
    return {
      title: "Guides",
      description: INDEX_DESCRIPTION,
      openGraph: {
        title: "Guides",
        description: INDEX_DESCRIPTION,
      },
      twitter: {
        card: "summary",
        title: "Guides",
        description: INDEX_DESCRIPTION,
      },
      alternates: {
        canonical: "/guides",
      },
      robots: {
        index: true,
        follow: true,
      },
      keywords: ["guides", "LeagueSports", "sports", "South Africa"],
    };
  }

  const guide = await getGuideBySlug(guideSlug);

  if (!guide) {
    return notFound();
  }

  const imageUrl = urlFor(guide.mainImage)?.url() ?? "";

  return {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: [guide.title, ...guide.keywords, "LeagueSports"],
  };
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<GuidesPageParams>;
}) {
  const guideSlug = (await params).route?.[0];

  if (!guideSlug) {
    return <GuidesIndex guides={await listGuides()} />;
  }

  const guide = await getGuideBySlug(guideSlug);

  if (!guide) {
    return notFound();
  }

  return <GuideDetail guide={guide} />;
}
