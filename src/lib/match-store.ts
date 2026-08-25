import type {
  CreatePadelMatchInput,
  PadelMatch,
} from "@/types/padel-match";
import { createInitialPadelMatch } from "@/lib/padel/padelReducer";

/**
 * Lightweight server-side match store for Quick-Start.
 * Prefer forwarding to the main API (`NEXT_PUBLIC_API_URL`) when configured;
 * otherwise keep an in-process map (local/dev / single-instance).
 *
 * Plugs into the existing external-API cookie session model — same host as
 * auth/pools once `/api/matches` is implemented on the backend.
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

function getExternalBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

function newMatchId(): string {
  return `match_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

async function forwardCreate(
  input: CreatePadelMatchInput,
): Promise<PadelMatch | null> {
  const base = getExternalBase();
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sport: "padel", ...input }),
    });
    if (!res.ok) return null;
    return (await res.json()) as PadelMatch;
  } catch {
    return null;
  }
}

async function forwardGet(id: string): Promise<PadelMatch | null> {
  const base = getExternalBase();
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/matches/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as PadelMatch;
  } catch {
    return null;
  }
}

async function forwardSync(match: PadelMatch): Promise<void> {
  const base = getExternalBase();
  if (!base) return;

  try {
    await fetch(`${base}/api/matches/${encodeURIComponent(match.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(match),
    });
  } catch (error) {
    console.error("[matches] async sync failed", error);
  }
}

export async function createMatch(
  input: CreatePadelMatchInput,
): Promise<PadelMatch> {
  const forwarded = await forwardCreate(input);
  if (forwarded) {
    getStore().matches.set(forwarded.id, forwarded);
    return forwarded;
  }

  const match = createInitialPadelMatch({
    id: newMatchId(),
    ruleset: input.ruleset,
    venue: input.venue,
    pairings: input.pairings,
    servingTeam: input.servingTeam ?? "A",
    createdByUserId: input.createdByUserId ?? null,
  });

  getStore().matches.set(match.id, match);
  return match;
}

export async function getMatch(id: string): Promise<PadelMatch | null> {
  const local = getStore().matches.get(id);
  if (local) return local;

  const remote = await forwardGet(id);
  if (remote) {
    getStore().matches.set(remote.id, remote);
  }
  return remote;
}

/**
 * Persist latest snapshot locally and fire-and-forget sync to main DB API.
 */
export async function syncMatchState(match: PadelMatch): Promise<PadelMatch> {
  getStore().matches.set(match.id, match);
  // Async DB sync — do not block the Ably publish path
  void forwardSync(match);
  return match;
}
