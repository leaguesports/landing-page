import { SPORT_CATALOG } from "@/lib/sports/catalog";
import {
  EVENTS_CMS_BY_SLUG_QUERY,
  findFixtureBySlug,
} from "@/lib/sports/events-path";
import {
  buildUpcomingFixtures,
  cmsEventsToFixtures,
  EVENTS_CMS_ON_DAY_QUERY,
  EVENTS_CMS_QUERY,
  EVENTS_SCREENINGS_ON_DAY_QUERY,
  EVENTS_SCREENINGS_QUERY,
  EVENTS_WATCH_VENUES_FOR_EVENT_QUERY,
  fixtureCalendarDay,
  parseFixtureSlug,
  saDayBounds,
  sortUpcomingFixtures,
  upcomingNotBeforeIso,
  watchVenuesListingEvent,
  type EventsCmsEventRow,
  type EventsScreeningVenueRow,
  type UpcomingFixture,
} from "@/lib/sports/events-feed";
import { uniqueFollowedFixtureSlugs } from "@/lib/sports/hub-feed";
import { sanityClient } from "@/sanity/client";

export type { UpcomingFixture } from "@/lib/sports/events-feed";

/** Cap day-detail lookups when a follow slug is outside the upcoming list. */
const MAX_FOLLOWED_FIXTURE_DETAIL_LOOKUPS = 8;

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

  const [screeningsResult, cmsResult] = await Promise.allSettled([
    sanityClient.fetch<EventsScreeningVenueRow[]>(EVENTS_SCREENINGS_QUERY, {
      notBefore,
    }),
    sanityClient.fetch<EventsCmsEventRow[]>(EVENTS_CMS_QUERY, { notBefore }),
  ]);

  if (screeningsResult.status === "rejected") {
    console.error("[events] screenings fetch failed", screeningsResult.reason);
  }
  if (cmsResult.status === "rejected") {
    console.error("[events] CMS events fetch failed", cmsResult.reason);
  }

  const screeningVenues =
    screeningsResult.status === "fulfilled" ? (screeningsResult.value ?? []) : [];
  const cmsEvents =
    cmsResult.status === "fulfilled" ? (cmsResult.value ?? []) : [];

  return buildUpcomingFixtures(screeningVenues, cmsEvents, SPORT_CATALOG, {
    limit: options.limit ?? 24,
    now,
  });
}

/**
 * Venues are stored on `venue.upcoming_screenings`, not on the event doc.
 * The hub feed is capped, so a detail page can resolve the event with an
 * empty venue list. This read is the reverse map for "Where it's on".
 * A failed lookup leaves whatever the feed already attached.
 */
async function withListedWatchVenues(
  fixture: UpcomingFixture | null,
  identity: { slug?: string; id?: string | null } = {},
): Promise<UpcomingFixture | null> {
  if (!fixture?.title.trim()) return fixture;

  const day = fixtureCalendarDay(fixture.startsAt);
  const bounds = day ? saDayBounds(day) : null;
  try {
    const rows = await sanityClient.fetch<EventsScreeningVenueRow[] | null>(
      EVENTS_WATCH_VENUES_FOR_EVENT_QUERY,
      {
        title: fixture.title,
        startsAt: fixture.startsAt,
        dayStart: bounds?.dayStart ?? null,
        dayEnd: bounds?.dayEnd ?? null,
      },
    );
    const listed = watchVenuesListingEvent(rows ?? [], {
      title: fixture.title,
      startsAt: fixture.startsAt,
      slug: identity.slug || fixture.slug,
      id: identity.id,
    });
    if (listed.length === 0) return fixture;
    return {
      ...fixture,
      venues: listed,
      kind: fixture.kind === "event" ? "both" : fixture.kind,
    };
  } catch (error) {
    console.error("[events] watch-venue reverse lookup failed", error);
    return fixture;
  }
}

/**
 * Resolve a public /events/[slug] fixture.
 * Day-suffixed slugs query that SA calendar day directly so detail pages
 * are not limited to the truncated upcoming list. Watch venues that list
 * the fixture on `upcoming_screenings` are attached afterwards.
 */
export async function getFixtureBySlug(
  slug: string,
): Promise<UpcomingFixture | null> {
  if (!isSanityConfigured()) return null;

  const { day } = parseFixtureSlug(slug);

  try {
    if (day) {
      const { dayStart, dayEnd } = saDayBounds(day);
      const [screeningsResult, cmsResult] = await Promise.allSettled([
        sanityClient.fetch<EventsScreeningVenueRow[]>(
          EVENTS_SCREENINGS_ON_DAY_QUERY,
          { dayStart, dayEnd },
        ),
        sanityClient.fetch<EventsCmsEventRow[]>(EVENTS_CMS_ON_DAY_QUERY, {
          dayStart,
          dayEnd,
        }),
      ]);

      if (screeningsResult.status === "rejected") {
        console.error(
          "[events] day screenings fetch failed",
          screeningsResult.reason,
        );
      }
      if (cmsResult.status === "rejected") {
        console.error("[events] day CMS events fetch failed", cmsResult.reason);
      }

      const screeningVenues =
        screeningsResult.status === "fulfilled"
          ? (screeningsResult.value ?? [])
          : [];
      const cmsEvents =
        cmsResult.status === "fulfilled" ? (cmsResult.value ?? []) : [];

      const fixtures = buildUpcomingFixtures(
        screeningVenues,
        cmsEvents,
        SPORT_CATALOG,
        {
          limit: 48,
          // Day query already scoped — do not drop same-day kickoffs.
          includePast: true,
          now: new Date(dayStart),
        },
      );
      return withListedWatchVenues(findFixtureBySlug(fixtures, slug), { slug });
    }

    const fixtures = await getUpcomingFixtures({ limit: 48 });
    const fromUpcoming = findFixtureBySlug(fixtures, slug);
    if (fromUpcoming) return withListedWatchVenues(fromUpcoming, { slug });

    const cmsEvent = await sanityClient.fetch<EventsCmsEventRow | null>(
      EVENTS_CMS_BY_SLUG_QUERY,
      { slug: slug.trim() },
    );
    if (!cmsEvent) return null;

    const fromCms = cmsEventsToFixtures([cmsEvent], SPORT_CATALOG, {
      includePast: true,
    });
    const eventId = typeof cmsEvent.id === "string" ? cmsEvent.id : null;
    const cmsDay = fromCms[0]
      ? parseFixtureSlug(fromCms[0].slug).day
      : null;
    if (!cmsDay) {
      return withListedWatchVenues(
        findFixtureBySlug(fromCms, slug) ?? fromCms[0] ?? null,
        { slug, id: eventId },
      );
    }

    const { dayStart, dayEnd } = saDayBounds(cmsDay);
    const [screeningsResult, cmsResult] = await Promise.allSettled([
      sanityClient.fetch<EventsScreeningVenueRow[]>(
        EVENTS_SCREENINGS_ON_DAY_QUERY,
        { dayStart, dayEnd },
      ),
      sanityClient.fetch<EventsCmsEventRow[]>(EVENTS_CMS_ON_DAY_QUERY, {
        dayStart,
        dayEnd,
      }),
    ]);
    const screeningVenues =
      screeningsResult.status === "fulfilled"
        ? (screeningsResult.value ?? [])
        : [];
    const cmsEvents =
      cmsResult.status === "fulfilled" ? (cmsResult.value ?? []) : [];
    const dayFixtures = buildUpcomingFixtures(
      screeningVenues,
      cmsEvents,
      SPORT_CATALOG,
      {
        limit: 48,
        includePast: true,
        now: new Date(dayStart),
      },
    );
    return withListedWatchVenues(
      findFixtureBySlug(dayFixtures, slug) ??
        findFixtureBySlug(fromCms, slug) ??
        fromCms[0] ??
        null,
      { slug, id: eventId },
    );
  } catch (error) {
    console.error("[events] fixture-by-slug fetch failed", error);
    return null;
  }
}

/**
 * Resolve followed fixture slugs into UpcomingFixture rows for the hub calendar.
 * Soft-fails missing CMS/screening data — unknown slugs are skipped.
 * Batches via the upcoming list first; day-scoped detail only for leftovers.
 * Pass `upcomingFixtures` to reuse a shared Sanity read (e.g. hub preferences).
 */
export async function resolveFollowedFixtures(
  slugs: Iterable<string> | null | undefined,
  options: {
    now?: Date;
    upcomingFixtures?: UpcomingFixture[] | Promise<UpcomingFixture[]>;
  } = {},
): Promise<UpcomingFixture[]> {
  const unique = uniqueFollowedFixtureSlugs(slugs);
  if (unique.length === 0 || !isSanityConfigured()) return [];

  const now = options.now ?? new Date();

  try {
    const upcoming = options.upcomingFixtures
      ? await Promise.resolve(options.upcomingFixtures)
      : await getUpcomingFixtures({ limit: 48, now });
    const bySlug = new Map(upcoming.map((item) => [item.slug, item]));
    const resolved: UpcomingFixture[] = [];
    const missing: string[] = [];

    for (const slug of unique) {
      const hit = bySlug.get(slug);
      if (hit) resolved.push(hit);
      else missing.push(slug);
    }

    if (missing.length > 0) {
      const detailHits = await Promise.all(
        missing
          .slice(0, MAX_FOLLOWED_FIXTURE_DETAIL_LOOKUPS)
          .map((slug) => getFixtureBySlug(slug)),
      );
      for (const fixture of detailHits) {
        if (fixture) resolved.push(fixture);
      }
    }

    return sortUpcomingFixtures(resolved, now);
  } catch (error) {
    console.error("[events] followed-fixtures resolve failed", error);
    return [];
  }
}
