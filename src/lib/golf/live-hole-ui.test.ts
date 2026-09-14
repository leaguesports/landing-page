import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  GolfCourseHole,
  GolfLiveStrokes,
  GolfPlayer,
} from "../../types/golf-round.ts";
import {
  GOLF_SCORE_STEPPER_HIT_PX,
  apiNetStrokesForHole,
  applyStrokeDelta,
  formatHoleProgress,
  formatLiveHoleMeta,
  formatThisHoleNetLine,
  holeStrokeValue,
  liveHoleNet,
  seedHoleStrokesIfEmpty,
} from "./live-hole-ui.ts";

const holes: GolfCourseHole[] = [
  { number: 9, par: 5, strokeIndex: 15 },
  { number: 10, par: 4, strokeIndex: 1 },
  { number: 11, par: 3, strokeIndex: 2 },
];

const players: GolfPlayer[] = [
  { slot: 1, displayName: "Alex", isGuest: true, userId: null },
  { slot: 2, displayName: "Sam", isGuest: true, userId: null },
];

describe("live hole header copy", () => {
  it("formats a compact Hole · Par · SI line", () => {
    assert.equal(
      formatLiveHoleMeta({ number: 9, par: 5, strokeIndex: 15 }),
      "Hole 9 · Par 5 · SI 15",
    );
  });

  it("formats quiet Hole N of M progress", () => {
    assert.equal(formatHoleProgress(0, 9), "Hole 1 of 9");
    assert.equal(formatHoleProgress(8, 9), "Hole 9 of 9");
  });
});

describe("this-hole net line", () => {
  it("shows to-par when net is unknown", () => {
    assert.equal(
      formatThisHoleNetLine({ net: null, toParLabel: "+1" }),
      "+1 this hole",
    );
  });

  it("puts net first when present", () => {
    assert.equal(
      formatThisHoleNetLine({ net: 5, toParLabel: "+1" }),
      "Net 5 · +1",
    );
  });
});

describe("discrete stroke stepper", () => {
  it("requires +/- hit targets of at least 44px", () => {
    assert.ok(GOLF_SCORE_STEPPER_HIT_PX >= 44);
  });

  it("steps by 1 and clamps 1–15 without parsing free text", () => {
    assert.equal(applyStrokeDelta(4, 1), 5);
    assert.equal(applyStrokeDelta(4, -1), 3);
    assert.equal(applyStrokeDelta(1, -1), 1);
    assert.equal(applyStrokeDelta(15, 1), 15);
    assert.equal(applyStrokeDelta(4, 0), 4);
  });

  it("defaults missing strokes to par (often 4) and keeps entered scores", () => {
    assert.equal(holeStrokeValue({}, 9, 1, 4), 4);
    assert.equal(holeStrokeValue({ 9: { "1": 6 } }, 9, 1, 4), 6);
  });

  it("seeds an empty hole to par and does not overwrite an in-progress hole", () => {
    const seeded = seedHoleStrokesIfEmpty({}, { number: 9, par: 4 }, players);
    assert.deepEqual(seeded[9], { "1": 4, "2": 4 });

    const existing: GolfLiveStrokes = { 9: { "1": 6 } };
    assert.equal(
      seedHoleStrokesIfEmpty(existing, { number: 9, par: 4 }, players),
      existing,
    );
  });
});

describe("live hole net display", () => {
  it("reads API netStrokes instead of inventing a 9-hole total", () => {
    assert.equal(
      apiNetStrokesForHole(
        {
          holes: [
            { number: 9, strokes: { "1": 6 }, netStrokes: { "1": 5 } },
          ],
        },
        9,
        1,
      ),
      5,
    );
    assert.equal(apiNetStrokesForHole(null, 9, 1), null);
  });

  it("prefers API netStrokes over SI allocation", () => {
    assert.deepEqual(
      liveHoleNet({
        gross: 6,
        playingHandicap: 2,
        holeNumber: 10,
        holes,
        apiNetStrokes: 3,
      }),
      { net: 3, strokesReceived: 3 },
    );
  });

  it("uses SI on the holes being played when the API has no hole net yet", () => {
    assert.deepEqual(
      liveHoleNet({
        gross: 6,
        playingHandicap: 2,
        holeNumber: 10,
        holes,
      }),
      { net: 5, strokesReceived: 1 },
    );
  });
});
