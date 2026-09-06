import { sanityClient } from "@/sanity/client";
import {
  isGuideSlug,
  publishedGuides,
  resolveGuideSlug,
} from "@/lib/guides/slugs";
import type { TypedObject } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url";

export type Guide = {
  _id: string;
  _createdAt?: string | null;
  title: string;
  mainImage?: SanityImageSource | null;
  slug: string;
  description: string;
  keywords?: string[] | null;
  content?: TypedObject[] | null;
};

const PUBLISHED_GUIDE_FILTER =
  `_type == "guide" && defined(slug.current) && slug.current != ""`;

const GUIDE_CARD_PROJECTION = `{
  _id,
  _createdAt,
  title,
  description,
  mainImage,
  "slug": slug.current,
  keywords,
}`;

const GUIDE_DETAIL_PROJECTION = `{
  _id,
  title,
  _createdAt,
  mainImage,
  "slug": slug.current,
  description,
  content,
  keywords,
}`;

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

export async function getTopGuides(limit: number = 4): Promise<Guide[]> {
  if (!isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<Guide[]>(
      `*[${PUBLISHED_GUIDE_FILTER}] | order(_createdAt desc) [0...$limit] ${GUIDE_CARD_PROJECTION}`,
      { limit },
    );
    return publishedGuides(rows);
  } catch (error) {
    console.error("[guides] getTopGuides failed", error);
    return [];
  }
}

export async function listGuides(): Promise<Guide[]> {
  if (!isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<Guide[]>(
      `*[${PUBLISHED_GUIDE_FILTER}] | order(_createdAt desc) ${GUIDE_CARD_PROJECTION}`,
    );
    return publishedGuides(rows);
  } catch (error) {
    console.error("[guides] listGuides failed", error);
    return [];
  }
}

async function fetchGuideByExactSlug(slug: string): Promise<Guide | null> {
  const row = await sanityClient.fetch<Guide | null>(
    `*[${PUBLISHED_GUIDE_FILTER} && slug.current == $slug][0] ${GUIDE_DETAIL_PROJECTION}`,
    { slug },
  );
  return row && isGuideSlug(row.slug) ? row : null;
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  if (!isSanityConfigured()) return null;

  const requested = slug.trim().toLowerCase();
  if (!isGuideSlug(requested)) return null;

  try {
    const exact = await fetchGuideByExactSlug(requested);
    if (exact) return exact;

    const candidates = await sanityClient.fetch<
      Array<{ slug?: unknown; title?: unknown }>
    >(
      `*[${PUBLISHED_GUIDE_FILTER}]{ title, "slug": slug.current }`,
    );
    const resolved = resolveGuideSlug(requested, candidates ?? []);
    if (!resolved || resolved === requested) return null;
    return fetchGuideByExactSlug(resolved);
  } catch (error) {
    console.error("[guides] getGuideBySlug failed", error);
    return null;
  }
}
