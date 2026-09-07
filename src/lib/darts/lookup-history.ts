import { getRailwayApiOrigin } from "@/lib/api-origin";
import {
  DARTS_API_UNAVAILABLE,
  DartsApiError,
  listPlayerDartsHistoryWith,
} from "@/lib/darts/api-match";
import type { DartsHistoryItem } from "@/types/darts-match";

export type DartsHistoryLookup =
  | { items: DartsHistoryItem[]; error: null }
  | { items: []; error: string };

function historyError(error: unknown): string {
  if (error instanceof DartsApiError) return error.message;
  if (error instanceof Error) return error.message;
  return DARTS_API_UNAVAILABLE;
}

export async function lookupPlayerDartsHistory(
  playerUserId: string,
  options: { cookie?: string } = {},
): Promise<DartsHistoryLookup> {
  const origin = getRailwayApiOrigin();
  if (!origin) {
    return { items: [], error: DARTS_API_UNAVAILABLE };
  }

  try {
    const items = await listPlayerDartsHistoryWith(playerUserId, {
      fetch,
      baseUrl: origin,
      cookie: options.cookie,
    });
    return { items, error: null };
  } catch (error) {
    return { items: [], error: historyError(error) };
  }
}
