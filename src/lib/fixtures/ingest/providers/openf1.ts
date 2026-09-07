import type { MotorsportLeader } from "../../../../types/fixture-feed.ts";
import {
  asArray,
  asNumber,
  asRecord,
  asString,
  fetchJson,
} from "../http.ts";
import type { ProviderLiveUpdate } from "../types.ts";

type OpenF1Session = {
  sessionKey: number;
  meetingName: string;
  circuit: string | null;
  sessionName: string | null;
  dateStart: string | null;
  dateEnd: string | null;
};

type OpenF1Driver = {
  driverNumber: number;
  name: string;
  team: string | null;
};

export function parseOpenF1Sessions(body: unknown): OpenF1Session[] {
  return asArray(body)
    .map((row) => {
      const item = asRecord(row);
      if (!item) return null;
      const sessionKey = asNumber(item.session_key);
      if (sessionKey == null) return null;
      return {
        sessionKey,
        meetingName:
          asString(item.meeting_name) ??
          asString(item.circuit_short_name) ??
          `Session ${sessionKey}`,
        circuit: asString(item.circuit_short_name) ?? asString(item.location),
        sessionName: asString(item.session_name) ?? asString(item.session_type),
        dateStart: asString(item.date_start),
        dateEnd: asString(item.date_end),
      };
    })
    .filter((row): row is OpenF1Session => Boolean(row));
}

export function parseOpenF1Drivers(body: unknown): Map<number, OpenF1Driver> {
  const map = new Map<number, OpenF1Driver>();
  for (const row of asArray(body)) {
    const item = asRecord(row);
    if (!item) continue;
    const driverNumber = asNumber(item.driver_number);
    const name =
      asString(item.name_acronym) ??
      asString(item.broadcast_name) ??
      asString(item.full_name);
    if (driverNumber == null || !name) continue;
    map.set(driverNumber, {
      driverNumber,
      name,
      team: asString(item.team_name),
    });
  }
  return map;
}

/** Latest sample per driver from the OpenF1 position time series. */
export function latestPositions(
  body: unknown,
): Map<number, { position: number; date: string | null }> {
  const latest = new Map<number, { position: number; date: string | null }>();
  for (const row of asArray(body)) {
    const item = asRecord(row);
    if (!item) continue;
    const driverNumber = asNumber(item.driver_number);
    const position = asNumber(item.position);
    if (driverNumber == null || position == null) continue;
    const date = asString(item.date);
    const current = latest.get(driverNumber);
    if (!current || (date && (!current.date || date > current.date))) {
      latest.set(driverNumber, { position, date });
    }
  }
  return latest;
}

export function latestGaps(body: unknown): Map<number, string | null> {
  const latest = new Map<number, { gap: string | null; date: string | null }>();
  for (const row of asArray(body)) {
    const item = asRecord(row);
    if (!item) continue;
    const driverNumber = asNumber(item.driver_number);
    if (driverNumber == null) continue;
    const date = asString(item.date);
    const gapNum = asNumber(item.gap_to_leader);
    const gap =
      gapNum == null ? asString(item.gap_to_leader) : `+${gapNum.toFixed(1)}s`;
    const current = latest.get(driverNumber);
    if (!current || (date && (!current.date || date > current.date))) {
      latest.set(driverNumber, { gap, date });
    }
  }
  const out = new Map<number, string | null>();
  for (const [id, value] of latest) out.set(id, value.gap);
  return out;
}

function sessionIsLive(session: OpenF1Session, now: Date): boolean {
  const start = session.dateStart ? new Date(session.dateStart).getTime() : NaN;
  const end = session.dateEnd ? new Date(session.dateEnd).getTime() : NaN;
  const t = now.getTime();
  if (!Number.isNaN(start) && t < start - 10 * 60 * 1000) return false;
  if (!Number.isNaN(end) && t > end + 15 * 60 * 1000) return false;
  return true;
}

function toLeaders(
  positions: Map<number, { position: number; date: string | null }>,
  drivers: Map<number, OpenF1Driver>,
  gaps: Map<number, string | null>,
): MotorsportLeader[] {
  return [...positions.entries()]
    .map(([driverNumber, row]) => ({
      driverNumber,
      position: row.position,
    }))
    .filter((row) => row.position >= 1 && row.position <= 3)
    .sort((a, b) => a.position - b.position)
    .map((row) => {
      const driver = drivers.get(row.driverNumber);
      return {
        pos: row.position as 1 | 2 | 3,
        driver: driver?.name ?? `#${row.driverNumber}`,
        team: driver?.team ?? null,
        gap: row.position === 1 ? "—" : (gaps.get(row.driverNumber) ?? null),
      };
    });
}

export function openF1ToUpdate(
  session: OpenF1Session,
  drivers: Map<number, OpenF1Driver>,
  positions: Map<number, { position: number; date: string | null }>,
  gaps: Map<number, string | null>,
  now: Date = new Date(),
): ProviderLiveUpdate | null {
  if (!sessionIsLive(session, now)) return null;
  const name = (session.sessionName ?? "").toLowerCase();
  if (name.includes("practice")) return null;
  const ended =
    session.dateEnd != null && new Date(session.dateEnd).getTime() <= now.getTime();
  return {
    provider: "openf1",
    providerEventId: `openf1:${session.sessionKey}`,
    sportFamily: "motorsport",
    status: ended ? "final" : "live",
    startsAt: session.dateStart,
    motorsport: {
      meetingName: session.meetingName,
      circuit: session.circuit,
      leaders: toLeaders(positions, drivers, gaps),
      sessionLabel: session.sessionName,
    },
  };
}

export async function fetchOpenF1Live(
  fetchImpl: typeof fetch = fetch,
  now: Date = new Date(),
): Promise<ProviderLiveUpdate[]> {
  const sessionRes = await fetchJson(
    "https://api.openf1.org/v1/sessions?session_key=latest",
    {},
    fetchImpl,
  );
  if (!sessionRes.ok) {
    throw new Error("OpenF1 session request failed");
  }
  const sessions = parseOpenF1Sessions(sessionRes.body);
  const session = sessions[0];
  if (!session) return [];

  const [driversRes, positionRes, intervalRes] = await Promise.all([
    fetchJson(
      `https://api.openf1.org/v1/drivers?session_key=${session.sessionKey}`,
      {},
      fetchImpl,
    ),
    fetchJson(
      `https://api.openf1.org/v1/position?session_key=${session.sessionKey}`,
      {},
      fetchImpl,
    ),
    fetchJson(
      `https://api.openf1.org/v1/intervals?session_key=${session.sessionKey}`,
      {},
      fetchImpl,
    ),
  ]);

  const update = openF1ToUpdate(
    session,
    driversRes.ok ? parseOpenF1Drivers(driversRes.body) : new Map(),
    positionRes.ok ? latestPositions(positionRes.body) : new Map(),
    intervalRes.ok ? latestGaps(intervalRes.body) : new Map(),
    now,
  );
  return update ? [update] : [];
}
