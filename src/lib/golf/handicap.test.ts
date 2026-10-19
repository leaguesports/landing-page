import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseGolfHandicapIndex } from "./handicap.ts";

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
