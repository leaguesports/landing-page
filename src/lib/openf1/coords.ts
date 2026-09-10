/** OpenF1 location is Cartesian x,y,z — not lat/lon. Matches Multiviewer. */

export const TRACK_SCALE = 0.012;
/** Fallback baseline when a session has not painted its own GPS z0. */
export const TRACK_Z0 = 1900;
export const TRACK_ELEVATION = 1;
/** OpenF1 sometimes returns 0 / tiny z; treat as missing. */
export const MISSING_Z_MAX = 100;

export type WorldVec = { x: number; y: number; z: number };

export function worldElev(z: number, z0: number = TRACK_Z0): number {
  if (!(z > MISSING_Z_MAX)) return 0;
  return (z - z0) * TRACK_SCALE * TRACK_ELEVATION;
}

export function worldVec(
  x: number,
  y: number,
  z: number,
  into: WorldVec = { x: 0, y: 0, z: 0 },
  z0: number = TRACK_Z0,
): WorldVec {
  into.x = x * TRACK_SCALE;
  into.y = Math.max(0, worldElev(z, z0));
  into.z = -y * TRACK_SCALE;
  return into;
}
