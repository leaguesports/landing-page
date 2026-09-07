import type {
  GolfCourseCms,
  GolfHolesPlayed,
} from "../../types/golf-round.ts";

export const TEE_NAME_MIN = 1;
export const TEE_NAME_MAX = 40;
export const STARTING_HOLE_MIN = 1;
export const STARTING_HOLE_MAX = 18;

export type GolfTeeOption = {
  name: string;
  color: string | null;
};

export function isHolesPlayed(value: unknown): value is GolfHolesPlayed {
  return value === 9 || value === 18;
}

export function isStartingHole(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= STARTING_HOLE_MIN &&
    value <= STARTING_HOLE_MAX
  );
}

export function normalizeTeeName(
  value: string | null | undefined,
): string {
  return value?.trim() ?? "";
}

/** Live API requires teeName of 1–40 characters. */
export function isValidTeeName(value: string | null | undefined): boolean {
  const trimmed = normalizeTeeName(value);
  return trimmed.length >= TEE_NAME_MIN && trimmed.length <= TEE_NAME_MAX;
}

/**
 * Unique tee names from a Sanity `golfCourse` (order preserved).
 * Empty when the venue has no course tees — UI should fall back to free text.
 */
export function teeOptionsFromGolfCourse(
  course: GolfCourseCms | null | undefined,
): GolfTeeOption[] {
  const options: GolfTeeOption[] = [];
  const seen = new Set<string>();
  for (const tee of course?.tees ?? []) {
    const name = tee?.name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      name,
      color: tee.color?.trim() || null,
    });
  }
  return options;
}

/**
 * Consecutive hole numbers for a round. 9 from 10 → 10–18.
 * Wraps past 18 (e.g. 18 holes from 10 → 10–18 then 1–9).
 */
export function holeOrder(
  holesPlayed: GolfHolesPlayed,
  startingHole: number,
): number[] {
  if (!isHolesPlayed(holesPlayed) || !isStartingHole(startingHole)) return [];
  return Array.from({ length: holesPlayed }, (_, index) => {
    const number = startingHole + index;
    return number > 18 ? number - 18 : number;
  });
}

export function formatHoleRangeLabel(
  holesPlayed: GolfHolesPlayed,
  startingHole: number,
): string {
  const order = holeOrder(holesPlayed, startingHole);
  if (order.length === 0) return "";
  if (holesPlayed === 18 && startingHole === 1) return "Play holes 1–18";
  if (holesPlayed === 9 && startingHole === 1) return "Play holes 1–9";
  if (holesPlayed === 9 && startingHole === 10) return "Play holes 10–18";

  const wrapAt = order.findIndex(
    (number, index) => index > 0 && number < (order[index - 1] ?? 0),
  );
  if (wrapAt <= 0) {
    return `Play holes ${order[0]}–${order[order.length - 1]}`;
  }
  const first = order.slice(0, wrapAt);
  const second = order.slice(wrapAt);
  return `Play holes ${first[0]}–${first[first.length - 1]}, then ${second[0]}–${second[second.length - 1]}`;
}

/** Start / capture / organise-start stay blocked until tee + layout are set. */
export function isGolfStartReady(input: {
  teeName: string | null | undefined;
  startingHole: number;
  holesPlayed: number;
}): boolean {
  return (
    isValidTeeName(input.teeName) &&
    isStartingHole(input.startingHole) &&
    isHolesPlayed(input.holesPlayed)
  );
}

export type StartOrganisedGolfOverrides = {
  teeName: string;
  startingHole: number;
  holesPlayed: GolfHolesPlayed;
};

export function buildStartOrganisedGolfOverrides(input: {
  teeName: string | null | undefined;
  startingHole: number;
  holesPlayed: number;
}):
  | { ok: true; overrides: StartOrganisedGolfOverrides }
  | { ok: false; error: string } {
  if (!isValidTeeName(input.teeName)) {
    return { ok: false, error: "Pick a tee before starting" };
  }
  if (!isStartingHole(input.startingHole)) {
    return { ok: false, error: "Starting hole must be 1–18" };
  }
  if (!isHolesPlayed(input.holesPlayed)) {
    return { ok: false, error: "Holes played must be 9 or 18" };
  }
  return {
    ok: true,
    overrides: {
      teeName: normalizeTeeName(input.teeName),
      startingHole: input.startingHole,
      holesPlayed: input.holesPlayed,
    },
  };
}
