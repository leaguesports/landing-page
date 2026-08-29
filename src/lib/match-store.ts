import type { PadelMatch } from "@/types/padel-match";
import {
  loadMatchFromAbly,
  publishMatchToAbly,
} from "@/lib/ably/match-history";

/**
 * Ably live-scoring cache only. Match identity (share/history id) is
 * created on league-sports-api via POST /api/matches — never mint an id here.
 */

type GlobalMatchStore = {
  matches: Map<string, PadelMatch>;
};

function getStore(): GlobalMatchStore {
  const g = globalThis as typeof globalThis & {
    __leaguesportsPadelMatches?: GlobalMatchStore;
  };
  if (!g.__leaguesportsPadelMatches) {
    g.__leaguesportsPadelMatches = { matches: new Map() };
  }
  return g.__leaguesportsPadelMatches;
}

export async function getMatch(id: string): Promise<PadelMatch | null> {
  const cached = getStore().matches.get(id);
  if (cached) return cached;

  const fromAbly = await loadMatchFromAbly(id, "padel");
  if (fromAbly) {
    getStore().matches.set(fromAbly.id, fromAbly);
  }
  return fromAbly;
}

/**
 * Cache locally and write the latest snapshot to Ably history.
 */
export async function syncMatchState(match: PadelMatch): Promise<PadelMatch> {
  getStore().matches.set(match.id, match);
  await publishMatchToAbly(match, "STATE_SYNC");
  return match;
}

/** In-process cache only — Ably already holds the published event. */
export async function cacheMatchState(match: PadelMatch): Promise<PadelMatch> {
  getStore().matches.set(match.id, match);
  return match;
}
