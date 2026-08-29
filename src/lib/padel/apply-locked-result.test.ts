import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelPairing } from "../../types/padel-match.ts";
import { applyLockedPadelResult } from "./apply-locked-result.ts";
import { createInitialPadelMatch } from "./padelReducer.ts";
import { makeGuestPlayer } from "./recent-players.ts";

const pairings: PadelPairing = {
  teamA: [makeGuestPlayer("Alex"), makeGuestPlayer("Sam")],
  teamB: [makeGuestPlayer("Jordan"), makeGuestPlayer("Riley")],
};

function liveMatch() {
  const match = createInitialPadelMatch({
    id: "api-match-1",
    ruleset: "golden_point",
    venue: {
      id: "sanity-padel-1",
      slug: "padel-social-club",
      name: "Padel Social Club",
    },
    pairings,
    servingTeam: "B",
    startsAt: "2026-08-29T10:00:00.000Z",
    venueCmsId: "sanity-padel-1",
  });
  match.status = "live";
  match.version = 18;
  match.servingTeam = "B";
  match.game = {
    pointsA: 40,
    pointsB: 30,
    advantage: null,
    isTieBreak: false,
    tieBreakPointsA: 0,
    tieBreakPointsB: 0,
  };
  match.sets = [
    { gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" },
    { gamesA: 2, gamesB: 1, tieBreak: null, winner: null },
  ];
  match.currentSetIndex = 1;
  return match;
}

describe("applyLockedPadelResult", () => {
  it("keeps live game and serve; stamps only lock fields from the API snapshot", () => {
    const live = liveMatch();
    const parsedLock = createInitialPadelMatch({
      id: live.id,
      ruleset: live.ruleset,
      venue: null,
      pairings,
      servingTeam: "A",
    });
    parsedLock.status = "finalized";
    parsedLock.lockedAt = "2026-08-29T11:00:00.000Z";
    parsedLock.winner = "A";
    parsedLock.version = 1;
    parsedLock.sets = [
      { gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" },
      { gamesA: 2, gamesB: 1, tieBreak: null, winner: null },
    ];

    const next = applyLockedPadelResult(live, parsedLock);

    assert.equal(next.status, "finalized");
    assert.equal(next.lockedAt, "2026-08-29T11:00:00.000Z");
    assert.equal(next.winner, "A");
    assert.deepEqual(next.sets, parsedLock.sets);
    assert.equal(next.currentSetIndex, 1);
    assert.equal(next.version, 19);
    assert.equal(next.game.pointsA, 40);
    assert.equal(next.game.pointsB, 30);
    assert.equal(next.servingTeam, "B");
    assert.equal(next.venue?.name, "Padel Social Club");
    assert.equal(parsedLock.game.pointsA, 0);
    assert.equal(parsedLock.servingTeam, "A");
  });

  it("does not let a full spread of the parsed lock snapshot win", () => {
    const live = liveMatch();
    const parsedLock = createInitialPadelMatch({
      id: live.id,
      ruleset: live.ruleset,
      venue: null,
      pairings,
    });
    parsedLock.lockedAt = "2026-08-29T11:00:00.000Z";
    parsedLock.winner = "A";
    parsedLock.sets = live.sets;

    const spread = { ...live, ...parsedLock };
    assert.equal(spread.game.pointsA, 0);
    assert.equal(spread.servingTeam, "A");
    assert.equal(spread.venue, null);

    const merged = applyLockedPadelResult(live, parsedLock);
    assert.equal(merged.game.pointsA, 40);
    assert.equal(merged.servingTeam, "B");
    assert.equal(merged.venue?.name, "Padel Social Club");
  });

  it("keeps live sets when the API snapshot has none", () => {
    const live = liveMatch();
    const next = applyLockedPadelResult(live, {
      lockedAt: "2026-08-29T11:00:00.000Z",
      winner: "A",
      sets: [],
    });
    assert.deepEqual(next.sets, live.sets);
    assert.equal(next.winner, "A");
  });

  it("stamps lockedAt when the API snapshot omits it", () => {
    const live = liveMatch();
    const before = Date.now();
    const next = applyLockedPadelResult(live, {
      winner: "A",
      sets: live.sets,
    });
    assert.ok(next.lockedAt);
    assert.ok(Date.parse(next.lockedAt!) >= before);
    assert.equal(next.status, "finalized");
  });
});
