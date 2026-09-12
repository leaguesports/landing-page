import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { venueLeaderboardQuery } from "./boards.ts";
import type {
  VenueLeaderboardBoard,
  VenueLeaderboardEntry,
  VenueLeaderboardGolfTeeRecord,
  VenueLeaderboardRecords,
  VenueLeaderboardResponse,
  VenueLeaderboardResult,
  VenueLeaderboardStats,
  VenueLeaderboardWindow,
} from "./types.ts";
import {
  VENUE_LEADERBOARD_BOARDS,
  VENUE_LEADERBOARD_WINDOWS,
} from "./types.ts";

export type VenueLeaderboardDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

function requestHeaders(cookie?: string): HeadersInit {
  const headers: Record<string, string> = {};
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function leaderboardsUrl(
  baseUrl: string,
  venueId: string,
  board: VenueLeaderboardBoard,
  window?: VenueLeaderboardWindow | null,
): string {
  const query = venueLeaderboardQuery({ board, window });
  return `${baseUrl.replace(/\/$/, "")}/api/venues/${encodeURIComponent(venueId)}/leaderboards?${query}`;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function apiError(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

function parseStats(value: unknown): VenueLeaderboardStats {
  if (!value || typeof value !== "object") return {};
  const out: VenueLeaderboardStats = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (
      typeof raw === "number" ||
      typeof raw === "string" ||
      raw === null
    ) {
      out[key] = raw;
    }
  }
  return out;
}

function parseEntry(value: unknown): VenueLeaderboardEntry | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.userId !== "string" || !row.userId.trim()) return null;
  if (typeof row.displayName !== "string") return null;
  const rank =
    typeof row.rank === "number" && Number.isFinite(row.rank) ? row.rank : 0;
  return {
    rank,
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
    stats: parseStats(row.stats),
  };
}

function parseEntries(value: unknown): VenueLeaderboardEntry[] {
  if (!Array.isArray(value)) return [];
  const out: VenueLeaderboardEntry[] = [];
  for (const item of value) {
    const entry = parseEntry(item);
    if (entry) out.push(entry);
  }
  return out;
}

function parseGolfTeeRecord(
  value: unknown,
): VenueLeaderboardGolfTeeRecord | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.userId !== "string" || !row.userId.trim()) return null;
  if (typeof row.displayName !== "string") return null;
  return {
    teeId: typeof row.teeId === "string" ? row.teeId : null,
    teeName: typeof row.teeName === "string" ? row.teeName : null,
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
    stats: parseStats(row.stats),
  };
}

function parseGolfTeeRecords(
  value: unknown,
): VenueLeaderboardGolfTeeRecord[] {
  if (!Array.isArray(value)) return [];
  const out: VenueLeaderboardGolfTeeRecord[] = [];
  for (const item of value) {
    const row = parseGolfTeeRecord(item);
    if (row) out.push(row);
  }
  return out;
}

function parseRecords(value: unknown): VenueLeaderboardRecords | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  const golf = row.golf && typeof row.golf === "object" ? row.golf : {};
  const padel = row.padel && typeof row.padel === "object" ? row.padel : {};
  const darts = row.darts && typeof row.darts === "object" ? row.darts : {};
  const golfRow = golf as Record<string, unknown>;
  const padelRow = padel as Record<string, unknown>;
  const dartsRow = darts as Record<string, unknown>;
  return {
    golf: {
      bestGrossByTee: parseGolfTeeRecords(golfRow.bestGrossByTee),
      bestNetByTee: parseGolfTeeRecords(golfRow.bestNetByTee),
    },
    padel: {
      mostWins: parseEntries(padelRow.mostWins),
      bestWinStreak: parseEntries(padelRow.bestWinStreak),
    },
    darts: {
      mostWins: parseEntries(dartsRow.mostWins),
      bestWinStreak: parseEntries(dartsRow.bestWinStreak),
    },
  };
}

export function parseVenueLeaderboardResponse(
  value: unknown,
): VenueLeaderboardResponse | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const venue = row.venue;
  if (!venue || typeof venue !== "object") return null;
  const venueRow = venue as Record<string, unknown>;
  if (
    typeof venueRow.id !== "string" ||
    typeof venueRow.cmsId !== "string" ||
    typeof venueRow.name !== "string"
  ) {
    return null;
  }
  if (
    typeof row.board !== "string" ||
    !(VENUE_LEADERBOARD_BOARDS as readonly string[]).includes(row.board)
  ) {
    return null;
  }
  if (
    typeof row.window !== "string" ||
    !(VENUE_LEADERBOARD_WINDOWS as readonly string[]).includes(row.window)
  ) {
    return null;
  }
  if (typeof row.windowKey !== "string" || typeof row.timezone !== "string") {
    return null;
  }
  if (typeof row.computedAt !== "string") return null;
  if (!Array.isArray(row.entries)) return null;

  return {
    venue: {
      id: venueRow.id,
      cmsId: venueRow.cmsId,
      name: venueRow.name,
    },
    board: row.board as VenueLeaderboardBoard,
    window: row.window as VenueLeaderboardWindow,
    windowKey: row.windowKey,
    timezone: row.timezone,
    computedAt: row.computedAt,
    first: parseEntry(row.first),
    entries: parseEntries(row.entries),
    records: parseRecords(row.records),
  };
}

export async function getVenueLeaderboardWith(
  venueId: string,
  query: {
    board: VenueLeaderboardBoard;
    window?: VenueLeaderboardWindow | null;
  },
  deps: VenueLeaderboardDeps,
): Promise<VenueLeaderboardResult> {
  const id = venueId.trim();
  if (!id) {
    return { ok: false, error: "Venue is required", status: 400 };
  }
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      leaderboardsUrl(deps.baseUrl, id, query.board, query.window),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: apiError(body, `Could not load leaderboards (${res.status})`),
        status: res.status,
      };
    }

    const board = parseVenueLeaderboardResponse(body);
    if (!board) {
      return {
        ok: false,
        error: "Unexpected leaderboard response",
        status: 500,
      };
    }
    return { ok: true, board };
  } catch {
    return { ok: false, error: "Could not reach leaderboards API", status: 0 };
  }
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function getVenueLeaderboard(
  venueId: string,
  query: {
    board: VenueLeaderboardBoard;
    window?: VenueLeaderboardWindow | null;
  },
  options: { cookie?: string } = {},
): Promise<VenueLeaderboardResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : getRailwayApiOrigin();
  return getVenueLeaderboardWith(venueId, query, {
    fetch,
    baseUrl,
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

export type VenueLeaderboardProbeResult = {
  records: VenueLeaderboardResult;
  potm: VenueLeaderboardResult;
  grinderMonth: VenueLeaderboardResult;
  grinderAll: VenueLeaderboardResult;
  streak: VenueLeaderboardResult;
};

/** Parallel probe — empty boards are 200 with empty lists, not 404. */
export async function probeVenueLeaderboardsWith(
  venueId: string,
  deps: VenueLeaderboardDeps,
): Promise<VenueLeaderboardProbeResult> {
  const [records, potm, grinderMonth, grinderAll, streak] = await Promise.all([
    getVenueLeaderboardWith(venueId, { board: "records" }, deps),
    getVenueLeaderboardWith(venueId, { board: "potm" }, deps),
    getVenueLeaderboardWith(
      venueId,
      { board: "grinder", window: "month" },
      deps,
    ),
    getVenueLeaderboardWith(venueId, { board: "grinder", window: "all" }, deps),
    getVenueLeaderboardWith(venueId, { board: "streak" }, deps),
  ]);
  return { records, potm, grinderMonth, grinderAll, streak };
}

export async function probeVenueLeaderboards(
  venueId: string,
  options: { cookie?: string } = {},
): Promise<VenueLeaderboardProbeResult> {
  if (!isApiConfigured()) {
    const missing: VenueLeaderboardResult = {
      ok: false,
      error: "API is not configured",
      status: 0,
    };
    return {
      records: missing,
      potm: missing,
      grinderMonth: missing,
      grinderAll: missing,
      streak: missing,
    };
  }
  return probeVenueLeaderboardsWith(venueId, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}
