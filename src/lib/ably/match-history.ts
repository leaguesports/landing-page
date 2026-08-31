import Ably from "ably";
import type {
  MatchChannelEvent,
  PadelMatch,
} from "@/types/padel-match";

const HISTORY_EVENT_NAMES = new Set([
  "POINT_SCORED",
  "UNDO_POINT",
  "SET_COMPLETED",
  "MATCH_FINALIZED",
  "STATE_SYNC",
]);

function getAblyRest(): Ably.Rest | null {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) return null;
  return new Ably.Rest({ key: apiKey });
}

function matchChannelName(sport: string, matchId: string): string {
  return `${sport}:${matchId}`;
}

function extractState(message: Ably.Message): PadelMatch | null {
  const data = message.data as MatchChannelEvent | PadelMatch | null;
  if (!data || typeof data !== "object") return null;

  if ("state" in data && data.state && typeof data.state === "object") {
    const event = data as MatchChannelEvent;
    if (event.state.id) return event.state;
  }

  if ("id" in data && "sport" in data && "pairings" in data) {
    return data as PadelMatch;
  }

  return null;
}

/**
 * Recover the latest match snapshot from Ably channel history.
 * Each published scoring event carries a full `state` — newest wins.
 */
export async function loadMatchFromAbly(
  matchId: string,
  sport = "padel",
): Promise<PadelMatch | null> {
  const rest = getAblyRest();
  if (!rest) return null;

  const channel = rest.channels.get(matchChannelName(sport, matchId));

  try {
    const result = await channel.history({
      limit: 100,
      direction: "backwards",
    });

    let latest: PadelMatch | null = null;

    for (const message of result.items ?? []) {
      if (message.name && !HISTORY_EVENT_NAMES.has(message.name)) continue;
      const state = extractState(message);
      if (!state || state.id !== matchId) continue;

      if (!latest || state.version >= latest.version) {
        latest = state;
      }
      // First page is newest-first; first valid snapshot is usually enough,
      // but keep scanning in case versions are out of order within the page.
    }

    return latest;
  } catch (error) {
    console.error("[ably] history load failed", matchId, error);
    return null;
  }
}

