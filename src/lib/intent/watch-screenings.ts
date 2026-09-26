import { eventsListHref } from "../events/scope.ts";
import { guideHref, isGuideSlug } from "../guides/slugs.ts";
import type { IntentScreeningHighlight } from "./enrichment.ts";
import { resolveSportSlug } from "../sports/catalog.ts";
import {
  FIXTURE_TIMEZONE,
  formatFixtureWhen,
  normalizeFixtureKey,
  type UpcomingFixture,
} from "../sports/events-feed.ts";
import {
  mergeVenueUpcomingScreenings,
  type MergeVenueScreeningsOptions,
} from "../sports/events-path.ts";

/** Compact calendar cap on `/watch/{sport}/{city}` (~5–8). */
export const WATCH_CITY_CALENDAR_LIMIT = 6;

export type WatchGuideLink = {
  href: string;
  label: string;
};

/**
 * Published Watch pack. Fixture `relatedGuide` slugs are not enough: an empty
 * rugby calendar still needs the city guide, and an unknown slug must not
 * become a `/guides` index link.
 */
const SPORT_CITY_GUIDES: Record<string, { slug: string; label: string }> = {
  "rugby|johannesburg": {
    slug: "where-to-watch-rugby-johannesburg",
    label: "Where to Watch Rugby & the Springboks in Johannesburg",
  },
  "cricket|johannesburg": {
    slug: "where-to-watch-cricket-johannesburg",
    label: "Where to Watch Cricket & the Proteas in Johannesburg",
  },
  "motorsport|johannesburg": {
    slug: "where-to-watch-f1-johannesburg",
    label: "Where to Watch F1 & Motorsport in Johannesburg",
  },
};

/** Cross-sport city hub. One link max, and only when this page is not already it. */
const CITY_WATCH_PACKS: Record<string, { slug: string; label: string }> = {
  johannesburg: {
    slug: "best-sports-bars-johannesburg",
    label: "The 7 Best Sports Bars in Johannesburg for Every Fan",
  },
  "cape-town": {
    slug: "best-sports-bars-cape-town",
    label: "Best Sports Bars in Cape Town",
  },
};

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
  href: string | null;
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
  limit = WATCH_CITY_CALENDAR_LIMIT,
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
        href: item.href ?? null,
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

export function watchScreeningEmptyBody(
  sportName: string,
  cityTitle: string,
  venueCount: number,
): string {
  const sport = sportName.trim().toLowerCase() || "this sport";
  const city = cityTitle.trim() || "this city";
  const count = Number.isFinite(venueCount) ? Math.max(0, Math.trunc(venueCount)) : 0;
  const noun = count === 1 ? "venue" : "venues";
  return `We still list ${count} ${noun} in ${city} tagged for ${sport}. Open a venue for address and amenities, or check Events for other fixtures.`;
}

export function watchEventsHref(sportSlug: string): string {
  return eventsListHref({ sport: sportSlug });
}

function normalizeWatchCity(citySlug: string | null | undefined): string {
  const city = (citySlug ?? "").trim().toLowerCase();
  if (city === "joburg" || city === "jozi") return "johannesburg";
  if (city === "cape town" || city === "capetown") return "cape-town";
  return city;
}

function normalizeWatchSport(sportSlug: string | null | undefined): string {
  const resolved = resolveSportSlug(sportSlug) || (sportSlug ?? "").trim().toLowerCase();
  if (resolved === "f1" || resolved === "formula-1") return "motorsport";
  if (resolved === "football") return "soccer";
  return resolved;
}

function toGuideLink(guide: { slug: string; label: string }): WatchGuideLink | null {
  if (!isGuideSlug(guide.slug)) return null;
  return { href: guideHref(guide.slug), label: guide.label };
}

/**
 * 1–3 guide links for this sport and city. Sport guide first, then the
 * cross-sport city pack. Unmapped cities return nothing (no `/guides` fallback).
 */
export function watchRelatedGuides(
  sportSlug: string,
  citySlug?: string | null,
): WatchGuideLink[] {
  const sport = normalizeWatchSport(sportSlug);
  const city = normalizeWatchCity(citySlug);
  const links: WatchGuideLink[] = [];
  const seen = new Set<string>();

  function push(guide: { slug: string; label: string } | undefined) {
    if (!guide || links.length >= 3) return;
    const link = toGuideLink(guide);
    if (!link || seen.has(guide.slug)) return;
    seen.add(guide.slug);
    links.push(link);
  }

  push(SPORT_CITY_GUIDES[`${sport}|${city}`]);
  push(CITY_WATCH_PACKS[city]);
  return links;
}

/** First mapped guide, or null when this sport/city has no Watch pack entry. */
export function watchRelatedGuideLink(
  sportSlug: string,
  citySlug?: string | null,
): WatchGuideLink | null {
  return watchRelatedGuides(sportSlug, citySlug)[0] ?? null;
}

/**
 * Empty-calendar links. Browse Events is separate. The sport guide is the
 * related guide; the city pack is the one cross-sport hub, omitted when it
 * is already the related guide or when no pack exists.
 */
export function watchCalendarSideLinks(
  sportSlug: string,
  citySlug?: string | null,
): { guide: WatchGuideLink | null; crossSport: WatchGuideLink | null } {
  const sport = normalizeWatchSport(sportSlug);
  const city = normalizeWatchCity(citySlug);
  const sportGuide = SPORT_CITY_GUIDES[`${sport}|${city}`];
  const cityPack = CITY_WATCH_PACKS[city];
  const guide = watchRelatedGuideLink(sportSlug, citySlug);
  const cross =
    sportGuide && cityPack && sportGuide.slug !== cityPack.slug
      ? toGuideLink(cityPack)
      : null;
  return { guide, crossSport: cross };
}

/** `venue · date · time` stamp for a compact calendar row. */
export function formatWatchCalendarStamp(startsAt: string): string | null {
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return null;
  const date = parsed.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: FIXTURE_TIMEZONE,
  });
  const time = parsed.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: FIXTURE_TIMEZONE,
  });
  if (!date || !time) return null;
  return `${date} · ${time}`;
}

/**
 * One meta line. Next screening for this sport wins; otherwise up to three
 * amenity words. No line when the venue has neither.
 */
export function watchVenueMetaLine(input: {
  sportName: string;
  nextTitle?: string | null;
  nextStartsAt?: string | null;
  hasScreens?: boolean;
  hasParking?: boolean;
  hasLiveAudio?: boolean;
  now?: Date;
}): string | null {
  const title = input.nextTitle?.trim() ?? "";
  if (title) {
    const sport = input.sportName.trim().toLowerCase() || "sport";
    const when = input.nextStartsAt
      ? formatFixtureWhen(input.nextStartsAt, input.now ?? new Date())
      : null;
    return when
      ? `Next ${sport} screening · ${title} · ${when}`
      : `Next ${sport} screening · ${title}`;
  }

  const amenities: string[] = [];
  if (input.hasScreens) amenities.push("Screens");
  if (input.hasParking) amenities.push("Parking");
  if (input.hasLiveAudio) amenities.push("Live audio");
  if (amenities.length === 0) return null;
  return amenities.slice(0, 3).join(" · ");
}

function venueHasHero(venue: { hero_image?: unknown }): boolean {
  const image = venue.hero_image;
  if (!image || typeof image !== "object") return false;
  return Boolean((image as { asset?: unknown }).asset);
}

const WATCH_AMENITY_KEYS = [
  "has_big_screens",
  "has_live_audio",
  "has_parking",
  "has_generator_backup",
  "has_food_menu",
  "has_outdoor_area",
  "has_craft_drafts",
  "is_verified",
] as const;

type WatchAmenityKey = (typeof WATCH_AMENITY_KEYS)[number];

type DedupeScreening = {
  title?: string | null;
  startsAt?: string | null;
  setupTags?: string[];
};

type DedupeBroadcast = {
  slug?: string | null;
  _id?: string | null;
  name?: string | null;
};

type DedupeVenue = {
  slug?: string | null;
  hero_image?: unknown;
  upcoming_screenings?: readonly DedupeScreening[] | null;
  broadcasts?: readonly DedupeBroadcast[] | null;
} & Partial<Record<WatchAmenityKey, boolean | null>>;

function screeningMergeKey(item: DedupeScreening): string {
  const title = (item.title ?? "").trim().toLowerCase();
  const startsAt = (item.startsAt ?? "").trim();
  if (!title || !startsAt) return "";
  return `${title}|${startsAt}`;
}

function unionScreenings(
  current: readonly DedupeScreening[] | null | undefined,
  incoming: readonly DedupeScreening[] | null | undefined,
): DedupeScreening[] | null {
  const left = current ?? [];
  const right = incoming ?? [];
  if (left.length === 0 && right.length === 0) {
    return current ? [...current] : incoming ? [...incoming] : null;
  }
  const seen = new Set<string>();
  const out: DedupeScreening[] = [];
  for (const item of [...left, ...right]) {
    const key = screeningMergeKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function unionBroadcasts(
  current: readonly DedupeBroadcast[] | null | undefined,
  incoming: readonly DedupeBroadcast[] | null | undefined,
): DedupeBroadcast[] | null {
  const left = current ?? [];
  const right = incoming ?? [];
  if (left.length === 0 && right.length === 0) {
    return current ? [...current] : incoming ? [...incoming] : null;
  }
  const seen = new Set<string>();
  const out: DedupeBroadcast[] = [];
  for (const item of [...left, ...right]) {
    const slug = (item.slug ?? item._id ?? "").trim().toLowerCase();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(item);
  }
  return out;
}

/**
 * One card per slug. Duplicate CMS docs are merged, not swapped: screenings,
 * broadcasts, and amenities survive from either doc, and `hero_image` is
 * taken from whichever duplicate has one. Replacing the whole record with
 * the photo doc drops the other doc's calendar.
 */
function mergeVenueDocs<T extends DedupeVenue>(current: T, incoming: T): T {
  const next: DedupeVenue = { ...current };
  if (!venueHasHero(current) && venueHasHero(incoming)) {
    next.hero_image = incoming.hero_image;
  }
  next.upcoming_screenings = unionScreenings(
    current.upcoming_screenings,
    incoming.upcoming_screenings,
  );
  next.broadcasts = unionBroadcasts(current.broadcasts, incoming.broadcasts);
  for (const key of WATCH_AMENITY_KEYS) {
    if (current[key] === true || incoming[key] === true) {
      next[key] = true;
    }
  }
  return next as T;
}

export function dedupeVenuesBySlug<T extends DedupeVenue>(
  venues: readonly T[],
): T[] {
  const indexBySlug = new Map<string, number>();
  const out: T[] = [];
  for (const venue of venues) {
    const slug = venue.slug?.trim().toLowerCase() ?? "";
    if (!slug) {
      out.push(venue);
      continue;
    }
    const existing = indexBySlug.get(slug);
    if (existing === undefined) {
      indexBySlug.set(slug, out.length);
      out.push(venue);
      continue;
    }
    const current = out[existing];
    if (current) out[existing] = mergeVenueDocs(current, venue);
  }
  return out;
}
