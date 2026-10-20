/**
 * Pure padel scoring for the mock Record a match flow.
 * A finished set is 6-0 through 6-4, 7-5, or 7-6 with a tiebreak played at 6-6.
 * No storage and no network.
 */

export type PadelSide = "A" | "B";

export type PadelSet = {
  gamesA: number;
  gamesB: number;
  /** Tiebreak points. Kept only while the games are 6-6. */
  tiebreakA: number | null;
  tiebreakB: number | null;
};

export function emptyPadelSet(): PadelSet {
  return { gamesA: 0, gamesB: 0, tiebreakA: null, tiebreakB: null };
}

function whole(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/** First to 7, win by 2. */
export function tiebreakWinner(pointsA: number | null, pointsB: number | null): PadelSide | null {
  if (pointsA === null || pointsB === null) return null;
  if (!whole(pointsA) || !whole(pointsB) || pointsA === pointsB) return null;
  const high = Math.max(pointsA, pointsB);
  const low = Math.min(pointsA, pointsB);
  if (high < 7 || high - low < 2) return null;
  return pointsA > pointsB ? "A" : "B";
}

function straightWinner(gamesA: number, gamesB: number): PadelSide | null {
  const high = Math.max(gamesA, gamesB);
  const low = Math.min(gamesA, gamesB);
  if (high !== 6 || low > 4) return null;
  return gamesA > gamesB ? "A" : "B";
}

function sevenFiveWinner(gamesA: number, gamesB: number): PadelSide | null {
  if (gamesA === 7 && gamesB === 5) return "A";
  if (gamesA === 5 && gamesB === 7) return "B";
  return null;
}

/**
 * Finished sets:
 * - 6-0, 6-1, 6-2, 6-3, 6-4 and the reverse
 * - 7-5 and 5-7
 * - 7-6 and 6-7 only when a tiebreak was played at 6-6
 * 6-5, 5-5, a bare 6-6, and 7-6 without a tiebreak are unfinished.
 */
export function setWinner(set: PadelSet): PadelSide | null {
  if (!whole(set.gamesA) || !whole(set.gamesB)) return null;
  const straight = straightWinner(set.gamesA, set.gamesB);
  if (straight) return straight;
  const sevenFive = sevenFiveWinner(set.gamesA, set.gamesB);
  if (sevenFive) return sevenFive;
  const tiebreak = tiebreakWinner(set.tiebreakA, set.tiebreakB);
  if (set.gamesA === 6 && set.gamesB === 6) return tiebreak;
  if (set.gamesA === 7 && set.gamesB === 6 && tiebreak === "A") return "A";
  if (set.gamesA === 6 && set.gamesB === 7 && tiebreak === "B") return "B";
  return null;
}

export function isFinishedSet(set: PadelSet): boolean {
  return setWinner(set) !== null;
}

/** 6-6 plus a won tiebreak is shown as 7-6. The steppers keep the games at 6-6. */
export function displayGames(set: PadelSet): { gamesA: number; gamesB: number } {
  if (set.gamesA === 6 && set.gamesB === 6) {
    const tiebreak = tiebreakWinner(set.tiebreakA, set.tiebreakB);
    if (tiebreak === "A") return { gamesA: 7, gamesB: 6 };
    if (tiebreak === "B") return { gamesA: 6, gamesB: 7 };
  }
  return { gamesA: set.gamesA, gamesB: set.gamesB };
}

export function tiebreakOpen(set: PadelSet): boolean {
  return set.gamesA === 6 && set.gamesB === 6;
}

/**
 * Best of 3. Play stops at the first unfinished set, and the match ends
 * when one side has won two sets.
 */
export function matchWinner(sets: readonly PadelSet[]): PadelSide | null {
  let wonA = 0;
  let wonB = 0;
  for (const set of sets.slice(0, 3)) {
    const winner = setWinner(set);
    if (!winner) break;
    if (winner === "A") wonA += 1;
    else wonB += 1;
    if (wonA >= 2) return "A";
    if (wonB >= 2) return "B";
  }
  return null;
}

/** The third set is offered only when the first two sets are split 1-1. */
export function thirdSetOffered(sets: readonly PadelSet[]): boolean {
  const first = sets[0];
  const second = sets[1];
  if (!first || !second) return false;
  const winnerA = setWinner(first);
  const winnerB = setWinner(second);
  return winnerA !== null && winnerB !== null && winnerA !== winnerB;
}

export function visibleSetCount(sets: readonly PadelSet[]): number {
  const first = sets[0];
  if (!first || !setWinner(first)) return 1;
  if (thirdSetOffered(sets)) return 3;
  return 2;
}

/** Save stays blocked until best-of-3 has a winner. */
export function canSaveMatch(sets: readonly PadelSet[]): boolean {
  return matchWinner(sets) !== null;
}

export function setsToSave(sets: readonly PadelSet[]): PadelSet[] | null {
  if (!canSaveMatch(sets)) return null;
  const played: PadelSet[] = [];
  let wonA = 0;
  let wonB = 0;
  for (const set of sets.slice(0, 3)) {
    const winner = setWinner(set);
    if (!winner) break;
    played.push({
      gamesA: set.gamesA,
      gamesB: set.gamesB,
      tiebreakA: set.tiebreakA,
      tiebreakB: set.tiebreakB,
    });
    if (winner === "A") wonA += 1;
    else wonB += 1;
    if (wonA >= 2 || wonB >= 2) break;
  }
  if (wonA < 2 && wonB < 2) return null;
  return played;
}

function legalGames(gamesA: number, gamesB: number): boolean {
  if (!whole(gamesA) || !whole(gamesB) || gamesA > 7 || gamesB > 7) return false;
  if (gamesA === 7 || gamesB === 7) {
    return (gamesA === 7 && gamesB === 5) || (gamesA === 5 && gamesB === 7);
  }
  return true;
}

export function normalizeTiebreak(set: PadelSet): PadelSet {
  if (set.gamesA === 6 && set.gamesB === 6) {
    return {
      gamesA: 6,
      gamesB: 6,
      tiebreakA: set.tiebreakA ?? 0,
      tiebreakB: set.tiebreakB ?? 0,
    };
  }
  return { gamesA: set.gamesA, gamesB: set.gamesB, tiebreakA: null, tiebreakB: null };
}

/**
 * Step one side's games. A side can reach 7 only for 7-5.
 * At 6-6 the games lock and the tiebreak field decides 7-6.
 * The loser can still be entered after 6-0, so 6-4 does not have to be typed in order.
 */
export function stepGames(set: PadelSet, side: PadelSide, delta: 1 | -1): PadelSet {
  if (!whole(set.gamesA) || !whole(set.gamesB)) return set;
  const current = side === "A" ? set.gamesA : set.gamesB;
  const next = current + delta;
  if (next < 0) return set;
  const gamesA = side === "A" ? next : set.gamesA;
  const gamesB = side === "B" ? next : set.gamesB;
  if (!legalGames(gamesA, gamesB)) return set;
  return normalizeTiebreak({ ...set, gamesA, gamesB });
}

export function stepTiebreak(set: PadelSet, side: PadelSide, delta: 1 | -1): PadelSet {
  if (!tiebreakOpen(set)) return set;
  const base = normalizeTiebreak(set);
  const current = side === "A" ? base.tiebreakA ?? 0 : base.tiebreakB ?? 0;
  const next = current + delta;
  if (next < 0 || next > 30) return base;
  if (delta === 1 && tiebreakWinner(base.tiebreakA, base.tiebreakB)) return base;
  return {
    ...base,
    tiebreakA: side === "A" ? next : base.tiebreakA,
    tiebreakB: side === "B" ? next : base.tiebreakB,
  };
}

export function canStepGames(set: PadelSet, side: PadelSide, delta: 1 | -1): boolean {
  const next = stepGames(set, side, delta);
  return next.gamesA !== set.gamesA || next.gamesB !== set.gamesB;
}

export function canStepTiebreak(set: PadelSet, side: PadelSide, delta: 1 | -1): boolean {
  const next = stepTiebreak(set, side, delta);
  return next.tiebreakA !== set.tiebreakA || next.tiebreakB !== set.tiebreakB;
}

export function replaceSet(sets: readonly PadelSet[], index: number, next: PadelSet): PadelSet[] {
  const visible = visibleSetCount(sets);
  if (index < 0 || index >= visible) return sets.slice(0, visible);
  const copy = Array.from({ length: visible }, (_, slot) => sets[slot] ?? emptyPadelSet());
  copy[index] = normalizeTiebreak(next);
  return copy.slice(0, visibleSetCount(copy));
}

export function formatSetLine(set: PadelSet): string {
  const games = displayGames(set);
  const tiebreak =
    tiebreakOpen(set) && tiebreakWinner(set.tiebreakA, set.tiebreakB)
      ? ` (${set.tiebreakA}-${set.tiebreakB})`
      : "";
  return `${games.gamesA}-${games.gamesB}${tiebreak}`;
}

export function formatSetsLine(sets: readonly PadelSet[]): string {
  return sets.map(formatSetLine).join(", ");
}
