import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allHolesScored,
  buildLockPayload,
  clampStrokes,
  formatToPar,
  playerGross,
  playerToPar,
  runningTotals,
  strokesFromScore,
} from "./scoring.ts";
import type {
  GolfCourseHole,
  GolfLiveStrokes,
  GolfPlayer,
} from "../../types/golf-round.ts";

const holes: GolfCourseHole[] = [
  { number: 1, par: 4, strokeIndex: 7 },
  { number: 2, par: 5, strokeIndex: 13 },
  { number: 3, par: 3, strokeIndex: 9 },
];

const players: GolfPlayer[] = [
  { slot: 1, displayName: "Alex", isGuest: true, userId: null },
  { slot: 2, displayName: "Sam", isGuest: true, userId: null },
];

describe("formatToPar / clampStrokes", () => {
  it("formats even / over / under", () => {
    assert.equal(formatToPar(0), "E");
    assert.equal(formatToPar(2), "+2");
    assert.equal(formatToPar(-1), "-1");
  });

  it("clamps strokes to 1–15", () => {
    assert.equal(clampStrokes(0), 1);
    assert.equal(clampStrokes(16), 15);
    assert.equal(clampStrokes(4.6), 5);
  });
});

describe("gross / toPar / running totals", () => {
  const strokes: GolfLiveStrokes = {
    1: { "1": 4, "2": 5 },
    2: { "1": 6, "2": 5 },
    3: { "1": 2, "2": 3 },
  };

  it("sums gross and to-par per player", () => {
    assert.equal(playerGross(strokes, 1), 12);
    assert.equal(playerGross(strokes, 2), 13);
    assert.equal(playerToPar(strokes, 1, holes), 0);
    assert.equal(playerToPar(strokes, 2, holes), 1);
  });

  it("builds running totals with holes scored", () => {
    const totals = runningTotals(players, strokes, holes);
    assert.equal(totals[0]?.gross, 12);
    assert.equal(totals[0]?.toPar, 0);
    assert.equal(totals[0]?.holesScored, 3);
    assert.equal(totals[1]?.toPar, 1);
  });
});

describe("allHolesScored / buildLockPayload", () => {
  it("requires every player on every hole", () => {
    const partial: GolfLiveStrokes = {
      1: { "1": 4, "2": 5 },
      2: { "1": 5 },
    };
    assert.equal(allHolesScored(players, partial, holes), false);

    const complete: GolfLiveStrokes = {
      1: { "1": 4, "2": 5 },
      2: { "1": 5, "2": 6 },
      3: { "1": 3, "2": 3 },
    };
    assert.equal(allHolesScored(players, complete, holes), true);

    const payload = buildLockPayload(players, complete, holes);
    assert.ok(payload);
    assert.equal(payload?.score.holes.length, 3);
    assert.deepEqual(payload?.score.holes[0], {
      number: 1,
      strokes: { "1": 4, "2": 5 },
    });
  });

  it("returns null when incomplete", () => {
    assert.equal(buildLockPayload(players, {}, holes), null);
  });
});

describe("strokesFromScore", () => {
  it("maps API score holes into the live stroke map", () => {
    const strokes = strokesFromScore({
      holes: [
        { number: 1, strokes: { "1": 4 } },
        { number: 2, strokes: { "1": 5 } },
      ],
    });
    assert.deepEqual(strokes[1], { "1": 4 });
    assert.deepEqual(strokes[2], { "1": 5 });
  });
});
