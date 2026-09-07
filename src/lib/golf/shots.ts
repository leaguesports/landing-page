import type {
  GolfHoleScore,
  GolfLiveShots,
  GolfPlayerSlot,
  GolfScore,
  GolfShot,
  GolfShotKind,
  ScorecardHole,
} from "../../types/golf-round.ts";

export type ShotCoords = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
};

const EARTH_RADIUS_M = 6_371_000;
const MIN_MANUAL_METERS = 1;
const MAX_MANUAL_METERS = 600;

function slotKey(slot: GolfPlayerSlot | number): string {
  return String(slot);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Haversine distance in meters. */
export function distanceMeters(a: ShotCoords, b: ShotCoords): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function newShotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `shot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function clampShotMeters(value: number): number {
  if (!Number.isFinite(value)) return MIN_MANUAL_METERS;
  return Math.min(MAX_MANUAL_METERS, Math.max(MIN_MANUAL_METERS, Math.round(value)));
}

export function formatShotMeters(meters: number | null | undefined): string {
  if (typeof meters !== "number" || !Number.isFinite(meters)) return "—";
  return `${Math.round(meters)} m`;
}

export function selectedTeeMeters(
  hole: Pick<ScorecardHole, "tees"> | null | undefined,
): number | null {
  const selected = hole?.tees?.find((tee) => tee.selected);
  if (!selected || !Number.isFinite(selected.meters) || selected.meters <= 0) {
    return null;
  }
  return selected.meters;
}

export function playerShots(
  shots: GolfLiveShots,
  holeNumber: number,
  slot: GolfPlayerSlot,
): GolfShot[] {
  const list = shots[holeNumber]?.[slotKey(slot)];
  return Array.isArray(list) ? list : [];
}

export function hasAnyShots(shots: GolfLiveShots | null | undefined): boolean {
  if (!shots) return false;
  for (const hole of Object.values(shots)) {
    if (!hole) continue;
    for (const list of Object.values(hole)) {
      if (Array.isArray(list) && list.length > 0) return true;
    }
  }
  return false;
}

/** Carries with a measured distance (excludes GPS start marks). */
export function measuredShotCount(list: GolfShot[]): number {
  return list.filter((shot) => typeof shot.meters === "number").length;
}

export function totalShotMeters(list: GolfShot[]): number {
  let total = 0;
  for (const shot of list) {
    if (typeof shot.meters === "number" && Number.isFinite(shot.meters)) {
      total += shot.meters;
    }
  }
  return total;
}

/** Remaining to the selected tee's hole length. Null when yardage is unknown. */
export function remainingHoleMeters(
  holeMeters: number | null | undefined,
  list: GolfShot[],
): number | null {
  if (typeof holeMeters !== "number" || !Number.isFinite(holeMeters) || holeMeters <= 0) {
    return null;
  }
  return Math.round(holeMeters - totalShotMeters(list));
}

function withSequence(list: GolfShot[]): GolfShot[] {
  return list.map((shot, index) => ({ ...shot, sequence: index + 1 }));
}

export function setPlayerShots(
  shots: GolfLiveShots,
  holeNumber: number,
  slot: GolfPlayerSlot,
  nextList: GolfShot[],
): GolfLiveShots {
  const hole = { ...(shots[holeNumber] ?? {}) };
  hole[slotKey(slot)] = withSequence(nextList);
  return { ...shots, [holeNumber]: hole };
}

export function shotFromGpsMark(
  previous: GolfShot | null | undefined,
  coords: ShotCoords,
  recordedAt = new Date().toISOString(),
): GolfShot {
  const prevHasFix =
    previous != null &&
    typeof previous.latitude === "number" &&
    typeof previous.longitude === "number";
  const meters = prevHasFix
    ? clampShotMeters(
        distanceMeters(
          {
            latitude: previous.latitude as number,
            longitude: previous.longitude as number,
          },
          coords,
        ),
      )
    : null;
  return {
    id: newShotId(),
    sequence: 0,
    meters,
    kind: "gps",
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracyMeters:
      typeof coords.accuracyMeters === "number" && Number.isFinite(coords.accuracyMeters)
        ? Math.round(coords.accuracyMeters)
        : null,
    recordedAt,
  };
}

export function shotFromManualMeters(
  meters: number,
  recordedAt = new Date().toISOString(),
): GolfShot {
  return {
    id: newShotId(),
    sequence: 0,
    meters: clampShotMeters(meters),
    kind: "manual",
    latitude: null,
    longitude: null,
    accuracyMeters: null,
    recordedAt,
  };
}

export function appendShot(
  shots: GolfLiveShots,
  holeNumber: number,
  slot: GolfPlayerSlot,
  shot: GolfShot,
): GolfLiveShots {
  const current = playerShots(shots, holeNumber, slot);
  return setPlayerShots(shots, holeNumber, slot, [...current, shot]);
}

export function removeLastShot(
  shots: GolfLiveShots,
  holeNumber: number,
  slot: GolfPlayerSlot,
): GolfLiveShots {
  const current = playerShots(shots, holeNumber, slot);
  if (current.length === 0) return shots;
  return setPlayerShots(shots, holeNumber, slot, current.slice(0, -1));
}

export function parseShot(value: unknown): GolfShot | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const kind: GolfShotKind | null =
    row.kind === "gps" || row.kind === "manual" ? row.kind : null;
  if (!kind) return null;
  const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : null;
  if (!id) return null;
  const sequence =
    typeof row.sequence === "number" && Number.isInteger(row.sequence) && row.sequence > 0
      ? row.sequence
      : 0;
  let meters: number | null = null;
  if (row.meters == null) {
    meters = null;
  } else if (typeof row.meters === "number" && Number.isFinite(row.meters)) {
    meters = clampShotMeters(row.meters);
  } else {
    return null;
  }
  const recordedAt =
    typeof row.recordedAt === "string" && row.recordedAt.trim()
      ? row.recordedAt
      : new Date(0).toISOString();
  return {
    id,
    sequence,
    meters,
    kind,
    latitude: typeof row.latitude === "number" ? row.latitude : null,
    longitude: typeof row.longitude === "number" ? row.longitude : null,
    accuracyMeters:
      typeof row.accuracyMeters === "number" && Number.isFinite(row.accuracyMeters)
        ? Math.round(row.accuracyMeters)
        : null,
    recordedAt,
  };
}

export function parseShotList(value: unknown): GolfShot[] {
  if (!Array.isArray(value)) return [];
  const list: GolfShot[] = [];
  for (const raw of value) {
    const shot = parseShot(raw);
    if (shot) list.push(shot);
  }
  return withSequence(list);
}

export function parseLiveShots(value: unknown): GolfLiveShots {
  if (!value || typeof value !== "object") return {};
  const shots: GolfLiveShots = {};
  for (const [holeKey, holeValue] of Object.entries(value as Record<string, unknown>)) {
    const holeNumber = Number(holeKey);
    if (!Number.isInteger(holeNumber) || holeNumber < 1) continue;
    if (!holeValue || typeof holeValue !== "object") continue;
    const bySlot: Record<string, GolfShot[]> = {};
    for (const [slot, list] of Object.entries(holeValue as Record<string, unknown>)) {
      const parsed = parseShotList(list);
      if (parsed.length) bySlot[slot] = parsed;
    }
    if (Object.keys(bySlot).length) shots[holeNumber] = bySlot;
  }
  return shots;
}

export function shotsFromScore(score: GolfScore | null | undefined): GolfLiveShots {
  if (!score?.holes?.length) return {};
  const shots: GolfLiveShots = {};
  for (const hole of score.holes) {
    if (typeof hole.number !== "number" || !hole.shots) continue;
    const bySlot: Record<string, GolfShot[]> = {};
    for (const [slot, list] of Object.entries(hole.shots)) {
      const parsed = parseShotList(list);
      if (parsed.length) bySlot[slot] = parsed;
    }
    if (Object.keys(bySlot).length) shots[hole.number] = bySlot;
  }
  return shots;
}

export function parseHoleShots(
  value: unknown,
): Record<string, GolfShot[]> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const bySlot: Record<string, GolfShot[]> = {};
  for (const [slot, list] of Object.entries(value as Record<string, unknown>)) {
    const parsed = parseShotList(list);
    if (parsed.length) bySlot[slot] = parsed;
  }
  return Object.keys(bySlot).length ? bySlot : undefined;
}

export function attachShotsToScoreHoles(
  holes: GolfHoleScore[],
  shots: GolfLiveShots,
): GolfHoleScore[] {
  return holes.map((hole) => {
    const bySlot = shots[hole.number];
    if (!bySlot) return hole;
    const cleaned: Record<string, GolfShot[]> = {};
    for (const [slot, list] of Object.entries(bySlot)) {
      if (Array.isArray(list) && list.length) cleaned[slot] = withSequence(list);
    }
    if (!Object.keys(cleaned).length) return hole;
    return { ...hole, shots: cleaned };
  });
}

export type GeolocationLike = {
  getCurrentPosition: Geolocation["getCurrentPosition"];
};

export async function requestHighAccuracyPosition(
  geolocation?: GeolocationLike | null,
): Promise<ShotCoords> {
  const api =
    geolocation ??
    (typeof navigator !== "undefined" ? navigator.geolocation : null);
  if (!api) {
    throw new Error("Geolocation is not supported on this device");
  }
  return new Promise((resolve, reject) => {
    api.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        });
      },
      (err) => {
        reject(new Error(err.message || "Could not read GPS"));
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );
  });
}
