import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildHoleLayout } from "./hole-layout.ts";

describe("buildHoleLayout", () => {
  it("is deterministic for the same hole inputs", () => {
    const a = buildHoleLayout(7, 4, 3);
    const b = buildHoleLayout(7, 4, 3);
    assert.equal(a.shape, b.shape);
    assert.equal(a.centerline, b.centerline);
    assert.equal(a.bunkers.length, b.bunkers.length);
    assert.deepEqual(a.green, b.green);
    assert.deepEqual(a.flag, b.flag);
  });

  it("varies across different holes", () => {
    const a = buildHoleLayout(1, 4, 1);
    const b = buildHoleLayout(18, 5, 18);
    assert.notEqual(a.centerline, b.centerline);
  });

  it("returns a labeled schematic with tee, green, and fairway", () => {
    const layout = buildHoleLayout(3, 3, 12);
    assert.ok(layout.centerline.startsWith("M "));
    assert.ok(layout.fairwayWidth > 10);
    assert.ok(layout.tee.width > 0);
    assert.ok(layout.green.rx > 0);
    assert.ok(layout.shapeLabel.length > 0);
    assert.ok(layout.bunkers.length >= 1);
  });

  it("adds more bunkers on harder stroke indexes", () => {
    const easy = buildHoleLayout(5, 4, 18);
    const hard = buildHoleLayout(5, 4, 1);
    assert.ok(hard.bunkers.length >= easy.bunkers.length);
  });
});
