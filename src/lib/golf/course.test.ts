import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  courseParTotal,
  hasPlayableGolfCourse,
  selectHoles,
  toCourseSnapshot,
} from "./course.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";

function sampleCourse(overrides?: Partial<GolfCourseCms>): GolfCourseCms {
  const holes = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: ([4, 5, 3, 4, 4, 3, 4, 5, 4, 4, 4, 4, 5, 3, 5, 4, 3, 4] as const)[i],
    strokeIndex: i + 1,
  }));
  return {
    courseName: "Test Links",
    holesTotal: 18,
    parTotal: 72,
    tees: [{ name: "Club", color: "White" }],
    holes,
    ...overrides,
  };
}

describe("hasPlayableGolfCourse", () => {
  it("requires at least 9 playable holes", () => {
    assert.equal(hasPlayableGolfCourse(null), false);
    assert.equal(hasPlayableGolfCourse({ holes: [] }), false);
    assert.equal(
      hasPlayableGolfCourse({
        holes: Array.from({ length: 8 }, (_, i) => ({
          number: i + 1,
          par: 4,
          strokeIndex: i + 1,
        })),
      }),
      false,
    );
    assert.equal(hasPlayableGolfCourse(sampleCourse()), true);
  });

  it("rejects holes missing par or stroke index", () => {
    assert.equal(
      hasPlayableGolfCourse({
        holes: Array.from({ length: 9 }, (_, i) => ({
          number: i + 1,
          par: 4,
          strokeIndex: undefined as unknown as number,
        })),
      }),
      false,
    );
  });
});

describe("selectHoles", () => {
  const course = sampleCourse();

  it("selects 18 consecutive holes from 1", () => {
    const holes = selectHoles(course, 18, 1);
    assert.equal(holes.length, 18);
    assert.deepEqual(
      holes.map((h) => h.number),
      Array.from({ length: 18 }, (_, i) => i + 1),
    );
  });

  it("selects front 9 and back 9", () => {
    const front = selectHoles(course, 9, 1);
    const back = selectHoles(course, 9, 10);
    assert.deepEqual(
      front.map((h) => h.number),
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
    assert.deepEqual(
      back.map((h) => h.number),
      [10, 11, 12, 13, 14, 15, 16, 17, 18],
    );
  });

  it("returns empty when a required hole is missing", () => {
    const incomplete = sampleCourse({
      holes: sampleCourse().holes?.filter((h) => h.number !== 12) ?? [],
    });
    assert.deepEqual(selectHoles(incomplete, 9, 10), []);
    assert.deepEqual(selectHoles(incomplete, 18, 1), []);
  });
});

describe("toCourseSnapshot / courseParTotal", () => {
  it("builds an API snapshot for the selected layout", () => {
    const course = sampleCourse();
    const snapshot = toCourseSnapshot(course, 9, 10);
    assert.ok(snapshot);
    assert.equal(snapshot?.name, "Test Links");
    assert.equal(snapshot?.holes.length, 9);
    assert.equal(snapshot?.holes[0]?.number, 10);
    assert.equal(courseParTotal(snapshot!.holes), 36);
  });

  it("returns null when the layout cannot be filled", () => {
    assert.equal(
      toCourseSnapshot({ holes: sampleCourse().holes?.slice(0, 5) }, 9, 1),
      null,
    );
  });

  it("attaches tee meters when distances match the selected tee", () => {
    const course = sampleCourse({
      holes: Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: 4,
        strokeIndex: i + 1,
        distances: [
          { teeName: "Club", meters: 350 + i },
          { teeName: "Champ", meters: 390 + i },
        ],
      })),
    });
    const snapshot = toCourseSnapshot(course, 9, 1, "Champ");
    assert.equal(snapshot?.holes[0]?.meters, 390);
    assert.equal(snapshot?.holes[8]?.meters, 398);
  });
});
