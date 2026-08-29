import type { PadelMatch, PadelTeamId } from "../../types/padel-match.ts";
import { matchWinner } from "./api-match.ts";

export type LockedPadelFields = {
  lockedAt?: string | null;
  winner?: PadelTeamId | null;
  sets: PadelMatch["sets"];
};

/**
 * Stamp the immutable lock result onto the live scorecard snapshot.
 * Does not copy `game`, `servingTeam`, or other live fields from a parsed
 * API snapshot (`parseApiMatch` rebuilds those via `createInitialPadelMatch`).
 */
export function applyLockedPadelResult(
  live: PadelMatch,
  locked: LockedPadelFields,
): PadelMatch {
  const sets = locked.sets.length > 0 ? locked.sets : live.sets;
  const winner: PadelTeamId | null =
    locked.winner === "A" || locked.winner === "B"
      ? locked.winner
      : (matchWinner({ ...live, sets }) ?? live.winner ?? null);

  return {
    ...live,
    status: "finalized",
    lockedAt: locked.lockedAt || live.lockedAt || new Date().toISOString(),
    winner,
    sets,
    currentSetIndex: sets.length > 0 ? sets.length - 1 : live.currentSetIndex,
    version: live.version + 1,
    updatedAt: new Date().toISOString(),
  };
}
