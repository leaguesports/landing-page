import { eventsListHref } from "../events/scope.ts";
import type { EventsCityCode } from "../sports/events-city.ts";
import { guideVenueMarkInitial } from "../guides/venueMedia.ts";
import { activityDisplayName } from "./activity.ts";
import { intentPath } from "./paths.ts";
import { resolveSportSlug, SPORT_CATALOG } from "../sports/catalog.ts";
import {
  fixtureCalendarDay,
  FIXTURE_TIMEZONE,
  normalizeFixtureKey,
  type UpcomingFixture,
} from "../sports/events-feed.ts";
import { mergeVenueUpcomingScreenings } from "../sports/events-path.ts";
import {
  formatWatchCalendarStamp,
  venueBroadcastSportSlugs,
} from "./watch-screenings.ts";

/**
 * Fanzo-direction watch hubs: fixture buckets, suburb ∩ fixture filtering,
 * watch cues, and honest distance labels. UI stays in LeagueSports chrome.
 */

export const WATCH_SPORT_ORDER = ["rugby", "soccer", "cricket", "motorsport"] as const;

const WATCH_CUE_ORDER = ["Screens", "Sound on", "Outdoor", "Fan park"] as const;
export type WatchCue = (typeof WATCH_CUE_ORDER)[number];

const SPORT_SLUGS = new Set([
  "rugby",
  "soccer",
  "football",
  "cricket",
  "motorsport",
  "golf",
  "padel",
  "tennis",
]);

const COMPETITION_LABELS: Record<string, string> = {
  urc: "URC",
  "united-rugby-championship": "URC",
  springboks: "Springboks",
  springbok: "Springboks",
  "six-nations": "Six Nations",
  "rugby-championship": "Rugby Championship",
  "currie-cup": "Currie Cup",
  psl: "PSL",
  "premier-soccer-league": "PSL",
  "premier-league": "Premier League",
  "dstv-premiership": "DStv Premiership",
  "betway-premiership": "Betway Premiership",
  proteas: "Proteas",
  sa20: "SA20",
  "sa-20": "SA20",
  f1: "Formula 1",
  "formula-1": "Formula 1",
  "formula 1": "Formula 1",
};

/** Approximate city centres for the labelled fallback. Not a GPS claim. */
const CITY_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  johannesburg: { latitude: -26.2041, longitude: 28.0473 },
  "cape-town": { latitude: -33.9249, longitude: 18.4241 },
  durban: { latitude: -29.8587, longitude: 31.0218 },
  pretoria: { latitude: -25.7479, longitude: 28.2293 },
};

const CITY_EVENT_CODE: Record<string, EventsCityCode> = {
  johannesburg: "jhb",
  "cape-town": "cpt",
  durban: "dbn",
  pretoria: "pta",
};

export type WatchHubBucketId = "today" | "weekend" | "later";

export type WatchHubFixtureRow = {
  key: string;
  title: string;
  startsAt: string;
  kickoffLabel: string | null;
  competition: string | null;
  bucket: WatchHubBucketId;
  venueSlugs: string[];
  sportSlug: string | null;
  sportName: string | null;
  eventSlug: string | null;
};

export type WatchHubBucket = {
  id: WatchHubBucketId;
  label: "Today" | "This weekend" | "Later";
  groups: { name: string | null; rows: WatchHubFixtureRow[] }[];
};

export type WatchHubCardModel = {
  id: string;
  slug: string;
  name: string;
  suburb: string;
  initial: string;
  photoSrc: string | null;
  latitude: number | null;
  longitude: number | null;
  cues: WatchCue[];
  hook: string | null;
  analyticsSport: string | null;
  screenings: { key: string; title: string; startsAt: string }[];
};

export type WatchHubVenueInput = {
  id: string;
  name: string;
  slug: string;
  suburb: string;
  latitude: number | null;
  longitude: number | null;
  photoSrc: string | null;
  hasScreens: boolean;
  hasLiveAudio: boolean;
  hasOutdoor: boolean;
  setupTags: readonly string[];
  cmsHook: string | null;
  broadcasts: readonly { slug?: string | null; name?: string | null }[];
  upcoming_screenings:
    | readonly {
        title?: string | null;
        startsAt?: string | null;
        setupTags?: string[];
      }[]
    | null;
};

export type WatchHubModel = {
  cards: WatchHubCardModel[];
  buckets: WatchHubBucket[];
  fixtureRows: WatchHubFixtureRow[];
  suburbs: string[];
  sports: { slug: string; name: string }[];
  weekendVenueCount: number;
  todayYmd: string | null;
};

const BUCKETS: { id: WatchHubBucketId; label: WatchHubBucket["label"] }[] = [
  { id: "today", label: "Today" },
  { id: "weekend", label: "This weekend" },
  { id: "later", label: "Later" },
];

function normalizeCitySlug(slug: string | null | undefined): string {
  const city = (slug ?? "").trim().toLowerCase();
  if (city === "joburg" || city === "jozi" || city === "jhb") return "johannesburg";
  if (city === "cape town" || city === "capetown" || city === "cpt") return "cape-town";
  if (city === "dbn") return "durban";
  if (city === "pta" || city === "tshwane") return "pretoria";
  return city;
}

function shiftSaDay(ymd: string, days: number): string {
  const start = new Date(`${ymd}T12:00:00+02:00`);
  const next = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return fixtureCalendarDay(next.toISOString()) ?? ymd;
}

function saWeekday(ymd: string): number {
  const date = new Date(`${ymd}T12:00:00+02:00`);
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: FIXTURE_TIMEZONE,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[label] ?? 0;
}

/** Friday–Sunday of the current weekend, or the upcoming one Mon–Thu. */
export function watchWeekendDays(now: Date): string[] {
  const today = fixtureCalendarDay(now.toISOString());
  if (!today) return [];
  const weekday = saWeekday(today);
  const fridayOffset =
    weekday === 5 ? 0 : weekday === 6 ? -1 : weekday === 0 ? -2 : 5 - weekday;
  const friday = shiftSaDay(today, fridayOffset);
  return [friday, shiftSaDay(friday, 1), shiftSaDay(friday, 2)];
}

export function watchFixtureBucket(startsAt: string, now: Date): WatchHubBucketId {
  const day = fixtureCalendarDay(startsAt);
  const today = fixtureCalendarDay(now.toISOString());
  if (!day || !today) return "later";
  if (day === today) return "today";
  if (watchWeekendDays(now).includes(day)) return "weekend";
  return "later";
}

export function watchKickoffIsThisWeekend(startsAt: string, now: Date): boolean {
  const day = fixtureCalendarDay(startsAt);
  if (!day) return false;
  return watchWeekendDays(now).includes(day);
}

export function watchCityCentroid(
  citySlug: string | null | undefined,
): { latitude: number; longitude: number } | null {
  return CITY_CENTROIDS[normalizeCitySlug(citySlug)] ?? null;
}

export function watchCityEventsHref(citySlug: string | null | undefined): string {
  const code = CITY_EVENT_CODE[normalizeCitySlug(citySlug)];
  return eventsListHref(code ? { city: code } : {});
}

export function watchCityEmptyBody(cityTitle: string, venueCount: number): string {
  const city = cityTitle.trim() || "this city";
  const count = Number.isFinite(venueCount) ? Math.max(0, Math.trunc(venueCount)) : 0;
  const noun = count === 1 ? "venue" : "venues";
  return `We still list ${count} ${noun} in ${city} tagged for live sport. Open a venue for address and amenities, or check Events for other fixtures.`;
}

export function watchCityHubHeading(cityTitle: string): string {
  const city = cityTitle.trim() || "this city";
  return `Watch sport in ${city}`;
}

export function watchHubPromise(input: {
  sportName?: string | null;
  hasFixtures: boolean;
}): string {
  if (input.hasFixtures) {
    return "Pick a kickoff, then open a bar that's actually showing it.";
  }
  const sport = input.sportName?.trim().toLowerCase();
  if (sport) return `Bars tagged for live ${sport} — open a venue before you go.`;
  return "Bars tagged for live sport — open a venue before you go.";
}

export function watchLivingCount(venueCount: number, weekendVenueCount: number): string {
  const venues = Number.isFinite(venueCount) ? Math.max(0, Math.trunc(venueCount)) : 0;
  const weekend = Number.isFinite(weekendVenueCount)
    ? Math.max(0, Math.trunc(weekendVenueCount))
    : 0;
  const venueLabel = `${venues} ${venues === 1 ? "venue" : "venues"} tagged`;
  if (weekend === 0) return `${venueLabel} · 0 this weekend`;
  return `${venueLabel} · ${weekend} screening this weekend`;
}

export function orderWatchSports<T extends { slug: string; name: string }>(
  sports: readonly T[],
): T[] {
  const bySlug = new Map<string, T>();
  for (const sport of sports) {
    const slug = sport.slug.trim().toLowerCase();
    if (!slug || bySlug.has(slug)) continue;
    bySlug.set(slug, { ...sport, slug });
  }
  return [...bySlug.values()].sort((a, b) => {
    const ai = WATCH_SPORT_ORDER.indexOf(a.slug as (typeof WATCH_SPORT_ORDER)[number]);
    const bi = WATCH_SPORT_ORDER.indexOf(b.slug as (typeof WATCH_SPORT_ORDER)[number]);
    const ar = ai === -1 ? 100 : ai;
    const br = bi === -1 ? 100 : bi;
    if (ar !== br) return ar - br;
    return a.name.localeCompare(b.name, "en");
  });
}

/** Catalog sports without a watch capability must not become a /watch chip. */
export function isWatchHubSport(slug: string): boolean {
  const sport = SPORT_CATALOG.find((item) => item.slug === slug);
  if (!sport) return true;
  return sport.capabilities.includes("watch");
}

export function watchSportsFromBroadcasts(
  venues: readonly {
    broadcasts?: readonly { slug?: string | null; name?: string | null }[] | null;
  }[],
): { slug: string; name: string }[] {
  const found: { slug: string; name: string }[] = [];
  for (const venue of venues) {
    for (const item of venue.broadcasts ?? []) {
      const raw = (item?.slug ?? "").trim().toLowerCase();
      const slug = resolveSportSlug(raw);
      if (!slug || !isWatchHubSport(slug)) continue;
      const name =
        raw === slug ? activityDisplayName(slug, item?.name) : activityDisplayName(slug);
      found.push({ slug, name });
    }
  }
  return orderWatchSports(found);
}

export function watchSportChipHref(sportSlug: string, citySlug: string): string {
  return intentPath("watch", sportSlug, citySlug);
}

export function watchSiblingSportLinks(input: {
  citySlug: string;
  cityTitle: string;
  sports: readonly { slug: string; name: string }[];
  currentSportSlug?: string | null;
}): { href: string; label: string }[] {
  const current = resolveSportSlug(input.currentSportSlug) ||
    (input.currentSportSlug ?? "").trim().toLowerCase();
  return orderWatchSports(input.sports)
    .filter((sport) => sport.slug !== current)
    .map((sport) => ({
      href: watchSportChipHref(sport.slug, input.citySlug),
      label: `Watch ${sport.name} in ${input.cityTitle}`,
    }));
}

function cueFromTag(tag: string): WatchCue | null {
  const key = tag.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!key) return null;
  if (["screen", "screens", "big screen", "big screens"].includes(key)) return "Screens";
  if (["sound", "sound on", "audio", "live audio"].includes(key)) return "Sound on";
  if (["outdoor", "outdoor area", "outside"].includes(key)) return "Outdoor";
  if (["fan park", "fanpark", "fan zone", "fanzone"].includes(key)) return "Fan park";
  return null;
}

/** Watch-relevant cues only. Food, parking, and missing tags are omitted. */
export function watchCueLabels(input: {
  hasScreens?: boolean;
  hasLiveAudio?: boolean;
  hasOutdoor?: boolean;
  setupTags?: readonly string[] | null;
}): WatchCue[] {
  const found = new Set<WatchCue>();
  if (input.hasScreens) found.add("Screens");
  if (input.hasLiveAudio) found.add("Sound on");
  if (input.hasOutdoor) found.add("Outdoor");
  for (const tag of input.setupTags ?? []) {
    const cue = cueFromTag(tag);
    if (cue) found.add(cue);
  }
  return WATCH_CUE_ORDER.filter((cue) => found.has(cue)).slice(0, 4);
}

export function watchHubHook(input: {
  cmsHook?: string | null;
  suburb: string;
  cues: readonly string[];
}): string | null {
  const cms = (input.cmsHook ?? "").replace(/\s+/g, " ").trim();
  if (cms && cms.length <= 140) return cms;
  const suburb = input.suburb.trim();
  if (!suburb) return null;
  const has = (cue: string) => input.cues.includes(cue);
  if (has("Screens")) return `Multi-screen ${suburb} local`;
  if (has("Outdoor") && has("Fan park")) return `Outdoor fan-park ${suburb} local`;
  if (has("Outdoor")) return `Outdoor ${suburb} local`;
  if (has("Fan park")) return `Fan-park ${suburb} local`;
  if (has("Sound on")) return `Sound-on ${suburb} local`;
  return `${suburb} local`;
}

export function formatWatchDistanceKm(km: number): string | null {
  if (!Number.isFinite(km) || km < 0) return null;
  if (km < 10) {
    const rounded = Math.round(km * 10) / 10;
    const shown = rounded < 0.1 ? 0.1 : rounded;
    return `${shown.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * User GPS is unlabeled km. City-centre fallback must say so.
 * No coordinates → suburb only.
 */
export function watchPlaceLine(input: {
  suburb: string;
  distanceKm: number | null;
  origin: "user" | "centre" | null;
  cityTitle: string;
}): string {
  const suburb = input.suburb.trim();
  const distance =
    input.distanceKm == null ? null : formatWatchDistanceKm(input.distanceKm);
  if (!distance || !input.origin) return suburb;
  if (input.origin === "centre") {
    const city = input.cityTitle.trim() || "city";
    const labelled = `${distance} from ${city} centre`;
    return suburb ? `${suburb} · ${labelled}` : labelled;
  }
  return suburb ? `${suburb} · ${distance}` : distance;
}

export function watchShowingLabel(input: {
  screenings: readonly { title: string; startsAt: string }[];
  selectedTitle?: string | null;
  todayYmd: string | null;
}): string | null {
  const selected = input.selectedTitle?.trim() ?? "";
  if (selected) return `Showing · ${selected}`;
  const todayCount = input.todayYmd
    ? input.screenings.filter(
        (item) => fixtureCalendarDay(item.startsAt) === input.todayYmd,
      ).length
    : 0;
  if (todayCount >= 2) return `${todayCount} games today`;
  const next = input.screenings[0];
  if (!next?.title.trim()) return null;
  return next.title.trim();
}

export function watchSuburbChips(suburbs: readonly string[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const raw of suburbs) {
    const label = raw.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { label, count: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "en"))
    .map((item) => item.label);
}

export function filterWatchHubCards<T extends { slug: string; suburb: string }>(
  cards: readonly T[],
  input: { suburb: string | null; fixtureVenueSlugs: readonly string[] | null },
): T[] {
  const suburb = input.suburb?.trim().toLowerCase() || null;
  const slugs = input.fixtureVenueSlugs
    ? new Set(input.fixtureVenueSlugs.map((slug) => slug.trim().toLowerCase()))
    : null;
  return cards.filter((card) => {
    if (suburb && card.suburb.trim().toLowerCase() !== suburb) return false;
    if (slugs && !slugs.has(card.slug.trim().toLowerCase())) return false;
    return true;
  });
}

export function sortWatchHubCards<
  T extends {
    suburb: string;
    name: string;
    hasUpcoming: boolean;
    distanceKm: number | null;
  },
>(
  cards: readonly T[],
  input: { fixtureSelected: boolean; hasAnyDistance: boolean },
): T[] {
  return [...cards].sort((a, b) => {
    if (!input.fixtureSelected && a.hasUpcoming !== b.hasUpcoming) {
      return a.hasUpcoming ? -1 : 1;
    }
    if (input.hasAnyDistance) {
      const ad =
        a.distanceKm == null || !Number.isFinite(a.distanceKm)
          ? Number.POSITIVE_INFINITY
          : a.distanceKm;
      const bd =
        b.distanceKm == null || !Number.isFinite(b.distanceKm)
          ? Number.POSITIVE_INFINITY
          : b.distanceKm;
      if (ad !== bd) return ad - bd;
    }
    const bySuburb = a.suburb.localeCompare(b.suburb, "en");
    if (bySuburb !== 0) return bySuburb;
    return a.name.localeCompare(b.name, "en");
  });
}

export function resolveWatchFixtureSelection(
  rows: readonly Pick<WatchHubFixtureRow, "key" | "title" | "eventSlug">[],
  raw: string | null | undefined,
): string | null {
  const needle = (raw ?? "").trim().toLowerCase();
  if (!needle) return null;
  const hit = rows.find(
    (row) =>
      row.key.toLowerCase() === needle ||
      (row.eventSlug ?? "").toLowerCase() === needle ||
      row.title.toLowerCase() === needle,
  );
  return hit?.key ?? null;
}

function competitionLabel(
  competition: string | null | undefined,
  series: string | null | undefined,
): string | null {
  const fromCompetition = labelOne(competition);
  if (fromCompetition) return fromCompetition;
  return labelOne(series);
}

function labelOne(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  const key = raw.toLowerCase();
  if (SPORT_SLUGS.has(key)) return null;
  if (COMPETITION_LABELS[key]) return COMPETITION_LABELS[key];
  if (/[A-Z]/.test(raw) || raw.includes(" ")) return raw;
  return raw
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function byKickoff(a: { startsAt: string }, b: { startsAt: string }): number {
  const at = Date.parse(a.startsAt);
  const bt = Date.parse(b.startsAt);
  if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return at - bt;
  return 0;
}

function groupFixtureRows(rows: WatchHubFixtureRow[]): WatchHubBucket["groups"] {
  const sorted = [...rows].sort((a, b) => {
    const byTime = byKickoff(a, b);
    if (byTime !== 0) return byTime;
    return a.title.localeCompare(b.title, "en");
  });
  if (!sorted.some((row) => row.competition)) {
    return [{ name: null, rows: sorted }];
  }
  const groups = new Map<string, WatchHubFixtureRow[]>();
  const unlabeled: WatchHubFixtureRow[] = [];
  for (const row of sorted) {
    if (!row.competition) {
      unlabeled.push(row);
      continue;
    }
    const list = groups.get(row.competition) ?? [];
    list.push(row);
    groups.set(row.competition, list);
  }
  const named = [...groups.entries()].sort((a, b) => byKickoff(a[1][0]!, b[1][0]!));
  const out: WatchHubBucket["groups"] = named.map(([name, groupRows]) => ({
    name,
    rows: groupRows,
  }));
  if (unlabeled.length > 0) out.push({ name: null, rows: unlabeled });
  return out;
}

export function buildWatchHubBuckets(
  rows: readonly WatchHubFixtureRow[],
): WatchHubBucket[] {
  return BUCKETS.flatMap((bucket) => {
    const inBucket = rows.filter((row) => row.bucket === bucket.id);
    if (inBucket.length === 0) return [];
    return [{ ...bucket, groups: groupFixtureRows(inBucket) }];
  });
}

function coord(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildWatchHubModel(input: {
  venues: readonly WatchHubVenueInput[];
  fixtures: readonly UpcomingFixture[];
  sportSlug: string | null;
  now?: Date;
}): WatchHubModel {
  const now = input.now ?? new Date();
  const sportSlug = input.sportSlug?.trim() || null;
  const fixtures = [...input.fixtures];
  const fixtureByKey = new Map<string, UpcomingFixture>();
  for (const fixture of fixtures) {
    if (!fixture.startsAt) continue;
    fixtureByKey.set(normalizeFixtureKey(fixture.title, fixture.startsAt), fixture);
  }

  type Acc = {
    key: string;
    title: string;
    startsAt: string;
    venueSlugs: Set<string>;
    competition: string | null;
    sportSlug: string | null;
    eventSlug: string | null;
  };
  const grouped = new Map<string, Acc>();

  const cards: WatchHubCardModel[] = [];

  for (const venue of input.venues) {
    const slug = venue.slug.trim();
    const name = venue.name.trim();
    if (!slug || !name) continue;
    const broadcasts = venueBroadcastSportSlugs(venue.broadcasts);
    const screenings = mergeVenueUpcomingScreenings(
      {
        slug,
        upcoming_screenings: [...(venue.upcoming_screenings ?? [])],
      },
      fixtures,
      now,
      sportSlug
        ? { sportSlug, broadcastSlugs: broadcasts }
        : { broadcastSlugs: broadcasts },
    );
    const cardScreenings = screenings.map((item) => ({
      key: normalizeFixtureKey(item.title, item.startsAt),
      title: item.title,
      startsAt: item.startsAt,
    }));

    for (const item of screenings) {
      const key = normalizeFixtureKey(item.title, item.startsAt);
      const match = fixtureByKey.get(key) ?? null;
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          key,
          title: match?.title?.trim() || item.title,
          startsAt: match?.startsAt || item.startsAt,
          venueSlugs: new Set([slug]),
          competition: competitionLabel(match?.competition, match?.series),
          sportSlug: match?.sportSlug ?? null,
          eventSlug: match?.slug ?? null,
        });
      } else {
        existing.venueSlugs.add(slug);
        if (!existing.competition) {
          existing.competition = competitionLabel(match?.competition, match?.series);
        }
        if (!existing.eventSlug && match?.slug) existing.eventSlug = match.slug;
        if (!existing.sportSlug && match?.sportSlug) existing.sportSlug = match.sportSlug;
      }
    }

    const setupTags = [
      ...venue.setupTags,
      ...screenings.flatMap((item) => item.setupTags ?? []),
    ];
    const cues = watchCueLabels({
      hasScreens: venue.hasScreens,
      hasLiveAudio: venue.hasLiveAudio,
      hasOutdoor: venue.hasOutdoor,
      setupTags,
    });
    const sports = watchSportsFromBroadcasts([{ broadcasts: venue.broadcasts }]);
    cards.push({
      id: venue.id || slug,
      slug,
      name,
      suburb: venue.suburb.trim(),
      initial: guideVenueMarkInitial(venue.suburb, name),
      photoSrc: venue.photoSrc,
      latitude: coord(venue.latitude),
      longitude: coord(venue.longitude),
      cues,
      hook: watchHubHook({
        cmsHook: venue.cmsHook,
        suburb: venue.suburb,
        cues,
      }),
      analyticsSport: sports[0]?.slug ?? null,
      screenings: cardScreenings,
    });
  }

  const fixtureRows: WatchHubFixtureRow[] = [...grouped.values()]
    .map((row) => ({
      key: row.key,
      title: row.title,
      startsAt: row.startsAt,
      kickoffLabel: formatWatchCalendarStamp(row.startsAt),
      competition: row.competition,
      bucket: watchFixtureBucket(row.startsAt, now),
      venueSlugs: [...row.venueSlugs].sort(),
      sportSlug: row.sportSlug,
      sportName: row.sportSlug ? activityDisplayName(row.sportSlug) : null,
      eventSlug: row.eventSlug,
    }))
    .sort((a, b) => byKickoff(a, b) || a.title.localeCompare(b.title, "en"));

  const weekendVenues = new Set<string>();
  for (const row of fixtureRows) {
    if (!watchKickoffIsThisWeekend(row.startsAt, now)) continue;
    for (const slug of row.venueSlugs) weekendVenues.add(slug);
  }

  return {
    cards,
    buckets: buildWatchHubBuckets(fixtureRows),
    fixtureRows,
    suburbs: watchSuburbChips(cards.map((card) => card.suburb)),
    sports: watchSportsFromBroadcasts(input.venues),
    weekendVenueCount: weekendVenues.size,
    todayYmd: fixtureCalendarDay(now.toISOString()),
  };
}
