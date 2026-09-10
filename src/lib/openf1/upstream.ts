import { invokeFetch } from "../invoke-fetch.ts";
import { parseOpenF1EventSlug, slugifyOpenF1Name, utcDateOnly } from "./openf1.ts";
import {
  firstArrayRow,
  parseLocationPoints,
  parseOpenF1MeetingSnake,
  parseOpenF1SessionSnake,
  parsePositionEvents,
  parseRaceControlEvents,
  parseReplayCircuit,
  parseReplayDrivers,
} from "./replay-parse.ts";
import { downsamplePoints } from "./location-buffer.ts";
import { LOCATION_MIN_INTERVAL_MS } from "./replay.ts";
import type {
  LocationPoint,
  PositionEvent,
  RaceControlEvent,
  ReplayCircuit,
  ReplayDriver,
} from "./replay.ts";
import type { OpenF1Meeting, OpenF1Session } from "./openf1.ts";

export const OPENF1_UPSTREAM_ORIGIN = "https://api.openf1.org";
export const MULTIVIEWER_CIRCUIT_ORIGIN = "https://api.multiviewer.app";

const USER_AGENT = "LeagueSports/1.0 (f1-replay; +https://leaguesports.co.za)";
const MIN_GAP_MS = 350;
const DEFAULT_TIMEOUT_MS = 12_000;

type CacheEntry = { expiresAt: number; value: unknown };

const cache = new Map<string, CacheEntry>();
let throttleChain = Promise.resolve();
let lastRequestAt = 0;

export function resetOpenF1UpstreamCache(): void {
  cache.clear();
  lastRequestAt = 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = throttleChain.then(async () => {
    const wait = lastRequestAt + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    return fn();
  });
  throttleChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return [];
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return [];
  }
}

type UpstreamInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

export class OpenF1UpstreamError extends Error {
  status: number;
  retryAfterSec: number | null;

  constructor(status: number, message: string, retryAfterSec: number | null = null) {
    super(message);
    this.name = "OpenF1UpstreamError";
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

async function upstreamGet(
  url: string,
  revalidate: number,
  tags: string[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<{ status: number; body: unknown; retryAfterSec: number | null }> {
  return enqueue(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const init: UpstreamInit = {
        method: "GET",
        headers: { Accept: "application/json", "User-Agent": USER_AGENT },
        cache: "force-cache",
        next: { revalidate, tags },
        signal: controller.signal,
      };
      const res = await invokeFetch(fetch, url, init);
      const retryAfter = res.headers.get("retry-after");
      const retryAfterSec = retryAfter ? Number.parseInt(retryAfter, 10) : null;
      const body = await readJson(res);
      return {
        status: res.status,
        body,
        retryAfterSec: Number.isFinite(retryAfterSec) ? retryAfterSec : null,
      };
    } finally {
      clearTimeout(timer);
    }
  });
}

async function cachedGet<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;
  const value = await load();
  cache.set(key, { expiresAt: now + ttlMs, value });
  if (cache.size > 200) {
    for (const [entryKey, entry] of cache) {
      if (entry.expiresAt <= now) cache.delete(entryKey);
    }
  }
  return value;
}

export function openF1LocationUrl(
  sessionKey: number,
  fromIso: string,
  toIso: string,
  driverNumber?: number,
): string {
  const driver =
    typeof driverNumber === "number" && driverNumber > 0
      ? `&driver_number=${driverNumber}`
      : "";
  return `${OPENF1_UPSTREAM_ORIGIN}/v1/location?session_key=${sessionKey}&date%3E${encodeURIComponent(fromIso)}&date%3C${encodeURIComponent(toIso)}${driver}`;
}

export async function fetchOpenF1Session(
  sessionKey: number,
): Promise<OpenF1Session | null> {
  return cachedGet(`session:${sessionKey}`, 300_000, async () => {
    const { status, body, retryAfterSec } = await upstreamGet(
      `${OPENF1_UPSTREAM_ORIGIN}/v1/sessions?session_key=${sessionKey}`,
      300,
      [`openf1-session-${sessionKey}`],
    );
    if (status === 429) {
      throw new OpenF1UpstreamError(429, "OpenF1 rate limited", retryAfterSec);
    }
    if (status >= 500) {
      throw new OpenF1UpstreamError(status, "OpenF1 session unavailable");
    }
    return parseOpenF1SessionSnake(firstArrayRow(body));
  });
}

export async function fetchOpenF1Meeting(
  meetingKey: number,
): Promise<OpenF1Meeting | null> {
  return cachedGet(`meeting:${meetingKey}`, 300_000, async () => {
    const { status, body } = await upstreamGet(
      `${OPENF1_UPSTREAM_ORIGIN}/v1/meetings?meeting_key=${meetingKey}`,
      300,
      [`openf1-meeting-${meetingKey}`],
    );
    if (status >= 400) return null;
    return parseOpenF1MeetingSnake(firstArrayRow(body));
  });
}

export async function fetchOpenF1Drivers(
  sessionKey: number,
): Promise<ReplayDriver[]> {
  return cachedGet(`drivers:${sessionKey}`, 300_000, async () => {
    const { status, body, retryAfterSec } = await upstreamGet(
      `${OPENF1_UPSTREAM_ORIGIN}/v1/drivers?session_key=${sessionKey}`,
      300,
      [`openf1-drivers-${sessionKey}`],
    );
    if (status === 429) {
      throw new OpenF1UpstreamError(429, "OpenF1 rate limited", retryAfterSec);
    }
    if (status >= 400) return [];
    return parseReplayDrivers(body);
  });
}

export async function fetchOpenF1Positions(
  sessionKey: number,
): Promise<PositionEvent[]> {
  return cachedGet(`positions:${sessionKey}`, 300_000, async () => {
    const { status, body } = await upstreamGet(
      `${OPENF1_UPSTREAM_ORIGIN}/v1/position?session_key=${sessionKey}`,
      300,
      [`openf1-positions-${sessionKey}`],
    );
    if (status >= 400) return [];
    return parsePositionEvents(body);
  });
}

export async function fetchOpenF1RaceControl(
  sessionKey: number,
): Promise<RaceControlEvent[]> {
  return cachedGet(`race-control:${sessionKey}`, 300_000, async () => {
    const { status, body } = await upstreamGet(
      `${OPENF1_UPSTREAM_ORIGIN}/v1/race_control?session_key=${sessionKey}`,
      300,
      [`openf1-race-control-${sessionKey}`],
    );
    if (status >= 400) return [];
    return parseRaceControlEvents(body);
  });
}

export async function fetchMultiviewerCircuit(
  circuitKey: number,
  year: number,
): Promise<ReplayCircuit | null> {
  return cachedGet(`circuit:${circuitKey}:${year}`, 86_400_000, async () => {
    const years = [year, year - 1, year - 2];
    for (const tryYear of years) {
      if (tryYear < 2018) continue;
      const { status, body } = await upstreamGet(
        `${MULTIVIEWER_CIRCUIT_ORIGIN}/api/v1/circuits/${circuitKey}/${tryYear}`,
        86_400,
        [`mv-circuit-${circuitKey}-${tryYear}`],
        15_000,
      );
      if (status >= 400) continue;
      const circuit = parseReplayCircuit(body, { circuitKey, year: tryYear });
      if (circuit) return circuit;
    }
    return null;
  });
}

export async function fetchOpenF1LocationChunk(
  sessionKey: number,
  fromIso: string,
  toIso: string,
  driverNumber?: number,
): Promise<LocationPoint[]> {
  const driverKey = driverNumber && driverNumber > 0 ? `:d${driverNumber}` : "";
  const key = `location:${sessionKey}:${fromIso}:${toIso}${driverKey}`;
  return cachedGet(key, 3_600_000, async () => {
    const { status, body, retryAfterSec } = await upstreamGet(
      openF1LocationUrl(sessionKey, fromIso, toIso, driverNumber),
      3600,
      [`openf1-location-${sessionKey}`],
      20_000,
    );
    if (status === 429) {
      throw new OpenF1UpstreamError(429, "OpenF1 rate limited", retryAfterSec);
    }
    if (status >= 400) {
      throw new OpenF1UpstreamError(status, "OpenF1 location unavailable");
    }
    return downsamplePoints(parseLocationPoints(body), LOCATION_MIN_INTERVAL_MS);
  });
}

export function openF1MeetingsByYearUrl(year: number): string {
  return `${OPENF1_UPSTREAM_ORIGIN}/v1/meetings?year=${year}`;
}

export function openF1SessionsByYearUrl(year: number): string {
  return `${OPENF1_UPSTREAM_ORIGIN}/v1/sessions?year=${year}`;
}

export async function fetchOpenF1MeetingsByYear(
  year: number,
): Promise<OpenF1Meeting[]> {
  return cachedGet(`meetings:${year}`, 600_000, async () => {
    const { status, body } = await upstreamGet(
      openF1MeetingsByYearUrl(year),
      600,
      [`openf1-meetings-${year}`],
    );
    if (status >= 400 || !Array.isArray(body)) return [];
    return body
      .map(parseOpenF1MeetingSnake)
      .filter((row): row is OpenF1Meeting => row !== null);
  });
}

export async function fetchOpenF1SessionsByYear(
  year: number,
): Promise<OpenF1Session[]> {
  return cachedGet(`sessions-year:${year}`, 600_000, async () => {
    const { status, body } = await upstreamGet(
      openF1SessionsByYearUrl(year),
      600,
      [`openf1-sessions-year-${year}`],
    );
    if (status >= 400 || !Array.isArray(body)) return [];
    return body
      .map(parseOpenF1SessionSnake)
      .filter((row): row is OpenF1Session => row !== null)
      .sort((a, b) => a.dateStart.localeCompare(b.dateStart));
  });
}

export async function fetchOpenF1SessionsForMeeting(
  meetingKey: number,
): Promise<OpenF1Session[]> {
  return cachedGet(`sessions-meeting:${meetingKey}`, 300_000, async () => {
    const { status, body } = await upstreamGet(
      `${OPENF1_UPSTREAM_ORIGIN}/v1/sessions?meeting_key=${meetingKey}`,
      300,
      [`openf1-sessions-${meetingKey}`],
    );
    if (status >= 400 || !Array.isArray(body)) return [];
    return body
      .map(parseOpenF1SessionSnake)
      .filter((row): row is OpenF1Session => row !== null)
      .sort((a, b) => a.dateStart.localeCompare(b.dateStart));
  });
}

export function meetingMatchesEventSlug(
  meeting: Pick<OpenF1Meeting, "meetingName" | "dateStart" | "dateEnd" | "eventSlug">,
  eventSlug: string,
): boolean {
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
