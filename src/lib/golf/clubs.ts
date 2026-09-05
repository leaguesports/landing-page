/** Typical carry distances (meters) for a mid-handicap bag. */

export type GolfClub = {
  id: string;
  shortName: string;
  label: string;
  meters: number;
};

export const GOLF_CLUBS: readonly GolfClub[] = [
  { id: "driver", shortName: "Dr", label: "Driver", meters: 210 },
  { id: "3w", shortName: "3W", label: "3 Wood", meters: 190 },
  { id: "5w", shortName: "5W", label: "5 Wood", meters: 175 },
  { id: "hybrid", shortName: "Hyb", label: "Hybrid", meters: 160 },
  { id: "5i", shortName: "5i", label: "5 Iron", meters: 145 },
  { id: "7i", shortName: "7i", label: "7 Iron", meters: 130 },
  { id: "9i", shortName: "9i", label: "9 Iron", meters: 110 },
  { id: "pw", shortName: "PW", label: "Pitching Wedge", meters: 90 },
  { id: "sw", shortName: "SW", label: "Sand Wedge", meters: 70 },
] as const;

/** Nearest club at or above the shot, else the longest. */
export function recommendClub(distanceMeters: number): GolfClub {
  const distance = Math.max(0, distanceMeters);
  const sortedAsc = [...GOLF_CLUBS].sort((a, b) => a.meters - b.meters);
  for (const club of sortedAsc) {
    if (club.meters >= distance) return club;
  }
  return sortedAsc[sortedAsc.length - 1]!;
}

export function clubIndex(clubId: string): number {
  const index = GOLF_CLUBS.findIndex((club) => club.id === clubId);
  return index >= 0 ? index : 0;
}

export function adjacentClub(clubId: string, delta: number): GolfClub {
  const index = clubIndex(clubId);
  const next = Math.min(
    GOLF_CLUBS.length - 1,
    Math.max(0, index + delta),
  );
  return GOLF_CLUBS[next]!;
}
