import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildStartOrganisedGolfOverrides,
  formatHoleRangeLabel,
  holeOrder,
  isGolfStartReady,
  isValidTeeName,
  teeOptionsFromGolfCourse,
} from "./pre-round.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";

/** Compact Kyalami Country Club fixture from published CMS golfCourse. */
function kyalamiCourse(): GolfCourseCms {
  return {
    courseName: "Kyalami Country Club",
    holesTotal: 18,
    parTotal: 72,
    tees: [
      { name: "Yellow", color: "Yellow", totalMeters: 6630 },
      { name: "White", color: "White", totalMeters: 6370 },
      { name: "Blue", color: "Blue", totalMeters: 5729 },
      { name: "Red", color: "Red", totalMeters: 5244 },
    ],
    holes: [],
  };
}

describe("teeOptionsFromGolfCourse", () => {
  it("derives unique tee names from a golfCourse (Kyalami)", () => {
    assert.deepEqual(
      teeOptionsFromGolfCourse(kyalamiCourse()).map((tee) => tee.name),
      ["Yellow", "White", "Blue", "Red"],
    );
  });

  it("skips blank names and duplicate tee names", () => {
    const options = teeOptionsFromGolfCourse({
      tees: [
        { name: "  White  ", color: "White" },
        { name: "", color: "Blue" },
        { name: "white", color: "White" },
        { name: "Club" },
      ],
    });
    assert.deepEqual(
      options.map((tee) => tee.name),
      ["White", "Club"],
    );
  });

  it("returns empty when the venue has no course tees (free-text fallback)", () => {
    assert.deepEqual(teeOptionsFromGolfCourse(null), []);
    assert.deepEqual(teeOptionsFromGolfCourse({ tees: [] }), []);
    assert.deepEqual(teeOptionsFromGolfCourse({ tees: [{ name: "   " }] }), []);
  });
});

describe("isGolfStartReady / isValidTeeName", () => {
  it("disables Start until a 1–40 character tee is set", () => {
    assert.equal(
      isGolfStartReady({ teeName: "", startingHole: 1, holesPlayed: 18 }),
      false,
    );
    assert.equal(
      isGolfStartReady({ teeName: "   ", startingHole: 1, holesPlayed: 18 }),
      false,
    );
    assert.equal(
      isGolfStartReady({
        teeName: null,
        startingHole: 1,
        holesPlayed: 18,
      }),
      false,
    );
    assert.equal(
      isValidTeeName("x".repeat(41)),
      false,
    );
    assert.equal(
      isGolfStartReady({
        teeName: "White",
        startingHole: 1,
        holesPlayed: 18,
      }),
      true,
    );
  });

  it("also requires a valid starting hole and 9/18 holes played", () => {
    assert.equal(
      isGolfStartReady({
        teeName: "White",
        startingHole: 0,
        holesPlayed: 18,
      }),
      false,
    );
    assert.equal(
      isGolfStartReady({
        teeName: "White",
        startingHole: 1,
        holesPlayed: 12,
      }),
      false,
    );
    assert.equal(
      isGolfStartReady({
        teeName: "Yellow",
        startingHole: 10,
        holesPlayed: 9,
      }),
      true,
    );
  });
});

describe("holeOrder", () => {
  it("plays holes 10–18 when holesPlayed is 9 starting at 10", () => {
    assert.deepEqual(holeOrder(9, 10), [10, 11, 12, 13, 14, 15, 16, 17, 18]);
    assert.equal(formatHoleRangeLabel(9, 10), "Play holes 10–18");
  });

  it("plays the front 9 from hole 1 and wraps 18-hole shotgun starts", () => {
    assert.deepEqual(holeOrder(9, 1), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepEqual(holeOrder(18, 10), [
      10, 11, 12, 13, 14, 15, 16, 17, 18, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    assert.equal(
      formatHoleRangeLabel(18, 10),
      "Play holes 10–18, then 1–9",
    );
  });
});

describe("buildStartOrganisedGolfOverrides", () => {
  it("builds teeName / startingHole / holesPlayed for organise start", () => {
    const built = buildStartOrganisedGolfOverrides({
      teeName: "  Blue  ",
      startingHole: 10,
      holesPlayed: 9,
    });
    assert.equal(built.ok, true);
    if (!built.ok) return;
    assert.deepEqual(built.overrides, {
      teeName: "Blue",
      startingHole: 10,
      holesPlayed: 9,
    });
  });

  it("rejects a missing tee", () => {
    const built = buildStartOrganisedGolfOverrides({
      teeName: "",
      startingHole: 1,
      holesPlayed: 18,
    });
    assert.equal(built.ok, false);
    if (built.ok) return;
    assert.match(built.error, /tee/i);
  });
});
