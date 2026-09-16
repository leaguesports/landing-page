import type {
  GolfCourseHole,
  GolfLiveStrokes,
  GolfPlayer,
  GolfPlayerSlot,
  GolfScore,
} from "../../types/golf-round.ts";
import { playerHasPlayingHandicap, resolveHoleNet } from "./handicap.ts";
import { clampStrokes } from "./scoring.ts";

/** Minimum +/- hit target (px). Tailwind `min-h-11` / `min-w-11` is 44px. */
export const GOLF_SCORE_STEPPER_HIT_PX = 44;

/** What the live hole card itself shows vs Round info / overflow. */
export type LiveCardVisibility = {
  showTeePills: boolean;
  showHoleProgressOnCard: boolean;
  showStackedHcp: boolean;
  showPlayerNameOnCard: boolean;
  showPlayerNameInTotals: boolean;
  compactSinglePlayerCard: boolean;
};

export function liveCardVisibility(playerCount: number): LiveCardVisibility {
  const multi = playerCount > 1;
  return {
    showTeePills: false,
    showHoleProgressOnCard: false,
    showStackedHcp: false,
    showPlayerNameOnCard: true,
    showPlayerNameInTotals: multi,
    compactSinglePlayerCard: !multi,
  };
}

export function liveHeaderShowsStrokeIndex(
  strokesReceived: readonly number[],
): boolean {
  return strokesReceived.some((count) => count !== 0);
}

export function formatLiveHoleMeta(
  hole: {
    number: number;
    par: number;
    strokeIndex: number;
  },
  options?: { showStrokeIndex?: boolean },
): string {
  const base = `Hole ${hole.number} · Par ${hole.par}`;
  if (options?.showStrokeIndex) {
    return `${base} · SI ${hole.strokeIndex}`;
  }
  return base;
}

export function formatHoleProgress(
  currentHoleIndex: number,
  holeCount: number,
): string {
  return `Hole ${currentHoleIndex + 1} of ${holeCount}`;
}

/** Quiet playing-handicap line on the live card. Course vs playing lives in Round info. */
export function formatLivePlayingHcp(
  playingHandicap: number | null | undefined,
): string | null {
  if (!playerHasPlayingHandicap({ playingHandicap })) return null;
  return `Hcp ${playingHandicap}`;
}

/** Instructional lock copy — only when every hole is ready. */
export function formatLiveLockHint(canLock: boolean): string | null {
  return canLock ? "All holes scored. Lock to save the round." : null;
}

export function formatRoundInfoRatings(input: {
  courseRating?: number | null;
  slopeRating?: number | null;
  teePar?: number | null;
}): string | null {
  const parts: string[] = [];
  if (typeof input.courseRating === "number" && Number.isFinite(input.courseRating)) {
    parts.push(`CR ${input.courseRating}`);
  }
  if (typeof input.slopeRating === "number" && Number.isFinite(input.slopeRating)) {
    parts.push(`Slope ${input.slopeRating}`);
  }
  if (typeof input.teePar === "number" && Number.isFinite(input.teePar)) {
    parts.push(`Par ${input.teePar}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatRoundInfoPlayerHcp(player: GolfPlayer): string | null {
  if (
    !playerHasPlayingHandicap(player) &&
    typeof player.courseHandicap !== "number"
  ) {
    return null;
  }
  const course =
    typeof player.courseHandicap === "number" &&
    Number.isFinite(player.courseHandicap)
      ? String(player.courseHandicap)
      : "—";
  const playing =
    typeof player.playingHandicap === "number" &&
    Number.isFinite(player.playingHandicap)
      ? String(player.playingHandicap)
      : "—";
  return `Course hcp ${course} · Playing hcp ${playing}`;
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
