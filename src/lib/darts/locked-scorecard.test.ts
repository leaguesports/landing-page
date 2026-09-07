import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDartsLockedScorecard,
  formatDartsRemainingLine,
} from "./locked-scorecard.ts";
import type { DartsMatch, DartsPlayer, DartsTurn } from "../../types/darts-match.ts";

function player(
  slot: DartsPlayer["slot"],
  displayName: string,
  remaining: number,
  userId?: string | null,
): DartsPlayer {
  return {
    slot,
    displayName,
    remaining,
    isGuest: !userId,
    userId: userId ?? null,
  };
}

function turn(
  turnNumber: number,
  playerSlot: DartsTurn["playerSlot"],
  score: number,
  remainingAfter: number,
  flags: { bust?: boolean; checkout?: boolean } = {},
): DartsTurn {
  return {
    turnNumber,
    playerSlot,
    score,
    remainingAfter,
    bust: flags.bust ?? false,
    checkout: flags.checkout ?? false,
  };
}

function baseMatch(
  overrides: Partial<DartsMatch> = {},
): Pick<
  DartsMatch,
  "players" | "turns" | "winnerSlot" | "winnerUserId" | "startingScore"
> {
  return {
    startingScore: 501,
    players: [
      player(1, "Alex Reed", 0, "u1"),
      player(2, "Sam Ortiz", 142, "u2"),
    ],
    turns: [
      turn(1, 1, 60, 441),
      turn(2, 2, 45, 456),
      turn(3, 1, 100, 341),
      turn(4, 2, 26, 430),
      turn(5, 1, 141, 200),
      turn(6, 2, 180, 250),
      turn(7, 1, 100, 100),
      turn(8, 2, 108, 142),
      turn(9, 1, 100, 0, { checkout: true }),
    ],
    winnerSlot: 1,
    winnerUserId: "u1",
    ...overrides,
  };
}

describe("buildDartsLockedScorecard", () => {
  it("puts the winner first with checkout and visit average", () => {
    const card = buildDartsLockedScorecard(baseMatch());
    assert.equal(card.players[0]?.isWinner, true);
    assert.equal(card.players[0]?.remaining, 0);
    assert.equal(card.players[0]?.checkoutScore, 100);
    assert.equal(card.players[0]?.visits, 5);
    assert.equal(card.checkoutScore, 100);
    assert.equal(card.winnerLabel, "Alex");
    assert.equal(card.visits.length, 9);
    assert.equal(card.visits[8]?.checkout, true);
  });

  it("ignores bust scores in the visit average", () => {
    const card = buildDartsLockedScorecard(
      baseMatch({
        players: [
          player(1, "Alex", 40),
          player(2, "Sam", 100),
        ],
        turns: [
          turn(1, 1, 60, 441),
          turn(2, 1, 180, 441, { bust: true }),
          turn(3, 1, 100, 341),
        ],
        winnerSlot: null,
        winnerUserId: null,
      }),
    );
    const alex = card.players.find((p) => p.slot === 1);
    assert.ok(alex);
    assert.equal(alex.visits, 3);
    assert.equal(alex.scored, 160);
    assert.equal(alex.average, Math.round((160 / 3) * 10) / 10);
  });

  it("handles a match with no turns", () => {
    const card = buildDartsLockedScorecard(
      baseMatch({
        turns: [],
        winnerSlot: 1,
        winnerUserId: "u1",
      }),
    );
    assert.equal(card.visits.length, 0);
    assert.equal(card.players[0]?.checkoutScore, null);
    assert.equal(card.winnerLabel, "Alex");
  });
});

describe("formatDartsRemainingLine", () => {
  it("orders remainings low to high with en-dashes", () => {
    assert.equal(
      formatDartsRemainingLine([
        { slot: 2, remaining: 142 },
        { slot: 1, remaining: 0 },
        { slot: 3, remaining: 87 },
      ]),
      "0–87–142",
    );
  });

  it("returns an em dash when empty", () => {
    assert.equal(formatDartsRemainingLine([]), "—");
  });
});
