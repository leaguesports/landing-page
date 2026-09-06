import {
  canonicalizeFixtureTitle,
  EVENT_KICKOFF_GROQ,
  fixtureCalendarDay,
  fixtureSlugFromTitle,
  normalizeFixtureKey,
  parseFixtureSlug,
  sortUpcomingFixtures,
  UPCOMING_GRACE_MS,
  type UpcomingFixture,
} from "./events-feed.ts";

/** Resolve a CMS event by `slug.current` when /events/[slug] has no day suffix. */
export const EVENTS_CMS_BY_SLUG_QUERY = `*[
  _type == "event" &&
  slug.current == $slug
][0] {
  "id": _id,
  title,
  "slug": slug.current,
  series,
  featured,
  "dateTime": ${EVENT_KICKOFF_GROQ},
  "track": f1Details.track
}`;

export type VenueScreeningDisplay = {
  title: string;
  startsAt: string;
  setupTags?: string[];
  href?: string | null;
};

function asIso(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  if (!text) return null;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function fixtureMatchesPublicSlug(
  fixture: UpcomingFixture,
  needle: string,
): boolean {
  if (fixture.slug === needle) return true;
  const { baseSlug } = parseFixtureSlug(fixture.slug);
  if (baseSlug === needle) return true;
  return fixtureSlugFromTitle(fixture.title) === needle;
}

/**
 * Resolve a public /events/[slug] — exact title+day slug first, then CMS
 * slug or title slug without a day (soonest upcoming when several match).
 */
export function findFixtureBySlug(
  fixtures: UpcomingFixture[],
  slug: string,
  now: Date = new Date(),
): UpcomingFixture | null {
  const needle = slug.trim().toLowerCase();
  if (!needle) return null;

  const exact = fixtures.filter((item) => item.slug === needle);
  if (exact.length === 1) return exact[0] ?? null;
  if (exact.length > 1) return sortUpcomingFixtures(exact, now)[0] ?? null;

  const aliases = fixtures.filter((item) =>
    fixtureMatchesPublicSlug(item, needle),
  );
  if (aliases.length === 0) return null;
  return sortUpcomingFixtures(aliases, now)[0] ?? null;
}

/** Public slugs that should 200 for this fixture (canonical + CMS + title). */
export function fixturePublicSlugs(fixture: UpcomingFixture): string[] {
  const slugs = new Set<string>();
  const canonical = fixture.slug.trim().toLowerCase();
  if (canonical) slugs.add(canonical);
  const { baseSlug } = parseFixtureSlug(canonical);
  if (baseSlug) slugs.add(baseSlug);
  const titleSlug = fixtureSlugFromTitle(fixture.title);
  if (titleSlug) slugs.add(titleSlug);
  return [...slugs];
}

/** List / hero / Tonight always open the Events detail path. */
export function fixtureWatchHref(fixture: UpcomingFixture): string {
  return `/events/${fixture.slug}`;
}

function fixtureSaDay(fixture: UpcomingFixture): string | null {
  return fixtureCalendarDay(fixture.startsAt) ?? parseFixtureSlug(fixture.slug).day;
}

/**
 * Homepage Tonight rows — only fixtures that already exist on /events.
 * Prefer the current SA calendar day; otherwise the soonest upcoming.
 */
export function tonightFixtureTeasers(
  fixtures: UpcomingFixture[],
  now: Date = new Date(),
  limit = 3,
): { items: UpcomingFixture[]; heading: "Tonight" | "Coming up" } {
  const sorted = sortUpcomingFixtures(fixtures, now);
  const today = fixtureCalendarDay(now.toISOString());
  const sameDay = today
    ? sorted.filter((item) => fixtureSaDay(item) === today)
    : [];
  if (sameDay.length > 0) {
    return { items: sameDay.slice(0, limit), heading: "Tonight" };
  }
  return { items: sorted.slice(0, limit), heading: "Coming up" };
}

function isUpcomingKickoff(iso: string, now: Date): boolean {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return Boolean(iso.trim());
  return time >= now.getTime() - UPCOMING_GRACE_MS;
}

function fixtureMatchingScreening(
  fixtures: UpcomingFixture[],
  title: string,
  startsAt: string | null,
): UpcomingFixture | null {
  const key = normalizeFixtureKey(title, startsAt);
  return (
    fixtures.find(
      (item) => normalizeFixtureKey(item.title, item.startsAt) === key,
    ) ??
    fixtures.find(
      (item) =>
        canonicalizeFixtureTitle(item.title) === canonicalizeFixtureTitle(title),
    ) ??
    null
  );
}

/**
 * CMS `upcoming_screenings` plus fixtures that already list this venue.
 * Past kickoffs drop after the grace window. Matching Events rows get an href.
 */
export function mergeVenueUpcomingScreenings(
  venue: {
    slug: string;
    upcoming_screenings?:
      | { title?: string | null; startsAt?: string | null; setupTags?: string[] }[]
      | null;
  },
  fixtures: UpcomingFixture[],
  now: Date = new Date(),
): VenueScreeningDisplay[] {
  const venueSlug = venue.slug.trim();
  const byKey = new Map<string, VenueScreeningDisplay>();

  function upsert(item: VenueScreeningDisplay) {
    const title = item.title.trim();
    const startsAt = item.startsAt.trim();
    if (!title || !startsAt) return;
    if (!isUpcomingKickoff(startsAt, now)) return;
    const key = normalizeFixtureKey(title, asIso(startsAt));
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        title,
        startsAt,
        setupTags: item.setupTags,
        href: item.href ?? null,
      });
      return;
    }
    if (!existing.href && item.href) existing.href = item.href;
    if (
      (!existing.setupTags || existing.setupTags.length === 0) &&
      item.setupTags &&
      item.setupTags.length > 0
    ) {
      existing.setupTags = item.setupTags;
    }
  }

  for (const screening of venue.upcoming_screenings ?? []) {
    const title = (screening.title ?? "").trim();
    const startsAt = (screening.startsAt ?? "").trim();
    if (!title || !startsAt) continue;
    const match = fixtureMatchingScreening(fixtures, title, asIso(startsAt));
    upsert({
      title,
      startsAt,
      setupTags: screening.setupTags,
      href: match ? `/events/${match.slug}` : null,
    });
  }

  if (venueSlug) {
    for (const fixture of fixtures) {
      if (!fixture.venues.some((item) => item.slug === venueSlug)) continue;
      if (!fixture.startsAt) continue;
      upsert({
        title: fixture.title,
        startsAt: fixture.startsAt,
        href: `/events/${fixture.slug}`,
      });
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const aTime = Date.parse(a.startsAt);
    const bTime = Date.parse(b.startsAt);
    if (Number.isFinite(aTime) && Number.isFinite(bTime)) return aTime - bTime;
    if (Number.isFinite(aTime)) return -1;
    if (Number.isFinite(bTime)) return 1;
    return a.title.localeCompare(b.title);
  });
}
