import { INTERP_MAX_GAP_MS, LOCATION_MIN_INTERVAL_MS } from "./replay.ts";
import type { LocationPoint, LocationSample } from "./replay.ts";

export type DriverTracks = Map<number, LocationSample[]>;

export function mergeLocationSamples(
  existing: readonly LocationSample[],
  incoming: readonly LocationSample[],
  minIntervalMs: number = LOCATION_MIN_INTERVAL_MS,
): LocationSample[] {
  if (existing.length === 0 && incoming.length === 0) return [];
  const merged = existing.concat(incoming);
  merged.sort((a, b) => a.t - b.t);
  const out: LocationSample[] = [];
  for (const sample of merged) {
    const last = out[out.length - 1];
    if (last && sample.t === last.t) {
      out[out.length - 1] = sample;
      continue;
    }
    if (last && sample.t - last.t < minIntervalMs) continue;
    out.push(sample);
  }
  return out;
}

export function appendLocationPoints(
  tracks: DriverTracks,
  points: readonly LocationPoint[],
  minIntervalMs: number = LOCATION_MIN_INTERVAL_MS,
): void {
  const grouped = new Map<number, LocationSample[]>();
  for (const point of points) {
    const list = grouped.get(point.driverNumber);
    const sample = { t: point.t, x: point.x, y: point.y, z: point.z };
    if (list) list.push(sample);
    else grouped.set(point.driverNumber, [sample]);
  }
  for (const [driverNumber, samples] of grouped) {
    const next = mergeLocationSamples(
      tracks.get(driverNumber) ?? [],
      samples,
      minIntervalMs,
    );
    tracks.set(driverNumber, next);
  }
}

function lowerBound(samples: readonly LocationSample[], t: number): number {
  let lo = 0;
  let hi = samples.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid]!.t < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export type SamplePose = {
  x: number;
  y: number;
  z: number;
};

export function sampleAt(
  samples: readonly LocationSample[] | undefined,
  t: number,
  maxGapMs: number = INTERP_MAX_GAP_MS,
): SamplePose | null {
  if (!samples || samples.length === 0) return null;
  const i = lowerBound(samples, t);
  if (i === 0) return poseOf(samples[0]!);
  if (i >= samples.length) return poseOf(samples[samples.length - 1]!);
  const next = samples[i]!;
  const prev = samples[i - 1]!;
  const gap = next.t - prev.t;
  if (gap > maxGapMs) {
    return t - prev.t <= next.t - t ? poseOf(prev) : poseOf(next);
  }
  if (gap <= 0) return poseOf(next);
  const u = (t - prev.t) / gap;
  return {
    x: prev.x + (next.x - prev.x) * u,
    y: prev.y + (next.y - prev.y) * u,
    z: prev.z + (next.z - prev.z) * u,
  };
}

function poseOf(sample: LocationSample): SamplePose {
  return { x: sample.x, y: sample.y, z: sample.z };
}

export function downsamplePoints(
  points: readonly LocationPoint[],
  minIntervalMs: number = LOCATION_MIN_INTERVAL_MS,
): LocationPoint[] {
  const tracks: DriverTracks = new Map();
  appendLocationPoints(tracks, points, minIntervalMs);
  const out: LocationPoint[] = [];
  for (const [driverNumber, samples] of tracks) {
    for (const sample of samples) {
      out.push({ driverNumber, ...sample });
    }
  }
  out.sort((a, b) => a.t - b.t || a.driverNumber - b.driverNumber);
  return out;
}
