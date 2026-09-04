import {
  eventHref,
  inferSportSlug,
  resolveSportSlug,
  SPORT_CATALOG,
  type SportDefinition,
} from "./catalog.ts";

export type HubFeedKind = "event" | "screening" | "guide";

export type HubFeedItem = {
  id: string;
  kind: HubFeedKind;
  /** Null when the CMS row cannot be tagged — All feed only. */
  sportSlug: string | null;
  title: string;
  subtitle: string;
  href: string;
  startsAt: string | null;
};

export const HUB_EVENTS_QUERY = `*[_type == "event"] | order(coalesce(f1Details.dateTime, _createdAt) asc) [0...12] {
  "id": _id,
  title,
  "slug": slug.current,
  series,
  "dateTime": f1Details.dateTime,
  "track": f1Details.track
}`;

export const HUB_SCREENINGS_QUERY = `*[_type == "venue" && count(upcoming_screenings) > 0] | order(_updatedAt desc) [0...8] {
  name,
  "slug": slug.current,
  "broadcasts": broadcasts[]->{ name, "slug": slug.current },
  upcoming_screenings[]{ title, startsAt }
}`;

export const HUB_GUIDES_QUERY = `*[_type == "guide"] | order(_createdAt desc) [0...6] {
  _id,
  _createdAt,
  title,
  description,
  keywords,
  "slug": slug.current
}`;

export type HubEventRow = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  series?: unknown;
  dateTime?: unknown;
  track?: unknown;
};

export type HubScreeningVenueRow = {
  name?: unknown;
  slug?: unknown;
  broadcasts?: Array<{ name?: unknown; slug?: unknown }> | null;
  upcoming_screenings?: Array<{ title?: unknown; startsAt?: unknown }> | null;
};

export type HubGuideRow = {
  _id?: unknown;
  _createdAt?: unknown;
  title?: unknown;
  description?: unknown;
  keywords?: unknown;
  slug?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asIso(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function eventToFeedItem(
  row: HubEventRow,
  sports: SportDefinition[] = SPORT_CATALOG,
): HubFeedItem | null {
  const id = asString(row.id);
  const title = asString(row.title);
  if (!id || !title) return null;
  const series = asString(row.series);
  const slug = asString(row.slug);
  const sportSlug =
    resolveSportSlug(series, sports) ??
    inferSportSlug(`${series} ${title}`, sports);
  const track = asString(row.track);
  const startsAt = asIso(row.dateTime);
  return {
    id: `event-${id}`,
    kind: "event",
    sportSlug,
    title,
    subtitle: track || series || "Upcoming event",
    href: eventHref(series, slug),
    startsAt,
  };
}

export function screeningsToFeedItems(
  venues: HubScreeningVenueRow[],
  sports: SportDefinition[] = SPORT_CATALOG,
  limit = 8,
): HubFeedItem[] {
  const items: HubFeedItem[] = [];

  for (const venue of venues) {
    const venueName = asString(venue.name) || "Venue";
    const venueSlug = asString(venue.slug);
    const href = venueSlug ? `/venues/${venueSlug}` : "/venues";
    const broadcastSport =
      venue.broadcasts
        ?.map((broadcast) => resolveSportSlug(asString(broadcast.slug), sports))
        .find((slug): slug is string => Boolean(slug)) ?? null;

    for (const screening of venue.upcoming_screenings ?? []) {
      const title = asString(screening.title);
      if (!title) continue;
      const sportSlug =
        inferSportSlug(title, sports) ?? broadcastSport;
      items.push({
        id: `screening-${venueSlug || venueName}-${title}-${asString(screening.startsAt)}`,
        kind: "screening",
        sportSlug,
        title,
        subtitle: venueName,
        href,
        startsAt: asIso(screening.startsAt),
      });
    }
  }

  return items.slice(0, limit);
}

export function guidesToFeedItems(
  guides: HubGuideRow[],
  sports: SportDefinition[] = SPORT_CATALOG,
): HubFeedItem[] {
  return guides.flatMap((guide) => {
    const slug = asString(guide.slug);
    const title = asString(guide.title);
    if (!slug || !title) return [];
    const keywords = Array.isArray(guide.keywords)
      ? guide.keywords.filter((word): word is string => typeof word === "string")
      : [];
    const blob = [title, asString(guide.description), ...keywords].join(" ");
    return [
      {
        id: `guide-${asString(guide._id) || slug}`,
        kind: "guide" as const,
        sportSlug: inferSportSlug(blob, sports),
        title,
        subtitle: "Guide",
        href: `/guides/${slug}`,
        startsAt: null,
      },
    ];
  });
}

export function sortHubFeed(
  items: HubFeedItem[],
  now: Date = new Date(),
): HubFeedItem[] {
  const nowMs = now.getTime();

  function rank(item: HubFeedItem): [number, number] {
    if (!item.startsAt) return [1, nowMs];
    const time = new Date(item.startsAt).getTime();
    if (Number.isNaN(time)) return [1, nowMs];
    if (time >= nowMs) return [0, time];
    return [2, -time];
  }

  return [...items].sort((a, b) => {
    const [aBucket, aTime] = rank(a);
    const [bBucket, bTime] = rank(b);
    if (aBucket !== bBucket) return aBucket - bBucket;
    return aTime - bTime;
  });
}

export function formatHubWhen(
  iso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;

  const diffMs = parsed.getTime() - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const time = parsed.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = parsed.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (diffMs >= 0 && diffMs < dayMs) return `Today · ${time}`;
  if (diffMs >= dayMs && diffMs < 2 * dayMs) return `Tomorrow · ${time}`;
  return `${date} · ${time}`;
}
