export const GOLF_HANDICAP_INDEX_MIN = -10;
export const GOLF_HANDICAP_INDEX_MAX = 54;

export type ParseGolfHandicapIndexResult =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

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
