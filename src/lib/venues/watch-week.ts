/**
 * This-week screenings for a Watch venue page.
 *
 * One card per screening at this venue. The clock is the event kickoff in
 * Africa/Johannesburg when we have the event — a venue screening time must
 * not replace it. Day chips exist only for days that have a screening.
 */

import {
  formatWatchFixtureClock,
  buildWatchFixtureFace,
  type WatchFixtureTeamHint,
} from "../intent/watch-fixture-card.ts";
import {
  canonicalizeFixtureTitle,
  FIXTURE_TIMEZONE,
  fixtureCalendarDay,
  normalizeFixtureKey,
  UPCOMING_GRACE_MS,
  type UpcomingFixture,
} from "../sports/events-feed.ts";
import {
  mergeVenueUpcomingScreenings,
  type VenueScreeningDisplay,
} from "../sports/events-path.ts";

export const VENUE_WEEK_EMPTY = "Nothing listed here this week.";

export type WatchEventKickoff = {
  title: string;
  slug: string;
  startsAt: string;
  teams?: readonly WatchFixtureTeamHint[] | null;
};

export type WatchVenueWeekInput = {
  slug: string;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  upcoming_screenings?:
    | {
        title?: string | null;
        startsAt?: string | null;
        setupTags?: string[] | null;
      }[]
    | null;
};

export type WatchVenueSide = {
  code: string;
  /** Hex when the curated map or CMS already has a colour. Otherwise null (slate). */
  colour: string | null;
};

export type WatchVenueFixtureCard = {
  id: string;
  title: string;
  dayId: string;
  dayChip: string;
  /** `15:30` in Africa/Johannesburg, or empty when the kickoff is not a time. */
  clock: string;
  cues: string[];
  /** `/events/…` only. Never another venue. */
  href: string | null;
  home: WatchVenueSide | null;
  away: WatchVenueSide | null;
};

export type WatchVenueWeek = {
  days: { id: string; chip: string }[];
  cards: WatchVenueFixtureCard[];
};

const CHIP_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  weekday: "short",
  day: "numeric",
});

function asIso(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  if (!text) return null;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function eventHref(slug: string | null | undefined): string | null {
  const clean = (slug ?? "").trim().replace(/^\/events\//, "");
  if (!clean || clean.includes("/") || clean.includes("venues")) return null;
  return `/events/${clean}`;
}

function sameTitle(a: string, b: string): boolean {
  return canonicalizeFixtureTitle(a) === canonicalizeFixtureTitle(b);
}

function findEvent(
  row: VenueScreeningDisplay,
  events: readonly WatchEventKickoff[],
): WatchEventKickoff | null {
  const iso = asIso(row.startsAt);
  const key = normalizeFixtureKey(row.title, iso ?? row.startsAt);
  const byKey = events.find(
    (event) =>
      event.startsAt &&
      normalizeFixtureKey(event.title, event.startsAt) === key,
  );
  if (byKey) return byKey;

  const day = fixtureCalendarDay(iso);
  const titled = events.filter(
    (event) => event.startsAt && sameTitle(event.title, row.title),
  );
  if (day) {
    const sameDay = titled.find(
      (event) => fixtureCalendarDay(event.startsAt) === day,
    );
    if (sameDay) return sameDay;
  }
  return null;
}

function findFixture(
  row: VenueScreeningDisplay,
  fixtures: readonly UpcomingFixture[],
): UpcomingFixture | null {
  const iso = asIso(row.startsAt);
  const key = normalizeFixtureKey(row.title, iso ?? row.startsAt);
  const byKey = fixtures.find(
    (fixture) => normalizeFixtureKey(fixture.title, fixture.startsAt) === key,
  );
  if (byKey) return byKey;
  const day = fixtureCalendarDay(iso);
  const titled = fixtures.filter((fixture) => sameTitle(fixture.title, row.title));
  if (day) {
    return (
      titled.find((fixture) => fixtureCalendarDay(fixture.startsAt) === day) ??
      null
    );
  }
  return null;
}

/**
 * Kickoff instant for the card. The event's own kickoff wins over the
 * venue screening clock, including when a merged fixture kept the earlier
 * screening time.
 */
export function resolveVenueKickoff(
  screeningStartsAt: string,
  eventStartsAt: string | null | undefined,
): string {
  const event = eventStartsAt?.trim() ?? "";
  if (event && !Number.isNaN(new Date(event).getTime())) return event;
  return screeningStartsAt;
}

const CUE_ORDER = ["Big screen", "Sound on"] as const;

function addCue(cues: string[], label: (typeof CUE_ORDER)[number]) {
  if (!cues.includes(label)) cues.push(label);
}

/** Big screen / sound on — only cues this screening or venue actually has. */
export function venueWatchCues(input: {
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  setupTags?: readonly string[] | null;
}): string[] {
  const cues: string[] = [];
  if (input.has_big_screens) addCue(cues, "Big screen");
  if (input.has_live_audio) addCue(cues, "Sound on");
  for (const tag of input.setupTags ?? []) {
    const text = tag.trim().toLowerCase();
    if (!text || /sound off|no sound|muted/.test(text)) continue;
    if (/big screen|hd screen|projector|\bscreens?\b/.test(text)) {
      addCue(cues, "Big screen");
    }
    if (/sound on|commentary|live audio|audio on/.test(text)) {
      addCue(cues, "Sound on");
    }
  }
  return CUE_ORDER.filter((label) => cues.includes(label));
}

export function watchFixtureDetailLine(clock: string, cues: readonly string[]): string {
  return [clock, ...cues].filter(Boolean).join(" · ");
}

function dayChip(iso: string): { id: string; chip: string } | null {
  const id = fixtureCalendarDay(iso);
  if (!id) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  const chip = CHIP_FORMAT.format(parsed).replace(/,/g, "").replace(/\s+/g, " ").trim();
  if (!chip) return null;
  return { id, chip };
}

function sideOf(
  side: { shortCode: string; primaryColour: string | null } | null,
): WatchVenueSide | null {
  if (!side?.shortCode) return null;
  return { code: side.shortCode, colour: side.primaryColour };
}

function teamHints(value: unknown): WatchFixtureTeamHint[] | null {
  if (!Array.isArray(value)) return null;
  const teams: WatchFixtureTeamHint[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) continue;
    teams.push({
      name,
      shortCode: typeof item.shortCode === "string" ? item.shortCode : null,
      primaryColour:
        typeof item.primaryColour === "string" ? item.primaryColour : null,
      secondaryColour:
        typeof item.secondaryColour === "string" ? item.secondaryColour : null,
    });
  }
  return teams.length > 0 ? teams : null;
}

/** CMS event rows → kickoffs. Drops blank titles and unparseable times. */
export function eventKickoffsFromRows(rows: unknown): WatchEventKickoff[] {
  if (!Array.isArray(rows)) return [];
  const out: WatchEventKickoff[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    const startsAt = typeof item.startsAt === "string" ? item.startsAt.trim() : "";
    if (!title || !slug || !startsAt) continue;
    if (Number.isNaN(new Date(startsAt).getTime())) continue;
    out.push({ title, slug, startsAt, teams: teamHints(item.teams) });
  }
  return out;
}

export function screeningListingDays(
  screenings: WatchVenueWeekInput["upcoming_screenings"],
  now: Date = new Date(),
): string[] {
  const days = new Set<string>();
  const cutoff = now.getTime() - UPCOMING_GRACE_MS;
  for (const screening of screenings ?? []) {
    const startsAt = (screening?.startsAt ?? "").trim();
    if (!screening?.title?.trim() || !startsAt) continue;
    const time = Date.parse(startsAt);
    if (Number.isFinite(time) && time < cutoff) continue;
    const day = fixtureCalendarDay(asIso(startsAt) ?? startsAt);
    if (day) days.add(day);
  }
  return [...days].sort();
}

export function buildWatchVenueWeek(input: {
  venue: WatchVenueWeekInput;
  fixtures?: readonly UpcomingFixture[];
  events?: readonly WatchEventKickoff[];
  now?: Date;
}): WatchVenueWeek {
  const now = input.now ?? new Date();
  const fixtures = input.fixtures ?? [];
  const events = input.events ?? [];
  const rows = mergeVenueUpcomingScreenings(
    {
      slug: input.venue.slug,
      upcoming_screenings: (input.venue.upcoming_screenings ?? []).map(
        (screening) => ({
          title: screening?.title,
          startsAt: screening?.startsAt,
          setupTags: screening?.setupTags ?? undefined,
        }),
      ),
    },
    [...fixtures],
    now,
  );

  const built: { card: WatchVenueFixtureCard; kickoffAt: string }[] = [];
  for (const row of rows) {
    const event = findEvent(row, events);
    const fixture = findFixture(row, fixtures);
    // A merged "both" row keeps the earlier screening clock. Only a
    // pure event row, or the event document itself, is the kickoff.
    const eventKickoff =
      event?.startsAt ??
      (fixture?.kind === "event" ? fixture.startsAt : null);
    const kickoff = resolveVenueKickoff(row.startsAt, eventKickoff);
    const day = dayChip(kickoff);
    if (!day) continue;
    const clock = formatWatchFixtureClock(kickoff) ?? "";
    const teams = event?.teams ?? fixture?.teams ?? null;
    const face = buildWatchFixtureFace({
      title: row.title,
      startsAt: kickoff,
      teams,
      venueSlugs: [],
    });
    const slug = event?.slug || fixture?.slug || null;
    const card: WatchVenueFixtureCard = {
      id: `${day.id}:${slug || row.title}:${kickoff}`,
      title: row.title,
      dayId: day.id,
      dayChip: day.chip,
      clock,
      cues: venueWatchCues({
        has_big_screens: input.venue.has_big_screens,
        has_live_audio: input.venue.has_live_audio,
        setupTags: row.setupTags,
      }),
      href: eventHref(slug),
      home: sideOf(face.home),
      away: sideOf(face.away),
    };
    built.push({ card, kickoffAt: kickoff });
  }

  built.sort(
    (a, b) =>
      a.kickoffAt.localeCompare(b.kickoffAt) ||
      a.card.title.localeCompare(b.card.title),
  );
  const cards = built.map((item) => item.card);
  const days: { id: string; chip: string }[] = [];
  for (const card of cards) {
    if (days.some((day) => day.id === card.dayId)) continue;
    days.push({ id: card.dayId, chip: card.dayChip });
  }
  return { days, cards };
}
