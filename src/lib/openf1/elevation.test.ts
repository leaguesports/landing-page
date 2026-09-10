import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paintCircuitElevation, withCircuitElevation } from "./elevation.ts";
import { TRACK_Z0 } from "./coords.ts";
import type { ReplayCircuit } from "./replay.ts";

describe("paintCircuitElevation", () => {
  it("uses the lowest GPS z as z0 so the ribbon stays above the grid", () => {
    const x = [0, 50, 100, 150, 200];
    const painted = paintCircuitElevation(
      { x, y: [0, 0, 0, 0, 0] },
      x.map((value) => ({ x: value, y: 0, z: 4000 + value })),
    );
    assert.ok(painted.z0 <= Math.min(...painted.z));
    assert.ok(painted.z0 <= 4000);
    assert.equal(painted.z.length, 5);
    assert.ok(painted.z[0]! < painted.z[4]!);
    assert.ok(painted.z[0]! > 3900);
    assert.ok(painted.z[4]! < 4300);
  });

  it("stays flat when GPS z is missing", () => {
    const painted = paintCircuitElevation(
      { x: [0, 1, 2], y: [0, 1, 2] },
      [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 40 },
      ],
    );
    assert.equal(painted.z0, TRACK_Z0);
    assert.deepEqual(painted.z, [0, 0, 0]);
  });

  it("copies a painted profile onto a circuit", () => {
    const circuit = {
      circuitKey: 7,
      circuitName: "Spa",
      year: 2026,
      rotation: 0,
      x: [0, 50],
      y: [0, 0],
      z: [0, 0],
      z0: TRACK_Z0,
      corners: [],
    } satisfies ReplayCircuit;
    const next = withCircuitElevation(circuit, [
      { x: 0, y: 0, z: 4100 },
      { x: 50, y: 0, z: 4100 },
    ]);
    assert.equal(next.z0, 4100);
    assert.deepEqual(next.z, [4100, 4100]);
    assert.equal(circuit.z0, TRACK_Z0);
  });
});
