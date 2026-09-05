import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adjacentClub,
  GOLF_CLUBS,
  recommendClub,
} from "./clubs.ts";
import {
  buildHoleLayout,
  defaultHoleMeters,
  mapDistanceMeters,
} from "./hole-layout.ts";

describe("recommendClub", () => {
  it("picks the shortest club that covers the shot", () => {
    assert.equal(recommendClub(100).id, "9i");
    assert.equal(recommendClub(140).id, "5i");
    assert.equal(recommendClub(200).id, "driver");
  });

  it("falls back to driver for long carries", () => {
    assert.equal(recommendClub(300).id, "driver");
  });
});

describe("adjacentClub", () => {
  it("cycles within the bag", () => {
    const first = GOLF_CLUBS[0]!;
    const last = GOLF_CLUBS[GOLF_CLUBS.length - 1]!;
    assert.equal(adjacentClub(first.id, -1).id, first.id);
    assert.equal(adjacentClub(last.id, 1).id, last.id);
    assert.equal(adjacentClub("hybrid", 1).shortName, "5i");
  });
});

describe("buildHoleLayout", () => {
  it("is stable for the same hole seed", () => {
    const a = buildHoleLayout({ holeNumber: 1, par: 4, meters: 257 });
    const b = buildHoleLayout({ holeNumber: 1, par: 4, meters: 257 });
    assert.equal(a.fairwayPath, b.fairwayPath);
    assert.equal(a.lengthMeters, 257);
    assert.ok(a.tee.y < a.green.y);
  });

  it("scales map distance to meters via tee→green", () => {
    const layout = buildHoleLayout({ holeNumber: 3, par: 3, meters: 150 });
    const full = mapDistanceMeters(layout, layout.tee, layout.green);
    assert.ok(Math.abs(full - 150) < 0.5);
  });

  it("defaults meters by par", () => {
    assert.equal(defaultHoleMeters(3), 150);
    assert.equal(defaultHoleMeters(4), 340);
    assert.equal(defaultHoleMeters(5), 470);
  });
});
