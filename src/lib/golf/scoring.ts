import type {
  GolfCourseHole,
  GolfHoleScore,
  GolfLiveStrokes,
  GolfPlayer,
  GolfPlayerSlot,
  GolfScore,
  LockGolfRoundBody,
} from "../../types/golf-round.ts";
import {
  holesHaveStrokeIndexes,
  playerHasPlayingHandicap,
  resolveHoleNet,
} from "./handicap.ts";

export type PlayerRunningTotal = {
  slot: GolfPlayerSlot;
  displayName: string;
  gross: number;
  net: number | null;
  toPar: number;
  holesScored: number;
  courseHandicap: number | null;
  playingHandicap: number | null;
};

function slotKey(slot: GolfPlayerSlot | number): string {
  return String(slot);
}

/** Gross strokes for one player across scored holes. */
export function playerGross(
  strokes: GolfLiveStrokes,
  slot: GolfPlayerSlot,
): number {
  const key = slotKey(slot);
  let total = 0;
  for (const hole of Object.values(strokes)) {
    const value = hole?.[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      total += value;
    }
  }
  return total;
}

/** Score relative to par for holes that have strokes entered. */
export function playerToPar(
  strokes: GolfLiveStrokes,
  slot: GolfPlayerSlot,
  holes: GolfCourseHole[],
): number {
  const key = slotKey(slot);
  let toPar = 0;
  for (const hole of holes) {
    const value = strokes[hole.number]?.[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      toPar += value - hole.par;
    }
  }
  return toPar;
}

export function formatToPar(toPar: number): string {
  if (toPar === 0) return "E";
  if (toPar > 0) return `+${toPar}`;
  return String(toPar);
}

export function runningTotals(
  players: GolfPlayer[],
  strokes: GolfLiveStrokes,
  holes: GolfCourseHole[],
): PlayerRunningTotal[] {
  return players.map((player) => {
    const key = slotKey(player.slot);
    let holesScored = 0;
    for (const hole of holes) {
      const value = strokes[hole.number]?.[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        holesScored += 1;
      }
    }
    const gross =
      typeof player.grossTotal === "number"
        ? player.grossTotal
        : playerGross(strokes, player.slot);
    let net: number | null =
      typeof player.netTotal === "number" ? player.netTotal : null;
    if (
      net == null &&
      playerHasPlayingHandicap(player) &&
      holesHaveStrokeIndexes(holes)
    ) {
      let holeNetSum = 0;
      let counted = 0;
      for (const hole of holes) {
        const value = strokes[hole.number]?.[key];
        if (typeof value !== "number" || !Number.isFinite(value)) continue;
        const resolved = resolveHoleNet({
          gross: value,
          playingHandicap: player.playingHandicap,
          holeNumber: hole.number,
          holes,
        });
        if (resolved.net == null) continue;
        holeNetSum += resolved.net;
        counted += 1;
      }
      if (counted > 0) net = holeNetSum;
    } else if (
      net == null &&
      playerHasPlayingHandicap(player) &&
      holesScored === holes.length
    ) {
      net = gross - (player.playingHandicap as number);
    }
    return {
      slot: player.slot,
      displayName: player.displayName,
      gross,
      net,
      toPar: playerToPar(strokes, player.slot, holes),
      holesScored,
      courseHandicap:
        typeof player.courseHandicap === "number" ? player.courseHandicap : null,
      playingHandicap:
        typeof player.playingHandicap === "number"
          ? player.playingHandicap
          : null,
    };
  });
}

/** True when every player has a stroke count on every course hole. */
export function allHolesScored(
  players: GolfPlayer[],
  strokes: GolfLiveStrokes,
  holes: GolfCourseHole[],
): boolean {
  if (!players.length || !holes.length) return false;
  for (const hole of holes) {
    const holeStrokes = strokes[hole.number];
    if (!holeStrokes) return false;
    for (const player of players) {
      const value = holeStrokes[slotKey(player.slot)];
      if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 1 ||
        value > 15
      ) {
        return false;
      }
    }
  }
  return true;
}

/** Map live stroke entry into the lock API payload. */
export function buildLockPayload(
  players: GolfPlayer[],
  strokes: GolfLiveStrokes,
  holes: GolfCourseHole[],
): LockGolfRoundBody | null {
  if (!allHolesScored(players, strokes, holes)) return null;

  const scoreHoles: GolfHoleScore[] = holes.map((hole) => {
    const holeStrokes = strokes[hole.number] ?? {};
    const next: Record<string, number> = {};
    for (const player of players) {
      next[slotKey(player.slot)] = holeStrokes[slotKey(player.slot)];
    }
    return { number: hole.number, strokes: next };
  });

  return { score: { holes: scoreHoles } };
}

/** Seed local strokes from a locked (or partial) API score. */
export function strokesFromScore(score: GolfScore | null | undefined): GolfLiveStrokes {
  if (!score?.holes?.length) return {};
  const strokes: GolfLiveStrokes = {};
  for (const hole of score.holes) {
    if (typeof hole.number !== "number") continue;
    strokes[hole.number] = { ...hole.strokes };
  }
  return strokes;
}

export function clampStrokes(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(15, Math.max(1, Math.round(value)));
}
