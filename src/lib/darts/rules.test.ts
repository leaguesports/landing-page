import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DARTS_BOGEY_SCORES,
  evaluateVisit,
  isBustVisit,
  isPlausibleDoubleOutFinish,
  isValidTurnScore,
  replayTurns,
  shouldOfferCheckout,
  toTurnPayload,
} from "./rules.ts";

describe("isValidTurnScore", () => {
  it("accepts integers 0–180", () => {
    assert.equal(isValidTurnScore(0), true);
    assert.equal(isValidTurnScore(60), true);
    assert.equal(isValidTurnScore(180), true);
    assert.equal(isValidTurnScore(181), false);
    assert.equal(isValidTurnScore(-1), false);
    assert.equal(isValidTurnScore(40.5), false);
    assert.equal(isValidTurnScore("60"), false);
  });
});

describe("isPlausibleDoubleOutFinish", () => {
  it("allows legal 3-dart checkouts and rejects bogeys", () => {
    assert.equal(isPlausibleDoubleOutFinish(2), true);
    assert.equal(isPlausibleDoubleOutFinish(40), true);
    assert.equal(isPlausibleDoubleOutFinish(50), true);
    assert.equal(isPlausibleDoubleOutFinish(170), true);
    assert.equal(isPlausibleDoubleOutFinish(1), false);
    assert.equal(isPlausibleDoubleOutFinish(171), false);
    for (const bogey of DARTS_BOGEY_SCORES) {
      assert.equal(isPlausibleDoubleOutFinish(bogey), false, String(bogey));
    }
  });
});

describe("evaluateVisit", () => {
  it("busts when the score exceeds remaining", () => {
    const visit = evaluateVisit(40, 60);
    assert.equal(visit.kind, "bust");
    assert.equal(visit.bust, true);
    assert.equal(visit.remainingAfter, 40);
    assert.equal(isBustVisit(40, 60), true);
  });

  it("busts when the visit would leave 1", () => {
    const visit = evaluateVisit(41, 40);
    assert.equal(visit.kind, "bust");
    assert.equal(visit.remainingAfter, 41);
    assert.match(visit.message ?? "", /leave 1/);
  });

  it("requires checkout on a legal double-out finish", () => {
    const visit = evaluateVisit(40, 40);
    assert.equal(visit.kind, "finish");
    assert.equal(visit.checkout, true);
    assert.equal(visit.remainingAfter, 0);
    assert.equal(shouldOfferCheckout(40, 40), true);
    assert.equal(shouldOfferCheckout(40, 20), false);
  });

  it("rejects finishing on a bogey remaining", () => {
    const visit = evaluateVisit(159, 159);
    assert.equal(visit.kind, "illegal_finish");
    assert.equal(visit.checkout, false);
    assert.equal(shouldOfferCheckout(159, 159), false);
  });

  it("leaves remaining on a scoring visit", () => {
    const visit = evaluateVisit(501, 60);
    assert.equal(visit.kind, "leave");
    assert.equal(visit.remainingAfter, 441);
    assert.equal(visit.bust, false);
  });
});

describe("toTurnPayload", () => {
  it("sends checkout only on a finishing visit when remaining is known", () => {
    assert.deepEqual(toTurnPayload({ playerSlot: 1, score: 60 }, 501), {
      playerSlot: 1,
      score: 60,
    });
    assert.deepEqual(
      toTurnPayload({ playerSlot: 2, score: 40, checkout: true }, 40),
      { playerSlot: 2, score: 40, checkout: true },
    );
  });

  it("rejects checkout on a non-finishing visit", () => {
    assert.throws(
      () => toTurnPayload({ playerSlot: 1, score: 60, checkout: true }, 501),
      /checkout can only/,
    );
  });

  it("requires checkout:true to finish on 0", () => {
    assert.throws(
      () => toTurnPayload({ playerSlot: 1, score: 40 }, 40),
      /checkout must be true/,
    );
  });
});

describe("replayTurns", () => {
  it("replays busts and a finishing checkout", () => {
    const replay = replayTurns(
      [{ slot: 1 }, { slot: 2 }],
      [
        { playerSlot: 1, score: 180 },
        { playerSlot: 1, score: 180 },
        { playerSlot: 1, score: 180 },
        { playerSlot: 2, score: 180 },
        { playerSlot: 2, score: 180 },
        { playerSlot: 2, score: 141, checkout: true },
      ],
    );
    assert.equal(replay.ok, true);
    if (!replay.ok) return;
    assert.equal(replay.state.remaining[1], 141);
    assert.equal(replay.state.remaining[2], 0);
    assert.equal(replay.state.winnerSlot, 2);
    assert.equal(replay.state.busts, 1);
  });

  it("fails when the log never checks out", () => {
    const replay = replayTurns(
      [{ slot: 1 }, { slot: 2 }],
      [{ playerSlot: 1, score: 60 }],
    );
    assert.equal(replay.ok, true);
    if (!replay.ok) return;
    assert.equal(replay.state.winnerSlot, null);
  });
});
