import { invokeFetch } from "../invoke-fetch.ts";
import { FIXTURE_TIMEZONE, fixtureCalendarDay } from "../sports/events-feed.ts";

/** Public historical meetings and sessions. No Railway proxy. */
export const OPENF1_PUBLIC_ORIGIN = "https://api.openf1.org/v1";

/** Align with `/events/[slug]` ISR (`revalidate = 300`). */
export const OPENF1_REVALIDATE_SECONDS = 300;

const OPENF1_TIMEOUT_MS = 12_000;

/** OpenF1 circuit maps and country flags are served from the F1 media CDN. */
export const OPENF1_MEDIA_HOST = "media.formula1.com";

const F1_SERIES = new Set(["f1", "formula-1", "formula 1", "formula1"]);
const EVENT_SLUG = /^([a-z0-9]+(?:-[a-z0-9]+)*)-(\d{4}-\d{2}-\d{2})$/;
const NAME_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type OpenF1Meeting = {
  meetingKey: number;
  meetingName: string;
  meetingOfficialName: string;
  eventSlug: string;
  circuitKey: number;
  circuitShortName: string;
  circuitType: string | null;
  circuitImage: string | null;
  circuitInfoUrl: string | null;
  countryKey: number;
  countryCode: string;
  countryName: string;
  countryFlag: string | null;
  dateStart: string;
  dateEnd: string;
  gmtOffset: string;
  isCancelled: boolean;
  location: string;
  year: number;
};

export type OpenF1Session = {
  sessionKey: number;
  sessionName: string;
  sessionType: string;
  meetingKey: number;
  circuitKey: number;
  circuitShortName: string;
  countryKey: number;
  countryCode: string;
  countryName: string;
  dateStart: string;
  dateEnd: string;
  gmtOffset: string;
  isCancelled: boolean;
  location: string;
  year: number;
};

export type OpenF1Weekend = {
  meeting: OpenF1Meeting;
  sessions: OpenF1Session[];
};

export type OpenF1SessionStatus =
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled";

export type OpenF1SessionDayGroup = {
  day: string;
  label: string;
  sessions: OpenF1Session[];
};

export type OpenF1Deps = {
  fetch: typeof fetch;
  signal?: AbortSignal;
};

type NextFetchInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
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

function asPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return parsed > 0 ? parsed : null;
  }
  return null;
}

function asYear(value: unknown): number | null {
  const year = asPositiveInt(value);
  if (year === null || year < 1950 || year > 2100) return null;
  return year;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function isValidUtcDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

/** HTTPS circuit/flag URLs on the F1 media CDN only — drop other hosts. */
export function parseOpenF1MediaUrl(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (url.hostname !== OPENF1_MEDIA_HOST) return null;
    if (url.hash) url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

export function parseOpenF1EventSlug(
  slug: string,
): { nameSlug: string; date: string } | null {
  const trimmed = slug.trim().toLowerCase();
  const match = EVENT_SLUG.exec(trimmed);
  if (!match?.[1] || !match[2] || !isValidUtcDate(match[2])) return null;
  return { nameSlug: match[1], date: match[2] };
}

export function isOpenF1EventSlug(slug: string): boolean {
  return parseOpenF1EventSlug(slug) !== null;
}

export function slugifyOpenF1Name(raw: string): string | null {
  const slug = raw
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return NAME_SLUG.test(slug) ? slug : null;
}

export function utcDateOnly(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function openF1EventSlugFromNameAndInstant(
  nameOrSlug: string,
  iso: string | null | undefined,
): string | null {
  const existing = parseOpenF1EventSlug(nameOrSlug);
  if (existing) return `${existing.nameSlug}-${existing.date}`;
  const nameSlug = slugifyOpenF1Name(nameOrSlug);
  const date = utcDateOnly(iso);
  if (!nameSlug || !date) return null;
  return `${nameSlug}-${date}`;
}

export function isOpenF1EnrichableSeries(
  series: string | null | undefined,
): boolean {
  return F1_SERIES.has((series ?? "").trim().toLowerCase());
}

export function isOpenF1EnrichableFixture(fixture: {
  series?: string | null;
  eventPageHref?: string | null;
}): boolean {
  if (isOpenF1EnrichableSeries(fixture.series)) return true;
  return Boolean(fixture.eventPageHref?.startsWith("/motorsport/f1/"));
}

/**
 * OpenF1 GP slugs look like `name-YYYY-MM-DD`. CMS rugby fixtures use the
 * same shape (`springboks-vs-all-blacks-2026-09-13`), so slug-shape alone
 * must not mount a race replay. Known fixtures need an F1 series (or an
 * `/motorsport/f1/` event page). Slug-only GPs without a CMS fixture stay
 * eligible so `/events/:gp/replay` still works.
 */
export function eventRaceReplaySlug(input: {
  slug: string;
  fixture?: {
    series?: string | null;
    eventPageHref?: string | null;
  } | null;
  weekendEventSlug?: string | null;
}): string | null {
  if (input.fixture && !isOpenF1EnrichableFixture(input.fixture)) return null;
  const fromWeekend = input.weekendEventSlug?.trim();
  if (fromWeekend) return fromWeekend;
  return isOpenF1EventSlug(input.slug) ? input.slug : null;
}

export function openF1EventSlugForFixture(fixture: {
  slug: string;
  title: string;
  startsAt?: string | null;
}): string | null {
  const fromSlug = parseOpenF1EventSlug(fixture.slug);
  if (fromSlug) return `${fromSlug.nameSlug}-${fromSlug.date}`;
  return openF1EventSlugFromNameAndInstant(fixture.title, fixture.startsAt);
}

export function openF1PublicMeetingsUrl(year: number): string {
  return `${OPENF1_PUBLIC_ORIGIN}/meetings?year=${year}`;
}

export function openF1PublicSessionsUrl(meetingKey: number): string {
  return `${OPENF1_PUBLIC_ORIGIN}/sessions?meeting_key=${meetingKey}`;
}

function pickField(
  row: Record<string, unknown>,
  camel: string,
  snake: string,
): unknown {
  return row[camel] ?? row[snake];
}

/**
 * Public OpenF1 rows are snake_case and have no event slug. The slug is the
 * meeting name plus the UTC end date (race day), matching the old weekend route.
 */
export function openF1MeetingFromPublicApi(value: unknown): OpenF1Meeting | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const meetingName = asString(pickField(row, "meetingName", "meeting_name"));
  const dateEnd = asString(pickField(row, "dateEnd", "date_end"));
  const nameSlug = slugifyOpenF1Name(meetingName);
  const endDate = utcDateOnly(dateEnd);
  const explicit = asString(pickField(row, "eventSlug", "event_slug")).toLowerCase();
  const eventSlug = explicit || (nameSlug && endDate ? `${nameSlug}-${endDate}` : "");
  return parseOpenF1Meeting({
    meetingKey: pickField(row, "meetingKey", "meeting_key"),
    meetingName,
    meetingOfficialName:
      asString(pickField(row, "meetingOfficialName", "meeting_official_name")) ||
      meetingName,
    eventSlug,
    circuitKey: pickField(row, "circuitKey", "circuit_key"),
    circuitShortName: pickField(row, "circuitShortName", "circuit_short_name"),
    circuitType: pickField(row, "circuitType", "circuit_type"),
    circuitImage: pickField(row, "circuitImage", "circuit_image"),
    circuitInfoUrl: pickField(row, "circuitInfoUrl", "circuit_info_url"),
    countryKey: pickField(row, "countryKey", "country_key"),
    countryCode: pickField(row, "countryCode", "country_code"),
    countryName: pickField(row, "countryName", "country_name"),
    countryFlag: pickField(row, "countryFlag", "country_flag"),
    dateStart: pickField(row, "dateStart", "date_start"),
    dateEnd,
    gmtOffset: pickField(row, "gmtOffset", "gmt_offset"),
    isCancelled: pickField(row, "isCancelled", "is_cancelled"),
    location: pickField(row, "location", "location"),
    year: row.year,
  });
}

export function openF1SessionFromPublicApi(value: unknown): OpenF1Session | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return parseOpenF1Session({
    sessionKey: pickField(row, "sessionKey", "session_key"),
    sessionName: pickField(row, "sessionName", "session_name"),
    sessionType: pickField(row, "sessionType", "session_type"),
    meetingKey: pickField(row, "meetingKey", "meeting_key"),
    circuitKey: pickField(row, "circuitKey", "circuit_key"),
    circuitShortName: pickField(row, "circuitShortName", "circuit_short_name"),
    countryKey: pickField(row, "countryKey", "country_key"),
    countryCode: pickField(row, "countryCode", "country_code"),
    countryName: pickField(row, "countryName", "country_name"),
    dateStart: pickField(row, "dateStart", "date_start"),
    dateEnd: pickField(row, "dateEnd", "date_end"),
    gmtOffset: pickField(row, "gmtOffset", "gmt_offset"),
    isCancelled: pickField(row, "isCancelled", "is_cancelled"),
    location: pickField(row, "location", "location"),
    year: row.year,
  });
}

function meetingCoversEventSlug(meeting: OpenF1Meeting, eventSlug: string): boolean {
  const parsed = parseOpenF1EventSlug(eventSlug);
  if (!parsed) return false;
  if (meeting.eventSlug === `${parsed.nameSlug}-${parsed.date}`) return true;
  const name = slugifyOpenF1Name(meeting.meetingName);
  if (name !== parsed.nameSlug) return false;
  const start = utcDateOnly(meeting.dateStart);
  const end = utcDateOnly(meeting.dateEnd);
  if (!start || !end) return false;
  return parsed.date >= start && parsed.date <= end;
}

export function parseOpenF1Meeting(value: unknown): OpenF1Meeting | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const meetingKey = asPositiveInt(row.meetingKey);
  const circuitKey = asPositiveInt(row.circuitKey);
  const countryKey = asPositiveInt(row.countryKey);
  const year = asYear(row.year);
  const dateStart = asIso(row.dateStart);
  const dateEnd = asIso(row.dateEnd);
  const meetingName = asString(row.meetingName);
  const meetingOfficialName = asString(row.meetingOfficialName);
  const eventSlug = asString(row.eventSlug).toLowerCase();
  const circuitShortName = asString(row.circuitShortName);
  const countryCode = asString(row.countryCode);
  const countryName = asString(row.countryName);
  const gmtOffset = asString(row.gmtOffset);
  const location = asString(row.location);
  if (
    meetingKey === null ||
    circuitKey === null ||
    countryKey === null ||
    year === null ||
    !dateStart ||
    !dateEnd ||
    !meetingName ||
    !meetingOfficialName ||
    !isOpenF1EventSlug(eventSlug) ||
    !circuitShortName ||
    !countryCode ||
    !countryName ||
    !gmtOffset ||
    !location
  ) {
    return null;
  }

  return {
    meetingKey,
    meetingName,
    meetingOfficialName,
    eventSlug,
    circuitKey,
    circuitShortName,
    circuitType: asString(row.circuitType) || null,
    circuitImage: parseOpenF1MediaUrl(row.circuitImage),
    circuitInfoUrl: asString(row.circuitInfoUrl) || null,
    countryKey,
    countryCode,
    countryName,
    countryFlag: parseOpenF1MediaUrl(row.countryFlag),
    dateStart,
    dateEnd,
    gmtOffset,
    isCancelled: asBoolean(row.isCancelled),
    location,
    year,
  };
}

export function parseOpenF1Session(value: unknown): OpenF1Session | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const sessionKey = asPositiveInt(row.sessionKey);
  const meetingKey = asPositiveInt(row.meetingKey);
  const circuitKey = asPositiveInt(row.circuitKey);
  const countryKey = asPositiveInt(row.countryKey);
  const year = asYear(row.year);
  const dateStart = asIso(row.dateStart);
  const dateEnd = asIso(row.dateEnd);
  const sessionName = asString(row.sessionName);
  const sessionType = asString(row.sessionType);
  const circuitShortName = asString(row.circuitShortName);
  const countryCode = asString(row.countryCode);
  const countryName = asString(row.countryName);
  const gmtOffset = asString(row.gmtOffset);
  const location = asString(row.location);
  if (
    sessionKey === null ||
    meetingKey === null ||
    circuitKey === null ||
    countryKey === null ||
    year === null ||
    !dateStart ||
    !dateEnd ||
    !sessionName ||
    !sessionType ||
    !circuitShortName ||
    !countryCode ||
    !countryName ||
    !gmtOffset ||
    !location
  ) {
    return null;
  }

  return {
    sessionKey,
    sessionName,
    sessionType,
    meetingKey,
    circuitKey,
    circuitShortName,
    countryKey,
    countryCode,
    countryName,
    dateStart,
    dateEnd,
    gmtOffset,
    isCancelled: asBoolean(row.isCancelled),
    location,
    year,
  };
}

export function parseOpenF1Weekend(value: unknown): OpenF1Weekend | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const meeting = parseOpenF1Meeting(row.meeting);
  if (!meeting) return null;
  const sessions = Array.isArray(row.sessions)
    ? row.sessions
        .map(parseOpenF1Session)
        .filter((session): session is OpenF1Session => session !== null)
        .sort((a, b) => a.dateStart.localeCompare(b.dateStart))
    : [];
  return { meeting, sessions };
}

export function openF1SessionStatus(
  session: Pick<OpenF1Session, "dateStart" | "dateEnd" | "isCancelled">,
  now: Date = new Date(),
): OpenF1SessionStatus {
  if (session.isCancelled) return "cancelled";
  const start = Date.parse(session.dateStart);
  const end = Date.parse(session.dateEnd);
  const nowMs = now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "upcoming";
  if (nowMs < start) return "upcoming";
  if (nowMs > end) return "completed";
  return "live";
}

export function findOpenF1RaceSession(
  sessions: readonly OpenF1Session[],
  options: { includeCancelled?: boolean } = {},
): OpenF1Session | null {
  const races = sessions.filter(
    (session) => session.sessionName.trim().toLowerCase() === "race",
  );
  const active = races.find((session) => !session.isCancelled) ?? null;
  if (active) return active;
  if (options.includeCancelled) return races[0] ?? null;
  return null;
}

export function formatOpenF1SessionWhen(
  iso: string,
  timeZone: string = FIXTURE_TIMEZONE,
): string | null {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  const date = parsed.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  });
  const time = parsed.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
  return `${date} · ${time}`;
}

export function formatOpenF1DayHeading(
  day: string,
  timeZone: string = FIXTURE_TIMEZONE,
): string {
  const parsed = new Date(`${day}T12:00:00+02:00`);
  if (Number.isNaN(parsed.getTime())) return day;
  return parsed.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  });
}

export function groupOpenF1SessionsBySaDay(
  sessions: readonly OpenF1Session[],
  timeZone: string = FIXTURE_TIMEZONE,
): OpenF1SessionDayGroup[] {
  const groups = new Map<string, OpenF1Session[]>();
  const order: string[] = [];

  for (const session of sessions) {
    const day =
      fixtureCalendarDay(session.dateStart) ??
      utcDateOnly(session.dateStart) ??
      session.dateStart.slice(0, 10);
    const existing = groups.get(day);
    if (existing) {
      existing.push(session);
      continue;
    }
    groups.set(day, [session]);
    order.push(day);
  }

  return order.map((day) => ({
    day,
    label: formatOpenF1DayHeading(day, timeZone),
    sessions: groups.get(day) ?? [],
  }));
}

export function openF1CircuitLine(
  meeting: Pick<OpenF1Meeting, "circuitShortName" | "location" | "countryName">,
): string {
  const bits = [meeting.circuitShortName, meeting.location, meeting.countryName]
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(bits)].join(", ");
}

export function openF1CircuitImageUrl(
  meeting: Pick<OpenF1Meeting, "circuitImage">,
): string | null {
  return parseOpenF1MediaUrl(meeting.circuitImage);
}

export function openF1CountryFlagUrl(
  meeting: Pick<OpenF1Meeting, "countryFlag">,
): string | null {
  return parseOpenF1MediaUrl(meeting.countryFlag);
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

async function fetchOpenF1PublicJson(
  url: string,
  tag: string,
  deps: OpenF1Deps,
): Promise<unknown | null> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), OPENF1_TIMEOUT_MS);
  const signal = deps.signal
    ? AbortSignal.any([deps.signal, timeout.signal])
    : timeout.signal;
  try {
    const init: NextFetchInit = {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "force-cache",
      next: {
        revalidate: OPENF1_REVALIDATE_SECONDS,
        tags: [tag],
      },
      signal,
    };
    const res = await invokeFetch(deps.fetch, url, init);
    if (!res.ok) return null;
    return await readJson(res);
  } catch (error) {
    console.error("[openf1] weekend fetch failed", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getOpenF1WeekendByEventSlugWith(
  eventSlugRaw: string,
  deps: OpenF1Deps,
): Promise<OpenF1Weekend | null> {
  const parsed = parseOpenF1EventSlug(eventSlugRaw);
  if (!parsed) return null;
  const eventSlug = `${parsed.nameSlug}-${parsed.date}`;
  const year = Number(parsed.date.slice(0, 4));

  const meetingsBody = await fetchOpenF1PublicJson(
    openF1PublicMeetingsUrl(year),
    `openf1-meetings-${year}`,
    deps,
  );
  if (!Array.isArray(meetingsBody)) return null;

  const meetings = meetingsBody
    .map(openF1MeetingFromPublicApi)
    .filter((meeting): meeting is OpenF1Meeting => meeting !== null)
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart));
  const meeting = meetings.find((candidate) =>
    meetingCoversEventSlug(candidate, eventSlug),
  );
  if (!meeting) return null;

  const sessionsBody = await fetchOpenF1PublicJson(
    openF1PublicSessionsUrl(meeting.meetingKey),
    `openf1-sessions-${meeting.meetingKey}`,
    deps,
  );
  if (!Array.isArray(sessionsBody)) return null;

  const sessions = sessionsBody
    .map(openF1SessionFromPublicApi)
    .filter((session): session is OpenF1Session => session !== null)
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart));

  return { meeting, sessions };
}

export async function getOpenF1WeekendByEventSlug(
  eventSlug: string,
  options: { signal?: AbortSignal } = {},
): Promise<OpenF1Weekend | null> {
  return getOpenF1WeekendByEventSlugWith(eventSlug, {
    fetch,
    signal: options.signal,
  });
}

export async function getOpenF1WeekendForFixture(
  fixture: {
    slug: string;
    title: string;
    startsAt?: string | null;
    series?: string | null;
    eventPageHref?: string | null;
  },
  options: { signal?: AbortSignal } = {},
): Promise<OpenF1Weekend | null> {
  if (!isOpenF1EnrichableFixture(fixture)) return null;
  const eventSlug = openF1EventSlugForFixture(fixture);
  if (!eventSlug) return null;
  return getOpenF1WeekendByEventSlug(eventSlug, options);
}
