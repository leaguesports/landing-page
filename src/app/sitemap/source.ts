import type { SitemapDataSource } from "@/app/sitemap/entries";
import {
  SITEMAP_EVENTS_QUERY,
  SITEMAP_GUIDES_QUERY,
  SITEMAP_LOCATIONS_QUERY,
  SITEMAP_METRO_PAGES_QUERY,
  SITEMAP_SERIES_QUERY,
  SITEMAP_SPORTS_QUERY,
  SITEMAP_VENUES_QUERY,
} from "@/app/sitemap/queries";

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

async function fetchFresh<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const { sanityClient } = await import("@/sanity/client");
  const client = sanityClient.withConfig({ useCdn: false });
  return client.fetch<T>(query, params);
}

export function createCmsSource(): SitemapDataSource {
  return {
    async getVenues() {
      if (!isSanityConfigured()) return [];
      return withTimeout(
        "venues",
        async () => {
          const rows = await fetchFresh<
            { slug: string | null; updatedAt: string | null }[]
          >(SITEMAP_VENUES_QUERY);
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
          const rows = await fetchFresh<
            { slug: string | null; updatedAt: string | null }[]
          >(SITEMAP_GUIDES_QUERY);
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
          const { mergeMetroPageLastmods } = await import(
            "@/lib/intent/indexed-pairs"
          );
          const rows = await listIndexedIntentPairs(intent);
          let metroPages: {
            intent?: string | null;
            activitySlug?: string | null;
            citySlug?: string | null;
            updatedAt?: string | null;
          }[] = [];
          try {
            const fetched = await fetchFresh<typeof metroPages>(
              SITEMAP_METRO_PAGES_QUERY,
              { intent },
            );
            metroPages = Array.isArray(fetched) ? fetched : [];
          } catch (error) {
            console.error("[sitemap] metro pages failed", error);
          }
          return mergeMetroPageLastmods(
            intent,
            Array.isArray(rows) ? rows : [],
            metroPages,
          );
        },
        [],
      );
    },
    async getFixtures() {
      if (!isSanityConfigured()) return [];
      return withTimeout(
        "fixtures",
        async () => {
          const { toPublishedEventSitemapRows } = await import(
            "@/lib/events/sitemap"
          );
          const rows = await fetchFresh<
            {
              title?: string | null;
              startsAt?: string | null;
              updatedAt?: string | null;
              seoIntro?: string | null;
              localAngle?: string | null;
              faqs?: { question?: string | null; answer?: string | null }[] | null;
            }[]
          >(SITEMAP_EVENTS_QUERY);
          return toPublishedEventSitemapRows(Array.isArray(rows) ? rows : []);
        },
        [],
      );
    },
    async getActivityHubs() {
      if (!isSanityConfigured()) return [];
      return withTimeout(
        "activity-hubs",
        async () => {
          const [sports, series, locations] = await Promise.all([
            fetchFresh<unknown[]>(SITEMAP_SPORTS_QUERY).catch((error) => {
              console.error("[sitemap] sports failed", error);
              return [];
            }),
            fetchFresh<unknown[]>(SITEMAP_SERIES_QUERY).catch((error) => {
              console.error("[sitemap] series failed", error);
              return [];
            }),
            fetchFresh<unknown[]>(SITEMAP_LOCATIONS_QUERY).catch((error) => {
              console.error("[sitemap] locations failed", error);
              return [];
            }),
          ]);
          return [
            ...(Array.isArray(sports) ? sports : []),
            ...(Array.isArray(series) ? series : []),
            ...(Array.isArray(locations) ? locations : []),
          ] as {
            kind?: string;
            slug?: string;
            updatedAt?: string | null;
            sportSlug?: string | null;
            locationType?: string | null;
            parentSlug?: string | null;
          }[];
        },
        [],
      );
    },
  };
}
