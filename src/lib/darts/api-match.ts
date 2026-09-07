import { getLoopbackApiProxyOrigin } from "../api-origin.ts";
import { getRailwayApiOrigin } from "../api-origin.ts";
import { getSiteBaseUrl } from "../site-url.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { attemptEnsureVenueFromCmsWith } from "../venues/appVenueApi.ts";
import type {
  CreateDartsMatchInput,
  DartsHistoryItem,
  DartsMatch,
  DartsMatchVenue,
  DartsPlayer,
  DartsPlayerSlot,
  DartsTurn,
  DartsTurnInput,
} from "../../types/darts-match.ts";
import {
  DARTS_CHECKOUT_RULE,
  DARTS_MAX_PLAYERS,
  DARTS_MIN_PLAYERS,
  DARTS_STARTING_SCORE,
} from "../../types/darts-match.ts";
import {
  isValidTurnScore,
  parseDartsPlayerSlot,
  toTurnPayload,
} from "./rules.ts";

export const DARTS_API_UNAVAILABLE = "Darts API is unavailable.";
export const DARTS_API_UNREACHABLE =
  "Darts API is unreachable (network error).";
export const DARTS_API_PROXY_MISS = "Darts API proxy missed this path";
export const DARTS_API_ORIGIN_UNCONFIGURED =
  "Darts API origin is not configured";

export const CREATE_DARTS_PATH = "/api/darts" as const;
export const DARTS_TURNS_PATH = (id: string) =>
  `/api/darts/${encodeURIComponent(id)}/turns` as const;
export const DARTS_MATCH_PATH = (id: string) =>
  `/api/darts/${encodeURIComponent(id)}` as const;

export function dartsApiUnreachableMessage(
  env: NodeJS.Dict<string> = process.env,
): string {
  const origin = getLoopbackApiProxyOrigin(env);
  if (!origin) return DARTS_API_UNREACHABLE;
  return `${DARTS_API_UNREACHABLE} Start league-sports-api on ${origin} (Postgres required).`;
}

export class DartsApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "DartsApiError";
    this.status = status;
  }
}

function fetchFailureDetail(err: unknown): string {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return "";
}

function unreachableDartsApi(opts?: {
  cause?: unknown;
  url?: string;
}): never {
  const base = dartsApiUnreachableMessage();
  const detail = fetchFailureDetail(opts?.cause);
  const url = opts?.url?.trim() ?? "";
  const parts = [base];
  if (detail) parts.push(detail);
  if (url) parts.push(url);
  throw new DartsApiError(0, parts.join(" · "));
}

export type CreateDartsMatchDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
};

function apiErrorMessage(body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error.trim();
  }
  return "";
}

function looksLikeHtml(body: unknown): boolean {
  if (typeof body !== "string") return false;
  const head = body.trim().slice(0, 256).toLowerCase();
  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.includes("<html")
  );
}

function isEmptyErrorBody(body: unknown): boolean {
  if (body == null) return true;
  if (typeof body === "string") return body.trim() === "";
  if (typeof body !== "object") return false;
  return Object.keys(body as Record<string, unknown>).length === 0;
}

function statusMessage(status: number, message: string): string {
  return `${status} ${message}`;
}

export function jsonError(status: number, body: unknown): DartsApiError {
  const code = status || 503;
  const apiMessage = apiErrorMessage(body);
  if (status === 409) {
    return new DartsApiError(
      409,
      statusMessage(409, apiMessage || "Game is already locked"),
    );
  }
  if (apiMessage) {
    return new DartsApiError(code, statusMessage(code, apiMessage));
  }
  if (looksLikeHtml(body) || isEmptyErrorBody(body)) {
    return new DartsApiError(code, statusMessage(code, DARTS_API_PROXY_MISS));
  }
  if (typeof body === "string") {
    return new DartsApiError(
      code,
      statusMessage(code, body.trim().slice(0, 160)),
    );
  }
  return new DartsApiError(code, statusMessage(code, "Darts request failed"));
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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

export type ApiDartsPlayer = {
  slot: DartsPlayerSlot;
  displayName: string;
  isGuest: boolean;
  userId: string | null;
};

export type CreateDartsMatchBody = {
  venueCmsId?: string | null;
  startsAt: string;
  players: ApiDartsPlayer[];
};

function normalizeCreatePlayers(
  players: CreateDartsMatchInput["players"],
): ApiDartsPlayer[] {
  if (!Array.isArray(players) || players.length < DARTS_MIN_PLAYERS) {
    throw new DartsApiError(400, "Darts needs 2–8 seated players");
  }
  if (players.length > DARTS_MAX_PLAYERS) {
    throw new DartsApiError(400, "Darts needs 2–8 seated players");
  }

  const slots = new Set<DartsPlayerSlot>();
  return players.map((player, index) => {
    const slot = parseDartsPlayerSlot(player.slot) ?? ((index + 1) as DartsPlayerSlot);
    if (!parseDartsPlayerSlot(slot)) {
      throw new DartsApiError(400, "Player slots must be 1–8");
    }
    if (slots.has(slot)) {
      throw new DartsApiError(400, "Player slots must be unique");
    }
    slots.add(slot);
    const displayName = player.displayName.trim();
    if (!displayName) {
      throw new DartsApiError(400, `Player ${slot} needs a display name`);
    }
    const isGuest = Boolean(player.isGuest) || !player.userId;
    return {
      slot,
      displayName,
      isGuest,
      userId: isGuest ? null : (player.userId ?? null),
    };
  });
}

export function toCreateDartsMatchBody(
  input: CreateDartsMatchInput,
): CreateDartsMatchBody {
  const startsAt = input.startsAt.trim();
  if (!startsAt) {
    throw new DartsApiError(400, "startsAt is required");
  }
  const venueCmsId = input.venueCmsId?.trim() || "";
  return {
    ...(venueCmsId ? { venueCmsId } : {}),
    startsAt,
    players: normalizeCreatePlayers(input.players),
  };
}

function parsePlayer(value: unknown, index: number): DartsPlayer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const slot = parseDartsPlayerSlot(row.slot) ?? ((index + 1) as DartsPlayerSlot);
  if (!parseDartsPlayerSlot(slot)) return null;
  const displayName =
    typeof row.displayName === "string" && row.displayName.trim()
      ? row.displayName.trim()
      : "";
  if (!displayName) return null;
  const isGuest = Boolean(row.isGuest) || !row.userId;
  const remaining =
    typeof row.remaining === "number" && Number.isInteger(row.remaining)
      ? row.remaining
      : DARTS_STARTING_SCORE;
  return {
    slot,
    displayName,
    isGuest,
    userId:
      typeof row.userId === "string" && row.userId.trim()
        ? row.userId.trim()
        : null,
    remaining,
  };
}

function parseTurn(value: unknown, index: number): DartsTurn | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const playerSlot = parseDartsPlayerSlot(row.playerSlot);
  if (!playerSlot) return null;
  if (!isValidTurnScore(row.score)) return null;
  const turnNumber =
    typeof row.turnNumber === "number" && Number.isInteger(row.turnNumber)
      ? row.turnNumber
      : index + 1;
  const remainingAfter =
    typeof row.remainingAfter === "number" &&
    Number.isInteger(row.remainingAfter)
      ? row.remainingAfter
      : 0;
  return {
    turnNumber,
    playerSlot,
    score: row.score,
    bust: Boolean(row.bust),
    checkout: Boolean(row.checkout),
    remainingAfter,
  };
}

function parseVenue(value: unknown): DartsMatchVenue | null {
  if (!value || typeof value !== "object") return null;
  const v = value as DartsMatchVenue;
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

export function parseApiDartsMatch(
  value: unknown,
  fallback?: { venue?: DartsMatchVenue | null },
): DartsMatch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  if (!Array.isArray(row.players) || row.players.length < DARTS_MIN_PLAYERS) {
    return null;
  }

  const players: DartsPlayer[] = [];
  for (let i = 0; i < row.players.length; i++) {
    const player = parsePlayer(row.players[i], i);
    if (!player) return null;
    players.push(player);
  }

  const turns: DartsTurn[] = [];
  if (Array.isArray(row.turns)) {
    for (let i = 0; i < row.turns.length; i++) {
      const turn = parseTurn(row.turns[i], i);
      if (!turn) return null;
      turns.push(turn);
    }
  }

  const venueCmsId =
    typeof row.venueCmsId === "string" && row.venueCmsId.trim()
      ? row.venueCmsId.trim()
      : null;

  const winnerSlot = parseDartsPlayerSlot(row.winnerSlot);
  const nextSuggestedSlot = parseDartsPlayerSlot(row.nextSuggestedSlot);

  return {
    id: row.id,
    sport: "darts",
    venueCmsId,
    startsAt:
      typeof row.startsAt === "string" && row.startsAt ? row.startsAt : "",
    startingScore: DARTS_STARTING_SCORE,
    checkoutRule: DARTS_CHECKOUT_RULE,
    status: row.status === "locked" ? "locked" : "live",
    players,
    turns,
    winnerSlot,
    winnerUserId:
      typeof row.winnerUserId === "string" && row.winnerUserId.trim()
        ? row.winnerUserId.trim()
        : null,
    lockedAt:
      typeof row.lockedAt === "string" && row.lockedAt ? row.lockedAt : null,
    nextSuggestedSlot: row.status === "locked" ? null : nextSuggestedSlot,
    venue:
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
        : null),
  };
}

export function parseDartsHistoryItem(value: unknown): DartsHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;

  const players: DartsPlayer[] = [];
  if (Array.isArray(row.players)) {
    for (let i = 0; i < row.players.length; i++) {
      const player = parsePlayer(row.players[i], i);
      if (!player) return null;
      players.push(player);
    }
  }

  const turns: DartsTurn[] = [];
  if (Array.isArray(row.turns)) {
    for (let i = 0; i < row.turns.length; i++) {
      const turn = parseTurn(row.turns[i], i);
      if (!turn) return null;
      turns.push(turn);
    }
  }

  return {
    id: row.id,
    startsAt:
      typeof row.startsAt === "string" && row.startsAt ? row.startsAt : "",
    venueCmsId:
      typeof row.venueCmsId === "string" && row.venueCmsId.trim()
        ? row.venueCmsId.trim()
        : null,
    venueName:
      typeof row.venueName === "string" && row.venueName.trim()
        ? row.venueName.trim()
        : null,
    venueSlug:
      typeof row.venueSlug === "string" && row.venueSlug.trim()
        ? row.venueSlug.trim()
        : null,
    startingScore: DARTS_STARTING_SCORE,
    checkoutRule: DARTS_CHECKOUT_RULE,
    players,
    turns,
    winnerSlot: parseDartsPlayerSlot(row.winnerSlot),
    winnerUserId:
      typeof row.winnerUserId === "string" && row.winnerUserId.trim()
        ? row.winnerUserId.trim()
        : null,
  };
}

function parseHistoryList(value: unknown): DartsHistoryItem[] | null {
  if (!Array.isArray(value)) return null;
  const items: DartsHistoryItem[] = [];
  for (const row of value) {
    const item = parseDartsHistoryItem(row);
    if (!item) return null;
    items.push(item);
  }
  return items;
}

async function ensureOptionalVenue(
  venueCmsId: string | null | undefined,
  venue: Pick<DartsMatchVenue, "name" | "slug"> | null | undefined,
  deps: CreateDartsMatchDeps,
): Promise<void> {
  const cmsId = venueCmsId?.trim() || "";
  if (!cmsId) return;
  const name = venue?.name.trim() || "";
  const slug = venue?.slug.trim() || "";
  if (!name) {
    throw new DartsApiError(400, "Venue name is required");
  }
  if (!slug) {
    throw new DartsApiError(400, "Venue slug is required");
  }

  const ensured = await attemptEnsureVenueFromCmsWith(
    { cmsId, name, slug },
    {
      fetch: deps.fetch,
      baseUrl: deps.baseUrl,
      cookie: deps.cookie,
    },
  );
  if (!ensured.ok) {
    if (ensured.networkError) {
      unreachableDartsApi({
        cause: ensured.networkCause,
        url: ensured.networkUrl,
      });
    }
    throw jsonError(ensured.status, ensured.body);
  }
}

/**
 * Optionally ensure the venue, then POST /api/darts.
 * Home games omit venueCmsId.
 */
export async function createDartsMatchWith(
  input: CreateDartsMatchInput,
  venue: Pick<DartsMatchVenue, "name" | "slug"> | null,
  deps: CreateDartsMatchDeps,
): Promise<DartsMatch> {
  if (!deps.baseUrl) {
    throw new DartsApiError(503, DARTS_API_ORIGIN_UNCONFIGURED);
  }

  const body = toCreateDartsMatchBody(input);
  await ensureOptionalVenue(body.venueCmsId, venue, deps);

  const matchUrl = `${deps.baseUrl.replace(/\/$/, "")}${CREATE_DARTS_PATH}`;
  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await invokeFetch(deps.fetch, matchUrl, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    unreachableDartsApi({ cause: err, url: matchUrl });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const match = parseApiDartsMatch(payload, {
    venue: body.venueCmsId && venue
      ? {
          id: body.venueCmsId,
          name: venue.name,
          slug: venue.slug,
        }
      : null,
  });
  if (!match?.id) {
    throw new DartsApiError(502, "Darts API did not return a match id");
  }
  return match;
}

export async function submitDartsTurnWith(
  matchId: string,
  input: DartsTurnInput,
  deps: CreateDartsMatchDeps & { remaining?: number; venue?: DartsMatchVenue | null },
): Promise<DartsMatch> {
  const id = matchId.trim();
  if (!id) {
    throw new DartsApiError(400, "Match id is required");
  }
  if (!deps.baseUrl) {
    throw new DartsApiError(503, DARTS_API_ORIGIN_UNCONFIGURED);
  }

  let body: ReturnType<typeof toTurnPayload>;
  try {
    body = toTurnPayload(input, deps.remaining);
  } catch (err) {
    throw new DartsApiError(
      400,
      err instanceof Error ? err.message : "Invalid visit",
    );
  }

  const turnUrl = `${deps.baseUrl.replace(/\/$/, "")}${DARTS_TURNS_PATH(id)}`;
  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await invokeFetch(deps.fetch, turnUrl, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    unreachableDartsApi({ cause: err, url: turnUrl });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const match = parseApiDartsMatch(payload, { venue: deps.venue ?? null });
  if (!match?.id) {
    throw new DartsApiError(502, "Darts API did not return a snapshot");
  }
  return match;
}

export async function fetchDartsMatchWith(
  matchId: string,
  deps: CreateDartsMatchDeps & { venue?: DartsMatchVenue | null },
): Promise<DartsMatch> {
  const id = matchId.trim();
  if (!id) {
    throw new DartsApiError(400, "Match id is required");
  }
  if (!deps.baseUrl) {
    throw new DartsApiError(503, DARTS_API_ORIGIN_UNCONFIGURED);
  }

  const url = `${deps.baseUrl.replace(/\/$/, "")}${DARTS_MATCH_PATH(id)}`;
  let res: Response;
  try {
    const headers: Record<string, string> = {};
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await invokeFetch(deps.fetch, url, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers,
    });
  } catch (err) {
    unreachableDartsApi({ cause: err, url });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const match = parseApiDartsMatch(payload, { venue: deps.venue ?? null });
  if (!match?.id) {
    throw new DartsApiError(502, "Darts API did not return a match");
  }
  return match;
}

export async function listPlayerDartsHistoryWith(
  playerUserId: string,
  deps: CreateDartsMatchDeps,
): Promise<DartsHistoryItem[]> {
  const userId = playerUserId.trim();
  if (!userId) {
    throw new DartsApiError(400, "playerUserId is required");
  }
  if (!deps.baseUrl) {
    throw new DartsApiError(503, DARTS_API_ORIGIN_UNCONFIGURED);
  }

  const historyUrl = `${deps.baseUrl.replace(/\/$/, "")}${CREATE_DARTS_PATH}?playerUserId=${encodeURIComponent(userId)}`;
  let res: Response;
  try {
    const headers: Record<string, string> = {};
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await invokeFetch(deps.fetch, historyUrl, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers,
    });
  } catch (err) {
    unreachableDartsApi({ cause: err, url: historyUrl });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const items = parseHistoryList(payload);
  if (!items) {
    throw new DartsApiError(502, "Darts API did not return history");
  }
  return items;
}

function getRequestBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getRailwayApiOrigin() || getSiteBaseUrl();
}

export async function createDartsMatch(
  input: CreateDartsMatchInput,
  venue: Pick<DartsMatchVenue, "name" | "slug"> | null,
): Promise<DartsMatch> {
  return createDartsMatchWith(input, venue, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

export async function submitDartsTurn(
  matchId: string,
  input: DartsTurnInput,
  remaining?: number,
  venue?: DartsMatchVenue | null,
): Promise<DartsMatch> {
  return submitDartsTurnWith(matchId, input, {
    fetch,
    baseUrl: getRequestBase(),
    remaining,
    venue,
  });
}

export async function fetchDartsMatch(matchId: string): Promise<DartsMatch> {
  return fetchDartsMatchWith(matchId, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

export async function listPlayerDartsHistory(
  playerUserId: string,
): Promise<DartsHistoryItem[]> {
  return listPlayerDartsHistoryWith(playerUserId, {
    fetch,
    baseUrl: getRequestBase(),
  });
}
