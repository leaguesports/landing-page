import { SPORT_CATALOG } from "@/lib/sports/catalog";
import {
  buildUpcomingFixtures,
  EVENTS_CMS_ON_DAY_QUERY,
  EVENTS_CMS_QUERY,
  EVENTS_SCREENINGS_ON_DAY_QUERY,
  EVENTS_SCREENINGS_QUERY,
  findFixtureBySlug,
  parseFixtureSlug,
  saDayBounds,
  upcomingNotBeforeIso,
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
 * GROQ filters to upcoming kickoffs; JS past-filter remains as defense.
 */
export async function getUpcomingFixtures(
  options: { limit?: number; now?: Date } = {},
): Promise<UpcomingFixture[]> {
  if (!isSanityConfigured()) return [];

  const now = options.now ?? new Date();
  const notBefore = upcomingNotBeforeIso(now);

  try {
    const [screeningVenues, cmsEvents] = await Promise.all([
      sanityClient.fetch<EventsScreeningVenueRow[]>(EVENTS_SCREENINGS_QUERY, {
        notBefore,
      }),
      sanityClient.fetch<EventsCmsEventRow[]>(EVENTS_CMS_QUERY, { notBefore }),
    ]);

    return buildUpcomingFixtures(
      screeningVenues ?? [],
      cmsEvents ?? [],
      SPORT_CATALOG,
      { limit: options.limit ?? 24, now },
    );
  } catch (error) {
    console.error("[events] fixtures fetch failed", error);
    return [];
  }
}

/**
 * Resolve a public /events/[slug] fixture.
 * Day-suffixed slugs query that SA calendar day directly so detail pages
 * are not limited to the truncated upcoming list.
 */
export async function getFixtureBySlug(
  slug: string,
): Promise<UpcomingFixture | null> {
  if (!isSanityConfigured()) return null;

  const { day } = parseFixtureSlug(slug);

  try {
    if (day) {
      const { dayStart, dayEnd } = saDayBounds(day);
      const [screeningVenues, cmsEvents] = await Promise.all([
        sanityClient.fetch<EventsScreeningVenueRow[]>(
          EVENTS_SCREENINGS_ON_DAY_QUERY,
          { dayStart, dayEnd },
        ),
        sanityClient.fetch<EventsCmsEventRow[]>(EVENTS_CMS_ON_DAY_QUERY, {
          dayStart,
          dayEnd,
        }),
      ]);

      const fixtures = buildUpcomingFixtures(
        screeningVenues ?? [],
        cmsEvents ?? [],
        SPORT_CATALOG,
        {
          limit: 48,
          // Day query already scoped — do not drop same-day kickoffs.
          includePast: true,
          now: new Date(dayStart),
        },
      );
      return findFixtureBySlug(fixtures, slug);
    }

    const fixtures = await getUpcomingFixtures({ limit: 48 });
    return findFixtureBySlug(fixtures, slug);
  } catch (error) {
    console.error("[events] fixture-by-slug fetch failed", error);
    return null;
  }
}
