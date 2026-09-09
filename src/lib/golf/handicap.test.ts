import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GolfCourseCms, GolfPlayer } from "../../types/golf-round.ts";
import {
  GOLF_HANDICAP_UI_DISCLAIMER,
  cmsTeeOptions,
  golfGrossOnlyBanner,
  golfGrossOnlyReasons,
  parseGolfHandicapIndex,
  resolveHoleNet,
  roundGrossOnlyBanner,
  selectedCmsTee,
  strokesReceivedOnHole,
  teeRatingsAreComplete,
  teeRatingsFromCms,
  toGolfTeeRatingsPayload,
} from "./handicap.ts";

describe("parseGolfHandicapIndex", () => {
  it("accepts null / blank as a clear", () => {
    assert.deepEqual(parseGolfHandicapIndex(null), { ok: true, value: null });
    assert.deepEqual(parseGolfHandicapIndex(undefined), {
      ok: true,
      value: null,
    });
    assert.deepEqual(parseGolfHandicapIndex(""), { ok: true, value: null });
    assert.deepEqual(parseGolfHandicapIndex("  "), { ok: true, value: null });
  });

  it("accepts −10.0…54.0 at 1 decimal", () => {
    assert.deepEqual(parseGolfHandicapIndex(-10), { ok: true, value: -10 });
    assert.deepEqual(parseGolfHandicapIndex(54), { ok: true, value: 54 });
    assert.deepEqual(parseGolfHandicapIndex(12.4), { ok: true, value: 12.4 });
    assert.deepEqual(parseGolfHandicapIndex("12.4"), { ok: true, value: 12.4 });
    assert.deepEqual(parseGolfHandicapIndex("0"), { ok: true, value: 0 });
    assert.deepEqual(parseGolfHandicapIndex("-2.5"), { ok: true, value: -2.5 });
  });

  it("rejects more than 1 decimal and out-of-range values", () => {
    assert.equal(parseGolfHandicapIndex("12.44").ok, false);
    assert.equal(parseGolfHandicapIndex(54.1).ok, false);
    assert.equal(parseGolfHandicapIndex(-10.1).ok, false);
    assert.equal(parseGolfHandicapIndex("x").ok, false);
    assert.equal(parseGolfHandicapIndex(Number.NaN).ok, false);
  });
});

describe("toGolfTeeRatingsPayload", () => {
  it("prefers a nested tee object and mirrors top-level fields", () => {
    assert.deepEqual(
      toGolfTeeRatingsPayload({
        teeId: "tee-white",
        courseRating: 71.2,
        slopeRating: 129,
        teePar: 72,
      }),
      {
        tee: {
          id: "tee-white",
          courseRating: 71.2,
          slopeRating: 129,
          par: 72,
        },
        courseRating: 71.2,
        slopeRating: 129,
        teePar: 72,
      },
    );
  });

  it("omits invalid or missing ratings instead of inventing them", () => {
    assert.deepEqual(
      toGolfTeeRatingsPayload({
        courseRating: 12,
        slopeRating: 200,
        teePar: null,
      }),
      { tee: {} },
    );
    assert.deepEqual(toGolfTeeRatingsPayload(null), { tee: {} });
  });
});

describe("tee ratings from CMS", () => {
  const course: GolfCourseCms = {
    courseName: "Kyalami",
    parTotal: 72,
    tees: [
      {
        name: "White",
        color: "White",
        courseRating: 71.2,
        slopeRating: 129,
        par: 72,
      },
      { name: "Red", color: "Red" },
    ],
  };

  it("maps complete White ratings and leaves Red incomplete", () => {
    const white = selectedCmsTee(course, "White");
    assert.equal(white?.courseRating, 71.2);
    assert.equal(white?.slopeRating, 129);
    assert.equal(teeRatingsAreComplete(teeRatingsFromCms(course, "White")), true);
    assert.equal(teeRatingsAreComplete(teeRatingsFromCms(course, "Red")), false);
    assert.equal(cmsTeeOptions(course).length, 2);
  });
});

describe("gross-only banners", () => {
  it("is honest when CR, slope, or HI is missing", () => {
    assert.match(
      golfGrossOnlyBanner(
        golfGrossOnlyReasons({
          handicapIndex: 12.4,
          ratings: { courseRating: null, slopeRating: null, teePar: 72 },
        }),
      ) ?? "",
      /no course or slope rating/i,
    );
    assert.match(
      golfGrossOnlyBanner(
        golfGrossOnlyReasons({
          handicapIndex: null,
          ratings: {
            courseRating: 71.2,
            slopeRating: 129,
            teePar: 72,
          },
        }),
      ) ?? "",
      /No handicap index/i,
    );
    assert.match(
      golfGrossOnlyBanner(golfGrossOnlyReasons({ isGuest: true })) ?? "",
      /Guests play gross-only/i,
    );
  });

  it("stays silent when a playing handicap is already snapshotted", () => {
    const players: GolfPlayer[] = [
      {
        slot: 1,
        displayName: "Alex",
        isGuest: false,
        userId: "u1",
        playingHandicap: 11,
        courseHandicap: 11,
        handicapIndexUsed: 10.4,
      },
    ];
    assert.equal(
      roundGrossOnlyBanner({
        players,
        ratings: { courseRating: 71.2, slopeRating: 129, teePar: 72 },
      }),
      null,
    );
  });

  it("keeps the WHS-style UI disclaimer copy", () => {
    assert.equal(
      GOLF_HANDICAP_UI_DISCLAIMER,
      "Estimated course handicap (WHS-style)",
    );
  });
});

describe("net display when PH + SI are present", () => {
  const holes = [
    { number: 1, par: 4, strokeIndex: 1 },
    { number: 2, par: 4, strokeIndex: 2 },
    { number: 3, par: 3, strokeIndex: 3 },
  ];

  it("allocates strokes to the hardest SI and returns hole net", () => {
    assert.equal(strokesReceivedOnHole(2, holes, 1), 1);
    assert.equal(strokesReceivedOnHole(2, holes, 2), 1);
    assert.equal(strokesReceivedOnHole(2, holes, 3), 0);
    assert.deepEqual(
      resolveHoleNet({
        gross: 5,
        playingHandicap: 2,
        holeNumber: 1,
        holes,
      }),
      { net: 4, strokesReceived: 1 },
    );
  });

  it("prefers API netStrokes over display allocation", () => {
    assert.deepEqual(
      resolveHoleNet({
        gross: 5,
        playingHandicap: 2,
        holeNumber: 1,
        holes,
        apiNetStrokes: 3,
      }),
      { net: 3, strokesReceived: 2 },
    );
  });

  it("hides per-hole net when stroke indexes are missing", () => {
    const noSi = [
      { number: 1, par: 4, strokeIndex: 0 },
      { number: 2, par: 4, strokeIndex: 0 },
    ];
    assert.deepEqual(
      resolveHoleNet({
        gross: 5,
        playingHandicap: 8,
        holeNumber: 1,
        holes: noSi,
      }),
      { net: null, strokesReceived: 0 },
    );
  });
});
