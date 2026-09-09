import type { SitemapDataSource } from "@/app/sitemap/entries";

const FETCH_TIMEOUT_MS = 12_000;

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

async function withTimeout<T>(
  label: string,
  work: () => Promise<T>,
  fallback: T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      work(),
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${FETCH_TIMEOUT_MS}ms`)),
          FETCH_TIMEOUT_MS,
        );
      }),
    ]);
    return result;
  } catch (error) {
    console.error(`[sitemap] ${label} failed`, error);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function createCmsSource(): SitemapDataSource {
  return {
    async getVenues() {
      if (!isSanityConfigured()) return [];
      return withTimeout(
        "venues",
        async () => {
          const { sanityClient } = await import("@/sanity/client");
          const rows = await sanityClient.fetch<
            { slug: string | null; updatedAt: string | null }[]
          >(`
          *[_type == "venue" && defined(slug.current)] {
            "slug": slug.current,
            "updatedAt": _updatedAt
          }
        `);
          return Array.isArray(rows) ? rows : [];
        },
        [],
      );
    },
    async getGuides() {
      if (!isSanityConfigured()) return [];
      return withTimeout(
        "guides",
        async () => {
          // Dedicated GROQ — do not import listGuides from the guides action
          // module (unguarded Sanity client + catch-all route graph).
          const { sanityClient } = await import("@/sanity/client");
          const rows = await sanityClient.fetch<
            { slug: string | null; updatedAt: string | null }[]
          >(`
          *[_type == "guide" && defined(slug.current) && slug.current != ""] {
            "slug": slug.current,
            "updatedAt": coalesce(_updatedAt, _createdAt)
          }
        `);
          return Array.isArray(rows) ? rows : [];
        },
        [],
      );
    },
    async getIntentPairs(intent) {
      if (!isSanityConfigured()) return [];
      return withTimeout(
        `intent:${intent}`,
        async () => {
          const { listIndexedIntentPairs } = await import("@/lib/intent/data");
          const rows = await listIndexedIntentPairs(intent);
          return Array.isArray(rows) ? rows : [];
        },
        [],
      );
    },
    async getFixtures() {
      if (!isSanityConfigured()) return [];
      return withTimeout(
        "fixtures",
        async () => {
          const { getUpcomingFixtures } = await import("@/services/events");
          const { toIndexableSitemapFixtures } = await import(
            "@/lib/events/sitemap"
          );
          const rows = await getUpcomingFixtures({ limit: 48 });
          return toIndexableSitemapFixtures(Array.isArray(rows) ? rows : []);
        },
        [],
      );
    },
  };
}
