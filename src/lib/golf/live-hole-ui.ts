import type {
  GolfCourseHole,
  GolfLiveStrokes,
  GolfPlayer,
  GolfPlayerSlot,
  GolfScore,
} from "../../types/golf-round.ts";
import { resolveHoleNet } from "./handicap.ts";
import { clampStrokes } from "./scoring.ts";

/** Minimum +/- hit target (px). Tailwind `min-h-11` / `min-w-11` is 44px. */
export const GOLF_SCORE_STEPPER_HIT_PX = 44;

export function formatLiveHoleMeta(hole: {
  number: number;
  par: number;
  strokeIndex: number;
}): string {
  return `Hole ${hole.number} · Par ${hole.par} · SI ${hole.strokeIndex}`;
}

export function formatHoleProgress(
  currentHoleIndex: number,
  holeCount: number,
): string {
  return `Hole ${currentHoleIndex + 1} of ${holeCount}`;
}

/** Name-row supporting copy: this-hole net from API (or live SI preview), plus to-par. */
export function formatThisHoleNetLine(input: {
  net: number | null;
  toParLabel: string;
}): string {
  if (input.net == null) return `${input.toParLabel} this hole`;
  return `Net ${input.net} · ${input.toParLabel}`;
}

export function applyStrokeDelta(current: number, delta: number): number {
  return clampStrokes(current + delta);
}

export function holeStrokeValue(
  strokes: GolfLiveStrokes,
  holeNumber: number,
  slot: GolfPlayerSlot | string,
  par: number,
): number {
  const value = strokes[holeNumber]?.[String(slot)];
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampStrokes(value);
  }
  return clampStrokes(par);
}

export function seedHoleStrokesIfEmpty(
  strokes: GolfLiveStrokes,
  hole: Pick<GolfCourseHole, "number" | "par">,
  players: readonly Pick<GolfPlayer, "slot">[],
): GolfLiveStrokes {
  const existing = strokes[hole.number];
  if (existing && Object.keys(existing).length > 0) return strokes;
  const seeded: Record<string, number> = {};
  for (const player of players) {
    seeded[String(player.slot)] = clampStrokes(hole.par);
  }
  return { ...strokes, [hole.number]: seeded };
}

export function apiNetStrokesForHole(
  score: GolfScore | null | undefined,
  holeNumber: number,
  slot: GolfPlayerSlot | string,
): number | null {
  const value = score?.holes.find((row) => row.number === holeNumber)
    ?.netStrokes?.[String(slot)];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * This-hole net for the live card. Prefer API `netStrokes` (9-hole math lives
 * in league-sports-api). Fall back to SI allocation on the holes being played.
 */
export function liveHoleNet(input: {
  gross: number;
  playingHandicap?: number | null;
  holeNumber: number;
  holes: readonly Pick<GolfCourseHole, "number" | "strokeIndex">[];
  apiNetStrokes?: number | null;
}): { net: number | null; strokesReceived: number } {
  return resolveHoleNet(input);
}
