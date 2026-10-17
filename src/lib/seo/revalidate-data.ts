import {
  REVALIDATE_METRO_FOR_ACTIVITY_QUERY,
  REVALIDATE_VENUES_IN_LOCATION_QUERY,
  REVALIDATE_VENUES_WITH_SCREENINGS_QUERY,
} from "../../app/sitemap/queries.ts";
import { sanityClient } from "../../sanity/client.ts";
import type {
  MetroPageRef,
  PublishedDoc,
  RelatedPages,
  VenuePageRow,
} from "./published-pages.ts";

function sanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

function freshClient() {
  return sanityClient.withConfig({ useCdn: false });
}

export async function loadRelatedForRevalidate(
  doc: PublishedDoc,
): Promise<RelatedPages> {
  if (!sanityConfigured()) return {};

  try {
    const client = freshClient();
    if (doc.type === "event") {
      const venues = await client.fetch<VenuePageRow[]>(
        REVALIDATE_VENUES_WITH_SCREENINGS_QUERY,
      );
      return { screeningVenues: Array.isArray(venues) ? venues : [] };
    }
    if (doc.type === "location" && doc.slug) {
      const venues = await client.fetch<VenuePageRow[]>(
        REVALIDATE_VENUES_IN_LOCATION_QUERY,
        { slug: doc.slug },
      );
      return { locationVenues: Array.isArray(venues) ? venues : [] };
    }
    if ((doc.type === "sport" || doc.type === "series") && doc.slug) {
      const metroPages = await client.fetch<MetroPageRef[]>(
        REVALIDATE_METRO_FOR_ACTIVITY_QUERY,
        { slug: doc.slug },
      );
      return { metroPages: Array.isArray(metroPages) ? metroPages : [] };
    }
    return {};
  } catch (error) {
    console.error("[revalidate] related pages lookup failed", error);
    return {};
  }
}
