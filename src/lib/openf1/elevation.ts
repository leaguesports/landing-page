import { MISSING_Z_MAX, TRACK_Z0 } from "./coords.ts";
import type { ReplayCircuit } from "./replay.ts";

export const ELEVATION_SAMPLE_MS = 110_000;
export const ELEVATION_CHUNK_MS = 55_000;
/** OpenF1 XY units; GPS racing line vs Multiviewer outline. */
export const ELEVATION_MATCH_RADIUS = 420;

export type ElevationSample = {
  x: number;
  y: number;
  z: number;
};

function minZ(values: readonly number[], fallback: number = TRACK_Z0): number {
  if (values.length === 0) return fallback;
  let min = values[0]!;
  for (const value of values) {
    if (value < min) min = value;
  }
  return min;
}

function validZ(z: number): boolean {
  return z > MISSING_Z_MAX;
}

function cellKey(x: number, y: number, size: number): string {
  return `${Math.floor(x / size)}:${Math.floor(y / size)}`;
}

function buildIndex(
  samples: readonly ElevationSample[],
  cell: number,
): Map<string, ElevationSample[]> {
  const index = new Map<string, ElevationSample[]>();
  for (const sample of samples) {
    if (!validZ(sample.z)) continue;
    const key = cellKey(sample.x, sample.y, cell);
    const bucket = index.get(key);
    if (bucket) bucket.push(sample);
    else index.set(key, [sample]);
  }
  return index;
}

function nearestZ(
  x: number,
  y: number,
  index: Map<string, ElevationSample[]>,
  cell: number,
  maxDist2: number,
): number | null {
  const cx = Math.floor(x / cell);
  const cy = Math.floor(y / cell);
  let best = maxDist2;
  let z: number | null = null;
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      const bucket = index.get(`${cx + dx}:${cy + dy}`);
      if (!bucket) continue;
      for (const sample of bucket) {
        const ddx = sample.x - x;
        const ddy = sample.y - y;
        const dist2 = ddx * ddx + ddy * ddy;
        if (dist2 < best) {
          best = dist2;
          z = sample.z;
        }
      }
    }
  }
  return z;
}

function wrapIndex(i: number, n: number): number {
  return ((i % n) + n) % n;
}

function fillCircular(values: Array<number | null>): number[] {
  const n = values.length;
  const out = new Array<number>(n).fill(0);
  const known: number[] = [];
  for (let i = 0; i < n; i += 1) {
    if (values[i] != null) known.push(i);
  }
  if (known.length === 0) return out;
  if (known.length === 1) {
    const z = values[known[0]!]!;
    return out.map(() => z);
  }
  for (let i = 0; i < n; i += 1) {
    const direct = values[i];
    if (direct != null) {
      out[i] = direct;
      continue;
    }
    let prev = known[known.length - 1]!;
    let next = known[0]!;
    for (const idx of known) {
      if (idx < i) prev = idx;
      if (idx > i) {
        next = idx;
        break;
      }
    }
    if (known[0]! > i) {
      prev = known[known.length - 1]!;
      next = known[0]!;
    }
    const span = wrapIndex(next - prev, n) || n;
    const step = wrapIndex(i - prev, n);
    const u = step / span;
    out[i] = values[prev]! * (1 - u) + values[next]! * u;
  }
  return out;
}

function smoothCircular(values: readonly number[], window: number = 7): number[] {
  const n = values.length;
  if (n === 0 || window <= 1) return [...values];
  const maxWindow = Math.min(window, Math.max(1, Math.floor(n / 8) * 2 + 1));
  if (maxWindow <= 1) return [...values];
  const half = Math.floor(maxWindow / 2);
  const out = new Array<number>(n);
  const denom = half * 2 + 1;
  for (let i = 0; i < n; i += 1) {
    let sum = 0;
    for (let k = -half; k <= half; k += 1) {
      sum += values[wrapIndex(i + k, n)]!;
    }
    out[i] = sum / denom;
  }
  return out;
}

export function paintCircuitElevation(
  circuit: Pick<ReplayCircuit, "x" | "y">,
  samples: readonly ElevationSample[],
): { z0: number; z: number[] } {
  const usable = samples.filter((sample) => validZ(sample.z));
  const z = circuit.x.map(() => 0);
  if (circuit.x.length === 0 || usable.length === 0) {
    return { z0: TRACK_Z0, z };
  }

  const cell = Math.max(40, ELEVATION_MATCH_RADIUS / 2);
  const index = buildIndex(usable, cell);
  const maxDist2 = ELEVATION_MATCH_RADIUS * ELEVATION_MATCH_RADIUS;
  const raw: Array<number | null> = circuit.x.map((x, i) =>
    nearestZ(x, circuit.y[i]!, index, cell, maxDist2),
  );
  const painted = smoothCircular(fillCircular(raw));
  // Sit the lowest vertex on the grid. Median z0 buried half of Spa.
  const z0 = minZ([...usable.map((sample) => sample.z), ...painted]);
  return { z0, z: painted };
}

export function withCircuitElevation(
  circuit: ReplayCircuit,
  samples: readonly ElevationSample[],
): ReplayCircuit {
  const painted = paintCircuitElevation(circuit, samples);
  return { ...circuit, z0: painted.z0, z: painted.z };
}
