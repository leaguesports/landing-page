/**
 * Client-side padel set/match validation. Mirrors the API plug-in rules so
 * the capture form can reject illegal scorelines before POST.
 */

export type PadelFormat = "best_of_3" | "best_of_5";
export type PadelTeamId = "A" | "B";

export type PadelSetScore = {
  a: number;
  b: number;
};

export type MatchOutcome = {
  winner: PadelTeamId;
  setsWon: { A: number; B: number };
};

export function setWinner(set: PadelSetScore): PadelTeamId | null {
  const { a, b } = set;
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
    return null;
  }
  if (a === 7 && b === 6) return "A";
  if (b === 7 && a === 6) return "B";
  if (a === 7 && b === 5) return "A";
  if (b === 7 && a === 5) return "B";
  if (a === 6 && b <= 4) return "A";
  if (b === 6 && a <= 4) return "B";
  return null;
}

export function setsNeededToWin(format: PadelFormat): number {
  return format === "best_of_5" ? 3 : 2;
}

export function maxSets(format: PadelFormat): number {
  return format === "best_of_5" ? 5 : 3;
}

export function decideMatch(
  format: PadelFormat,
  sets: readonly PadelSetScore[],
): MatchOutcome | null {
  if (sets.length === 0) return null;
  if (sets.length > maxSets(format)) return null;

  const needed = setsNeededToWin(format);
  let wonA = 0;
  let wonB = 0;

  for (let index = 0; index < sets.length; index += 1) {
    if (wonA >= needed || wonB >= needed) return null;
    const winner = setWinner(sets[index]!);
    if (!winner) return null;
    if (winner === "A") wonA += 1;
    else wonB += 1;
  }

  if (wonA !== needed && wonB !== needed) return null;
  if (wonA === needed && wonB === needed) return null;

  return {
    winner: wonA > wonB ? "A" : "B",
    setsWon: { A: wonA, B: wonB },
  };
}

export function scoreline(sets: readonly PadelSetScore[]): string {
  return sets.map((set) => `${set.a}-${set.b}`).join(" ");
}
