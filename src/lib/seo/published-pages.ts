import { isGuideSlug } from "../guides/slugs.ts";
import {
  activitySupportsIntent,
  buildIntentActivity,
} from "../intent/activity.ts";
import { locationSlugsFromIntentVenueRow } from "../intent/indexed-pairs.ts";
import { intentPath } from "../intent/paths.ts";
import { isWatchCityHubLocation } from "../intent/routes.ts";
import {
  canonicalizeFixtureTitle,
  fixtureCalendarDay,
  fixtureSlugFromTitle,
  normalizeFixtureKey,
} from "../sports/events-feed.ts";

const PUBLIC_SLUG = /^[A-Za-z0-9._~-]+$/;

export type SitemapBucketName =
  | "static"
  | "venues"
  | "events"
  | "guides"
  | "play-cities"
  | "watch-cities";

export type ScreeningRow = {
  title?: string | null;
  startsAt?: string | null;
};

export type VenuePageRow = {
  slug?: string | null;
  upcoming_screenings?: readonly ScreeningRow[] | null;
  broadcasts?: readonly (string | null)[] | null;
  sports?: readonly (string | null)[] | null;
  locationSlug?: string | null;
  parentSlug?: string | null;
  suburbSlug?: string | null;
  citySlug?: string | null;
};

export type MetroPageRef = {
  intent?: string | null;
  activitySlug?: string | null;
  citySlug?: string | null;
};

export type ActivityHubDoc = {
  kind?: unknown;
  slug?: unknown;
  updatedAt?: unknown;
  sportSlug?: unknown;
  locationType?: unknown;
  parentSlug?: unknown;
};

/** Document fields the revalidate webhook can read from the projection or a raw doc. */
export type PublishedDoc = {
  type: string;
  id: string | null;
  slug: string | null;
  title: string | null;
  startsAt: string | null;
  intent: "watch" | "play" | null;
  activitySlug: string | null;
  citySlug: string | null;
  sportSlug: string | null;
  locationType: string | null;
  parentSlug: string | null;
  hostVenueSlug: string | null;
  relatedGuideSlug: string | null;
  screenings: ScreeningRow[];
  broadcasts: string[];
  sports: string[];
  locationSlug: string | null;
  suburbSlug: string | null;
  venueCitySlug: string | null;
};

export type RelatedPages = {
  screeningVenues?: readonly VenuePageRow[];
  locationVenues?: readonly VenuePageRow[];
  metroPages?: readonly MetroPageRef[];
};

export type ReadPublishedResult =
  | { ignored: "draft" }
  | { ignored: "missing-type"; doc: null }
  | { ignored: null; doc: PublishedDoc };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function isPublicSlug(value: string | null | undefined): value is string {
  return typeof value === "string" && PUBLIC_SLUG.test(value);
}

function slugFrom(value: unknown): string | null {
  const direct = asString(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return null;
  return asString(record.current) ?? slugFrom(record.slug);
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const direct = asString(item);
    if (direct) {
      out.push(direct);
      continue;
    }
    const record = asRecord(item);
    if (!record) continue;
    const slug = slugFrom(record.slug) ?? slugFrom(record);
    if (slug) out.push(slug);
  }
  return out;
}

function screeningsFrom(value: unknown): ScreeningRow[] {
  if (!Array.isArray(value)) return [];
  const out: ScreeningRow[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (!record) continue;
    const title = asString(record.title);
    if (!title) continue;
    out.push({ title, startsAt: asString(record.startsAt) });
  }
  return out;
}

function kickoffFrom(record: Record<string, unknown>): string | null {
  const f1 = asRecord(record.f1Details);
  return (
    asString(record.startDateTime) ??
    asString(record.startsAt) ??
    (f1 ? asString(f1.dateTime) : null) ??
    asString(record.dateTime)
  );
}

function intentFrom(value: unknown): "watch" | "play" | null {
  const intent = asString(value);
  if (intent === "watch" || intent === "play") return intent;
  return null;
}

function flattenPayload(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload) ?? {};
  const before = asRecord(root.before);
  const after = asRecord(root.after);
  if (!before && !after) return root;
  const rest = { ...root };
  delete rest.before;
  delete rest.after;
  return { ...(before ?? {}), ...(after ?? {}), ...rest };
}

/**
 * Read a Sanity webhook body. Accepts the documented projection or a raw
 * document. Draft ids are ignored so unpublished edits do not flush caches.
 */
export function readPublishedDocument(payload: unknown): ReadPublishedResult {
  const record = flattenPayload(payload);
  const id = asString(record._id) ?? asString(record.id);
  if (id?.startsWith("drafts.")) return { ignored: "draft" };

  const type = asString(record._type) ?? asString(record.type);
  if (!type) return { ignored: "missing-type", doc: null };

  const venueLocations = asRecord(record.venueLocations);
  const doc: PublishedDoc = {
    type,
    id,
    slug: slugFrom(record.slug),
    title: asString(record.title) ?? asString(record.name) ?? asString(record.h1),
    startsAt: kickoffFrom(record),
    intent: intentFrom(record.intent),
    activitySlug: asString(record.activitySlug),
    citySlug: asString(record.citySlug),
    sportSlug:
      asString(record.sportSlug) ??
      slugFrom(record.sport),
    locationType:
      asString(record.locationType) ??
      (type === "location" ? asString(record.type) : null),
    parentSlug:
      asString(record.parentSlug) ??
      slugFrom(asRecord(record.parent)?.slug) ??
      slugFrom(record.parent),
    hostVenueSlug: asString(record.hostVenue) ?? slugFrom(record.hostVenue),
    relatedGuideSlug:
      asString(record.relatedGuide) ?? slugFrom(record.relatedGuide),
    screenings: screeningsFrom(record.screenings ?? record.upcoming_screenings),
    broadcasts: stringList(record.broadcasts),
    sports: stringList(record.sports),
    locationSlug:
      asString(record.locationSlug) ??
      asString(venueLocations?.locationSlug) ??
      slugFrom(record.location),
    suburbSlug:
      asString(record.suburbSlug) ?? asString(venueLocations?.suburbSlug),
    venueCitySlug:
      asString(venueLocations?.citySlug) ??
      (type === "venue" ? asString(record.citySlug) : null),
  };

  if (type === "location" && !doc.locationType) {
    doc.locationType = asString(record.type);
  }

  return { ignored: null, doc };
}

function uniquePaths(paths: readonly (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const path of paths) {
    if (!path || !path.startsWith("/")) continue;
    if (/[?#\s&]/.test(path)) continue;
    if (seen.has(path)) continue;
    seen.add(path);
    out.push(path);
  }
  return out.sort();
}

function supportsIntent(slug: string, intent: "watch" | "play"): boolean {
  if (!isPublicSlug(slug)) return false;
  return activitySupportsIntent(buildIntentActivity({ slug }), intent);
}

export function metroPagePath(
  intent: string | null | undefined,
  activitySlug: string | null | undefined,
  citySlug: string | null | undefined,
): string | null {
  if (intent !== "watch" && intent !== "play") return null;
  const activity = activitySlug?.trim() ?? "";
  const city = citySlug?.trim() ?? "";
  if (!isPublicSlug(activity) || !isPublicSlug(city)) return null;
  return intentPath(intent, activity, city);
}

/**
 * Same title+day key the venue week cards use to attach a screening to an event.
 * There is no stored reverse map; this is that match run the other way.
 */
export function screeningMatchesEvent(
  screening: ScreeningRow,
  event: { title: string; startsAt?: string | null },
): boolean {
  const title = screening.title?.trim() ?? "";
  const eventTitle = event.title.trim();
  if (!title || !eventTitle) return false;
  const screeningStarts = screening.startsAt?.trim() || null;
  const eventStarts = event.startsAt?.trim() || null;
  if (
    normalizeFixtureKey(title, screeningStarts) ===
    normalizeFixtureKey(eventTitle, eventStarts)
  ) {
    return true;
  }
  if (canonicalizeFixtureTitle(title) !== canonicalizeFixtureTitle(eventTitle)) {
    return false;
  }
  const eventDay = fixtureCalendarDay(eventStarts);
  const screeningDay = fixtureCalendarDay(screeningStarts);
  if (eventDay && screeningDay) return eventDay === screeningDay;
  return !eventDay && !screeningDay;
}

export function eventPagePaths(doc: {
  title?: string | null;
  slug?: string | null;
  startsAt?: string | null;
}): string[] {
  const slugs = new Set<string>();
  const title = doc.title?.trim() ?? "";
  if (title) {
    slugs.add(fixtureSlugFromTitle(title, doc.startsAt ?? null));
    const undated = fixtureSlugFromTitle(title, null);
    if (undated) slugs.add(undated);
  }
  const cmsSlug = doc.slug?.trim().toLowerCase() ?? "";
  if (cmsSlug) slugs.add(cmsSlug);
  return uniquePaths(
    [...slugs].filter((slug) => isPublicSlug(slug)).map((slug) => `/events/${slug}`),
  );
}

function screeningEventPaths(screenings: readonly ScreeningRow[]): string[] {
  const paths: string[] = [];
  for (const screening of screenings) {
    const title = screening.title?.trim() ?? "";
    if (!title) continue;
    paths.push(
      ...eventPagePaths({
        title,
        startsAt: screening.startsAt,
      }),
    );
  }
  return paths;
}

export function venueListingPaths(venue: VenuePageRow): string[] {
  const slug = venue.slug?.trim() ?? "";
  const paths: string[] = [];
  if (isPublicSlug(slug)) paths.push(`/venues/${slug}`);
  paths.push("/venues");
  paths.push(...screeningEventPaths(venue.upcoming_screenings ?? []));

  const locations = locationSlugsFromIntentVenueRow({
    locationSlug: venue.locationSlug,
    parentSlug: venue.parentSlug,
    suburbSlug: venue.suburbSlug,
    citySlug: venue.citySlug,
  }).filter((location) => isPublicSlug(location));

  for (const sport of venue.sports ?? []) {
    const activity = sport?.trim() ?? "";
    if (!supportsIntent(activity, "play")) continue;
    paths.push(`/play/${activity}`, "/play");
    for (const location of locations) {
      paths.push(intentPath("play", activity, location));
    }
  }

  for (const broadcast of venue.broadcasts ?? []) {
    const activity = broadcast?.trim() ?? "";
    if (!supportsIntent(activity, "watch")) continue;
    paths.push(`/watch/${activity}`, "/watch");
    for (const location of locations) {
      paths.push(intentPath("watch", activity, location));
    }
  }

  for (const city of [venue.citySlug, venue.parentSlug]) {
    const clean = city?.trim() ?? "";
    if (isPublicSlug(clean)) paths.push(`/watch/${clean}`);
  }

  return uniquePaths(paths);
}

function metroPathsForActivity(
  pages: readonly MetroPageRef[] | undefined,
  activitySlug: string,
): string[] {
  const paths: string[] = [];
  for (const page of pages ?? []) {
    if ((page.activitySlug ?? "").trim() !== activitySlug) continue;
    const path = metroPagePath(page.intent, page.activitySlug, page.citySlug);
    if (!path) continue;
    paths.push(path);
    if (page.intent === "watch" || page.intent === "play") {
      paths.push(`/${page.intent}`);
      if (supportsIntent(activitySlug, page.intent)) {
        paths.push(intentPath(page.intent, activitySlug));
      }
    }
  }
  return paths;
}

export function activityHubPaths(doc: ActivityHubDoc): string[] {
  const kind = asString(doc.kind);
  const slug = asString(doc.slug);
  if (!kind || !slug || !isPublicSlug(slug)) return [];

  if (kind === "location") {
    if (
      !isWatchCityHubLocation({
        type: asString(doc.locationType),
        parentSlug: asString(doc.parentSlug),
      })
    ) {
      return [];
    }
    return uniquePaths([`/watch/${slug}`, "/watch"]);
  }

  const paths: string[] = [];
  if (kind === "sport" || kind === "series") {
    if (supportsIntent(slug, "watch")) {
      paths.push(`/watch/${slug}`, "/watch");
    }
  }
  if (kind === "sport" && supportsIntent(slug, "play")) {
    paths.push(`/play/${slug}`, "/play");
  }
  if (kind === "series") {
    const sportSlug = asString(doc.sportSlug);
    if (sportSlug && isPublicSlug(sportSlug) && supportsIntent(sportSlug, "watch")) {
      paths.push(`/watch/${sportSlug}`);
    }
  }
  return uniquePaths(paths);
}

export function sitemapBucketsForDocument(doc: PublishedDoc): SitemapBucketName[] {
  switch (doc.type) {
    case "event":
      return ["events"];
    case "venue":
      return ["venues", "play-cities", "watch-cities"];
    case "guide":
      return ["guides"];
    case "metroPage":
      return doc.intent === "play" ? ["play-cities"] : ["watch-cities"];
    case "sport":
    case "series":
    case "location":
      return ["static", "play-cities", "watch-cities"];
    default:
      return [];
  }
}

export function sitemapRevalidatePaths(buckets: readonly SitemapBucketName[]): string[] {
  return uniquePaths([
    ...buckets.map((id) => `/sitemap/${id}.xml`),
    "/sitemap-index.xml",
  ]);
}

/** Pages whose HTML depends on this published document. */
export function pagePathsForDocument(
  doc: PublishedDoc,
  related: RelatedPages = {},
): string[] {
  switch (doc.type) {
    case "event": {
      const paths = [
        ...eventPagePaths(doc),
        "/events",
        doc.hostVenueSlug && isPublicSlug(doc.hostVenueSlug)
          ? `/venues/${doc.hostVenueSlug}`
          : null,
        doc.relatedGuideSlug && isGuideSlug(doc.relatedGuideSlug)
          ? `/guides/${doc.relatedGuideSlug}`
          : null,
      ];
      const title = doc.title?.trim() ?? "";
      if (title) {
        for (const venue of related.screeningVenues ?? []) {
          const matches = (venue.upcoming_screenings ?? []).some((screening) =>
            screeningMatchesEvent(screening, { title, startsAt: doc.startsAt }),
          );
          if (!matches) continue;
          const slug = venue.slug?.trim() ?? "";
          if (isPublicSlug(slug)) paths.push(`/venues/${slug}`);
        }
      }
      return uniquePaths(paths);
    }
    case "venue":
      return venueListingPaths({
        slug: doc.slug,
        upcoming_screenings: doc.screenings,
        broadcasts: doc.broadcasts,
        sports: doc.sports,
        locationSlug: doc.locationSlug,
        parentSlug: doc.parentSlug,
        suburbSlug: doc.suburbSlug,
        citySlug: doc.venueCitySlug ?? doc.citySlug,
      });
    case "guide": {
      if (!doc.slug || !isGuideSlug(doc.slug)) return uniquePaths(["/guides"]);
      return uniquePaths([`/guides/${doc.slug}`, "/guides"]);
    }
    case "metroPage": {
      const path = metroPagePath(doc.intent, doc.activitySlug, doc.citySlug);
      const paths = [path];
      if (doc.intent && doc.activitySlug && isPublicSlug(doc.activitySlug)) {
        paths.push(intentPath(doc.intent, doc.activitySlug), `/${doc.intent}`);
      }
      return uniquePaths(paths);
    }
    case "sport":
    case "series": {
      const paths = activityHubPaths({
        kind: doc.type,
        slug: doc.slug,
        sportSlug: doc.sportSlug,
      });
      if (doc.slug) paths.push(...metroPathsForActivity(related.metroPages, doc.slug));
      return uniquePaths(paths);
    }
    case "location": {
      const paths = activityHubPaths({
        kind: "location",
        slug: doc.slug,
        locationType: doc.locationType,
        parentSlug: doc.parentSlug,
      });
      for (const venue of related.locationVenues ?? []) {
        paths.push(...venueListingPaths(venue));
      }
      return uniquePaths(paths);
    }
    default:
      return [];
  }
}

export function revalidatePathsForDocument(
  doc: PublishedDoc,
  related: RelatedPages = {},
): string[] {
  return uniquePaths([
    ...pagePathsForDocument(doc, related),
    ...sitemapRevalidatePaths(sitemapBucketsForDocument(doc)),
  ]);
}
