import { FIXTURE_TIMEZONE, fixtureCalendarDay } from "../sports/events-feed.ts";
import { lookupWatchTeamBrand } from "./watch-team-colours.ts";

/**
 * Pill-sandwich presentation for Watch hub fixtures.
 *
 * Team sides prefer CMS `teams[]` (name, optional shortCode / colours).
 * When those are missing, home/away are parsed from "A vs B" in the title.
 * That title parse is fragile — it is not a club code, and it must not invent
 * a crest. A blank primary colour falls back to a curated name → kit map.
 * A non-empty CMS value that is not a hex stays unset. Unmatched names stay
 * null so the card can paint neutral slate.
 * The centre cluster is either the kickoff clock or `score–FT–score`, never both.
 */

export const WATCH_FIXTURE_CAROUSEL_LIMIT = 8;

/** Neutral fills when a side has no usable colour. Not a team brand. */
export const WATCH_FIXTURE_SLATE = "#3a4658";
export const WATCH_FIXTURE_SLATE_AWAY = "#2c3646";

const EN_DASH = "\u2013";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const PILL_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

export type WatchFixtureSide = {
  name: string;
  /** Three letters. CMS shortCode wins; otherwise the first three letters of the name. */
  shortCode: string;
  /** Normalised hex, or null when the card should use slate. */
  primaryColour: string | null;
  secondaryColour: string | null;
};

export type WatchFixtureCentre =
  | { kind: "kickoff"; label: string }
  | {
      kind: "score";
      status: "FT" | "LIVE";
      homeScore: number;
      awayScore: number;
      label: string;
    };

export type WatchFixtureFace = {
  topPill: string;
  centre: WatchFixtureCentre;
  home: WatchFixtureSide | null;
  away: WatchFixtureSide | null;
  /** `title` is the fragile interim path. CMS names win when two teams are present. */
  sidesSource: "cms" | "title" | "none";
  /** `{n} venues screening`, one venue name, or "No venues listed". */
  bottomPill: string | null;
};

export type WatchFixtureTeamHint = {
  name: string;
  shortCode?: string | null;
  primaryColour?: string | null;
  secondaryColour?: string | null;
};

export type WatchFixtureScore = {
  status: "FT" | "LIVE";
  homeScore: number;
  awayScore: number;
};

const VS_TITLE =
  /^(.*?)\s+(?:versus|vs\.?|v\.?)\s+(.*?)$/i;

export function deriveWatchShortCode(name: string): string {
  const letters = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "");
  return letters.slice(0, 3).toUpperCase();
}

function resolveShortCode(
  raw: string | null | undefined,
  name: string,
  curated?: string,
): string {
  const letters = (raw ?? "").replace(/[^A-Za-z]/g, "").toUpperCase();
  if (letters.length >= 3) return letters.slice(0, 3);
  if (letters.length > 0) return letters;
  return curated || deriveWatchShortCode(name);
}

/** Hex only. Anything else (names, urls, gradients) is missing colour → slate. */
export function normaliseWatchTeamColour(
  value: string | null | undefined,
): string | null {
  const raw = (value ?? "").trim();
  if (!raw || /url\s*\(|gradient\(/i.test(raw)) return null;
  const match = raw.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match?.[1]) return null;
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return `#${hex.toLowerCase()}`;
}

export function watchFixtureFill(
  colour: string | null | undefined,
  side: "home" | "away",
): string {
  return normaliseWatchTeamColour(colour) ??
    (side === "home" ? WATCH_FIXTURE_SLATE : WATCH_FIXTURE_SLATE_AWAY);
}

/** Dark ink on light fills so initials stay readable. */
export function watchFixtureInk(fill: string): "#0c0f0c" | "#ffffff" {
  const hex = normaliseWatchTeamColour(fill) ?? WATCH_FIXTURE_SLATE;
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? "#0c0f0c" : "#ffffff";
}

export function parseWatchFixtureTitle(
  title: string,
): { home: string; away: string } | null {
  const match = title.trim().match(VS_TITLE);
  const home = match?.[1]?.trim() ?? "";
  const away = match?.[2]?.trim() ?? "";
  if (!home || !away) return null;
  return { home, away };
}

export function normaliseWatchFixtureScore(value: unknown): WatchFixtureScore | null {
  if (!value || typeof value !== "object") return null;
  const row = value as {
    status?: unknown;
    homeScore?: unknown;
    awayScore?: unknown;
  };
  const token = String(row.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  const status =
    token === "ft" || token === "fulltime" || token === "final"
      ? "FT"
      : token === "live" || token === "inplay"
        ? "LIVE"
        : null;
  if (!status) return null;
  if (typeof row.homeScore !== "number" || typeof row.awayScore !== "number") {
    return null;
  }
  if (!Number.isFinite(row.homeScore) || !Number.isFinite(row.awayScore)) return null;
  if (row.homeScore < 0 || row.awayScore < 0) return null;
  return {
    status,
    homeScore: Math.trunc(row.homeScore),
    awayScore: Math.trunc(row.awayScore),
  };
}

function formatParts(startsAt: string): Intl.DateTimeFormatPart[] | null {
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return PILL_FORMAT.formatToParts(parsed);
}

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((item) => item.type === type)?.value ?? "";
}

export function formatWatchFixtureClock(startsAt: string): string | null {
  const parts = formatParts(startsAt);
  if (!parts) return null;
  const hour = part(parts, "hour").replace(/\D/g, "");
  const minute = part(parts, "minute").replace(/\D/g, "");
  if (!hour || !minute) return null;
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/** `SAT 31 OCT` — date only. Time and status are appended by the caller. */
export function formatWatchFixtureDateStamp(startsAt: string): string | null {
  const parts = formatParts(startsAt);
  if (!parts) return null;
  const weekday = part(parts, "weekday").replace(/\./g, "").slice(0, 3).toUpperCase();
  const day = part(parts, "day").replace(/\D/g, "");
  const ymd = fixtureCalendarDay(startsAt);
  const monthIndex = ymd ? Number(ymd.slice(5, 7)) - 1 : -1;
  const month = MONTHS[monthIndex];
  if (!weekday || !day || !month) return null;
  return `${weekday} ${day} ${month}`;
}

/** `Saturday 31 October` for the View all groups. */
export function formatWatchFixtureDayLabel(startsAt: string): string | null {
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return null;
  const label = DAY_FORMAT.format(parsed).replace(/,/g, "").replace(/\s+/g, " ").trim();
  return label || null;
}

function sideFrom(
  name: string,
  hint: WatchFixtureTeamHint | null | undefined,
): WatchFixtureSide {
  const brand = lookupWatchTeamBrand(name);
  const rawPrimary = hint?.primaryColour;
  const cmsColourProvided = Boolean((rawPrimary ?? "").trim());
  return {
    name,
    shortCode: resolveShortCode(hint?.shortCode, name, brand?.shortCode),
    primaryColour: cmsColourProvided
      ? normaliseWatchTeamColour(rawPrimary)
      : normaliseWatchTeamColour(brand?.primaryColour),
    secondaryColour: normaliseWatchTeamColour(hint?.secondaryColour),
  };
}

function resolveSides(input: {
  title: string;
  teams?: readonly WatchFixtureTeamHint[] | null;
}): {
  home: WatchFixtureSide | null;
  away: WatchFixtureSide | null;
  sidesSource: WatchFixtureFace["sidesSource"];
} {
  const teams = (input.teams ?? []).filter((team) => team.name.trim());
  if (teams.length >= 2) {
    return {
      home: sideFrom(teams[0]!.name.trim(), teams[0]),
      away: sideFrom(teams[1]!.name.trim(), teams[1]),
      sidesSource: "cms",
    };
  }
  const parsed = parseWatchFixtureTitle(input.title);
  if (!parsed) return { home: null, away: null, sidesSource: "none" };
  return {
    home: sideFrom(parsed.home, null),
    away: sideFrom(parsed.away, null),
    sidesSource: "title",
  };
}

export function watchFixtureBottomPill(input: {
  venueSlugs: readonly string[];
  venueNames: ReadonlyMap<string, string> | Readonly<Record<string, string>>;
}): string {
  const slugs = input.venueSlugs.map((slug) => slug.trim()).filter(Boolean);
  if (slugs.length === 0) return "No venues listed";
  if (slugs.length === 1) {
    const slug = slugs[0]!;
    const names = input.venueNames;
    const fromMap =
      names instanceof Map
        ? names.get(slug)
        : (names as Readonly<Record<string, string>>)[slug];
    const name = (fromMap ?? "").trim();
    return name || slug;
  }
  return `${slugs.length} venues screening`;
}

export function buildWatchFixtureFace(input: {
  title: string;
  startsAt: string;
  teams?: readonly WatchFixtureTeamHint[] | null;
  venueSlugs: readonly string[];
  venueNames?: ReadonlyMap<string, string> | Readonly<Record<string, string>>;
  score?: unknown;
}): WatchFixtureFace {
  const sides = resolveSides(input);
  const clock = formatWatchFixtureClock(input.startsAt);
  const date = formatWatchFixtureDateStamp(input.startsAt);
  const score = normaliseWatchFixtureScore(input.score);
  const bottomPill = watchFixtureBottomPill({
    venueSlugs: input.venueSlugs,
    venueNames: input.venueNames ?? new Map(),
  });

  if (score && sides.home && sides.away) {
    const label = `${score.homeScore}${EN_DASH}${score.status}${EN_DASH}${score.awayScore}`;
    return {
      topPill: date ? `${date} · ${score.status}` : score.status,
      centre: {
        kind: "score",
        status: score.status,
        homeScore: score.homeScore,
        awayScore: score.awayScore,
        label,
      },
      ...sides,
      bottomPill,
    };
  }

  const kickoff = clock ?? "";
  return {
    topPill: date && kickoff ? `${date} · ${kickoff}` : date || kickoff,
    centre: { kind: "kickoff", label: kickoff },
    ...sides,
    bottomPill,
  };
}

export function watchCarouselFixtures<T>(rows: readonly T[]): T[] {
  return rows.slice(0, WATCH_FIXTURE_CAROUSEL_LIMIT);
}

/**
 * One competition eyebrow for the carousel, only when every card shares it.
 * Mixed strips leave the name for View all.
 */
export function watchStripCompetition(
  rows: readonly { competition: string | null }[],
): string | null {
  if (rows.length === 0) return null;
  const first = rows[0]?.competition?.trim() || null;
  if (!first) return null;
  for (const row of rows) {
    if ((row.competition?.trim() || null) !== first) return null;
  }
  return first;
}

export function groupWatchFixturesByDay<T extends { startsAt: string }>(
  rows: readonly T[],
): { id: string; label: string; rows: T[] }[] {
  const groups: { id: string; label: string; rows: T[] }[] = [];
  for (const row of rows) {
    const id = fixtureCalendarDay(row.startsAt) ?? "undated";
    const label = formatWatchFixtureDayLabel(row.startsAt) ?? "Upcoming";
    const last = groups[groups.length - 1];
    if (last && last.id === id) last.rows.push(row);
    else groups.push({ id, label, rows: [row] });
  }
  return groups;
}

/** First word only — a disambiguation label, not a crest. */
export function watchSportMicroLabel(sportName: string | null | undefined): string | null {
  const word = sportName?.trim().split(/\s+/)[0]?.trim() ?? "";
  return word || null;
}

/** `8 for ORL vs KAI` — the sticky / list header after the word Showing. */
export function watchFixtureSelectionDetail(input: {
  count: number;
  title: string;
  homeCode?: string | null;
  awayCode?: string | null;
}): string {
  const count = Number.isFinite(input.count) ? Math.max(0, Math.trunc(input.count)) : 0;
  const home = input.homeCode?.trim() || "";
  const away = input.awayCode?.trim() || "";
  const match = home && away ? `${home} vs ${away}` : input.title.trim() || "this fixture";
  return `${count} for ${match}`;
}

export function watchAllFixturesHref(sourcePage: string): string {
  const path = sourcePage.trim() || "/watch";
  const splitAt = path.indexOf("?");
  const pathname = splitAt === -1 ? path : path.slice(0, splitAt);
  const params = new URLSearchParams(splitAt === -1 ? "" : path.slice(splitAt + 1));
  params.set("view", "fixtures");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function isWatchFixturesView(raw: string | null | undefined): boolean {
  return (raw ?? "").trim().toLowerCase() === "fixtures";
}
