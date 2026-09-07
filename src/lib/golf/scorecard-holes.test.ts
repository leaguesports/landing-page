import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toScorecardHoles } from "./scorecard-holes.ts";
import type {
  GolfCourseCms,
  GolfCourseHole,
} from "../../types/golf-round.ts";

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
    holes: [
      {
        number: 1,
        par: 4,
        strokeIndex: 9,
        distances: [
          { teeName: "Yellow", meters: 343 },
          { teeName: "White", meters: 338 },
          { teeName: "Blue", meters: 310 },
          { teeName: "Red", meters: 281 },
        ],
      },
      {
        number: 2,
        par: 4,
        strokeIndex: 3,
        distances: [
          { teeName: "Yellow", meters: 404 },
          { teeName: "White", meters: 402 },
          { teeName: "Blue", meters: 369 },
          { teeName: "Red", meters: 302 },
        ],
      },
      {
        number: 10,
        par: 4,
        strokeIndex: 6,
        distances: [
          { teeName: "Yellow", meters: 378 },
          { teeName: "White", meters: 367 },
          { teeName: "Blue", meters: 341 },
          { teeName: "Red", meters: 337 },
        ],
      },
    ],
  };
}

const snapshotHoles: GolfCourseHole[] = [
  { number: 1, par: 4, strokeIndex: 7 },
  { number: 2, par: 5, strokeIndex: 13 },
  { number: 10, par: 4, strokeIndex: 2 },
];

describe("toScorecardHoles", () => {
  it("keeps snapshot par/SI and omits tees when golfCourse is missing", () => {
    const holes = toScorecardHoles(snapshotHoles, null, "White");
    assert.deepEqual(
      holes.map((hole) => ({
        number: hole.number,
        par: hole.par,
        strokeIndex: hole.strokeIndex,
        tees: hole.tees,
      })),
      snapshotHoles.map((hole) => ({ ...hole, tees: [] })),
    );
  });

  it("keeps the current hole list when golfCourse has no holes", () => {
    const holes = toScorecardHoles(snapshotHoles, { holes: [] }, "Yellow");
    assert.equal(holes.length, 3);
    assert.equal(holes[0]?.par, 4);
    assert.equal(holes[0]?.strokeIndex, 7);
    assert.deepEqual(holes[0]?.tees, []);
  });

  it("overlays CMS par, SI, and tee distances for Kyalami hole 1", () => {
    const [hole] = toScorecardHoles(
      [{ number: 1, par: 4, strokeIndex: 7 }],
      kyalamiCourse(),
      "White",
    );
    assert.equal(hole?.number, 1);
    assert.equal(hole?.par, 4);
    assert.equal(hole?.strokeIndex, 9);
    assert.deepEqual(
      hole?.tees.map((tee) => tee.teeName),
      ["Yellow", "White", "Blue", "Red"],
    );
    assert.deepEqual(
      hole?.tees.map((tee) => tee.meters),
      [343, 338, 310, 281],
    );
    assert.deepEqual(
      hole?.tees.map((tee) => tee.selected),
      [false, true, false, false],
    );
  });

  it("highlights the selected tee by colour when names differ in case", () => {
    const [hole] = toScorecardHoles(
      [{ number: 1, par: 4, strokeIndex: 9 }],
      kyalamiCourse(),
      "yellow",
    );
    const selected = hole?.tees.filter((tee) => tee.selected) ?? [];
    assert.equal(selected.length, 1);
    assert.equal(selected[0]?.teeName, "Yellow");
    assert.equal(selected[0]?.meters, 343);
  });

  it("still lists other tees compactly when one is selected", () => {
    const [hole] = toScorecardHoles(
      [{ number: 2, par: 4, strokeIndex: 3 }],
      kyalamiCourse(),
      "Blue",
    );
    assert.equal(hole?.tees.length, 4);
    assert.equal(hole?.tees.find((tee) => tee.selected)?.teeName, "Blue");
    assert.equal(hole?.tees.find((tee) => tee.teeName === "Red")?.meters, 302);
  });

  it("maps legacy null teeName without breaking (no selected tee)", () => {
    const [hole] = toScorecardHoles(
      [{ number: 1, par: 4, strokeIndex: 9 }],
      kyalamiCourse(),
      null,
    );
    assert.equal(hole?.tees.every((tee) => tee.selected === false), true);
  });

  it("skips invalid distances and leaves snapshot par when CMS hole is absent", () => {
    const holes = toScorecardHoles(
      [
        { number: 1, par: 4, strokeIndex: 7 },
        { number: 18, par: 5, strokeIndex: 14 },
      ],
      {
        holes: [
          {
            number: 1,
            par: 4,
            strokeIndex: 9,
            distances: [
              { teeName: "White", meters: 338 },
              { teeName: "Ghost", meters: 0 },
              { teeName: "  ", meters: 200 },
            ],
          },
        ],
      },
      "White",
    );
    assert.deepEqual(
      holes[0]?.tees.map((tee) => ({
        teeName: tee.teeName,
        meters: tee.meters,
        selected: tee.selected,
      })),
      [{ teeName: "White", meters: 338, selected: true }],
    );
    assert.equal(holes[1]?.number, 18);
    assert.equal(holes[1]?.par, 5);
    assert.equal(holes[1]?.strokeIndex, 14);
    assert.deepEqual(holes[1]?.tees, []);
  });

  it("maps only the holes in the round layout (e.g. back 9 start)", () => {
    const holes = toScorecardHoles(
      [{ number: 10, par: 4, strokeIndex: 2 }],
      kyalamiCourse(),
      "Red",
    );
    assert.equal(holes.length, 1);
    assert.equal(holes[0]?.number, 10);
    assert.equal(holes[0]?.strokeIndex, 6);
    assert.equal(holes[0]?.tees.find((tee) => tee.selected)?.meters, 337);
  });
});
