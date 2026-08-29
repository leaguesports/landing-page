import { getRailwayApiOrigin } from "@/lib/api-origin";
import { getMatch } from "@/lib/match-store";
import { parseApiMatch, preferMatchSnapshot } from "@/lib/padel/api-match";
import type { PadelMatch } from "@/types/padel-match";

async function fetchMatchFromRailway(
  matchId: string,
  options: { cookie?: string } = {},
): Promise<PadelMatch | null> {
  const origin = getRailwayApiOrigin();
  if (!origin || !matchId) return null;

  try {
    const headers: HeadersInit = {};
    if (options.cookie) headers.Cookie = options.cookie;

    const res = await fetch(
      `${origin}/api/matches/${encodeURIComponent(matchId)}`,
      { cache: "no-store", credentials: "include", headers },
    );
    if (!res.ok) return null;
    return parseApiMatch(await res.json().catch(() => null));
  } catch {
    return null;
  }
}

/**
 * Resolve a padel match for `/padel/{id}`.
 * Identity comes from league-sports-api; Ably may hold a newer live score.
 * A locked API snapshot is the immutable result — do not overlay Ably.
 */
export async function lookupPadelMatch(
  matchId: string,
  options: { cookie?: string } = {},
): Promise<PadelMatch | null> {
  const [fromApi, fromAbly] = await Promise.all([
    fetchMatchFromRailway(matchId, options),
    getMatch(matchId),
  ]);

  return preferMatchSnapshot(fromApi, fromAbly);
}
