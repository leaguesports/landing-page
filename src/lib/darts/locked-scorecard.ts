import type {
  DartsMatch,
  DartsPlayer,
  DartsPlayerSlot,
  DartsTurn,
} from "../../types/darts-match.ts";
import { DARTS_STARTING_SCORE } from "../../types/darts-match.ts";

export type DartsLockedPlayerRow = {
  slot: DartsPlayerSlot;
  displayName: string;
  remaining: number;
  isWinner: boolean;
  visits: number;
  scored: number;
  average: number | null;
  checkoutScore: number | null;
};

export type DartsLockedVisitRow = {
  turnNumber: number;
  playerSlot: DartsPlayerSlot;
  displayName: string;
  score: number;
  bust: boolean;
  checkout: boolean;
  remainingAfter: number;
};

export type DartsLockedScorecardModel = {
  startingScore: typeof DARTS_STARTING_SCORE;
  players: DartsLockedPlayerRow[];
  visits: DartsLockedVisitRow[];
  winnerLabel: string | null;
  checkoutScore: number | null;
};

function firstName(player: Pick<DartsPlayer, "displayName">): string {
  return player.displayName.split(" ")[0] || player.displayName;
}

function playerVisits(
  turns: readonly DartsTurn[],
  slot: DartsPlayerSlot,
): DartsTurn[] {
  return turns.filter((turn) => turn.playerSlot === slot);
}

function scoredPoints(turns: readonly DartsTurn[]): number {
  return turns.reduce(
    (sum, turn) => (turn.bust ? sum : sum + turn.score),
    0,
  );
}

function visitAverage(scored: number, visits: number): number | null {
  if (visits <= 0) return null;
  return Math.round((scored / visits) * 10) / 10;
}

function checkoutForPlayer(
  turns: readonly DartsTurn[],
  slot: DartsPlayerSlot,
): number | null {
  const finish = [...turns]
    .reverse()
    .find((turn) => turn.playerSlot === slot && turn.checkout);
  return finish ? finish.score : null;
}

export function buildDartsLockedScorecard(
  match: Pick<
    DartsMatch,
    "players" | "turns" | "winnerSlot" | "winnerUserId" | "startingScore"
  >,
): DartsLockedScorecardModel {
  const startingScore = match.startingScore || DARTS_STARTING_SCORE;
  const nameBySlot = new Map(
    match.players.map((player) => [player.slot, player.displayName] as const),
  );

  const players: DartsLockedPlayerRow[] = match.players.map((player) => {
    const turns = playerVisits(match.turns, player.slot);
    const scored = scoredPoints(turns);
    const isWinner =
      match.winnerSlot === player.slot ||
      (Boolean(match.winnerUserId) &&
        Boolean(player.userId) &&
        match.winnerUserId === player.userId);
    return {
      slot: player.slot,
      displayName: player.displayName,
      remaining: player.remaining,
      isWinner,
      visits: turns.length,
      scored,
      average: visitAverage(scored, turns.length),
      checkoutScore: isWinner
        ? checkoutForPlayer(match.turns, player.slot)
        : null,
    };
  });

  // Winner first, then by remaining ascending (closer finishes higher).
  players.sort((a, b) => {
    if (a.isWinner !== b.isWinner) return a.isWinner ? -1 : 1;
    if (a.remaining !== b.remaining) return a.remaining - b.remaining;
    return a.slot - b.slot;
  });

  const visits: DartsLockedVisitRow[] = match.turns.map((turn) => ({
    turnNumber: turn.turnNumber,
    playerSlot: turn.playerSlot,
    displayName:
      nameBySlot.get(turn.playerSlot) ?? `Slot ${turn.playerSlot}`,
    score: turn.score,
    bust: turn.bust,
    checkout: turn.checkout,
    remainingAfter: turn.remainingAfter,
  }));

  const winner = players.find((player) => player.isWinner) ?? null;

  return {
    startingScore,
    players,
    visits,
    winnerLabel: winner
      ? firstName({ displayName: winner.displayName })
      : null,
    checkoutScore: winner?.checkoutScore ?? null,
  };
}

/** History / share scoreline — remainings joined with en-dashes. */
export function formatDartsRemainingLine(
  players: readonly Pick<DartsPlayer, "remaining" | "slot">[],
): string {
  if (!players.length) return "—";
  return [...players]
    .sort((a, b) => a.remaining - b.remaining || a.slot - b.slot)
    .map((player) => String(player.remaining))
    .join("–");
}
