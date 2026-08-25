import type {
  CreatePadelMatchInput,
  PadelMatch,
} from "@/types/padel-match";
import { createInitialPadelMatch } from "@/lib/padel/padelReducer";
import {
  loadMatchFromAbly,
  publishMatchToAbly,
} from "@/lib/ably/match-history";

/**
 * Match persistence is Ably channel history only.
 * In-memory Map is a short-lived cache for the same serverless instance.
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

function newMatchId(): string {
  return `match_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function createMatch(
  input: CreatePadelMatchInput,
): Promise<PadelMatch> {
  const match = createInitialPadelMatch({
    id: newMatchId(),
    ruleset: input.ruleset,
    venue: input.venue,
    pairings: input.pairings,
    servingTeam: input.servingTeam ?? "A",
    createdByUserId: input.createdByUserId ?? null,
  });

  getStore().matches.set(match.id, match);

  // Seed Ably history so `/padel/{id}` can hydrate after cold starts
  const published = await publishMatchToAbly(match, "STATE_SYNC");
  if (!published) {
    throw new Error(
      "Realtime is unavailable — set ABLY_API_KEY to start matches",
    );
  }

  return match;
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
