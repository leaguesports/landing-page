import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { formatOrganisedGameError } from "./errors.ts";

export const ORGANISED_GAME_SPORTS = ["padel", "golf"] as const;
export type OrganisedGameSport = (typeof ORGANISED_GAME_SPORTS)[number];

export const ORGANISED_GAME_STATUSES = ["open", "started", "cancelled"] as const;
export type OrganisedGameStatus = (typeof ORGANISED_GAME_STATUSES)[number];

export const ORGANISED_GAME_ROLES = ["host", "invitee", "guest"] as const;
export type OrganisedGameRole = (typeof ORGANISED_GAME_ROLES)[number];

export const ORGANISED_GAME_RSVPS = ["pending", "accepted", "declined"] as const;
export type OrganisedGameRsvp = (typeof ORGANISED_GAME_RSVPS)[number];

export const ORGANISED_GAME_NOTES_MAX = 280;
export const ORGANISED_GAME_CAPACITY_MIN = 2;
export const ORGANISED_GAME_CAPACITY_MAX = 8;
export const ORGANISED_GAME_CAPACITY_DEFAULT = 4;

export type OrganisedGamePerson = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
};

export type OrganisedGameInvitee = OrganisedGamePerson & {
  inviteId: string;
  rsvp: OrganisedGameRsvp;
  invitedAt: string;
  respondedAt: string | null;
};

export type OrganisedGameLive = {
  sport: OrganisedGameSport;
  id: string;
  path: string;
};

export type OrganisedGameViewer = {
  role: OrganisedGameRole;
  rsvp: OrganisedGameRsvp | null;
};

export type OrganisedGame = {
  id: string;
  sport: OrganisedGameSport;
  status: OrganisedGameStatus;
  venueCmsId: string;
  startsAt: string;
  notes: string | null;
  capacity: number;
  host: OrganisedGamePerson;
  invitees: OrganisedGameInvitee[];
  inviteToken: string | null;
  viewer: OrganisedGameViewer;
  live: OrganisedGameLive | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganisedGamesSnapshot = {
  hosted: OrganisedGame[];
  invited: OrganisedGame[];
};

export type CreateOrganisedGameInput = {
  sport: OrganisedGameSport;
  venueCmsId: string;
  startsAt: string;
  notes?: string;
  capacity?: number;
  inviteUserIds?: string[];
};

export type OrganisedGamesDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type OrganisedGamesResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function rootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/organised-games`;
}

function meUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/organised-games`;
}

function gameUrl(baseUrl: string, id: string): string {
  return `${rootUrl(baseUrl)}/${encodeURIComponent(id)}`;
}

function invitePreviewUrl(baseUrl: string, token: string): string {
  return `${rootUrl(baseUrl)}/invite/${encodeURIComponent(token)}`;
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

function errorFromBody(body: unknown, status: number, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return formatOrganisedGameError(status, (body as { error: string }).error);
  }
  return formatOrganisedGameError(status, fallback);
}

function isSport(value: unknown): value is OrganisedGameSport {
  return value === "padel" || value === "golf";
}

function isStatus(value: unknown): value is OrganisedGameStatus {
  return value === "open" || value === "started" || value === "cancelled";
}

function isRole(value: unknown): value is OrganisedGameRole {
  return value === "host" || value === "invitee" || value === "guest";
}

function isRsvp(value: unknown): value is OrganisedGameRsvp {
  return value === "pending" || value === "accepted" || value === "declined";
}

export function parseOrganisedGamePerson(
  value: unknown,
): OrganisedGamePerson | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    displayName: row.displayName,
    handle: row.handle,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
  };
}

export function parseOrganisedGameInvitee(
  value: unknown,
): OrganisedGameInvitee | null {
  const person = parseOrganisedGamePerson(value);
  if (!person || !value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.inviteId !== "string" ||
    !isRsvp(row.rsvp) ||
    typeof row.invitedAt !== "string"
  ) {
    return null;
  }
  return {
    ...person,
    inviteId: row.inviteId,
    rsvp: row.rsvp,
    invitedAt: row.invitedAt,
    respondedAt: typeof row.respondedAt === "string" ? row.respondedAt : null,
  };
}

export function parseOrganisedGameLive(
  value: unknown,
): OrganisedGameLive | null {
  if (value == null) return null;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    !isSport(row.sport) ||
    typeof row.id !== "string" ||
    typeof row.path !== "string" ||
    !row.path.startsWith("/")
  ) {
    return null;
  }
  return { sport: row.sport, id: row.id, path: row.path };
}

export function parseOrganisedGameViewer(
  value: unknown,
): OrganisedGameViewer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!isRole(row.role)) return null;
  if (row.rsvp !== null && row.rsvp !== undefined && !isRsvp(row.rsvp)) {
    return null;
  }
  return {
    role: row.role,
    rsvp: isRsvp(row.rsvp) ? row.rsvp : null,
  };
}

export function parseOrganisedGame(value: unknown): OrganisedGame | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const host = parseOrganisedGamePerson(row.host);
  const viewer = parseOrganisedGameViewer(row.viewer);
  if (
    typeof row.id !== "string" ||
    !isSport(row.sport) ||
    !isStatus(row.status) ||
    typeof row.venueCmsId !== "string" ||
    typeof row.startsAt !== "string" ||
    typeof row.capacity !== "number" ||
    !Number.isFinite(row.capacity) ||
    !host ||
    !viewer ||
    !Array.isArray(row.invitees) ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string"
  ) {
    return null;
  }

  const invitees = row.invitees
    .map(parseOrganisedGameInvitee)
    .filter((item): item is OrganisedGameInvitee => !!item);
  if (invitees.length !== row.invitees.length) return null;

  let live: OrganisedGameLive | null = null;
  if (row.live != null) {
    live = parseOrganisedGameLive(row.live);
    if (!live) return null;
  }

  return {
    id: row.id,
    sport: row.sport,
    status: row.status,
    venueCmsId: row.venueCmsId,
    startsAt: row.startsAt,
    notes: typeof row.notes === "string" ? row.notes : null,
    capacity: row.capacity,
    host,
    invitees,
    inviteToken: typeof row.inviteToken === "string" ? row.inviteToken : null,
    viewer,
    live,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseGameEnvelope(body: unknown): OrganisedGame | null {
  if (!body || typeof body !== "object") return null;
  return parseOrganisedGame((body as { game?: unknown }).game);
}

export function parseOrganisedGamesSnapshot(
  value: unknown,
): OrganisedGamesSnapshot {
  if (!value || typeof value !== "object") {
    return emptyOrganisedGamesSnapshot();
  }
  const row = value as Record<string, unknown>;
  return {
    hosted: Array.isArray(row.hosted)
      ? row.hosted
          .map(parseOrganisedGame)
          .filter((item): item is OrganisedGame => !!item)
      : [],
    invited: Array.isArray(row.invited)
      ? row.invited
          .map(parseOrganisedGame)
          .filter((item): item is OrganisedGame => !!item)
      : [],
  };
}

export function emptyOrganisedGamesSnapshot(): OrganisedGamesSnapshot {
  return { hosted: [], invited: [] };
}

export type CreateOrganisedGamePayloadResult =
  | { ok: true; payload: CreateOrganisedGameInput }
  | { ok: false; error: string };

function uniqueIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const id = raw.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * Build POST /api/organised-games body. Notes blank → omitted.
 * Capacity defaults to 4 and is clamped to 2–8.
 */
export function buildCreateOrganisedGamePayload(input: {
  sport: string;
  venueCmsId: string;
  startsAt: string;
  notes?: string;
  capacity?: number;
  inviteUserIds?: readonly string[];
}): CreateOrganisedGamePayloadResult {
  if (!isSport(input.sport)) {
    return { ok: false, error: "Pick padel or golf." };
  }
  const venueCmsId = input.venueCmsId.trim();
  if (!venueCmsId) {
    return { ok: false, error: "Pick a venue." };
  }
  const startsAt = input.startsAt.trim();
  if (!startsAt) {
    return { ok: false, error: "Set when the game starts." };
  }
  const parsedStart = new Date(startsAt);
  if (Number.isNaN(parsedStart.getTime())) {
    return { ok: false, error: "Set a valid start time." };
  }

  const notes = input.notes?.trim() ?? "";
  if (notes.length > ORGANISED_GAME_NOTES_MAX) {
    return {
      ok: false,
      error: `Notes must be ${ORGANISED_GAME_NOTES_MAX} characters or fewer.`,
    };
  }

  let capacity = ORGANISED_GAME_CAPACITY_DEFAULT;
  if (input.capacity != null) {
    if (
      !Number.isInteger(input.capacity) ||
      input.capacity < ORGANISED_GAME_CAPACITY_MIN ||
      input.capacity > ORGANISED_GAME_CAPACITY_MAX
    ) {
      return { ok: false, error: "Capacity must be between 2 and 8." };
    }
    capacity = input.capacity;
  }

  const inviteUserIds = uniqueIds(input.inviteUserIds ?? []);

  const payload: CreateOrganisedGameInput = {
    sport: input.sport,
    venueCmsId,
    startsAt: parsedStart.toISOString(),
    capacity,
  };
  if (notes) payload.notes = notes;
  if (inviteUserIds.length > 0) payload.inviteUserIds = inviteUserIds;
  return { ok: true, payload };
}

/** Host + invitees who have not declined. */
export function organisedGameOccupiedCount(game: OrganisedGame): number {
  return (
    1 + game.invitees.filter((invitee) => invitee.rsvp !== "declined").length
  );
}

export function formatOrganisedGameSport(sport: OrganisedGameSport): string {
  return sport === "golf" ? "Golf" : "Padel";
}

export function formatOrganisedGameStatus(status: OrganisedGameStatus): string {
  if (status === "started") return "Started";
  if (status === "cancelled") return "Cancelled";
  return "Open";
}

export function formatOrganisedGameRsvp(rsvp: OrganisedGameRsvp | null): string {
  if (rsvp === "accepted") return "In";
  if (rsvp === "declined") return "Out";
  if (rsvp === "pending") return "Pending";
  return "Host";
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

async function readGameResponse(
  res: Response,
  fallback: string,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  const body = await readJson(res);
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromBody(body, res.status, fallback),
      status: res.status,
    };
  }
  const game = parseGameEnvelope(body);
  if (!game) {
    return { ok: false, error: "Unexpected organised game response", status: 500 };
  }
  return { ok: true, value: game };
}

export async function listMyOrganisedGamesWith(
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGamesSnapshot>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, meUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    if (!res.ok) {
      const body = await readJson(res);
      return {
        ok: false,
        error: errorFromBody(body, res.status, "Could not load organised games"),
        status: res.status,
      };
    }

    return { ok: true, value: parseOrganisedGamesSnapshot(await readJson(res)) };
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function getOrganisedGameWith(
  id: string,
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing game id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, gameUrl(deps.baseUrl, trimmed), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    return readGameResponse(res, "Could not load this game");
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function previewOrganisedGameInviteWith(
  token: string,
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  const trimmed = token.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing invite token", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      invitePreviewUrl(deps.baseUrl, trimmed),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readGameResponse(res, "Could not load this invite");
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function createOrganisedGameWith(
  input: CreateOrganisedGameInput,
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, rootUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(input),
      signal: deps.signal,
    });
    return readGameResponse(res, "Could not organise this game");
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function inviteToOrganisedGameWith(
  id: string,
  userIds: readonly string[],
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing game id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${gameUrl(deps.baseUrl, trimmed)}/invites`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify({ userIds: uniqueIds(userIds) }),
        signal: deps.signal,
      },
    );
    return readGameResponse(res, "Could not send invites");
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function rsvpOrganisedGameWith(
  id: string,
  rsvp: "accepted" | "declined",
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing game id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${gameUrl(deps.baseUrl, trimmed)}/rsvp`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify({ rsvp }),
        signal: deps.signal,
      },
    );
    return readGameResponse(res, "Could not update RSVP");
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export type StartOrganisedGameResult = {
  game: OrganisedGame;
  live: OrganisedGameLive;
};

/** Optional golf start overrides — live API requires teeName (1–40). */
export type StartOrganisedGameOverrides = {
  teeName?: string;
  startingHole?: number;
  holesPlayed?: number;
};

export function toStartOrganisedGameBody(
  overrides?: StartOrganisedGameOverrides | null,
): Record<string, string | number> {
  if (!overrides) return {};
  const body: Record<string, string | number> = {};
  if (typeof overrides.teeName === "string" && overrides.teeName.trim()) {
    body.teeName = overrides.teeName.trim();
  }
  if (
    typeof overrides.startingHole === "number" &&
    Number.isInteger(overrides.startingHole)
  ) {
    body.startingHole = overrides.startingHole;
  }
  if (overrides.holesPlayed === 9 || overrides.holesPlayed === 18) {
    body.holesPlayed = overrides.holesPlayed;
  }
  return body;
}

export async function startOrganisedGameWith(
  id: string,
  deps: OrganisedGamesDeps,
  overrides?: StartOrganisedGameOverrides | null,
): Promise<OrganisedGamesResult<StartOrganisedGameResult>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing game id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${gameUrl(deps.baseUrl, trimmed)}/start`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(toStartOrganisedGameBody(overrides)),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, res.status, "Could not start this game"),
        status: res.status,
      };
    }
    const game = parseGameEnvelope(body);
    const liveFromBody =
      body && typeof body === "object"
        ? parseOrganisedGameLive((body as { live?: unknown }).live)
        : null;
    const live = liveFromBody ?? game?.live ?? null;
    if (!game || !live) {
      return {
        ok: false,
        error: "Unexpected start response",
        status: 500,
      };
    }
    return { ok: true, value: { game, live } };
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function cancelOrganisedGameWith(
  id: string,
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing game id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${gameUrl(deps.baseUrl, trimmed)}/cancel`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readGameResponse(res, "Could not cancel this game");
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function joinOrganisedGameInviteWith(
  token: string,
  deps: OrganisedGamesDeps,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  const trimmed = token.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing invite token", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${invitePreviewUrl(deps.baseUrl, trimmed)}/join`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readGameResponse(res, "Could not join this game");
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function listMyOrganisedGames(options: {
  cookie?: string;
} = {}): Promise<OrganisedGamesSnapshot> {
  if (!isApiConfigured()) return emptyOrganisedGamesSnapshot();
  const result = await listMyOrganisedGamesWith({
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
  return result.ok ? result.value : emptyOrganisedGamesSnapshot();
}

export async function getOrganisedGameResult(
  id: string,
  options: { cookie?: string } = {},
): Promise<OrganisedGamesResult<OrganisedGame>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return getOrganisedGameWith(id, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

export async function previewOrganisedGameInviteResult(
  token: string,
  options: { cookie?: string } = {},
): Promise<OrganisedGamesResult<OrganisedGame>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return previewOrganisedGameInviteWith(token, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

export async function createOrganisedGame(
  input: CreateOrganisedGameInput,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await createOrganisedGameWith(input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function rsvpOrganisedGame(
  id: string,
  rsvp: "accepted" | "declined",
): Promise<OrganisedGamesResult<OrganisedGame>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await rsvpOrganisedGameWith(id, rsvp, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function startOrganisedGame(
  id: string,
  overrides?: StartOrganisedGameOverrides | null,
): Promise<OrganisedGamesResult<StartOrganisedGameResult>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await startOrganisedGameWith(
      id,
      {
        fetch,
        baseUrl: browserBaseUrl(),
        signal: AbortSignal.timeout(15000),
      },
      overrides,
    );
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function cancelOrganisedGame(
  id: string,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await cancelOrganisedGameWith(id, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}

export async function joinOrganisedGameInvite(
  token: string,
): Promise<OrganisedGamesResult<OrganisedGame>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await joinOrganisedGameInviteWith(token, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach organised games API", status: 0 };
  }
}
