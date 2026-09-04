import { getRailwayApiOrigin } from "@/lib/api-origin";
import {
  GOLF_API_UNAVAILABLE,
  GolfApiError,
  listPlayerGolfHistoryWith,
} from "@/lib/golf/api-round";
import type { GolfHistoryItem } from "@/types/golf-round";

export type GolfHistoryLookup =
  | { items: GolfHistoryItem[]; error: null }
  | { items: []; error: string };

function historyError(error: unknown): string {
  if (error instanceof GolfApiError) return error.message;
  if (error instanceof Error) return error.message;
  return GOLF_API_UNAVAILABLE;
}

export async function lookupPlayerGolfHistory(
  playerUserId: string,
  options: { cookie?: string } = {},
): Promise<GolfHistoryLookup> {
  const origin = getRailwayApiOrigin();
  if (!origin) {
    return { items: [], error: GOLF_API_UNAVAILABLE };
  }

  try {
    const items = await listPlayerGolfHistoryWith(playerUserId, {
      fetch,
      baseUrl: origin,
      cookie: options.cookie,
    });
    return { items, error: null };
  } catch (error) {
    return { items: [], error: historyError(error) };
  }
}
