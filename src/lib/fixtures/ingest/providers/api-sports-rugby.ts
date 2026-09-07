import type { FixtureBoardStatus } from "../../../../types/fixture-feed.ts";
import {
  asArray,
  asNumber,
  asRecord,
  asString,
  fetchJson,
  mapProviderStatus,
} from "../http.ts";
import type { ProviderLiveUpdate } from "../types.ts";

type ApiSportsGame = {
  id: string;
  date: string | null;
  elapsed: number | null;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
};

function rugbyStatus(short: string | null, long: string | null): FixtureBoardStatus {
  const mapped = mapProviderStatus(short) !== "scheduled"
    ? mapProviderStatus(short)
    : mapProviderStatus(long);
  if (short?.toUpperCase() === "HT") return "live";
  return mapped;
}

function rugbyClock(
  status: FixtureBoardStatus,
  short: string | null,
  elapsed: number | null,
): { clock: string | null; period: string | null } {
  const code = (short ?? "").toUpperCase();
  if (code === "HT") return { clock: "HT", period: "Half time" };
  if (status === "final" || code === "FT") return { clock: "FT", period: null };
  if (elapsed != null && elapsed >= 0) {
    const period = code === "1H" ? "1st half" : code === "2H" ? "2nd half" : null;
    return { clock: `${elapsed}'`, period };
  }
  return { clock: null, period: null };
}

export function parseApiSportsRugbyGames(body: unknown): ProviderLiveUpdate[] {
  const root = asRecord(body);
  const rows = asArray(root?.response);
  const updates: ProviderLiveUpdate[] = [];

  for (const row of rows) {
    const game = parseGame(row);
    if (!game) continue;
    const status = rugbyStatus(
      asString(asRecord(asRecord(row)?.status)?.short),
      asString(asRecord(asRecord(row)?.status)?.long),
    );
    if (status === "scheduled") continue;
    const { clock, period } = rugbyClock(
      status,
      asString(asRecord(asRecord(row)?.status)?.short),
      game.elapsed,
    );
    updates.push({
      provider: "api-sports",
      providerEventId: `rugby:${game.id}`,
      sportFamily: "match",
      status,
      startsAt: game.date,
      clock,
      period,
      match: {
        home: game.home,
        away: game.away,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
      },
    });
  }

  return updates;
}

function parseGame(row: unknown): ApiSportsGame | null {
  const game = asRecord(row);
  if (!game) return null;
  const id = asNumber(game.id) ?? asNumber(asRecord(game.game)?.id);
  const teams = asRecord(game.teams);
  const home = asString(asRecord(teams?.home)?.name);
  const away = asString(asRecord(teams?.away)?.name);
  if (id == null || !home || !away) return null;

  const scores = asRecord(game.scores) ?? asRecord(game.score);
  const homeScore = asNumber(scores?.home) ?? 0;
  const awayScore = asNumber(scores?.away) ?? 0;
  const status = asRecord(game.status);

  return {
    id: String(id),
    date: asString(game.date),
    elapsed: asNumber(status?.elapsed),
    home,
    away,
    homeScore,
    awayScore,
  };
}

export async function fetchApiSportsRugbyLive(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProviderLiveUpdate[]> {
  const { ok, body } = await fetchJson(
    "https://v1.rugby.api-sports.io/games?live=all",
    { headers: { "x-apisports-key": apiKey } },
    fetchImpl,
  );
  if (!ok) {
    throw new Error("API-Sports rugby live request failed");
  }
  return parseApiSportsRugbyGames(body);
}
