import { normaliseWatchTeamColour, parseWatchFixtureTitle } from "../intent/watch-fixture-card.ts";
import { lookupWatchTeamBrand } from "../intent/watch-team-colours.ts";
import { FIXTURE_TIMEZONE } from "../sports/events-feed.ts";
import { resolvePosterFlag, type PosterFlag } from "./poster-flags.ts";

/**
 * Split-poster colour resolution for the event-page hero.
 *
 * Team fill: a valid CMS hex wins. A blank CMS colour falls back to the
 * curated Watch kit map. A non-empty value that is not hex stays unset and
 * paints the neutral slate — it does not silently swap in the curated kit.
 * Race posters use a flag-icons 4:3 SVG. Unknown nations, Ireland, and a
 * failed image fall back to a solid band with outlined initials.
 */

export const SPLIT_POSTER_NEUTRAL = "#3a4658";
export const SPLIT_POSTER_NEUTRAL_ALT = "#2c3646";
export const SPLIT_POSTER_INK = "#0B0B0B";
export const SPLIT_POSTER_PAPER = "#ffffff";

export type SplitPosterColourSource = "cms" | "curated" | "neutral";

export type ResolvedTeamColour = {
  name: string;
  fill: string;
  source: SplitPosterColourSource;
};

export type PosterSide = {
  name: string;
  displayName: string;
  fill: string;
  ink: string;
  source: SplitPosterColourSource;
  /** Pirates read as black-and-white pinstripe. Light fields get a halftone. */
  texture: "solid" | "pinstripe" | "halftone";
  /** Small tracked corner label, when the kit has one. */
  epithet: string | null;
};

export type SplitPosterModel =
  | {
      kind: "match";
      headlineHome: string;
      headlineAway: string;
      breadcrumb: string;
      eyebrow: string;
      sportLabel: string | null;
      metaDate: string | null;
      metaClock: string;
      home: PosterSide;
      away: PosterSide;
      /** Big corner line on the away side, e.g. the rivalry name. */
      cornerTitle: string | null;
      dateLine: string;
    }
  | {
      kind: "race";
      headline: string;
      breadcrumb: string;
      eyebrow: string;
      sportLabel: string | null;
      metaDate: string | null;
      metaClock: string;
      lead: string;
      rest: string;
      kicker: string;
      flag: PosterFlag;
      circuit: string | null;
      dateLine: string;
      weekendLine: string | null;
      numeral: string | null;
    }
  | {
      kind: "title";
      headline: string;
      breadcrumb: string;
      eyebrow: string;
      sportLabel: string | null;
      metaDate: string | null;
      metaClock: string | null;
      dateLine: string | null;
      fill: string;
    };

export type SplitPosterInput = {
  title: string;
  sportSlug?: string | null;
  sportName?: string | null;
  competition?: string | null;
  series?: string | null;
  startsAt?: string | null;
  teams?: readonly { name: string; primaryColour?: string | null }[] | null;
  countryCode?: string | null;
  countryName?: string | null;
  place?: string | null;
  /** Circuit or track line under the giant title. */
  circuit?: string | null;
  weekendStart?: string | null;
  weekendEnd?: string | null;
};

const GENERIC_LAST = new Set([
  "fc",
  "afc",
  "rfc",
  "cf",
  "sc",
  "united",
  "city",
  "town",
  "rovers",
  "athletic",
  "wanderers",
]);

const DATE_STAMP = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DAY_MONTH = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  day: "numeric",
  month: "short",
});

const CLOCK = new Intl.DateTimeFormat("en-GB", {
  timeZone: FIXTURE_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function posterInk(fill: string): "#0B0B0B" | "#ffffff" {
  const hex = normaliseWatchTeamColour(fill) ?? SPLIT_POSTER_NEUTRAL;
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? SPLIT_POSTER_INK : SPLIT_POSTER_PAPER;
}

export function resolveTeamPosterColour(input: {
  name: string;
  primaryColour?: string | null;
}): ResolvedTeamColour {
  const name = input.name.trim();
  const provided = (input.primaryColour ?? "").trim();
  if (provided) {
    const hex = normaliseWatchTeamColour(provided);
    if (hex) return { name, fill: hex, source: "cms" };
    return { name, fill: SPLIT_POSTER_NEUTRAL, source: "neutral" };
  }
  const curated = normaliseWatchTeamColour(lookupWatchTeamBrand(name)?.primaryColour);
  if (curated) return { name, fill: curated, source: "curated" };
  return { name, fill: SPLIT_POSTER_NEUTRAL, source: "neutral" };
}

/** Giant-type name: the distinctive last word, otherwise the full name. */
export function posterDisplayName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  const words = trimmed.split(" ").filter(Boolean);
  if (words.length >= 2) {
    const last = words[words.length - 1] ?? "";
    if (last.length >= 4 && !GENERIC_LAST.has(last.toLowerCase())) return last;
  }
  return trimmed;
}

function raceBreadcrumb(title: string): string {
  const stripped = title
    .replace(/\bgrand\s+prix\b/gi, "")
    .replace(/\bgp\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped ? `${stripped} GP` : "Grand Prix";
}

export function grandPrixPosterLines(title: string): { lead: string; rest: string } {
  const stripped = title
    .replace(/\bgrand\s+prix\b/gi, "")
    .replace(/\bgp\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = stripped.split(" ").filter(Boolean);
  if (words.length === 0) return { lead: "GRAND", rest: "PRIX" };
  if (words.length === 1) return { lead: words[0]!.toLocaleUpperCase("en"), rest: "" };
  return {
    lead: words[0]!.toLocaleUpperCase("en"),
    rest: words.slice(1).join(" ").toLocaleUpperCase("en"),
  };
}

function parsedInstant(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatMetaDate(instant: Date): string {
  return DATE_STAMP.format(instant).replace(/,/g, "").replace(/\s+/g, " ").trim();
}

function formatDayMonth(instant: Date): string {
  return DAY_MONTH.format(instant).replace(/,/g, "").replace(/\s+/g, " ").trim();
}

function formatClock(instant: Date): string {
  return CLOCK.format(instant);
}

function numeralFrom(instant: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: FIXTURE_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(instant);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return day && month ? `${day}.${month}` : "";
}

function clockPhrase(kind: "match" | "race", instant: Date | null): string {
  const label = kind === "race" ? "Lights out" : "Kick-off";
  if (!instant) return `${label} TBC`;
  return `${label} ${formatClock(instant)}`;
}

function posterDateLine(kind: "match" | "race", instant: Date | null): string {
  const clock = clockPhrase(kind, instant).toLocaleUpperCase("en");
  if (!instant) return clock;
  return `${formatMetaDate(instant).toLocaleUpperCase("en")} · ${clock}`;
}

function weekendLine(startIso: string | null | undefined, endIso: string | null | undefined): string | null {
  const start = parsedInstant(startIso);
  const end = parsedInstant(endIso);
  if (!start && !end) return null;
  if (start && end) {
    const a = formatDayMonth(start).toLocaleUpperCase("en");
    const b = formatDayMonth(end).toLocaleUpperCase("en");
    if (a === b) return `RACE DAY · ${a}`;
    return `RACE WEEKEND · ${a} – ${b}`;
  }
  const only = formatDayMonth((start ?? end)!).toLocaleUpperCase("en");
  return `RACE DAY · ${only}`;
}

function epithetFor(name: string): string | null {
  const code = lookupWatchTeamBrand(name)?.shortCode;
  if (code === "KAI") return "Gold & black";
  if (code === "ORL") return "Black & white";
  return null;
}

function sideTexture(name: string, fill: string): PosterSide["texture"] {
  if (lookupWatchTeamBrand(name)?.shortCode === "ORL" && posterInk(fill) === SPLIT_POSTER_PAPER) {
    return "pinstripe";
  }
  if (posterInk(fill) === SPLIT_POSTER_INK) return "halftone";
  return "solid";
}

function toSide(input: { name: string; primaryColour?: string | null }, fillOverride?: string): PosterSide {
  const resolved = resolveTeamPosterColour(input);
  const fill = fillOverride ?? resolved.fill;
  return {
    name: resolved.name,
    displayName: posterDisplayName(resolved.name),
    fill,
    ink: posterInk(fill),
    source: resolved.source,
    texture: sideTexture(resolved.name, fill),
    epithet: epithetFor(resolved.name),
  };
}

function rivalryLabel(a: string, b: string): string | null {
  const codes = [lookupWatchTeamBrand(a)?.shortCode, lookupWatchTeamBrand(b)?.shortCode]
    .filter((code): code is string => Boolean(code))
    .sort();
  if (codes[0] === "KAI" && codes[1] === "ORL") return "The Soweto derby";
  return null;
}

function teamPair(input: SplitPosterInput): { home: PosterSide; away: PosterSide } | null {
  const teams = (input.teams ?? []).filter((team) => team.name.trim());
  if (teams.length >= 2) {
    const home = toSide(teams[0]!);
    let away = toSide(teams[1]!);
    if (home.source === "neutral" && away.source === "neutral" && home.fill === away.fill) {
      away = { ...away, fill: SPLIT_POSTER_NEUTRAL_ALT, ink: posterInk(SPLIT_POSTER_NEUTRAL_ALT) };
    }
    return { home, away };
  }
  const parsed = parseWatchFixtureTitle(input.title);
  if (!parsed) return null;
  const home = toSide({ name: parsed.home });
  let away = toSide({ name: parsed.away });
  if (home.source === "neutral" && away.source === "neutral" && home.fill === away.fill) {
    away = { ...away, fill: SPLIT_POSTER_NEUTRAL_ALT, ink: posterInk(SPLIT_POSTER_NEUTRAL_ALT) };
  }
  return { home, away };
}

function isMotorsport(input: SplitPosterInput): boolean {
  const sport = (input.sportSlug ?? "").trim().toLowerCase();
  const series = (input.series ?? "").trim().toLowerCase();
  if (sport === "motorsport" || sport === "f1" || sport === "formula-1") return true;
  if (series === "f1" || series === "formula-1" || series === "formula 1" || series === "f2") return true;
  return /\bgrand\s+prix\b/i.test(input.title);
}

function sportLabel(input: SplitPosterInput): string | null {
  const name = input.sportName?.trim();
  if (name) return name;
  const slug = input.sportSlug?.trim();
  if (!slug) return null;
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function eyebrow(sport: string | null, context: string | null): string {
  const lead = sport ? `Watch ${sport}` : "Watch";
  return context ? `${lead} · ${context}` : lead;
}

function raceKicker(input: SplitPosterInput): string {
  const series = (input.series ?? "").trim().toLowerCase();
  const competition = (input.competition ?? "").trim().toLowerCase();
  if (
    series === "f1" ||
    series === "formula-1" ||
    series === "formula 1" ||
    competition.includes("formula 1") ||
    competition.includes("formula one")
  ) {
    return "FORMULA 1";
  }
  return (input.sportName ?? input.sportSlug ?? "Race").toUpperCase();
}

export function buildSplitPoster(input: SplitPosterInput): SplitPosterModel {
  const instant = parsedInstant(input.startsAt);
  const sport = sportLabel(input);
  const metaDate = instant ? formatMetaDate(instant) : null;
  const pair = teamPair(input);

  if (pair) {
    const rivalry = rivalryLabel(pair.home.name, pair.away.name);
    const competition = input.competition?.trim() || null;
    const corner = rivalry ?? competition;
    const metaClock = clockPhrase("match", instant);
    return {
      kind: "match",
      headlineHome: pair.home.displayName,
      headlineAway: pair.away.displayName,
      breadcrumb: `${pair.home.displayName} vs ${pair.away.displayName}`,
      eyebrow: eyebrow(sport, rivalry ?? competition),
      sportLabel: sport,
      metaDate,
      metaClock,
      home: pair.home,
      away: pair.away,
      cornerTitle: corner,
      dateLine: posterDateLine("match", instant),
    };
  }

  if (isMotorsport(input)) {
    const lines = grandPrixPosterLines(input.title);
    const place =
      input.place?.trim() ||
      input.title.replace(/\bgrand\s+prix\b/gi, "").replace(/\bgp\b/gi, "").replace(/\s+/g, " ").trim() ||
      input.countryName?.trim() ||
      null;
    const flag = resolvePosterFlag({
      countryCode: input.countryCode,
      countryName: input.countryName,
      hint: `${input.place ?? ""} ${input.countryName ?? ""} ${input.title}`,
    });
    const headline = `${[lines.lead, lines.rest].filter(Boolean).join(" ")} GP`.replace(/\s+/g, " ");
    return {
      kind: "race",
      headline,
      breadcrumb: raceBreadcrumb(input.title),
      eyebrow: eyebrow(sport, place),
      sportLabel: sport,
      metaDate,
      metaClock: clockPhrase("race", instant),
      lead: lines.lead,
      rest: lines.rest,
      kicker: raceKicker(input),
      flag,
      circuit: input.circuit?.trim() || null,
      dateLine: posterDateLine("race", instant),
      weekendLine:
        weekendLine(input.weekendStart, input.weekendEnd) ??
        (instant ? `RACE DAY · ${formatDayMonth(instant).toLocaleUpperCase("en")}` : null),
      numeral: instant ? numeralFrom(instant) : null,
    };
  }

  const headline = input.title.trim() || "Event";
  return {
    kind: "title",
    headline,
    breadcrumb: headline,
    eyebrow: eyebrow(sport, input.competition?.trim() || null),
    sportLabel: sport,
    metaDate,
    metaClock: instant ? clockPhrase("match", instant) : null,
    dateLine: instant ? posterDateLine("match", instant) : null,
    fill: SPLIT_POSTER_NEUTRAL,
  };
}

function calendarStamp(instant: Date): string {
  const year = instant.getUTCFullYear().toString().padStart(4, "0");
  const month = (instant.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = instant.getUTCDate().toString().padStart(2, "0");
  const hour = instant.getUTCHours().toString().padStart(2, "0");
  const minute = instant.getUTCMinutes().toString().padStart(2, "0");
  const second = instant.getUTCSeconds().toString().padStart(2, "0");
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

/** Google Calendar template. No start time still opens the composer with the title. */
export function fixtureCalendarUrl(input: {
  title: string;
  startsAt?: string | null;
  detailsUrl: string;
  durationMinutes?: number;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title.trim(),
    details: input.detailsUrl,
  });
  const start = parsedInstant(input.startsAt);
  if (start) {
    const end = new Date(start.getTime() + (input.durationMinutes ?? 120) * 60 * 1000);
    params.set("dates", `${calendarStamp(start)}/${calendarStamp(end)}`);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
