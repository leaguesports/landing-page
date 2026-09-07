import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelMatch } from "../../types/padel-match.ts";
import { createInitialPadelMatch } from "./padelReducer.ts";
import {
  buildPadelLockedScorecard,
  playedPadelSets,
} from "./locked-scorecard.ts";

function player(name: string) {
  return { id: name.toLowerCase(), displayName: name, isGuest: true };
}

function lockedMatch(
  overrides: Partial<PadelMatch> = {},
): PadelMatch {
  const base = createInitialPadelMatch({
    id: "match-1",
    ruleset: "golden_point",
    venue: {
      id: "v1",
      slug: "green-point",
      name: "Green Point",
    },
    pairings: {
      teamA: [player("Alex"), player("Sam")],
      teamB: [player("Jordan"), player("Riley")],
    },
  });
  return { ...base, ...overrides };
}

describe("playedPadelSets", () => {
  it("drops unused trailing sets", () => {
    const played = playedPadelSets([
      { gamesA: 6, gamesB: 4, winner: "A" },
      { gamesA: 0, gamesB: 0, winner: null, tieBreak: null },
    ]);
    assert.equal(played.length, 1);
    assert.equal(played[0]?.gamesA, 6);
  });

  it("keeps a 0-0 set that already has a winner", () => {
    const played = playedPadelSets([
      { gamesA: 0, gamesB: 0, winner: "B" },
    ]);
    assert.equal(played.length, 1);
  });
});

describe("buildPadelLockedScorecard", () => {
  it("builds set columns, tie-break points, and the match winner", () => {
    const match = lockedMatch({
      winner: "A",
      sets: [
        { gamesA: 6, gamesB: 4, winner: "A" },
        {
          gamesA: 7,
          gamesB: 6,
          winner: "A",
          tieBreak: { pointsA: 7, pointsB: 5 },
        },
        { gamesA: 0, gamesB: 0, winner: null },
      ],
    });
    const card = buildPadelLockedScorecard(match);
    assert.deepEqual(card.setLabels, ["1", "2"]);
    assert.equal(card.teamA.label, "Alex / Sam");
    assert.equal(card.teamB.label, "Jordan / Riley");
    assert.equal(card.teamA.cells[1]?.display, "7");
    assert.equal(card.teamA.cells[1]?.tieBreakPoints, 7);
    assert.equal(card.teamB.cells[1]?.tieBreakPoints, 5);
    assert.equal(card.teamA.cells[0]?.won, true);
    assert.equal(card.teamA.setsWon, 2);
    assert.equal(card.teamB.setsWon, 0);
    assert.equal(card.winner, "A");
    assert.equal(card.winnerLabel, "Alex / Sam");
    assert.equal(card.teamA.isWinner, true);
    assert.equal(card.teamB.isWinner, false);
  });

  it("infers the winner from set winners when match.winner is missing", () => {
    const match = lockedMatch({
      winner: null,
      sets: [
        { gamesA: 4, gamesB: 6, winner: "B" },
        { gamesA: 3, gamesB: 6, winner: "B" },
      ],
    });
    const card = buildPadelLockedScorecard(match);
    assert.equal(card.winner, "B");
    assert.equal(card.teamB.isWinner, true);
    assert.equal(card.teamB.setsWon, 2);
  });
});
