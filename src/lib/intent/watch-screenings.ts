import {
  eventsListHref,
  fixtureMatchesEventsSport,
} from "../events/scope.ts";
import { guideHref, isGuideSlug } from "../guides/slugs.ts";
import type { IntentScreeningHighlight } from "./enrichment.ts";
import { resolveSportSlug } from "../sports/catalog.ts";
import { normalizeFixtureKey, type UpcomingFixture } from "../sports/events-feed.ts";
import {
  mergeVenueUpcomingScreenings,
  type MergeVenueScreeningsOptions,
} from "../sports/events-path.ts";

type WatchVenue = {
  name: string;
  slug: string;
  broadcasts?: readonly { slug?: string | null }[] | null;
  upcoming_screenings?:
    | { title?: string | null; startsAt?: string | null; setupTags?: string[] }[]
    | null;
};

export type WatchCalendarRow = IntentScreeningHighlight & {
  venueSlug: string;
};

/** Hub sports this venue actually broadcasts, aliases collapsed. */
export function venueBroadcastSportSlugs(
  broadcasts: readonly { slug?: string | null }[] | null | undefined,
): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const item of broadcasts ?? []) {
    const slug = resolveSportSlug(item?.slug);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
  }
  return slugs;
}

function screeningDedupeKey(venueSlug: string, title: string, startsAt: string): string {
  return `${venueSlug.trim().toLowerCase()}|${normalizeFixtureKey(title, startsAt)}`;
}

/**
 * Calendar rows for `/watch/{sport}/{city}` (and suburb variants).
 * Same fixture at the same venue is one row, even when CMS has duplicate
 * venue documents or repeated `upcoming_screenings` entries.
 */
export function watchCalendarScreenings(
  venues: readonly WatchVenue[],
  fixtures: readonly UpcomingFixture[],
  sportSlug: string,
  now: Date = new Date(),
  limit = 3,
): WatchCalendarRow[] {
  const sport = sportSlug.trim();
  if (!sport) return [];

  const seen = new Set<string>();
  const rows: WatchCalendarRow[] = [];

  for (const venue of venues) {
    const venueSlug = venue.slug.trim();
    const venueName = venue.name.trim();
    if (!venueSlug || !venueName) continue;

    const options: MergeVenueScreeningsOptions = {
      sportSlug: sport,
      broadcastSlugs: venueBroadcastSportSlugs(venue.broadcasts),
    };
    const screenings = mergeVenueUpcomingScreenings(
      venue,
      [...fixtures],
      now,
      options,
    );

    for (const item of screenings) {
      const key = screeningDedupeKey(venueSlug, item.title, item.startsAt);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        title: item.title,
        venueName,
        venueSlug,
        startsAt: item.startsAt,
      });
    }
  }

  rows.sort((a, b) => {
    const aTime = Date.parse(a.startsAt);
    const bTime = Date.parse(b.startsAt);
    if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
      return aTime - bTime;
    }
    const byVenue = a.venueName.localeCompare(b.venueName);
    if (byVenue !== 0) return byVenue;
    return a.title.localeCompare(b.title);
  });

  return rows.slice(0, Math.max(0, limit));
}

export function watchScreeningEmptyCopy(sportName: string): string {
  const name = sportName.trim().toLowerCase() || "this sport";
  return `No upcoming ${name} screenings listed yet`;
}

export function watchEventsHref(sportSlug: string): string {
  return eventsListHref({ sport: sportSlug });
}

function cityNeedles(citySlug: string): string[] {
  if (!citySlug) return [];
  if (citySlug === "johannesburg") return ["johannesburg", "joburg"];
  return [citySlug];
}

function guideRank(slug: string, sportSlug: string, citySlug: string): number {
  const haystack = slug.toLowerCase();
  const sportHit = Boolean(sportSlug) && haystack.includes(sportSlug);
  const cityHit = cityNeedles(citySlug).some((needle) => haystack.includes(needle));
  if (sportHit && cityHit) return 0;
  if (sportHit) return 1;
  if (cityHit) return 2;
  return 3;
}

/**
 * Guide link for the empty calendar. Prefer a fixture guide whose slug
 * matches this sport and city, then any guide for the sport. Falls back
 * to the guides index when CMS has not linked one.
 */
export function watchRelatedGuideLink(
  fixtures: readonly UpcomingFixture[],
  sportSlug: string,
  citySlug?: string | null,
): { href: string; label: string } {
  const sport = sportSlug.trim().toLowerCase();
  const city = (citySlug ?? "").trim().toLowerCase();
  const guides = fixtures.filter(
    (item) =>
      fixtureMatchesEventsSport(item, sport) &&
      item.relatedGuide?.slug &&
      isGuideSlug(item.relatedGuide.slug),
  );
  guides.sort(
    (a, b) =>
      guideRank(a.relatedGuide!.slug, sport, city) -
      guideRank(b.relatedGuide!.slug, sport, city),
  );
  const guide = guides[0]?.relatedGuide;
  if (guide && isGuideSlug(guide.slug)) {
    return { href: guideHref(guide.slug), label: guide.title };
  }
  return { href: "/guides", label: "Guides" };
}
