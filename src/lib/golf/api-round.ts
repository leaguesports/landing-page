import { getLoopbackApiProxyOrigin } from "../api-origin.ts";
import { getRailwayApiOrigin } from "../api-origin.ts";
import { getSiteBaseUrl } from "../site-url.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { attemptEnsureVenueFromCmsWith } from "../venues/appVenueApi.ts";
import type {
  CreateGolfRoundInput,
  GolfCourseSnapshot,
  GolfHistoryItem,
  GolfHolesPlayed,
  GolfPlayer,
  GolfPlayerSlot,
  GolfRound,
  GolfRoundVenue,
  GolfScore,
  LockGolfRoundBody,
} from "../../types/golf-round.ts";

export const GOLF_API_UNAVAILABLE = "Golf round API is unavailable.";
export const GOLF_API_UNREACHABLE =
  "Golf round API is unreachable (network error).";
export const GOLF_API_PROXY_MISS = "Golf round API proxy missed this path";
export const GOLF_API_ORIGIN_UNCONFIGURED =
  "Golf round API origin is not configured";

export function golfApiUnreachableMessage(
  env: NodeJS.Dict<string> = process.env,
): string {
  const origin = getLoopbackApiProxyOrigin(env);
  if (!origin) return GOLF_API_UNREACHABLE;
  return `${GOLF_API_UNREACHABLE} Start league-sports-api on ${origin} (Postgres required).`;
}

export class GolfApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GolfApiError";
    this.status = status;
  }
}

function fetchFailureDetail(err: unknown): string {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return "";
}

function unreachableGolfApi(opts?: {
  cause?: unknown;
  url?: string;
}): never {
  const base = golfApiUnreachableMessage();
  const detail = fetchFailureDetail(opts?.cause);
  const url = opts?.url?.trim() ?? "";
  const parts = [base];
  if (detail) parts.push(detail);
  if (url) parts.push(url);
  throw new GolfApiError(0, parts.join(" · "));
}

export type CreateGolfRoundDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
};

export type LockGolfRoundDeps = CreateGolfRoundDeps & {
  venue?: GolfRoundVenue | null;
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

export function jsonError(status: number, body: unknown): GolfApiError {
  const code = status || 503;
  const apiMessage = apiErrorMessage(body);
  if (status === 409) {
    return new GolfApiError(
      409,
      statusMessage(
        409,
        apiMessage || "Round is already locked with a different score",
      ),
    );
  }
  if (apiMessage) {
    return new GolfApiError(code, statusMessage(code, apiMessage));
  }
  if (looksLikeHtml(body) || isEmptyErrorBody(body)) {
    return new GolfApiError(code, statusMessage(code, GOLF_API_PROXY_MISS));
  }
  if (typeof body === "string") {
    return new GolfApiError(
      code,
      statusMessage(code, body.trim().slice(0, 160)),
    );
  }
  return new GolfApiError(code, statusMessage(code, "Golf round request failed"));
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

function parseSlot(value: unknown): GolfPlayerSlot | null {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  if (value === "1" || value === "2" || value === "3" || value === "4") {
    return Number(value) as GolfPlayerSlot;
  }
  return null;
}

function parsePlayer(value: unknown, index: number): GolfPlayer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const slot = parseSlot(row.slot) ?? ((index + 1) as GolfPlayerSlot);
  if (slot < 1 || slot > 4) return null;
  const displayName =
    typeof row.displayName === "string" && row.displayName.trim()
      ? row.displayName.trim()
      : "";
  if (!displayName) return null;
  const isGuest = Boolean(row.isGuest) || !row.userId;
  return {
    slot,
    displayName,
    isGuest,
    userId:
      typeof row.userId === "string" && row.userId.trim()
        ? row.userId.trim()
        : null,
  };
}

function parseCourse(value: unknown): GolfCourseSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { name?: unknown; holes?: unknown };
  if (!Array.isArray(row.holes) || row.holes.length === 0) return null;
  const holes = [];
  for (const raw of row.holes) {
    if (!raw || typeof raw !== "object") return null;
    const hole = raw as {
      number?: unknown;
      par?: unknown;
      strokeIndex?: unknown;
    };
    if (
      typeof hole.number !== "number" ||
      typeof hole.par !== "number" ||
      typeof hole.strokeIndex !== "number"
    ) {
      return null;
    }
    holes.push({
      number: hole.number,
      par: hole.par,
      strokeIndex: hole.strokeIndex,
    });
  }
  return {
    name: typeof row.name === "string" ? row.name : null,
    holes,
  };
}

function parseScore(value: unknown): GolfScore | null {
  if (value == null) return null;
  if (!value || typeof value !== "object") return null;
  const row = value as { holes?: unknown };
  if (!Array.isArray(row.holes)) return null;
  const holes = [];
  for (const raw of row.holes) {
    if (!raw || typeof raw !== "object") return null;
    const hole = raw as { number?: unknown; strokes?: unknown };
    if (typeof hole.number !== "number") return null;
    if (!hole.strokes || typeof hole.strokes !== "object") return null;
    const strokes: Record<string, number> = {};
    for (const [key, stroke] of Object.entries(
      hole.strokes as Record<string, unknown>,
    )) {
      if (typeof stroke === "number") strokes[key] = stroke;
    }
    holes.push({ number: hole.number, strokes });
  }
  return { holes };
}

function parseVenue(value: unknown): GolfRoundVenue | null {
  if (!value || typeof value !== "object") return null;
  const v = value as GolfRoundVenue;
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

export function parseApiGolfRound(
  value: unknown,
  fallback?: { venue?: GolfRoundVenue | null },
): GolfRound | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;

  const course = parseCourse(row.course);
  if (!course) return null;

  if (!Array.isArray(row.players) || row.players.length < 1) return null;
  const players: GolfPlayer[] = [];
  for (let i = 0; i < row.players.length; i++) {
    const player = parsePlayer(row.players[i], i);
    if (!player) return null;
    players.push(player);
  }

  const holesPlayed: GolfHolesPlayed =
    row.holesPlayed === 9 || row.holesPlayed === 18 ? row.holesPlayed : course.holes.length === 9 ? 9 : 18;

  const venueCmsId =
    typeof row.venueCmsId === "string" && row.venueCmsId.trim()
      ? row.venueCmsId.trim()
      : "";

  const status: GolfRound["status"] =
    row.status === "locked" ? "locked" : "live";

  return {
    id: row.id,
    sport: "golf",
    status,
    venueCmsId,
    startsAt:
      typeof row.startsAt === "string" && row.startsAt ? row.startsAt : "",
    holesPlayed,
    startingHole:
      typeof row.startingHole === "number" && Number.isInteger(row.startingHole)
        ? row.startingHole
        : 1,
    teeName: typeof row.teeName === "string" ? row.teeName : null,
    course,
    players,
    score: parseScore(row.score),
    lockedAt:
      typeof row.lockedAt === "string" && row.lockedAt ? row.lockedAt : null,
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

export function parseGolfHistoryItem(value: unknown): GolfHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;

  const course = parseCourse(row.course);
  if (!course) return null;

  if (!Array.isArray(row.players) || row.players.length < 1) return null;
  const players: GolfPlayer[] = [];
  for (let i = 0; i < row.players.length; i++) {
    const player = parsePlayer(row.players[i], i);
    if (!player) return null;
    players.push(player);
  }

  return {
    id: row.id,
    startsAt:
      typeof row.startsAt === "string" && row.startsAt ? row.startsAt : "",
    venueCmsId:
      typeof row.venueCmsId === "string" && row.venueCmsId.trim()
        ? row.venueCmsId.trim()
        : "",
    venueName:
      typeof row.venueName === "string" && row.venueName.trim()
        ? row.venueName.trim()
        : null,
    venueSlug:
      typeof row.venueSlug === "string" && row.venueSlug.trim()
        ? row.venueSlug.trim()
        : null,
    holesPlayed:
      row.holesPlayed === 9 || row.holesPlayed === 18
        ? row.holesPlayed
        : course.holes.length,
    startingHole:
      typeof row.startingHole === "number" ? row.startingHole : 1,
    teeName: typeof row.teeName === "string" ? row.teeName : null,
    course,
    players,
    score: parseScore(row.score),
  };
}

function parseHistoryList(value: unknown): GolfHistoryItem[] | null {
  if (!Array.isArray(value)) return null;
  const items: GolfHistoryItem[] = [];
  for (const row of value) {
    const item = parseGolfHistoryItem(row);
    if (!item) return null;
    items.push(item);
  }
  return items;
}

export function toCreateGolfRoundBody(input: CreateGolfRoundInput) {
  return {
    venueCmsId: input.venueCmsId,
    startsAt: input.startsAt,
    holesPlayed: input.holesPlayed,
    startingHole: input.startingHole ?? 1,
    teeName: input.teeName ?? null,
    course: {
      name: input.course.name ?? null,
      holes: input.course.holes.map((hole) => ({
        number: hole.number,
        par: hole.par,
        strokeIndex: hole.strokeIndex,
      })),
    },
    players: input.players.map((player) => ({
      slot: player.slot,
      displayName: player.displayName,
      isGuest: player.isGuest,
      userId: player.isGuest ? null : (player.userId ?? null),
    })),
  };
}

/**
 * Ensure the venue exists, then POST /api/golf-rounds.
 */
export async function createGolfRoundWith(
  input: CreateGolfRoundInput,
  venue: Pick<GolfRoundVenue, "name" | "slug">,
  deps: CreateGolfRoundDeps,
): Promise<GolfRound> {
  const name = venue.name.trim();
  const slug = venue.slug.trim();
  if (!input.venueCmsId.trim()) {
    throw new GolfApiError(400, "Venue cmsId is required");
  }
  if (!name) {
    throw new GolfApiError(400, "Venue name is required");
  }
  if (!slug) {
    throw new GolfApiError(400, "Venue slug is required");
  }
  if (!deps.baseUrl) {
    throw new GolfApiError(503, GOLF_API_ORIGIN_UNCONFIGURED);
  }

  const ensured = await attemptEnsureVenueFromCmsWith(
    { cmsId: input.venueCmsId, name, slug },
    {
      fetch: deps.fetch,
      baseUrl: deps.baseUrl,
      cookie: deps.cookie,
    },
  );
  if (!ensured.ok) {
    if (ensured.networkError) {
      unreachableGolfApi({
        cause: ensured.networkCause,
        url: ensured.networkUrl,
      });
    }
    throw jsonError(ensured.status, ensured.body);
  }
  if (!ensured.venue) {
    console.warn(
      "[golf] venue ensure succeeded but AppVenue parse failed; continuing to POST /api/golf-rounds",
      ensured.body,
    );
  }

  const body = toCreateGolfRoundBody(input);
  const roundUrl = `${deps.baseUrl.replace(/\/$/, "")}/api/golf-rounds`;
  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await invokeFetch(deps.fetch, roundUrl, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    unreachableGolfApi({ cause: err, url: roundUrl });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const round = parseApiGolfRound(payload, {
    venue: {
      id: input.venueCmsId,
      name,
      slug,
    },
  });
  if (!round?.id) {
    throw new GolfApiError(502, "Golf round API did not return a round id");
  }
  return round;
}

export async function fetchGolfRoundWith(
  roundId: string,
  deps: CreateGolfRoundDeps & { venue?: GolfRoundVenue | null },
): Promise<GolfRound> {
  const id = roundId.trim();
  if (!id) {
    throw new GolfApiError(400, "Round id is required");
  }
  if (!deps.baseUrl) {
    throw new GolfApiError(503, GOLF_API_ORIGIN_UNCONFIGURED);
  }

  const url = `${deps.baseUrl.replace(/\/$/, "")}/api/golf-rounds/${encodeURIComponent(id)}`;
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
    unreachableGolfApi({ cause: err, url });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const round = parseApiGolfRound(payload, { venue: deps.venue ?? null });
  if (!round?.id) {
    throw new GolfApiError(502, "Golf round API did not return a round");
  }
  return round;
}

export async function lockGolfRoundWith(
  roundId: string,
  body: LockGolfRoundBody,
  deps: LockGolfRoundDeps,
): Promise<GolfRound> {
  const id = roundId.trim();
  if (!id) {
    throw new GolfApiError(400, "Round id is required");
  }
  if (!deps.baseUrl) {
    throw new GolfApiError(503, GOLF_API_ORIGIN_UNCONFIGURED);
  }

  const lockUrl = `${deps.baseUrl.replace(/\/$/, "")}/api/golf-rounds/${encodeURIComponent(id)}/lock`;
  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await invokeFetch(deps.fetch, lockUrl, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    unreachableGolfApi({ cause: err, url: lockUrl });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const round = parseApiGolfRound(payload, { venue: deps.venue ?? null });
  if (!round?.id) {
    throw new GolfApiError(502, "Golf round API did not return a locked round");
  }
  return round;
}

export async function listPlayerGolfHistoryWith(
  playerUserId: string,
  deps: CreateGolfRoundDeps,
): Promise<GolfHistoryItem[]> {
  const userId = playerUserId.trim();
  if (!userId) {
    throw new GolfApiError(400, "playerUserId is required");
  }
  if (!deps.baseUrl) {
    throw new GolfApiError(503, GOLF_API_ORIGIN_UNCONFIGURED);
  }

  const historyUrl = `${deps.baseUrl.replace(/\/$/, "")}/api/golf-rounds?playerUserId=${encodeURIComponent(userId)}`;
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
    unreachableGolfApi({ cause: err, url: historyUrl });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const items = parseHistoryList(payload);
  if (!items) {
    throw new GolfApiError(502, "Golf round API did not return history");
  }
  return items;
}

function getRequestBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getRailwayApiOrigin() || getSiteBaseUrl();
}

/** Browser/same-origin create. */
export async function createGolfRound(
  input: CreateGolfRoundInput,
  venue: Pick<GolfRoundVenue, "name" | "slug">,
): Promise<GolfRound> {
  return createGolfRoundWith(input, venue, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

export async function fetchGolfRound(roundId: string): Promise<GolfRound> {
  return fetchGolfRoundWith(roundId, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

export async function lockGolfRound(
  roundId: string,
  body: LockGolfRoundBody,
  venue?: GolfRoundVenue | null,
): Promise<GolfRound> {
  return lockGolfRoundWith(roundId, body, {
    fetch,
    baseUrl: getRequestBase(),
    venue,
  });
}

export async function listPlayerGolfHistory(
  playerUserId: string,
): Promise<GolfHistoryItem[]> {
  return listPlayerGolfHistoryWith(playerUserId, {
    fetch,
    baseUrl: getRequestBase(),
  });
}
