import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TEE_HANDICAP_INCOMPLETE_MESSAGE,
  golfCourseFieldNames,
  golfCourseType,
  golfHoleFieldNames,
  golfHoleType,
  golfTeeFieldNames,
  golfTeeType,
  isTeeCompleteForHandicap,
  teeHandicapCompleteness,
  teeSlopeRating,
} from "./golfCourse.ts";

describe("golfCourse Sanity schema", () => {
  it("is a defineType object named golfCourse", () => {
    assert.equal(golfCourseType.name, "golfCourse");
    assert.equal(golfCourseType.type, "object");
  });

  it("keeps existing course, tee, and hole fields", () => {
    for (const field of [
      "courseName",
      "holesTotal",
      "parTotal",
      "notes",
      "tees",
      "holes",
    ]) {
      assert.ok(
        golfCourseFieldNames().includes(field),
        `missing golfCourse field ${field}`,
      );
    }

    for (const field of ["name", "color", "courseRating", "slope", "totalMeters"]) {
      assert.ok(golfTeeFieldNames().includes(field), `missing tee field ${field}`);
    }

    for (const field of ["number", "par", "strokeIndex", "distances"]) {
      assert.ok(golfHoleFieldNames().includes(field), `missing hole field ${field}`);
    }
  });

  it("adds handicap tee fields without inventing gender", () => {
    const names = golfTeeFieldNames();
    assert.ok(names.includes("courseRating"));
    assert.ok(names.includes("slopeRating"));
    assert.ok(names.includes("par"));
    assert.equal(names.includes("gender"), false);
  });

  it("keeps hole strokeIndex constrained to 1–18", () => {
    const strokeIndex = golfHoleType.fields.find(
      (field) => field.name === "strokeIndex",
    ) as {
      validation?: (rule: {
        required: () => {
          min: (n: number) => { max: (n: number) => unknown };
        };
      }) => unknown;
    };
    assert.ok(strokeIndex);
    const calls: number[] = [];
    strokeIndex.validation?.({
      required: () => ({
        min: (n: number) => {
          calls.push(n);
          return {
            max: (n: number) => {
              calls.push(n);
              return {};
            },
          };
        },
      }),
    });
    assert.deepEqual(calls, [1, 18]);
  });

  it("warns when a tee is incomplete for handicap", () => {
    const result = (
      golfTeeType as {
        validation?: (rule: {
          custom: (fn: (value: unknown) => true | string) => {
            warning: () => string;
          };
        }) => unknown;
      }
    ).validation?.({
      custom: (fn) => ({
        warning: () => {
          const message = fn({ name: "White" });
          return typeof message === "string" ? message : "ok";
        },
      }),
    });
    assert.equal(result, TEE_HANDICAP_INCOMPLETE_MESSAGE);
  });
});

describe("tee handicap completeness", () => {
  it("treats a tee as complete when CR and slopeRating are set", () => {
    assert.equal(
      isTeeCompleteForHandicap({ courseRating: 71.2, slopeRating: 128 }),
      true,
    );
    assert.equal(
      teeHandicapCompleteness({ courseRating: 71.2, slopeRating: 128 }),
      true,
    );
  });

  it("accepts legacy slope when slopeRating is empty", () => {
    assert.equal(teeSlopeRating({ slope: 124 }), 124);
    assert.equal(
      isTeeCompleteForHandicap({ courseRating: 70.4, slope: 124 }),
      true,
    );
  });

  it("is incomplete when course rating or slope is null", () => {
    assert.equal(isTeeCompleteForHandicap({}), false);
    assert.equal(
      isTeeCompleteForHandicap({ courseRating: 71.2 }),
      false,
    );
    assert.equal(
      isTeeCompleteForHandicap({ slopeRating: 128 }),
      false,
    );
    assert.equal(
      teeHandicapCompleteness({ courseRating: null, slopeRating: null }),
      TEE_HANDICAP_INCOMPLETE_MESSAGE,
    );
    assert.equal(teeHandicapCompleteness(null), true);
  });

  it("prefers slopeRating over legacy slope", () => {
    assert.equal(teeSlopeRating({ slopeRating: 130, slope: 120 }), 130);
  });
});
