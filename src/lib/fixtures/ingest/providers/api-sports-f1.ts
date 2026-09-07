import type { MotorsportLeader } from "../../../../types/fixture-feed.ts";
import {
  asArray,
  asNumber,
  asRecord,
  asString,
  fetchJson,
  mapProviderStatus,
} from "../http.ts";
import type { ProviderLiveUpdate } from "../types.ts";

type RaceRow = {
  id: number;
  meetingName: string;
  circuit: string | null;
  date: string | null;
  status: string | null;
  type: string | null;
  currentLap: number | null;
  totalLaps: number | null;
};

export function parseApiSportsF1Races(body: unknown): RaceRow[] {
  const rows = asArray(asRecord(body)?.response);
  const races: RaceRow[] = [];
  for (const row of rows) {
    const item = asRecord(row);
    if (!item) continue;
    const id = asNumber(item.id);
    const competition = asRecord(item.competition);
    const circuit = asRecord(item.circuit);
    const laps = asRecord(item.laps);
    if (id == null) continue;
    races.push({
      id,
      meetingName:
        asString(competition?.name) ?? asString(item.name) ?? `Race ${id}`,
      circuit: asString(circuit?.name),
      date: asString(item.date),
      status: asString(item.status),
      type: asString(item.type),
      currentLap: asNumber(laps?.current),
      totalLaps: asNumber(laps?.total),
    });
  }
  return races;
}

export function parseApiSportsF1Rankings(
  body: unknown,
): Array<{ pos: number; driver: string; team: string | null; gap: string | null }> {
  const rows = asArray(asRecord(body)?.response);
  const parsed: Array<{
    pos: number;
    driver: string;
    team: string | null;
    gap: string | null;
  }> = [];
  for (const row of rows) {
    const item = asRecord(row);
    if (!item) continue;
    const pos = asNumber(item.position);
    const driver =
      asString(asRecord(item.driver)?.name) ?? asString(item.driver);
    if (pos == null || !driver) continue;
    parsed.push({
      pos,
      driver,
      team: asString(asRecord(item.team)?.name),
      gap: asString(item.gap) ?? (pos === 1 ? "—" : null),
    });
  }
  return parsed.sort((a, b) => a.pos - b.pos);
}

function toLeaders(
  rows: Array<{ pos: number; driver: string; team: string | null; gap: string | null }>,
): MotorsportLeader[] {
  return rows
    .filter((row) => row.pos === 1 || row.pos === 2 || row.pos === 3)
    .map((row) => ({
      pos: row.pos as 1 | 2 | 3,
      driver: row.driver,
      team: row.team,
      gap: row.gap,
    }));
}

function sessionLabel(race: RaceRow): string | null {
  const type = race.type?.trim();
  if (race.currentLap && race.totalLaps) {
    return `Lap ${race.currentLap}/${race.totalLaps}`;
  }
  if (race.currentLap) return `Lap ${race.currentLap}`;
  return type ?? null;
}

export function raceToUpdate(
  race: RaceRow,
  rankings: ReturnType<typeof parseApiSportsF1Rankings>,
): ProviderLiveUpdate | null {
  const status = mapProviderStatus(race.status);
  if (status === "scheduled") return null;
  const leaders = toLeaders(rankings);
  if (status === "live" && leaders.length === 0) {
    // Live but rankings not populated yet — still open the board.
  }
  return {
    provider: "api-sports",
    providerEventId: `f1:${race.id}`,
    sportFamily: "motorsport",
    status,
    startsAt: race.date,
    motorsport: {
      meetingName: race.meetingName,
      circuit: race.circuit,
      leaders,
      sessionLabel: sessionLabel(race),
    },
  };
}

function todayUtcDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export async function fetchApiSportsF1Live(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
  now: Date = new Date(),
): Promise<ProviderLiveUpdate[]> {
  const date = todayUtcDate(now);
  const headers = { "x-apisports-key": apiKey };
  const { ok, body } = await fetchJson(
    `https://v1.formula-1.api-sports.io/races?date=${encodeURIComponent(date)}`,
    { headers },
    fetchImpl,
  );
  if (!ok) {
    throw new Error("API-Sports F1 races request failed");
  }

  const races = parseApiSportsF1Races(body).filter((race) => {
    const status = mapProviderStatus(race.status);
    const type = (race.type ?? "").toLowerCase();
    return status !== "scheduled" && !type.includes("practice");
  });

  const updates: ProviderLiveUpdate[] = [];
  for (const race of races) {
    const rankingRes = await fetchJson(
      `https://v1.formula-1.api-sports.io/rankings/races?race=${race.id}`,
      { headers },
      fetchImpl,
    );
    const rankings = rankingRes.ok
      ? parseApiSportsF1Rankings(rankingRes.body)
      : [];
    const update = raceToUpdate(race, rankings);
    if (update) updates.push(update);
  }
  return updates;
}
