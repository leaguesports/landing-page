import { getRailwayApiOrigin } from "@/lib/api-origin";
import { fetchGolfRoundWith, parseApiGolfRound } from "@/lib/golf/api-round";
import type { GolfRound } from "@/types/golf-round";

/**
 * Resolve a golf round for `/golf/{id}`.
 * Identity comes from league-sports-api (no Ably for golf).
 */
export async function lookupGolfRound(
  roundId: string,
  options: { cookie?: string } = {},
): Promise<GolfRound | null> {
  const origin = getRailwayApiOrigin();
  if (!origin || !roundId.trim()) return null;

  try {
    return await fetchGolfRoundWith(roundId, {
      fetch,
      baseUrl: origin,
      cookie: options.cookie,
    });
  } catch {
    return null;
  }
}

/** Soft parse helper when only a raw payload is available. */
export function lookupGolfRoundFromPayload(
  payload: unknown,
): GolfRound | null {
  return parseApiGolfRound(payload);
}
