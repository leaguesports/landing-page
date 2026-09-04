import type { GolfLiveStrokes } from "../../types/golf-round.ts";

export type GolfRoundLocalState = {
  roundId: string;
  currentHoleIndex: number;
  strokes: GolfLiveStrokes;
  updatedAt: string;
};

const CACHE_PREFIX = "leaguesports.golf.round.v1.";

export function golfRoundCacheKey(roundId: string): string {
  return `${CACHE_PREFIX}${roundId.trim()}`;
}

export function readGolfRoundLocal(
  roundId: string,
): GolfRoundLocalState | null {
  if (typeof window === "undefined") return null;
  const id = roundId.trim();
  if (!id) return null;
  try {
    const raw = localStorage.getItem(golfRoundCacheKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GolfRoundLocalState;
    if (!parsed || parsed.roundId !== id) return null;
    if (typeof parsed.currentHoleIndex !== "number") return null;
    if (!parsed.strokes || typeof parsed.strokes !== "object") return null;
    return {
      roundId: id,
      currentHoleIndex: Math.max(0, Math.floor(parsed.currentHoleIndex)),
      strokes: parsed.strokes,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeGolfRoundLocal(state: GolfRoundLocalState): void {
  if (typeof window === "undefined") return;
  const id = state.roundId.trim();
  if (!id) return;
  try {
    localStorage.setItem(
      golfRoundCacheKey(id),
      JSON.stringify({
        ...state,
        roundId: id,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // quota / private mode
  }
}

export function clearGolfRoundLocal(roundId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(golfRoundCacheKey(roundId));
  } catch {
    // ignore
  }
}

/** Full round snapshot cache (create → navigate). */
const SNAPSHOT_PREFIX = "leaguesports.golf.snapshot.v1.";

export function cacheGolfRoundSnapshot(round: unknown): void {
  if (typeof window === "undefined") return;
  if (!round || typeof round !== "object") return;
  const id = (round as { id?: unknown }).id;
  if (typeof id !== "string" || !id.trim()) return;
  try {
    localStorage.setItem(
      `${SNAPSHOT_PREFIX}${id.trim()}`,
      JSON.stringify(round),
    );
  } catch {
    // ignore
  }
}

export function readCachedGolfRoundSnapshot<T = unknown>(
  roundId: string,
): T | null {
  if (typeof window === "undefined") return null;
  const id = roundId.trim();
  if (!id) return null;
  try {
    const raw = localStorage.getItem(`${SNAPSHOT_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
