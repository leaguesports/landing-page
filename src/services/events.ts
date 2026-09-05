import { SPORT_CATALOG } from "@/lib/sports/catalog";
import {
  buildUpcomingFixtures,
  EVENTS_CMS_QUERY,
  EVENTS_SCREENINGS_QUERY,
  findFixtureBySlug,
  type EventsCmsEventRow,
  type EventsScreeningVenueRow,
  type UpcomingFixture,
} from "@/lib/sports/events-feed";
import { sanityClient } from "@/sanity/client";

export type { UpcomingFixture } from "@/lib/sports/events-feed";

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

/**
 * Upcoming big-game fixtures for marketing + /events.
 * Built from venue screenings (where to watch) plus CMS event docs.
 */
export async function getUpcomingFixtures(
  options: { limit?: number; now?: Date } = {},
): Promise<UpcomingFixture[]> {
  if (!isSanityConfigured()) return [];

  try {
    const [screeningVenues, cmsEvents] = await Promise.all([
      sanityClient.fetch<EventsScreeningVenueRow[]>(EVENTS_SCREENINGS_QUERY),
      sanityClient.fetch<EventsCmsEventRow[]>(EVENTS_CMS_QUERY),
    ]);

    return buildUpcomingFixtures(
      screeningVenues ?? [],
      cmsEvents ?? [],
      SPORT_CATALOG,
      { limit: options.limit ?? 24, now: options.now },
    );
  } catch (error) {
    console.error("[events] fixtures fetch failed", error);
    return [];
  }
}

export async function getFixtureBySlug(
  slug: string,
): Promise<UpcomingFixture | null> {
  const fixtures = await getUpcomingFixtures({ limit: 48 });
  return findFixtureBySlug(fixtures, slug);
}
