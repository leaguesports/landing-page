import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { FIXTURE_TIMEZONE, fixtureCalendarDay } from "../sports/events-feed.ts";

export const OPENF1_EVENTS_PATH = "/api/openf1/events" as const;

/**
 * Explicit Railway rewrite sources. Static collection paths before `:param`.
 */
export const OPENF1_PROXY_SOURCES = [
  "/api/openf1/meetings",
  "/api/openf1/meetings/:meetingKey",
  "/api/openf1/events/:eventSlug",
  "/api/openf1/sessions",
  "/api/openf1/sessions/:sessionKey",
] as const;

/** Align with `/events/[slug]` ISR (`revalidate = 300`). API caches 15 minutes. */
export const OPENF1_REVALIDATE_SECONDS = 300;

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
  baseUrl: string;
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

export function openF1EventSlugForFixture(fixture: {
  slug: string;
  title: string;
  startsAt?: string | null;
}): string | null {
  const fromSlug = parseOpenF1EventSlug(fixture.slug);
  if (fromSlug) return `${fromSlug.nameSlug}-${fromSlug.date}`;
  return openF1EventSlugFromNameAndInstant(fixture.title, fixture.startsAt);
}

export function openF1EventUrl(baseUrl: string, eventSlug: string): string {
  const root = baseUrl.replace(/\/$/, "");
  return `${root}${OPENF1_EVENTS_PATH}/${encodeURIComponent(eventSlug)}`;
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
    circuitImage: asString(row.circuitImage) || null,
    circuitInfoUrl: asString(row.circuitInfoUrl) || null,
    countryKey,
    countryCode,
    countryName,
    countryFlag: asString(row.countryFlag) || null,
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
): OpenF1Session | null {
  return (
    sessions.find(
      (session) =>
        session.sessionName.trim().toLowerCase() === "race" &&
        !session.isCancelled,
    ) ?? null
  );
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

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

export async function getOpenF1WeekendByEventSlugWith(
  eventSlugRaw: string,
  deps: OpenF1Deps,
): Promise<OpenF1Weekend | null> {
  const parsed = parseOpenF1EventSlug(eventSlugRaw);
  if (!parsed || !deps.baseUrl) return null;
  const eventSlug = `${parsed.nameSlug}-${parsed.date}`;

  try {
    const init: NextFetchInit = {
      method: "GET",
      cache: "force-cache",
      next: {
        revalidate: OPENF1_REVALIDATE_SECONDS,
        tags: [`openf1-event-${eventSlug}`],
      },
      signal: deps.signal,
    };
    const res = await invokeFetch(
      deps.fetch,
      openF1EventUrl(deps.baseUrl, eventSlug),
      init,
    );
    if (!res.ok) return null;
    return parseOpenF1Weekend(await readJson(res));
  } catch (error) {
    console.error("[openf1] weekend fetch failed", error);
    return null;
  }
}

export async function getOpenF1WeekendByEventSlug(
  eventSlug: string,
  options: { signal?: AbortSignal } = {},
): Promise<OpenF1Weekend | null> {
  if (!isApiConfigured()) return null;
  return getOpenF1WeekendByEventSlugWith(eventSlug, {
    fetch,
    baseUrl: getRailwayApiOrigin(),
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
