import {
  asArray,
  asNumber,
  asRecord,
  asString,
  fetchJson,
  mapProviderStatus,
} from "../http.ts";
import type { ProviderLiveUpdate } from "../types.ts";

export function parseApiSportsFootballFixtures(
  body: unknown,
): ProviderLiveUpdate[] {
  const rows = asArray(asRecord(body)?.response);
  const updates: ProviderLiveUpdate[] = [];

  for (const row of rows) {
    const item = asRecord(row);
    if (!item) continue;
    const fixture = asRecord(item.fixture);
    const teams = asRecord(item.teams);
    const goals = asRecord(item.goals);
    const status = asRecord(fixture?.status);
    const id = asNumber(fixture?.id);
    const home = asString(asRecord(teams?.home)?.name);
    const away = asString(asRecord(teams?.away)?.name);
    if (id == null || !home || !away) continue;

    const mapped = mapProviderStatus(
      asString(status?.short) ?? asString(status?.long),
    );
    if (mapped === "scheduled") continue;
    const short = (asString(status?.short) ?? "").toUpperCase();
    const elapsed = asNumber(status?.elapsed);
    const clock =
      short === "HT"
        ? "HT"
        : mapped === "final" || short === "FT"
          ? "FT"
          : elapsed != null
            ? `${elapsed}'`
            : null;
    const period =
      short === "HT"
        ? "Half time"
        : short === "1H"
          ? "1st half"
          : short === "2H"
            ? "2nd half"
            : null;

    updates.push({
      provider: "api-sports",
      providerEventId: `soccer:${id}`,
      sportFamily: "match",
      status: short === "HT" ? "live" : mapped,
      startsAt: asString(fixture?.date),
      clock,
      period,
      match: {
        home,
        away,
        homeScore: asNumber(goals?.home) ?? 0,
        awayScore: asNumber(goals?.away) ?? 0,
      },
    });
  }

  return updates;
}

export async function fetchApiSportsFootballLive(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProviderLiveUpdate[]> {
  const { ok, body } = await fetchJson(
    "https://v3.football.api-sports.io/fixtures?live=all",
    { headers: { "x-apisports-key": apiKey } },
    fetchImpl,
  );
  if (!ok) {
    throw new Error("API-Sports football live request failed");
  }
  return parseApiSportsFootballFixtures(body);
}
