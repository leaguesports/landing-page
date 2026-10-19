import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasPlayableGolfCourse } from "./course.ts";
import type { GolfCourseCms } from "../../types/golf-course.ts";

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
});
