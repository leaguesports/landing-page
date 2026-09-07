import type {
  PadelMatch,
  PadelTeamId,
  SetScore,
} from "../../types/padel-match.ts";
import { getTeamLabel } from "./padelReducer.ts";

export type PadelScorecardSetCell = {
  games: number;
  tieBreakPoints: number | null;
  display: string;
  won: boolean;
  played: boolean;
};

export type PadelScorecardTeamRow = {
  team: PadelTeamId;
  label: string;
  cells: PadelScorecardSetCell[];
  setsWon: number;
  isWinner: boolean;
};

export type PadelLockedScorecardModel = {
  setLabels: string[];
  teamA: PadelScorecardTeamRow;
  teamB: PadelScorecardTeamRow;
  winner: PadelTeamId | null;
  winnerLabel: string | null;
};

export function playedPadelSets(sets: SetScore[]): SetScore[] {
  return sets.filter(
    (set) =>
      set.gamesA > 0 ||
      set.gamesB > 0 ||
      Boolean(set.winner) ||
      Boolean(set.tieBreak),
  );
}

function setWinner(set: SetScore): PadelTeamId | null {
  if (set.winner === "A" || set.winner === "B") return set.winner;
  if (set.gamesA === set.gamesB) return null;
  return set.gamesA > set.gamesB ? "A" : "B";
}

function lockedWinner(
  match: Pick<PadelMatch, "winner" | "sets">,
): PadelTeamId | null {
  if (match.winner === "A" || match.winner === "B") return match.winner;
  const a = match.sets.filter((set) => setWinner(set) === "A").length;
  const b = match.sets.filter((set) => setWinner(set) === "B").length;
  if (a > b) return "A";
  if (b > a) return "B";
  return null;
}

function teamCell(set: SetScore, team: PadelTeamId): PadelScorecardSetCell {
  const games = team === "A" ? set.gamesA : set.gamesB;
  const tieBreakPoints =
    set.tieBreak == null
      ? null
      : team === "A"
        ? set.tieBreak.pointsA
        : set.tieBreak.pointsB;
  const winner = setWinner(set);
  return {
    games,
    tieBreakPoints,
    display: String(games),
    won: winner === team,
    played: true,
  };
}

export function buildPadelLockedScorecard(
  match: Pick<PadelMatch, "pairings" | "sets" | "winner">,
): PadelLockedScorecardModel {
  const sets = playedPadelSets(match.sets);
  const winner = lockedWinner(match);
  const teamACells = sets.map((set) => teamCell(set, "A"));
  const teamBCells = sets.map((set) => teamCell(set, "B"));
  const setsWonA = teamACells.filter((cell) => cell.won).length;
  const setsWonB = teamBCells.filter((cell) => cell.won).length;
  const teamALabel = getTeamLabel(match, "A");
  const teamBLabel = getTeamLabel(match, "B");

  return {
    setLabels: sets.map((_, index) => String(index + 1)),
    teamA: {
      team: "A",
      label: teamALabel,
      cells: teamACells,
      setsWon: setsWonA,
      isWinner: winner === "A",
    },
    teamB: {
      team: "B",
      label: teamBLabel,
      cells: teamBCells,
      setsWon: setsWonB,
      isWinner: winner === "B",
    },
    winner,
    winnerLabel:
      winner === "A" ? teamALabel : winner === "B" ? teamBLabel : null,
  };
}
