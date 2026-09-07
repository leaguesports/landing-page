import type {
  CaptureDartsTurnInput,
  DartsPlayer,
  DartsPlayerSlot,
  DartsTurnInput,
} from "../../types/darts-match.ts";
import {
  DARTS_MAX_PLAYERS,
  DARTS_MAX_TURN_SCORE,
  DARTS_MIN_PLAYERS,
  DARTS_MIN_TURN_SCORE,
  DARTS_STARTING_SCORE,
} from "../../types/darts-match.ts";

/**
 * Scores that cannot be finished on double-out with three darts.
 * The API does not validate the combo; the FE asserts this before checkout.
 */
export const DARTS_BOGEY_SCORES = new Set([
  159, 162, 163, 165, 166, 168, 169,
]);

export const DARTS_MAX_CHECKOUT = 170;
export const DARTS_MIN_CHECKOUT = 2;

export type VisitKind =
  | "invalid"
  | "bust"
  | "illegal_finish"
  | "finish"
  | "leave";

export type VisitEvaluation = {
  kind: VisitKind;
  remainingAfter: number;
  bust: boolean;
  checkout: boolean;
  message: string | null;
};

export function isDartsPlayerSlot(value: unknown): value is DartsPlayerSlot {
  return (
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7 ||
    value === 8
  );
}

export function parseDartsPlayerSlot(value: unknown): DartsPlayerSlot | null {
  if (isDartsPlayerSlot(value)) return value;
  if (
    value === "1" ||
    value === "2" ||
    value === "3" ||
    value === "4" ||
    value === "5" ||
    value === "6" ||
    value === "7" ||
    value === "8"
  ) {
    return Number(value) as DartsPlayerSlot;
  }
  return null;
}

export function isValidTurnScore(score: unknown): score is number {
  return (
    typeof score === "number" &&
    Number.isInteger(score) &&
    score >= DARTS_MIN_TURN_SCORE &&
    score <= DARTS_MAX_TURN_SCORE
  );
}

/** Remaining that can legally finish a 501 double-out visit. */
export function isPlausibleDoubleOutFinish(remaining: number): boolean {
  return (
    Number.isInteger(remaining) &&
    remaining >= DARTS_MIN_CHECKOUT &&
    remaining <= DARTS_MAX_CHECKOUT &&
    !DARTS_BOGEY_SCORES.has(remaining)
  );
}

export function isBustVisit(remaining: number, score: number): boolean {
  if (!isValidTurnScore(score)) return false;
  return score > remaining || remaining - score === 1;
}

export function evaluateVisit(
  remaining: number,
  score: unknown,
): VisitEvaluation {
  if (!isValidTurnScore(score)) {
    return {
      kind: "invalid",
      remainingAfter: remaining,
      bust: false,
      checkout: false,
      message: `Visit score must be an integer ${DARTS_MIN_TURN_SCORE}–${DARTS_MAX_TURN_SCORE}`,
    };
  }

  if (isBustVisit(remaining, score)) {
    return {
      kind: "bust",
      remainingAfter: remaining,
      bust: true,
      checkout: false,
      message:
        remaining - score === 1
          ? "Bust — cannot leave 1 on double-out"
          : "Bust — score is higher than remaining",
    };
  }

  if (remaining - score === 0) {
    if (!isPlausibleDoubleOutFinish(remaining)) {
      return {
        kind: "illegal_finish",
        remainingAfter: remaining,
        bust: false,
        checkout: false,
        message: `${remaining} is not a legal double-out checkout`,
      };
    }
    return {
      kind: "finish",
      remainingAfter: 0,
      bust: false,
      checkout: true,
      message: "Checkout — double-out finish",
    };
  }

  return {
    kind: "leave",
    remainingAfter: remaining - score,
    bust: false,
    checkout: false,
    message: null,
  };
}

/** Show the checkout control when this visit would finish on a legal double. */
export function shouldOfferCheckout(
  remaining: number,
  score: unknown,
): boolean {
  return evaluateVisit(remaining, score).kind === "finish";
}

export type ReplayState = {
  remaining: Record<DartsPlayerSlot, number>;
  winnerSlot: DartsPlayerSlot | null;
  busts: number;
};

export function emptyReplayState(
  slots: readonly DartsPlayerSlot[],
  startingScore = DARTS_STARTING_SCORE,
): ReplayState {
  const remaining = {} as Record<DartsPlayerSlot, number>;
  for (const slot of slots) {
    remaining[slot] = startingScore;
  }
  return { remaining, winnerSlot: null, busts: 0 };
}

export function replayTurns(
  players: readonly Pick<DartsPlayer, "slot">[],
  turns: readonly CaptureDartsTurnInput[],
  startingScore = DARTS_STARTING_SCORE,
): { ok: true; state: ReplayState } | { ok: false; message: string } {
  const slots = players.map((player) => player.slot);
  const state = emptyReplayState(slots, startingScore);

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    if (!turn) continue;
    if (state.winnerSlot) {
      return { ok: false, message: "Turns continue after a finishing checkout" };
    }
    if (!slots.includes(turn.playerSlot)) {
      return {
        ok: false,
        message: `Turn ${i + 1} player is not seated`,
      };
    }
    const current = state.remaining[turn.playerSlot];
    const visit = evaluateVisit(current, turn.score);
    if (visit.kind === "invalid" || visit.kind === "illegal_finish") {
      return { ok: false, message: visit.message ?? "Invalid visit" };
    }
    if (visit.kind === "finish") {
      if (turn.checkout !== true) {
        return {
          ok: false,
          message: "checkout must be true to finish on 0",
        };
      }
      state.remaining[turn.playerSlot] = 0;
      state.winnerSlot = turn.playerSlot;
      continue;
    }
    if (turn.checkout === true) {
      return {
        ok: false,
        message: "checkout can only be set on a finishing visit",
      };
    }
    if (visit.kind === "bust") {
      state.busts += 1;
      continue;
    }
    state.remaining[turn.playerSlot] = visit.remainingAfter;
  }

  return { ok: true, state };
}

export function normalizePlayerCount(count: number): number {
  if (!Number.isInteger(count)) return DARTS_MIN_PLAYERS;
  return Math.min(DARTS_MAX_PLAYERS, Math.max(DARTS_MIN_PLAYERS, count));
}

export function toTurnPayload(
  input: DartsTurnInput,
  remaining?: number,
): { playerSlot?: DartsPlayerSlot; userId?: string; score: number; checkout?: true } {
  if (!isValidTurnScore(input.score)) {
    throw new Error(
      `Visit score must be an integer ${DARTS_MIN_TURN_SCORE}–${DARTS_MAX_TURN_SCORE}`,
    );
  }

  const slot = parseDartsPlayerSlot(input.playerSlot);
  const userId =
    typeof input.userId === "string" && input.userId.trim()
      ? input.userId.trim()
      : "";
  if (!slot && !userId) {
    throw new Error("playerSlot or userId is required");
  }

  const checkout =
    remaining == null
      ? input.checkout === true
      : evaluateVisit(remaining, input.score).kind === "finish" &&
        input.checkout === true;

  if (remaining != null) {
    const visit = evaluateVisit(remaining, input.score);
    if (visit.kind === "invalid" || visit.kind === "illegal_finish") {
      throw new Error(visit.message ?? "Invalid visit");
    }
    if (visit.kind === "finish" && input.checkout !== true) {
      throw new Error("checkout must be true to finish on 0");
    }
    if (input.checkout === true && visit.kind !== "finish") {
      throw new Error("checkout can only be set on a finishing visit");
    }
  }

  return {
    ...(slot ? { playerSlot: slot } : {}),
    ...(userId ? { userId } : {}),
    score: input.score,
    ...(checkout ? { checkout: true as const } : {}),
  };
}
