import {
  findOpenF1RaceSession,
  openF1CircuitLine,
  openF1SessionStatus,
  type OpenF1Meeting,
  type OpenF1Session,
} from "./openf1.ts";
import { replayHrefForEventSlug } from "./replay.ts";
import {
  fetchOpenF1MeetingsByYear,
  fetchOpenF1SessionsByYear,
} from "./upstream.ts";

export const REPLAY_CATALOG_MIN_YEAR = 2023;

export type ReplayCatalogStatus = "replay" | "live" | "upcoming";

export type ReplayCatalogItem = {
  meetingKey: number;
  meetingName: string;
  eventSlug: string;
  replayHref: string;
  circuitKey: number;
  circuitShortName: string;
  circuitLine: string;
  countryCode: string;
  countryName: string;
  countryFlag: string | null;
  location: string;
  year: number;
  round: number;
  sessionKey: number;
  raceStartIso: string;
  raceEndIso: string;
  dateStart: string;
  dateEnd: string;
  status: ReplayCatalogStatus;
};

export type ReplayCatalog = {
  year: number;
  races: ReplayCatalogItem[];
};

export function replayCatalogMaxYear(now: Date = new Date()): number {
  return Math.max(now.getUTCFullYear(), REPLAY_CATALOG_MIN_YEAR);
}

export function defaultReplayCatalogYear(now: Date = new Date()): number {
  const max = replayCatalogMaxYear(now);
  return Math.min(max, Math.max(REPLAY_CATALOG_MIN_YEAR, now.getUTCFullYear()));
}

export function replayCatalogYears(now: Date = new Date()): number[] {
  const max = replayCatalogMaxYear(now);
  const years: number[] = [];
  for (let year = REPLAY_CATALOG_MIN_YEAR; year <= max; year++) {
    years.push(year);
  }
  return years;
}

export function parseReplayCatalogYear(
  raw: string | null | undefined,
  now: Date = new Date(),
): number | null {
  const text = (raw ?? "").trim();
  if (!/^\d{4}$/.test(text)) return null;
  const year = Number(text);
  if (year < REPLAY_CATALOG_MIN_YEAR || year > replayCatalogMaxYear(now)) {
    return null;
  }
  return year;
}

export function replayCatalogYearOrDefault(
  raw: string | null | undefined,
  now: Date = new Date(),
): number {
  return parseReplayCatalogYear(raw, now) ?? defaultReplayCatalogYear(now);
}

export function isOpenF1TestingMeeting(name: string): boolean {
  return /\b(pre-season|testing|tests?)\b/i.test(name);
}

export function catalogStatusForRace(
  session: Pick<OpenF1Session, "dateStart" | "dateEnd" | "isCancelled">,
  now: Date = new Date(),
): ReplayCatalogStatus | null {
  const status = openF1SessionStatus(session, now);
  if (status === "cancelled") {
    // OpenF1 sometimes flags completed weekends cancelled after the fact.
    if (Date.parse(session.dateEnd) < now.getTime()) return "replay";
    return null;
  }
  if (status === "live") return "live";
  if (status === "completed") return "replay";
  return "upcoming";
}

function sessionsByMeeting(
  sessions: readonly OpenF1Session[],
): Map<number, OpenF1Session[]> {
  const grouped = new Map<number, OpenF1Session[]>();
  for (const session of sessions) {
    const existing = grouped.get(session.meetingKey);
    if (existing) {
      existing.push(session);
      continue;
    }
    grouped.set(session.meetingKey, [session]);
  }
  return grouped;
}

export function buildReplayCatalog(
  meetings: readonly OpenF1Meeting[],
  sessions: readonly OpenF1Session[],
  now: Date = new Date(),
): ReplayCatalogItem[] {
  const grouped = sessionsByMeeting(sessions);
  const items: ReplayCatalogItem[] = [];

  for (const meeting of meetings) {
    if (
      isOpenF1TestingMeeting(meeting.meetingName) ||
      isOpenF1TestingMeeting(meeting.meetingOfficialName)
    ) {
      continue;
    }
    const race = findOpenF1RaceSession(grouped.get(meeting.meetingKey) ?? [], {
      includeCancelled: true,
    });
    if (!race) continue;
    const status = catalogStatusForRace(race, now);
    if (!status) continue;

    items.push({
      meetingKey: meeting.meetingKey,
      meetingName: meeting.meetingName,
      eventSlug: meeting.eventSlug,
      replayHref: replayHrefForEventSlug(meeting.eventSlug),
      circuitKey: meeting.circuitKey,
      circuitShortName: meeting.circuitShortName,
      circuitLine: openF1CircuitLine(meeting),
      countryCode: meeting.countryCode,
      countryName: meeting.countryName,
      countryFlag: meeting.countryFlag,
      location: meeting.location,
      year: meeting.year,
      round: 0,
      sessionKey: race.sessionKey,
      raceStartIso: race.dateStart,
      raceEndIso: race.dateEnd,
      dateStart: meeting.dateStart,
      dateEnd: meeting.dateEnd,
      status,
    });
  }

  items.sort((a, b) => a.raceStartIso.localeCompare(b.raceStartIso));
  return items.map((item, index) => ({ ...item, round: index + 1 }));
}

export async function loadReplayCatalog(year: number): Promise<ReplayCatalog> {
  const [meetings, sessions] = await Promise.all([
    fetchOpenF1MeetingsByYear(year),
    fetchOpenF1SessionsByYear(year),
  ]);
  return { year, races: buildReplayCatalog(meetings, sessions) };
}

export async function loadReplayCatalogSafe(
  year: number,
): Promise<ReplayCatalog> {
  try {
    return await loadReplayCatalog(year);
  } catch (error) {
    console.error("[f1-replay] catalog failed", error);
    return { year, races: [] };
  }
}
