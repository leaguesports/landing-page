import { HUB_PLAY_HREF, hubPlaySportHref } from "../sports/hub-ia.ts";
import type {
  VenueLeaderboardBoard,
  VenueLeaderboardEntry,
  VenueLeaderboardRecords,
  VenueLeaderboardResponse,
  VenueLeaderboardWindow,
} from "./types.ts";
import {
  VENUE_LEADERBOARD_BOARDS,
  VENUE_LEADERBOARD_WINDOWS,
} from "./types.ts";

export const VENUE_LEADERBOARD_EMPTY_COPY =
  "Play and lock a game here to open this board." as const;

export const VENUE_LEADERBOARD_EMPTY_CTA = "Start" as const;

export const VENUE_LEADERBOARD_OPT_OUT_LABEL =
  "Appear on venue leaderboards" as const;

export const VENUE_LEADERBOARD_TAB_LABELS: Record<
  VenueLeaderboardBoard,
  string
> = {
  records: "Records",
  potm: "Player of the month",
  grinder: "Grinder",
  streak: "Streak",
};

export const VENUE_LEADERBOARD_WINDOW_LABELS: Record<
  VenueLeaderboardWindow,
  string
> = {
  month: "Month",
  all: "All-time",
};

const PLAYABLE_SPORTS = new Set(["padel", "golf", "darts"]);

export function isVenueLeaderboardBoard(
  value: unknown,
): value is VenueLeaderboardBoard {
  return (
    typeof value === "string" &&
    (VENUE_LEADERBOARD_BOARDS as readonly string[]).includes(value)
  );
}

export function isVenueLeaderboardWindow(
  value: unknown,
): value is VenueLeaderboardWindow {
  return (
    typeof value === "string" &&
    (VENUE_LEADERBOARD_WINDOWS as readonly string[]).includes(value)
  );
}

export function parseBoardQuery(value: unknown): VenueLeaderboardBoard | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return isVenueLeaderboardBoard(trimmed) ? trimmed : null;
}

export function parseWindowQuery(
  value: unknown,
): VenueLeaderboardWindow | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return isVenueLeaderboardWindow(trimmed) ? trimmed : null;
}

function firstQueryValue(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/**
 * Read `?board=` from a query string, URLSearchParams, or Next.js
 * `searchParams` object (`{ board: "grinder" }`).
 */
export function parseBoardFromSearch(
  search:
    | string
    | URLSearchParams
    | { get: (name: string) => string | null }
    | Record<string, unknown>
    | null
    | undefined,
): VenueLeaderboardBoard | null {
  if (!search) return null;
  if (typeof search === "string") {
    const q = search.startsWith("?") ? search.slice(1) : search;
    return parseBoardQuery(new URLSearchParams(q).get("board"));
  }
  if (typeof (search as { get?: unknown }).get === "function") {
    return parseBoardQuery(
      (search as { get: (name: string) => string | null }).get("board"),
    );
  }
  return parseBoardQuery(
    firstQueryValue((search as Record<string, unknown>).board),
  );
}

export function parseWindowFromSearch(
  search:
    | string
    | URLSearchParams
    | { get: (name: string) => string | null }
    | Record<string, unknown>
    | null
    | undefined,
): VenueLeaderboardWindow | null {
  if (!search) return null;
  if (typeof search === "string") {
    const q = search.startsWith("?") ? search.slice(1) : search;
    return parseWindowQuery(new URLSearchParams(q).get("window"));
  }
  if (typeof (search as { get?: unknown }).get === "function") {
    return parseWindowQuery(
      (search as { get: (name: string) => string | null }).get("window"),
    );
  }
  return parseWindowQuery(
    firstQueryValue((search as Record<string, unknown>).window),
  );
}

export function emptyRecords(): VenueLeaderboardRecords {
  return {
    golf: { bestGrossByTee: [], bestNetByTee: [] },
    padel: { mostWins: [], bestWinStreak: [] },
    darts: { mostWins: [], bestWinStreak: [] },
  };
}

export function isRecordsPayloadEmpty(
  records: VenueLeaderboardRecords | null | undefined,
): boolean {
  if (!records) return true;
  return (
    records.golf.bestGrossByTee.length === 0 &&
    records.golf.bestNetByTee.length === 0 &&
    records.padel.mostWins.length === 0 &&
    records.padel.bestWinStreak.length === 0 &&
    records.darts.mostWins.length === 0 &&
    records.darts.bestWinStreak.length === 0
  );
}

export function isVenueLeaderboardEmpty(
  payload: Pick<VenueLeaderboardResponse, "first" | "entries" | "records" | "board">
    | null
    | undefined,
): boolean {
  if (!payload) return true;
  if (payload.board === "records" || payload.records) {
    const rankedEmpty = !payload.first && payload.entries.length === 0;
    return rankedEmpty && isRecordsPayloadEmpty(payload.records);
  }
  return !payload.first && payload.entries.length === 0;
}

export type VisibleVenueLeaderboardTabs = {
  records: boolean;
  potm: boolean;
  grinder: boolean;
  streak: boolean;
};

export type VenueLeaderboardProbe = {
  records?: Pick<
    VenueLeaderboardResponse,
    "first" | "entries" | "records" | "board"
  > | null;
  potm?: Pick<VenueLeaderboardResponse, "first" | "entries" | "board"> | null;
  grinderMonth?: Pick<
    VenueLeaderboardResponse,
    "first" | "entries" | "board"
  > | null;
  grinderAll?: Pick<
    VenueLeaderboardResponse,
    "first" | "entries" | "board"
  > | null;
  streak?: Pick<VenueLeaderboardResponse, "first" | "entries" | "board"> | null;
};

/** Hide tabs whose API lists are empty (200 + empty, not 404). */
export function visibleVenueLeaderboardTabs(
  probe: VenueLeaderboardProbe,
): VisibleVenueLeaderboardTabs {
  return {
    records: !isVenueLeaderboardEmpty(
      probe.records
        ? { ...probe.records, board: probe.records.board ?? "records" }
        : null,
    ),
    potm: !isVenueLeaderboardEmpty(
      probe.potm ? { ...probe.potm, board: probe.potm.board ?? "potm" } : null,
    ),
    grinder:
      !isVenueLeaderboardEmpty(
        probe.grinderMonth
          ? { ...probe.grinderMonth, board: "grinder" }
          : null,
      ) ||
      !isVenueLeaderboardEmpty(
        probe.grinderAll ? { ...probe.grinderAll, board: "grinder" } : null,
      ),
    streak: !isVenueLeaderboardEmpty(
      probe.streak
        ? { ...probe.streak, board: probe.streak.board ?? "streak" }
        : null,
    ),
  };
}

export function visibleBoardIds(
  tabs: VisibleVenueLeaderboardTabs,
): VenueLeaderboardBoard[] {
  return VENUE_LEADERBOARD_BOARDS.filter((board) => tabs[board]);
}

/**
 * Deep link `?board=grinder` selects that tab when it is present and
 * non-empty. Otherwise the first non-empty tab (Records → POTM → Grinder →
 * Streak). `null` when every board is empty.
 */
export function selectVenueLeaderboardTab(
  requested: VenueLeaderboardBoard | null | undefined,
  tabs: VisibleVenueLeaderboardTabs,
): VenueLeaderboardBoard | null {
  const visible = visibleBoardIds(tabs);
  if (visible.length === 0) return null;
  if (requested && tabs[requested]) return requested;
  return visible[0] ?? null;
}

/**
 * Grinder Month | All-time. Prefer the requested window when that list has
 * rows; otherwise fall back to the non-empty window so the tab is usable.
 */
export function selectGrinderWindow(
  requested: VenueLeaderboardWindow | null | undefined,
  monthEmpty: boolean,
  allEmpty: boolean,
): VenueLeaderboardWindow {
  const preferred = requested ?? "month";
  if (preferred === "month" && !monthEmpty) return "month";
  if (preferred === "all" && !allEmpty) return "all";
  if (!monthEmpty) return "month";
  if (!allEmpty) return "all";
  return preferred;
}

export function venueLeaderboardPlayHref(
  sportSlug?: string | null,
): string {
  const sport = sportSlug?.trim().toLowerCase() ?? "";
  if (PLAYABLE_SPORTS.has(sport)) return hubPlaySportHref(sport);
  return HUB_PLAY_HREF;
}

export function venueLeaderboardQuery(input: {
  board: VenueLeaderboardBoard;
  window?: VenueLeaderboardWindow | null;
}): string {
  const params = new URLSearchParams({ board: input.board });
  if (input.board === "grinder") {
    params.set("window", input.window ?? "month");
  }
  return params.toString();
}

/** Ranked rows with `#1` first, de-duplicated when `entries` already includes it. */
export function listedVenueLeaderboardEntries(
  first: VenueLeaderboardEntry | null | undefined,
  entries: VenueLeaderboardEntry[] | null | undefined,
): VenueLeaderboardEntry[] {
  const rows = entries ?? [];
  if (!first) return rows;
  if (rows.some((row) => row.userId === first.userId)) return rows;
  return [first, ...rows];
}

export function formatVenueLeaderboardStats(
  stats: VenueLeaderboardEntry["stats"] | undefined,
): string {
  if (!stats) return "";
  const parts: string[] = [];

  if (typeof stats.wins === "number") {
    parts.push(`${stats.wins} ${stats.wins === 1 ? "win" : "wins"}`);
  }
  if (typeof stats.streak === "number") {
    parts.push(
      `${stats.streak}-win streak`,
    );
  }
  if (typeof stats.netAverage === "number") {
    parts.push(`${stats.netAverage} net avg`);
  }
  if (typeof stats.score === "number") {
    parts.push(String(stats.score));
  }
  if (typeof stats.netRounds === "number") {
    parts.push(
      `${stats.netRounds} ${stats.netRounds === 1 ? "net round" : "net rounds"}`,
    );
  }
  if (typeof stats.events === "number") {
    parts.push(
      `${stats.events} ${stats.events === 1 ? "game" : "games"}`,
    );
  }

  return parts.join(" · ");
}

export function formatGolfTeeLabel(
  record: { teeName: string | null; teeId: string | null },
): string {
  const name = record.teeName?.trim();
  if (name) return name;
  const id = record.teeId?.trim();
  if (id) return id;
  return "Tee";
}

export function appearOnVenueLeaderboardsPutBody(
  appear: boolean,
): { appearOnVenueLeaderboards: boolean } {
  return { appearOnVenueLeaderboards: appear };
}
