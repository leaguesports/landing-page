import type {
  GolfCourseCms,
  GolfCourseCmsTee,
  GolfCourseHole,
  GolfPlayer,
  GolfTeeRatings,
  GolfTeeRatingsInput,
} from "../../types/golf-round.ts";

export type { GolfTeeRatings, GolfTeeRatingsInput };

/** UI disclaimer — issue #207. API also returns `handicapDisclaimer`. */
export const GOLF_HANDICAP_UI_DISCLAIMER =
  "Estimated course handicap (WHS-style)";

export const GOLF_HANDICAP_INDEX_MIN = -10;
export const GOLF_HANDICAP_INDEX_MAX = 54;

export const COURSE_RATING_MIN = 25;
export const COURSE_RATING_MAX = 90;
export const SLOPE_RATING_MIN = 55;
export const SLOPE_RATING_MAX = 155;
export const TEE_PAR_MIN = 27;
export const TEE_PAR_MAX = 84;

export type ParseGolfHandicapIndexResult =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

export type GolfTeeRatingsPayload = {
  tee: {
    id?: string;
    courseRating?: number;
    slopeRating?: number;
    par?: number;
  };
  courseRating?: number;
  slopeRating?: number;
  teePar?: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function oneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function decimalPlaces(raw: string): number | null {
  const match = raw.trim().match(/^-?\d+(?:\.(\d+))?$/);
  if (!match) return null;
  return match[1]?.length ?? 0;
}

/** Profile / form HI: null clears; −10.0…54.0 at 1 decimal. */
export function parseGolfHandicapIndex(
  raw: unknown,
): ParseGolfHandicapIndexResult {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: null };
  }
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      return { ok: false, error: "Handicap index must be a number" };
    }
    if (raw < GOLF_HANDICAP_INDEX_MIN || raw > GOLF_HANDICAP_INDEX_MAX) {
      return {
        ok: false,
        error: `Handicap index must be between ${GOLF_HANDICAP_INDEX_MIN}.0 and ${GOLF_HANDICAP_INDEX_MAX}.0`,
      };
    }
    return { ok: true, value: oneDecimal(raw) };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Handicap index must be a number" };
  }
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };

  const places = decimalPlaces(trimmed);
  if (places === null) {
    return { ok: false, error: "Handicap index must be a number" };
  }
  if (places > 1) {
    return { ok: false, error: "Handicap index must have at most 1 decimal" };
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { ok: false, error: "Handicap index must be a number" };
  }
  if (value < GOLF_HANDICAP_INDEX_MIN || value > GOLF_HANDICAP_INDEX_MAX) {
    return {
      ok: false,
      error: `Handicap index must be between ${GOLF_HANDICAP_INDEX_MIN}.0 and ${GOLF_HANDICAP_INDEX_MAX}.0`,
    };
  }
  return { ok: true, value: oneDecimal(value) };
}

export function formatGolfHandicapIndex(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) return "";
  return oneDecimal(value).toFixed(1);
}

export function parseOptionalGolfHandicapIndex(
  raw: unknown,
): number | null | undefined {
  if (raw === undefined) return undefined;
  const parsed = parseGolfHandicapIndex(raw);
  return parsed.ok ? parsed.value : undefined;
}

function parseCourseRating(raw: unknown): number | null {
  if (!isFiniteNumber(raw)) return null;
  if (raw < COURSE_RATING_MIN || raw > COURSE_RATING_MAX) return null;
  return oneDecimal(raw);
}

function parseSlopeRating(raw: unknown): number | null {
  if (!isFiniteNumber(raw) || !Number.isInteger(raw)) return null;
  if (raw < SLOPE_RATING_MIN || raw > SLOPE_RATING_MAX) return null;
  return raw;
}

function parseTeePar(raw: unknown): number | null {
  if (!isFiniteNumber(raw) || !Number.isInteger(raw)) return null;
  if (raw < TEE_PAR_MIN || raw > TEE_PAR_MAX) return null;
  return raw;
}

function parseTeeId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value.length > 0 && value.length <= 80 ? value : null;
}

export function cmsTeeSlopeRating(
  tee: Pick<GolfCourseCmsTee, "slopeRating" | "slope"> | null | undefined,
): number | null {
  return parseSlopeRating(tee?.slopeRating ?? tee?.slope ?? null);
}

export function normalizeTeeRatings(
  input: GolfTeeRatings | null | undefined,
): GolfTeeRatings {
  return {
    teeId: parseTeeId(input?.teeId),
    courseRating: parseCourseRating(input?.courseRating),
    slopeRating: parseSlopeRating(input?.slopeRating),
    teePar: parseTeePar(input?.teePar),
  };
}

export function teeRatingsAreComplete(
  ratings: GolfTeeRatings | null | undefined,
): boolean {
  const normalized = normalizeTeeRatings(ratings);
  return (
    normalized.courseRating != null &&
    normalized.slopeRating != null &&
    normalized.teePar != null
  );
}

/**
 * Nested `tee` object (preferred) plus top-level mirrors.
 * Omits invalid / missing ratings — never invents numbers.
 */
export function toGolfTeeRatingsPayload(
  input: GolfTeeRatings | null | undefined,
): GolfTeeRatingsPayload {
  const ratings = normalizeTeeRatings(input);
  const tee: GolfTeeRatingsPayload["tee"] = {};
  if (ratings.teeId) tee.id = ratings.teeId;
  if (ratings.courseRating != null) tee.courseRating = ratings.courseRating;
  if (ratings.slopeRating != null) tee.slopeRating = ratings.slopeRating;
  if (ratings.teePar != null) tee.par = ratings.teePar;

  const payload: GolfTeeRatingsPayload = { tee };
  if (ratings.courseRating != null) payload.courseRating = ratings.courseRating;
  if (ratings.slopeRating != null) payload.slopeRating = ratings.slopeRating;
  if (ratings.teePar != null) payload.teePar = ratings.teePar;
  return payload;
}

export function mergeTeeRatingsInput(
  input: GolfTeeRatingsInput | null | undefined,
): GolfTeeRatings {
  const nested = input?.tee;
  return normalizeTeeRatings({
    teeId: nested?.id ?? nested?.teeId ?? input?.teeId ?? null,
    courseRating:
      nested?.courseRating ?? input?.courseRating ?? null,
    slopeRating: nested?.slopeRating ?? input?.slopeRating ?? null,
    teePar: nested?.par ?? nested?.teePar ?? input?.teePar ?? null,
  });
}

export type GolfCmsTeeOption = {
  name: string;
  color: string | null;
  id: string | null;
  courseRating: number | null;
  slopeRating: number | null;
  par: number | null;
};

function cmsTeeOption(
  tee: GolfCourseCmsTee,
  fallbackPar: number | null,
): GolfCmsTeeOption | null {
  const name = tee?.name?.trim();
  if (!name) return null;
  return {
    name,
    color: tee.color?.trim() || null,
    id: parseTeeId(tee.name),
    courseRating: parseCourseRating(tee.courseRating),
    slopeRating: cmsTeeSlopeRating(tee),
    par: parseTeePar(tee.par ?? fallbackPar),
  };
}

export function cmsTeeOptions(
  course: GolfCourseCms | null | undefined,
): GolfCmsTeeOption[] {
  const fallbackPar = parseTeePar(course?.parTotal);
  const options: GolfCmsTeeOption[] = [];
  const seen = new Set<string>();
  for (const tee of course?.tees ?? []) {
    const option = cmsTeeOption(tee, fallbackPar);
    if (!option) continue;
    const key = option.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(option);
  }
  return options;
}

export function selectedCmsTee(
  course: GolfCourseCms | null | undefined,
  teeName: string | null | undefined,
): GolfCmsTeeOption | null {
  const key = teeName?.trim().toLowerCase();
  if (!key) return null;
  return (
    cmsTeeOptions(course).find((tee) => tee.name.toLowerCase() === key) ?? null
  );
}

export function teeRatingsFromCms(
  course: GolfCourseCms | null | undefined,
  teeName: string | null | undefined,
  holeParTotal?: number | null,
): GolfTeeRatings {
  const selected = selectedCmsTee(course, teeName);
  const fallbackPar =
    parseTeePar(selected?.par) ??
    parseTeePar(course?.parTotal) ??
    parseTeePar(holeParTotal ?? null);
  if (!selected) {
    return normalizeTeeRatings({
      teeId: null,
      courseRating: null,
      slopeRating: null,
      teePar: fallbackPar,
    });
  }
  return normalizeTeeRatings({
    teeId: selected.id,
    courseRating: selected.courseRating,
    slopeRating: selected.slopeRating,
    teePar: fallbackPar,
  });
}

export function playerHasPlayingHandicap(
  player: Pick<GolfPlayer, "playingHandicap"> | null | undefined,
): boolean {
  return (
    typeof player?.playingHandicap === "number" &&
    Number.isFinite(player.playingHandicap)
  );
}

export function anyPlayerHasPlayingHandicap(
  players: readonly Pick<GolfPlayer, "playingHandicap">[] | null | undefined,
): boolean {
  return (players ?? []).some(playerHasPlayingHandicap);
}

export function holeHasStrokeIndex(
  hole: Pick<GolfCourseHole, "strokeIndex"> | null | undefined,
): boolean {
  return (
    typeof hole?.strokeIndex === "number" &&
    Number.isInteger(hole.strokeIndex) &&
    hole.strokeIndex >= 1 &&
    hole.strokeIndex <= 18
  );
}

export function holesHaveStrokeIndexes(
  holes: readonly Pick<GolfCourseHole, "strokeIndex">[] | null | undefined,
): boolean {
  const list = holes ?? [];
  return list.length > 0 && list.every(holeHasStrokeIndex);
}

export type GrossOnlyReason =
  | "missing-hi"
  | "missing-ratings"
  | "guest"
  | "no-ph";

export type GrossOnlyContext = {
  handicapIndex?: number | null;
  ratings?: GolfTeeRatings | null;
  isGuest?: boolean;
  playingHandicap?: number | null;
  signedIn?: boolean;
};

/**
 * Honest reasons the UI must stay gross-only. Never invent CR / slope / HI.
 */
export function golfGrossOnlyReasons(
  context: GrossOnlyContext,
): GrossOnlyReason[] {
  const reasons: GrossOnlyReason[] = [];
  if (context.isGuest) reasons.push("guest");
  if (
    context.signedIn !== false &&
    !context.isGuest &&
    (context.handicapIndex === null || context.handicapIndex === undefined)
  ) {
    reasons.push("missing-hi");
  }
  if (!teeRatingsAreComplete(context.ratings)) {
    reasons.push("missing-ratings");
  }
  if (
    context.playingHandicap !== undefined &&
    !playerHasPlayingHandicap({ playingHandicap: context.playingHandicap })
  ) {
    reasons.push("no-ph");
  }
  return [...new Set(reasons)];
}

export function golfGrossOnlyBanner(
  reasons: readonly GrossOnlyReason[],
): string | null {
  if (reasons.length === 0) return null;
  const parts: string[] = [];
  if (reasons.includes("guest")) {
    parts.push("Guests play gross-only");
  }
  if (reasons.includes("missing-hi")) {
    parts.push("No handicap index");
  }
  if (reasons.includes("missing-ratings")) {
    parts.push("This tee has no course or slope rating");
  }
  if (
    reasons.includes("no-ph") &&
    !reasons.includes("missing-hi") &&
    !reasons.includes("missing-ratings") &&
    !reasons.includes("guest")
  ) {
    parts.push("No playing handicap on this snapshot");
  }
  if (parts.length === 0) return "Scoring is gross-only";
  if (parts.length === 1) return `${parts[0]} — scoring is gross-only.`;
  return `${parts.join(". ")}. Scoring is gross-only.`;
}

export function roundGrossOnlyBanner(input: {
  players: readonly GolfPlayer[];
  ratings?: GolfTeeRatings | null;
}): string | null {
  if (anyPlayerHasPlayingHandicap(input.players)) return null;
  const seated = input.players.filter((player) => !player.isGuest && player.userId);
  const guestsOnly = seated.length === 0;
  return golfGrossOnlyBanner(
    golfGrossOnlyReasons({
      isGuest: guestsOnly,
      handicapIndex: seated.some(
        (player) => player.handicapIndexUsed != null,
      )
        ? 0
        : null,
      ratings: input.ratings,
      playingHandicap: null,
    }),
  );
}

/**
 * Display-only stroke allocation matching the API (hardest SI first; extras wrap).
 * Source of truth for CH/PH/net is the server snapshot — use this for SI dots
 * on the live card before lock returns `netStrokes`.
 */
export function allocateHoleStrokes(
  playingHandicap: number,
  holes: readonly Pick<GolfCourseHole, "number" | "strokeIndex">[],
): Map<number, number> {
  const allocated = new Map<number, number>();
  for (const hole of holes) {
    allocated.set(hole.number, 0);
  }
  if (playingHandicap === 0 || holes.length === 0) return allocated;

  const count = Math.abs(playingHandicap);
  const ordered = [...holes].sort((a, b) => {
    if (a.strokeIndex !== b.strokeIndex) {
      return playingHandicap > 0
        ? a.strokeIndex - b.strokeIndex
        : b.strokeIndex - a.strokeIndex;
    }
    return a.number - b.number;
  });
  const delta = playingHandicap > 0 ? 1 : -1;
  for (let index = 0; index < count; index++) {
    const hole = ordered[index % ordered.length];
    if (!hole) continue;
    allocated.set(hole.number, (allocated.get(hole.number) ?? 0) + delta);
  }
  return allocated;
}

export function strokesReceivedOnHole(
  playingHandicap: number | null | undefined,
  holes: readonly Pick<GolfCourseHole, "number" | "strokeIndex">[],
  holeNumber: number,
): number {
  if (
    typeof playingHandicap !== "number" ||
    !Number.isFinite(playingHandicap) ||
    !holesHaveStrokeIndexes(holes)
  ) {
    return 0;
  }
  return allocateHoleStrokes(playingHandicap, holes).get(holeNumber) ?? 0;
}

export function resolveHoleNet(input: {
  gross: number;
  playingHandicap?: number | null;
  holeNumber: number;
  holes: readonly Pick<GolfCourseHole, "number" | "strokeIndex">[];
  apiNetStrokes?: number | null;
}): { net: number | null; strokesReceived: number } {
  if (typeof input.apiNetStrokes === "number" && Number.isFinite(input.apiNetStrokes)) {
    return {
      net: input.apiNetStrokes,
      strokesReceived: input.gross - input.apiNetStrokes,
    };
  }
  if (
    typeof input.playingHandicap !== "number" ||
    !Number.isFinite(input.playingHandicap)
  ) {
    return { net: null, strokesReceived: 0 };
  }
  if (!holesHaveStrokeIndexes(input.holes)) {
    return { net: null, strokesReceived: 0 };
  }
  const strokesReceived = strokesReceivedOnHole(
    input.playingHandicap,
    input.holes,
    input.holeNumber,
  );
  return { net: input.gross - strokesReceived, strokesReceived };
}

export function displayNetTotal(input: {
  gross: number;
  playingHandicap?: number | null;
  apiNetTotal?: number | null;
  allHolesScored?: boolean;
  holesHaveSi?: boolean;
}): number | null {
  if (typeof input.apiNetTotal === "number" && Number.isFinite(input.apiNetTotal)) {
    return input.apiNetTotal;
  }
  if (
    typeof input.playingHandicap !== "number" ||
    !Number.isFinite(input.playingHandicap)
  ) {
    return null;
  }
  if (input.holesHaveSi) return null;
  if (input.allHolesScored === false) return null;
  return input.gross - input.playingHandicap;
}

export function handicapSnapshotLabel(player: GolfPlayer): string | null {
  if (!playerHasPlayingHandicap(player)) return null;
  const course =
    typeof player.courseHandicap === "number"
      ? String(player.courseHandicap)
      : "—";
  const playing =
    typeof player.playingHandicap === "number"
      ? String(player.playingHandicap)
      : "—";
  return `Course hcp ${course} · Playing hcp ${playing}`;
}
