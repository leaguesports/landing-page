import { getRailwayApiOrigin } from "@/lib/api-origin";
import { fetchDartsMatchWith, parseApiDartsMatch } from "@/lib/darts/api-match";
import type { DartsMatch } from "@/types/darts-match";

/**
 * Resolve a darts game for `/darts/{id}`.
 * Identity comes from league-sports-api.
 */
export async function lookupDartsMatch(
  matchId: string,
  options: { cookie?: string } = {},
): Promise<DartsMatch | null> {
  const origin = getRailwayApiOrigin();
  if (!origin || !matchId.trim()) return null;

  try {
    return await fetchDartsMatchWith(matchId, {
      fetch,
      baseUrl: origin,
      cookie: options.cookie,
    });
  } catch {
    return null;
  }
}

export function lookupDartsMatchFromPayload(
  payload: unknown,
): DartsMatch | null {
  return parseApiDartsMatch(payload);
}
