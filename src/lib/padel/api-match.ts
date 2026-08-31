import { createInitialPadelMatch } from "./padelReducer.ts";
import { ensureVenueFromCmsWith } from "../venues/appVenueApi.ts";
import type {
  CreatePadelMatchInput,
  HistoryPairings,
  HistoryPlayer,
  LockPadelMatchBody,
  PadelHistoryItem,
  PadelMatch,
  PadelMatchVenue,
  PadelPairing,
  PadelPlayer,
  PadelRuleset,
  PadelTeamId,
  SetScore,
} from "../../types/padel-match.ts";

export const MATCH_API_UNAVAILABLE = "Match API is unavailable.";

export class MatchApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MatchApiError";
    this.status = status;
  }
}

export type ApiPadelPlayer = {
  userId?: string | null;
  displayName: string;
  isGuest: boolean;
  slot?: string;
};

export type CreatePadelMatchBody = {
  venueCmsId: string;
  startsAt: string;
  ruleset: PadelRuleset;
  pairings: {
    teamA: [ApiPadelPlayer, ApiPadelPlayer];
    teamB: [ApiPadelPlayer, ApiPadelPlayer];
  };
  servingTeam?: PadelTeamId;
};

export type ApiMatchSnapshot = {
  id: string;
  venueCmsId: string;
  startsAt: string;
  ruleset: PadelRuleset;
  status: "live" | "locked";
  servingTeam: PadelTeamId | null;
  pairings: {
    teamA: [ApiPadelPlayer, ApiPadelPlayer];
    teamB: [ApiPadelPlayer, ApiPadelPlayer];
  };
  score: { sets: unknown[] } | null;
  winner: PadelTeamId | null;
  lockedAt: string | null;
};

export function toApiPlayer(player: PadelPlayer): ApiPadelPlayer {
  if (player.isGuest || !player.userId) {
    return {
      displayName: player.displayName,
      isGuest: true,
      userId: null,
    };
  }
  return {
    userId: player.userId,
    displayName: player.displayName,
    isGuest: false,
  };
}

export function toCreateMatchBody(
  input: CreatePadelMatchInput,
): CreatePadelMatchBody {
  return {
    venueCmsId: input.venueCmsId,
    startsAt: input.startsAt,
    ruleset: input.ruleset,
    pairings: {
      teamA: [
        toApiPlayer(input.pairings.teamA[0]),
        toApiPlayer(input.pairings.teamA[1]),
      ],
      teamB: [
        toApiPlayer(input.pairings.teamB[0]),
        toApiPlayer(input.pairings.teamB[1]),
      ],
    },
    ...(input.servingTeam ? { servingTeam: input.servingTeam } : {}),
  };
}

export function toDatetimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function datetimeLocalToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function fromApiPlayer(player: ApiPadelPlayer, index: number): PadelPlayer {
  const isGuest = Boolean(player.isGuest) || !player.userId;
  const displayName = player.displayName?.trim() || (isGuest ? "Guest" : "Player");
  const slot = player.slot?.trim();
  return {
    id: player.userId || slot || `guest_${index}_${displayName.toLowerCase().replace(/\s+/g, "_")}`,
    displayName,
    isGuest,
    userId: player.userId ?? null,
  };
}

function isApiPlayer(value: unknown): value is ApiPadelPlayer {
  if (!value || typeof value !== "object") return false;
  const p = value as ApiPadelPlayer;
  return typeof p.displayName === "string";
}

function parsePairings(value: unknown): PadelPairing | null {
  if (!value || typeof value !== "object") return null;
  const p = value as { teamA?: unknown; teamB?: unknown };
  if (!Array.isArray(p.teamA) || !Array.isArray(p.teamB)) return null;
  if (p.teamA.length !== 2 || p.teamB.length !== 2) return null;
  if (!p.teamA.every(isApiPlayer) || !p.teamB.every(isApiPlayer)) return null;
  return {
    teamA: [fromApiPlayer(p.teamA[0], 0), fromApiPlayer(p.teamA[1], 1)],
    teamB: [fromApiPlayer(p.teamB[0], 2), fromApiPlayer(p.teamB[1], 3)],
  };
}

function parseVenue(value: unknown): PadelMatchVenue | null {
  if (!value || typeof value !== "object") return null;
  const v = value as PadelMatchVenue;
  if (typeof v.id !== "string" || typeof v.name !== "string") return null;
  return {
    id: v.id,
    slug: typeof v.slug === "string" ? v.slug : "",
    name: v.name,
    suburb: v.suburb ?? null,
    city: v.city ?? null,
    latitude: v.latitude ?? null,
    longitude: v.longitude ?? null,
  };
}

function isLiveSnapshot(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "string" &&
    value.sport === "padel" &&
    Boolean(value.pairings) &&
    Boolean(value.game) &&
    Array.isArray(value.sets)
  );
}

function parseTieBreak(
  value: unknown,
): { pointsA: number; pointsB: number } | null {
  if (!value || typeof value !== "object") return null;
  const tb = value as { pointsA?: unknown; pointsB?: unknown };
  if (typeof tb.pointsA !== "number" || typeof tb.pointsB !== "number") {
    return null;
  }
  return { pointsA: tb.pointsA, pointsB: tb.pointsB };
}

function parseSetScores(value: unknown): SetScore[] | null {
  if (!value || typeof value !== "object") return null;
  const score = value as { sets?: unknown };
  if (!Array.isArray(score.sets) || score.sets.length === 0) return null;

  const sets: SetScore[] = [];
  for (const raw of score.sets) {
    if (!raw || typeof raw !== "object") return null;
    const s = raw as {
      gamesA?: unknown;
      gamesB?: unknown;
      tieBreak?: unknown;
      winner?: unknown;
    };
    if (typeof s.gamesA !== "number" || typeof s.gamesB !== "number") {
      return null;
    }
    sets.push({
      gamesA: s.gamesA,
      gamesB: s.gamesB,
      tieBreak: parseTieBreak(s.tieBreak),
      winner: s.winner === "A" || s.winner === "B" ? s.winner : null,
    });
  }
  return sets;
}

function applyLockedResult(
  match: PadelMatch,
  row: Record<string, unknown>,
): void {
  const sets = parseSetScores(row.score);
  if (sets) {
    match.sets = sets;
    match.currentSetIndex = Math.max(0, sets.length - 1);
  }
  if (row.winner === "A" || row.winner === "B") {
    match.winner = row.winner;
  }
  if (typeof row.lockedAt === "string" && row.lockedAt) {
    match.lockedAt = row.lockedAt;
  }
}

function parseHistoryPlayer(
  value: unknown,
  index: number,
): HistoryPlayer | null {
  if (!isApiPlayer(value)) return null;
  const player = fromApiPlayer(value, index);
  return {
    slot: value.slot?.trim() || undefined,
    userId: player.userId ?? null,
    displayName: player.displayName,
    isGuest: player.isGuest,
  };
}

function parseHistoryPairings(value: unknown): HistoryPairings | null {
  if (!value || typeof value !== "object") return null;
  const p = value as { teamA?: unknown; teamB?: unknown };
  if (!Array.isArray(p.teamA) || !Array.isArray(p.teamB)) return null;
  if (p.teamA.length !== 2 || p.teamB.length !== 2) return null;
  const teamA = [
    parseHistoryPlayer(p.teamA[0], 0),
    parseHistoryPlayer(p.teamA[1], 1),
  ];
  const teamB = [
    parseHistoryPlayer(p.teamB[0], 2),
    parseHistoryPlayer(p.teamB[1], 3),
  ];
  if (!teamA[0] || !teamA[1] || !teamB[0] || !teamB[1]) return null;
  return { teamA: [teamA[0], teamA[1]], teamB: [teamB[0], teamB[1]] };
}

function parseHistoryOpponents(
  value: unknown,
  pairings: HistoryPairings | null,
): HistoryPlayer[] | HistoryPairings | null {
  if (Array.isArray(value)) {
    const players = value
      .map((player, i) => parseHistoryPlayer(player, i))
      .filter((player): player is HistoryPlayer => player !== null);
    return players.length > 0 ? players : null;
  }
  return parseHistoryPairings(value) ?? pairings;
}

export function parseHistoryItem(value: unknown): PadelHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;

  const pairings = parseHistoryPairings(row.pairings);
  const opponents = parseHistoryOpponents(row.opponents, pairings);
  if (!opponents) return null;

  const venueCmsId =
    typeof row.venueCmsId === "string" && row.venueCmsId.trim()
      ? row.venueCmsId.trim()
      : "";
  const venueName =
    typeof row.venueName === "string" && row.venueName.trim()
      ? row.venueName.trim()
      : null;
  const venueSlug =
    typeof row.venueSlug === "string" && row.venueSlug.trim()
      ? row.venueSlug.trim()
      : null;
  const startsAt =
    typeof row.startsAt === "string" && row.startsAt
      ? row.startsAt
      : "";
  const sets = parseSetScores(row.score);

  return {
    id: row.id,
    startsAt,
    venueCmsId,
    venueName,
    venueSlug,
    pairings: pairings ?? { teamA: [], teamB: [] },
    opponents,
    score: sets
      ? {
          sets: sets.map((set) => ({
            gamesA: set.gamesA,
            gamesB: set.gamesB,
            tieBreak: set.tieBreak ?? null,
            winner: set.winner,
          })),
        }
      : null,
    winner: row.winner === "A" || row.winner === "B" ? row.winner : null,
  };
}

function parseHistoryList(value: unknown): PadelHistoryItem[] | null {
  if (!Array.isArray(value)) return null;
  const items: PadelHistoryItem[] = [];
  for (const row of value) {
    const item = parseHistoryItem(row);
    if (!item) return null;
    items.push(item);
  }
  return items;
}

export function parseApiMatch(
  value: unknown,
  fallback?: { venue?: PadelMatchVenue | null },
): PadelMatch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;

  if (isLiveSnapshot(row)) {
    return row as unknown as PadelMatch;
  }

  const ruleset = row.ruleset as PadelRuleset | undefined;
  if (ruleset !== "golden_point" && ruleset !== "advantage") return null;

  const pairings = parsePairings(row.pairings);
  if (!pairings) return null;

  const venueCmsId =
    typeof row.venueCmsId === "string" && row.venueCmsId.trim()
      ? row.venueCmsId.trim()
      : "";
  const venue =
    parseVenue(row.venue) ??
    fallback?.venue ??
    (venueCmsId
      ? {
          id: venueCmsId,
          slug: "",
          name: "",
          suburb: null,
          city: null,
          latitude: null,
          longitude: null,
        }
      : null);

  const servingTeam: PadelTeamId = row.servingTeam === "B" ? "B" : "A";
  const startsAt =
    typeof row.startsAt === "string" && row.startsAt
      ? row.startsAt
      : undefined;

  const match = createInitialPadelMatch({
    id: row.id,
    ruleset,
    venue,
    pairings,
    servingTeam,
    startsAt,
    venueCmsId: venueCmsId || venue?.id || undefined,
  });

  if (row.status === "locked" || row.status === "finalized") {
    match.status = "finalized";
  } else if (row.status === "live") {
    match.status = "live";
  }

  applyLockedResult(match, row);

  return match;
}

export function matchWinner(match: PadelMatch): PadelTeamId | null {
  if (match.winner === "A" || match.winner === "B") return match.winner;
  const a = match.sets.filter((s) => s.winner === "A").length;
  const b = match.sets.filter((s) => s.winner === "B").length;
  if (a > b) return "A";
  if (b > a) return "B";
  return null;
}

/**
 * Map live scorecard state into the lock contract.
 * `tieBreak` is always `null` (not omitted) so idempotent locks compare equal.
 */
export function toLockMatchBody(match: PadelMatch): LockPadelMatchBody | null {
  const winner = matchWinner(match);
  if (!winner || match.sets.length === 0) return null;

  return {
    score: {
      sets: match.sets.map((set) => ({
        gamesA: set.gamesA,
        gamesB: set.gamesB,
        tieBreak: set.tieBreak
          ? {
              pointsA: set.tieBreak.pointsA,
              pointsB: set.tieBreak.pointsB,
            }
          : null,
        winner: set.winner === "A" || set.winner === "B" ? set.winner : null,
      })),
    },
    winner,
  };
}

/** Locked API identity wins over a newer Ably live score. */
export function preferMatchSnapshot(
  fromApi: PadelMatch | null,
  fromAbly: PadelMatch | null,
): PadelMatch | null {
  if (fromApi?.lockedAt) return fromApi;
  if (fromApi && fromAbly) {
    return fromAbly.version >= fromApi.version ? fromAbly : fromApi;
  }
  return fromApi ?? fromAbly;
}

export type CreatePadelMatchDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
};

export type LockPadelMatchDeps = CreatePadelMatchDeps & {
  venue?: PadelMatchVenue | null;
};

function jsonError(status: number, body: unknown): MatchApiError {
  const message =
    body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "";
  if (status === 409) {
    return new MatchApiError(
      409,
      message || "Match is already locked with a different result",
    );
  }
  if (status === 404 && /venue not found/i.test(message)) {
    return new MatchApiError(404, message);
  }
  if (status === 404 && /match not found/i.test(message)) {
    return new MatchApiError(404, message);
  }
  if (status === 400 && message) {
    return new MatchApiError(400, message);
  }
  if (status === 503 && message) {
    return new MatchApiError(503, message);
  }
  if (
    status === 0 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 405 ||
    status === 501 ||
    status === 502 ||
    status === 503
  ) {
    return new MatchApiError(status || 503, MATCH_API_UNAVAILABLE);
  }
  return new MatchApiError(status, message || "Match request failed");
}

/**
 * Ensure the court exists (GET, PUT { name, slug } only on 404), then
 * POST /api/matches. Does not mint an Ably id.
 */
export async function createPadelMatchWith(
  input: CreatePadelMatchInput,
  venue: Pick<PadelMatchVenue, "name" | "slug">,
  deps: CreatePadelMatchDeps,
): Promise<PadelMatch> {
  const name = venue.name.trim();
  const slug = venue.slug.trim();
  if (!input.venueCmsId.trim() || !name || !slug || !deps.baseUrl) {
    throw new MatchApiError(503, MATCH_API_UNAVAILABLE);
  }

  const ensured = await ensureVenueFromCmsWith(
    { cmsId: input.venueCmsId, name, slug },
    {
      fetch: deps.fetch,
      baseUrl: deps.baseUrl,
      cookie: deps.cookie,
    },
  );
  if (!ensured) {
    throw new MatchApiError(503, MATCH_API_UNAVAILABLE);
  }

  const body = toCreateMatchBody(input);
  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await deps.fetch(`${deps.baseUrl.replace(/\/$/, "")}/api/matches`, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new MatchApiError(0, MATCH_API_UNAVAILABLE);
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const match = parseApiMatch(payload, {
    venue: {
      id: input.venueCmsId,
      name,
      slug,
    },
  });
  if (!match?.id) {
    throw new MatchApiError(502, "Match API did not return a match id");
  }
  return match;
}

/**
 * POST /api/matches/:id/lock. Identity is league-sports-api; does not mint an id.
 * Browser callers use same-origin `/api` (Railway proxy). Server uses
 * `getRailwayApiOrigin()`.
 */
export async function lockPadelMatchWith(
  matchId: string,
  body: LockPadelMatchBody,
  deps: LockPadelMatchDeps,
): Promise<PadelMatch> {
  const id = matchId.trim();
  if (!id || !deps.baseUrl) {
    throw new MatchApiError(503, MATCH_API_UNAVAILABLE);
  }

  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await deps.fetch(
      `${deps.baseUrl.replace(/\/$/, "")}/api/matches/${encodeURIComponent(id)}/lock`,
      {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers,
        body: JSON.stringify(body),
      },
    );
  } catch {
    throw new MatchApiError(0, MATCH_API_UNAVAILABLE);
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const match = parseApiMatch(payload, { venue: deps.venue ?? null });
  if (!match?.id) {
    throw new MatchApiError(502, "Match API did not return a locked match");
  }
  return match;
}

async function fetchHistoryList(
  path: string,
  deps: CreatePadelMatchDeps,
): Promise<PadelHistoryItem[]> {
  if (!deps.baseUrl) {
    throw new MatchApiError(503, MATCH_API_UNAVAILABLE);
  }

  let res: Response;
  try {
    const headers: Record<string, string> = {};
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await deps.fetch(`${deps.baseUrl.replace(/\/$/, "")}${path}`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers,
    });
  } catch {
    throw new MatchApiError(0, MATCH_API_UNAVAILABLE);
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const items = parseHistoryList(payload);
  if (!items) {
    throw new MatchApiError(502, "Match API did not return history");
  }
  return items;
}

/**
 * GET /api/matches?playerUserId= — locked matches for a named account.
 * 400 without playerUserId. Guests have no player history list.
 */
export async function listPlayerHistoryWith(
  playerUserId: string,
  deps: CreatePadelMatchDeps,
): Promise<PadelHistoryItem[]> {
  const userId = playerUserId.trim();
  if (!userId) {
    throw new MatchApiError(400, "playerUserId is required");
  }
  return fetchHistoryList(
    `/api/matches?playerUserId=${encodeURIComponent(userId)}`,
    deps,
  );
}

/**
 * GET /api/venues/:cmsId/matches — locked matches at that court.
 * Unknown cmsId is 200 [].
 */
export async function listVenueHistoryWith(
  venueCmsId: string,
  deps: CreatePadelMatchDeps,
): Promise<PadelHistoryItem[]> {
  const cmsId = venueCmsId.trim();
  if (!cmsId) {
    throw new MatchApiError(400, "venue cmsId is required");
  }
  return fetchHistoryList(
    `/api/venues/${encodeURIComponent(cmsId)}/matches`,
    deps,
  );
}

