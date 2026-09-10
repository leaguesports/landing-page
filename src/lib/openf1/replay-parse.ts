import {
  parseOpenF1Meeting,
  parseOpenF1Session,
  slugifyOpenF1Name,
  utcDateOnly,
  type OpenF1Meeting,
  type OpenF1Session,
} from "./openf1.ts";
import { TRACK_Z0 } from "./coords.ts";
import type {
  LocationPoint,
  PositionEvent,
  RaceControlEvent,
  ReplayCircuit,
  ReplayCircuitCorner,
  ReplayDriver,
} from "./replay.ts";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asIsoMs(value: unknown): number | null {
  const text = asString(value);
  if (!text) return null;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asInt(value: unknown): number | null {
  const n = asFiniteNumber(value);
  if (n === null || !Number.isInteger(n)) return null;
  return n;
}

function pick(
  row: Record<string, unknown>,
  camel: string,
  snake: string,
): unknown {
  return row[camel] ?? row[snake];
}

export function teamColourHex(value: unknown): string {
  const raw = asString(value).replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return "#3dff8a";
  return `#${raw.toLowerCase()}`;
}

export function parseReplayDriver(value: unknown): ReplayDriver | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const driverNumber = asInt(pick(row, "driverNumber", "driver_number"));
  const acronym = asString(pick(row, "nameAcronym", "name_acronym")).toUpperCase();
  if (driverNumber === null || driverNumber <= 0 || driverNumber > 99 || !acronym) {
    return null;
  }
  const fullName =
    asString(pick(row, "fullName", "full_name")) ||
    asString(pick(row, "broadcastName", "broadcast_name")) ||
    acronym;
  return {
    driverNumber,
    acronym,
    fullName,
    teamName: asString(pick(row, "teamName", "team_name")) || "Unknown",
    teamColour: teamColourHex(pick(row, "teamColour", "team_colour")),
  };
}

export function parseReplayDrivers(value: unknown): ReplayDriver[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  const drivers: ReplayDriver[] = [];
  for (const row of value) {
    const driver = parseReplayDriver(row);
    if (!driver || seen.has(driver.driverNumber)) continue;
    seen.add(driver.driverNumber);
    drivers.push(driver);
  }
  return drivers.sort((a, b) => a.driverNumber - b.driverNumber);
}

export function parseLocationPoint(value: unknown): LocationPoint | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const driverNumber = asInt(pick(row, "driverNumber", "driver_number"));
  const t =
    typeof row.t === "number" && Number.isFinite(row.t)
      ? row.t
      : asIsoMs(pick(row, "date", "date"));
  const x = asFiniteNumber(row.x);
  const y = asFiniteNumber(row.y);
  const z = asFiniteNumber(row.z) ?? 0;
  if (driverNumber === null || t === null || x === null || y === null) return null;
  return { driverNumber, t, x, y, z };
}

export function parseLocationPoints(value: unknown): LocationPoint[] {
  if (!Array.isArray(value)) return [];
  const points: LocationPoint[] = [];
  for (const row of value) {
    const point = parseLocationPoint(row);
    if (point) points.push(point);
  }
  return points;
}

export function parsePositionEvent(value: unknown): PositionEvent | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const driverNumber = asInt(pick(row, "driverNumber", "driver_number"));
  const position = asInt(row.position);
  const t = asIsoMs(pick(row, "date", "date")) ?? asFiniteNumber(row.t);
  if (
    driverNumber === null ||
    t === null ||
    position === null ||
    position < 1 ||
    position > 99
  ) {
    return null;
  }
  return { t, driverNumber, position };
}

export function parsePositionEvents(value: unknown): PositionEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parsePositionEvent)
    .filter((row): row is PositionEvent => row !== null)
    .sort((a, b) => a.t - b.t);
}

export function parseRaceControlEvent(value: unknown): RaceControlEvent | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const t = asIsoMs(pick(row, "date", "date")) ?? asFiniteNumber(row.t);
  if (t === null) return null;
  const flagRaw = asString(pick(row, "flag", "flag"));
  const sector = asInt(row.sector);
  return {
    t,
    flag: flagRaw || null,
    category: asString(row.category),
    scope: asString(row.scope) || null,
    sector: sector !== null && sector > 0 ? sector : null,
    message: asString(row.message),
  };
}

export function parseRaceControlEvents(value: unknown): RaceControlEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseRaceControlEvent)
    .filter((row): row is RaceControlEvent => row !== null)
    .sort((a, b) => a.t - b.t);
}

function parseCorner(value: unknown): ReplayCircuitCorner | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const number = asInt(row.number);
  const pos =
    row.trackPosition && typeof row.trackPosition === "object"
      ? (row.trackPosition as Record<string, unknown>)
      : row;
  const x = asFiniteNumber(pos.x);
  const y = asFiniteNumber(pos.y);
  if (number === null || x === null || y === null) return null;
  return { number, x, y };
}

export function parseReplayCircuit(
  value: unknown,
  fallback: { circuitKey: number; year: number },
): ReplayCircuit | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const x = Array.isArray(row.x)
    ? row.x.map(asFiniteNumber).filter((n): n is number => n !== null)
    : [];
  const y = Array.isArray(row.y)
    ? row.y.map(asFiniteNumber).filter((n): n is number => n !== null)
    : [];
  if (x.length < 8 || x.length !== y.length) return null;
  const corners = Array.isArray(row.corners)
    ? row.corners
        .map(parseCorner)
        .filter((corner): corner is ReplayCircuitCorner => corner !== null)
    : [];
  const circuitKey = asInt(row.circuitKey) ?? fallback.circuitKey;
  const year = asInt(row.year) ?? fallback.year;
  const rotation = asFiniteNumber(row.rotation) ?? 0;
  const z =
    Array.isArray(row.z) && row.z.length === x.length
      ? row.z.map((value) => asFiniteNumber(value) ?? 0)
      : x.map(() => 0);
  const z0 = asFiniteNumber(row.z0) ?? TRACK_Z0;
  return {
    circuitKey,
    circuitName: asString(row.circuitName) || "Circuit",
    year,
    rotation,
    x,
    y,
    z,
    z0,
    corners,
  };
}

export function parseOpenF1SessionSnake(value: unknown): OpenF1Session | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return parseOpenF1Session({
    sessionKey: pick(row, "sessionKey", "session_key"),
    sessionName: pick(row, "sessionName", "session_name"),
    sessionType: pick(row, "sessionType", "session_type"),
    meetingKey: pick(row, "meetingKey", "meeting_key"),
    circuitKey: pick(row, "circuitKey", "circuit_key"),
    circuitShortName: pick(row, "circuitShortName", "circuit_short_name"),
    countryKey: pick(row, "countryKey", "country_key"),
    countryCode: pick(row, "countryCode", "country_code"),
    countryName: pick(row, "countryName", "country_name"),
    dateStart: pick(row, "dateStart", "date_start"),
    dateEnd: pick(row, "dateEnd", "date_end"),
    gmtOffset: pick(row, "gmtOffset", "gmt_offset"),
    isCancelled: pick(row, "isCancelled", "is_cancelled"),
    location: pick(row, "location", "location"),
    year: row.year,
  });
}

export function parseOpenF1MeetingSnake(value: unknown): OpenF1Meeting | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const meetingName = asString(pick(row, "meetingName", "meeting_name"));
  const dateStart = asString(pick(row, "dateStart", "date_start"));
  const date = utcDateOnly(dateStart);
  const nameSlug = slugifyOpenF1Name(meetingName);
  const eventSlug =
    asString(pick(row, "eventSlug", "event_slug")).toLowerCase() ||
    (nameSlug && date ? `${nameSlug}-${date}` : "");
  return parseOpenF1Meeting({
    meetingKey: pick(row, "meetingKey", "meeting_key"),
    meetingName,
    meetingOfficialName:
      asString(pick(row, "meetingOfficialName", "meeting_official_name")) ||
      meetingName,
    eventSlug,
    circuitKey: pick(row, "circuitKey", "circuit_key"),
    circuitShortName: pick(row, "circuitShortName", "circuit_short_name"),
    circuitType: pick(row, "circuitType", "circuit_type"),
    circuitImage: pick(row, "circuitImage", "circuit_image"),
    circuitInfoUrl: pick(row, "circuitInfoUrl", "circuit_info_url"),
    countryKey: pick(row, "countryKey", "country_key"),
    countryCode: pick(row, "countryCode", "country_code"),
    countryName: pick(row, "countryName", "country_name"),
    countryFlag: pick(row, "countryFlag", "country_flag"),
    dateStart,
    dateEnd: pick(row, "dateEnd", "date_end"),
    gmtOffset: pick(row, "gmtOffset", "gmt_offset"),
    isCancelled: pick(row, "isCancelled", "is_cancelled"),
    location: pick(row, "location", "location"),
    year: row.year,
  });
}

export function firstArrayRow(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}
