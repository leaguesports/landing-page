import { getRailwayApiOrigin } from "@/lib/api-origin";
import {
  MATCH_API_UNAVAILABLE,
  MatchApiError,
  listPlayerHistoryWith,
  listVenueHistoryWith,
} from "@/lib/padel/api-match";
import type { PadelHistoryItem } from "@/types/padel-match";

export type HistoryLookup =
  | { items: PadelHistoryItem[]; error: null }
  | { items: []; error: string };

function historyError(error: unknown): string {
  if (error instanceof MatchApiError) return error.message;
  if (error instanceof Error) return error.message;
  return MATCH_API_UNAVAILABLE;
}

/**
 * Server-side history. Missing API origin or route fails visibly —
 * never an empty list that looks like "no matches".
 */
export async function lookupPlayerHistory(
  playerUserId: string,
  options: { cookie?: string } = {},
): Promise<HistoryLookup> {
  const origin = getRailwayApiOrigin();
  if (!origin) {
    return { items: [], error: MATCH_API_UNAVAILABLE };
  }

  try {
    const items = await listPlayerHistoryWith(playerUserId, {
      fetch,
      baseUrl: origin,
      cookie: options.cookie,
    });
    return { items, error: null };
  } catch (error) {
    return { items: [], error: historyError(error) };
  }
}

export async function lookupVenueHistory(
  venueCmsId: string,
  options: { cookie?: string } = {},
): Promise<HistoryLookup> {
  const origin = getRailwayApiOrigin();
  if (!origin) {
    return { items: [], error: MATCH_API_UNAVAILABLE };
  }

  try {
    const items = await listVenueHistoryWith(venueCmsId, {
      fetch,
      baseUrl: origin,
      cookie: options.cookie,
    });
    return { items, error: null };
  } catch (error) {
    return { items: [], error: historyError(error) };
  }
}
