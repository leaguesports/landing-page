/** OpenF1 location is Cartesian x,y,z — not lat/lon. Matches Multiviewer. */

export const TRACK_SCALE = 0.012;
export const TRACK_Z0 = 1900;
export const TRACK_ELEVATION = 0.35;
/** OpenF1 sometimes returns 0 / tiny z; treat as missing. */
export const MISSING_Z_MAX = 100;

export type WorldVec = { x: number; y: number; z: number };

export function worldVec(
  x: number,
  y: number,
  z: number,
  into: WorldVec = { x: 0, y: 0, z: 0 },
): WorldVec {
  const elev =
    z > MISSING_Z_MAX ? (z - TRACK_Z0) * TRACK_SCALE * TRACK_ELEVATION : 0;
  into.x = x * TRACK_SCALE;
  into.y = elev;
  into.z = -y * TRACK_SCALE;
  return into;
}
