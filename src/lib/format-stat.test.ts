import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatStat } from "./format-stat.ts";

describe("formatStat", () => {
  it("shows exact grouped counts with no plus suffix", () => {
    assert.equal(formatStat(0), "0");
    assert.equal(formatStat(4), "4");
    assert.equal(formatStat(47), "47");
    assert.equal(formatStat(1200), "1,200");
  });

  it("treats non-finite and negative values as zero", () => {
    assert.equal(formatStat(-3), "0");
    assert.equal(formatStat(Number.NaN), "0");
    assert.equal(formatStat(Number.POSITIVE_INFINITY), "0");
  });

  it("floors fractional counts", () => {
    assert.equal(formatStat(12.9), "12");
  });
});
