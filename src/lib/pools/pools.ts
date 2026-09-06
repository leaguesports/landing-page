import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export const POOL_WINNERS = ["home", "away", "draw"] as const;
export type PoolWinner = (typeof POOL_WINNERS)[number];

export const POOL_ROLES = ["owner", "member"] as const;
export type PoolRole = (typeof POOL_ROLES)[number];

export type PoolPick = {
  tip: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: PoolWinner | null;
};

export type PoolResult = {
  homeScore: number;
  awayScore: number;
  winner: PoolWinner;
};

export type PoolMember = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  role: PoolRole;
  joinedAt: string;
  pick: PoolPick | null;
};

export type PredictionPool = {
  id: string;
  fixtureSlug: string;
  title: string | null;
  inviteCode: string;
  createdByUserId: string;
  kicksOffAt: string | null;
  lockedAt: string | null;
  locked: boolean;
  result: PoolResult | null;
  memberCount: number;
  joined: boolean;
  role: PoolRole | null;
  myPick: PoolPick | null;
  createdAt: string;
  members: PoolMember[];
};

export type PoolStanding = {
  userId: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  points: number;
  rank: number;
  pick: PoolPick | null;
};

export type PoolStandings = {
  locked: boolean;
  result: PoolResult | null;
  standings: PoolStanding[];
};

export type CreatePoolInput = {
  fixtureSlug: string;
  title?: string | null;
  kicksOffAt?: string | null;
};

export type SubmitPoolPickInput = {
  tip?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  winner?: PoolWinner | null;
};

export type RecordPoolResultInput = {
  homeScore: number;
  awayScore: number;
  winner?: PoolWinner | null;
};

export type PoolsDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type PoolsResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function rootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/pools`;
}

function poolUrl(baseUrl: string, idOrCode: string): string {
  return `${rootUrl(baseUrl)}/${encodeURIComponent(idOrCode)}`;
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

function errorFromBody(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

function isPoolWinner(value: unknown): value is PoolWinner {
  return value === "home" || value === "away" || value === "draw";
}

function isPoolRole(value: unknown): value is PoolRole {
  return value === "owner" || value === "member";
}

export function parsePoolPick(value: unknown): PoolPick | null {
  if (value == null) return null;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    row.tip !== null &&
    row.tip !== undefined &&
    typeof row.tip !== "string"
  ) {
    return null;
  }
  if (
    row.homeScore !== null &&
    row.homeScore !== undefined &&
    typeof row.homeScore !== "number"
  ) {
    return null;
  }
  if (
    row.awayScore !== null &&
    row.awayScore !== undefined &&
    typeof row.awayScore !== "number"
  ) {
    return null;
  }
  if (
    row.winner !== null &&
    row.winner !== undefined &&
    !isPoolWinner(row.winner)
  ) {
    return null;
  }
  return {
    tip: typeof row.tip === "string" ? row.tip : null,
    homeScore: typeof row.homeScore === "number" ? row.homeScore : null,
    awayScore: typeof row.awayScore === "number" ? row.awayScore : null,
    winner: isPoolWinner(row.winner) ? row.winner : null,
  };
}

export function parsePoolResult(value: unknown): PoolResult | null {
  if (value == null) return null;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.homeScore !== "number" ||
    typeof row.awayScore !== "number" ||
    !isPoolWinner(row.winner)
  ) {
    return null;
  }
  return {
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    winner: row.winner,
  };
}

export function parsePoolMember(value: unknown): PoolMember | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string" ||
    !isPoolRole(row.role) ||
    typeof row.joinedAt !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    displayName: row.displayName,
    handle: row.handle,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
    role: row.role,
    joinedAt: row.joinedAt,
    pick: parsePoolPick(row.pick),
  };
}

export function parsePredictionPool(value: unknown): PredictionPool | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.fixtureSlug !== "string" ||
    typeof row.inviteCode !== "string" ||
    typeof row.createdByUserId !== "string" ||
    typeof row.memberCount !== "number" ||
    !Number.isFinite(row.memberCount) ||
    typeof row.locked !== "boolean" ||
    typeof row.createdAt !== "string"
  ) {
    return null;
  }
  if (row.title !== null && row.title !== undefined && typeof row.title !== "string") {
    return null;
  }
  if (
    row.kicksOffAt !== null &&
    row.kicksOffAt !== undefined &&
    typeof row.kicksOffAt !== "string"
  ) {
    return null;
  }
  if (
    row.lockedAt !== null &&
    row.lockedAt !== undefined &&
    typeof row.lockedAt !== "string"
  ) {
    return null;
  }
  if (row.role !== null && row.role !== undefined && !isPoolRole(row.role)) {
    return null;
  }
  const members = Array.isArray(row.members) ? row.members : [];
  return {
    id: row.id,
    fixtureSlug: row.fixtureSlug,
    title: typeof row.title === "string" ? row.title : null,
    inviteCode: row.inviteCode,
    createdByUserId: row.createdByUserId,
    kicksOffAt: typeof row.kicksOffAt === "string" ? row.kicksOffAt : null,
    lockedAt: typeof row.lockedAt === "string" ? row.lockedAt : null,
    locked: row.locked,
    result: parsePoolResult(row.result),
    memberCount: row.memberCount,
    joined: row.joined === true,
    role: isPoolRole(row.role) ? row.role : null,
    myPick: parsePoolPick(row.myPick),
    createdAt: row.createdAt,
    members: members
      .map(parsePoolMember)
      .filter((item): item is PoolMember => !!item),
  };
}

export function parsePoolStanding(value: unknown): PoolStanding | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.userId !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string" ||
    typeof row.points !== "number" ||
    typeof row.rank !== "number"
  ) {
    return null;
  }
  return {
    userId: row.userId,
    displayName: row.displayName,
    handle: row.handle,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
    points: row.points,
    rank: row.rank,
    pick: parsePoolPick(row.pick),
  };
}

export function parsePoolStandings(value: unknown): PoolStandings | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.locked !== "boolean" || !Array.isArray(row.standings)) {
    return null;
  }
  return {
    locked: row.locked,
    result: parsePoolResult(row.result),
    standings: row.standings
      .map(parsePoolStanding)
      .filter((item): item is PoolStanding => !!item),
  };
}

function poolFromBody(body: unknown): PredictionPool | null {
  if (!body || typeof body !== "object") return null;
  return parsePredictionPool((body as { pool?: unknown }).pool);
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

function fail(error: string, status: number): PoolsResult<never> {
  return { ok: false, error, status };
}

export async function createPoolWith(
  input: CreatePoolInput,
  deps: PoolsDeps,
): Promise<PoolsResult<PredictionPool>> {
  const fixtureSlug = input.fixtureSlug.trim();
  if (!fixtureSlug || !deps.baseUrl) {
    return fail("Fixture slug is required", 400);
  }

  const payload: Record<string, string> = { fixtureSlug };
  if (input.title?.trim()) payload.title = input.title.trim();
  if (input.kicksOffAt?.trim()) payload.kicksOffAt = input.kicksOffAt.trim();

  try {
    const res = await invokeFetch(deps.fetch, rootUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(payload),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return fail(errorFromBody(body, "Could not create prediction pool"), res.status);
    }
    const pool = poolFromBody(body);
    if (!pool) return fail("Unexpected prediction pool response", 500);
    return { ok: true, value: pool };
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function getPoolWith(
  idOrCode: string,
  deps: PoolsDeps,
): Promise<PoolsResult<PredictionPool>> {
  const trimmed = idOrCode.trim();
  if (!trimmed || !deps.baseUrl) {
    return fail("Missing pool code", 400);
  }

  try {
    const res = await invokeFetch(deps.fetch, poolUrl(deps.baseUrl, trimmed), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return fail(errorFromBody(body, `Could not load pool (${res.status})`), res.status);
    }
    const pool = poolFromBody(body);
    if (!pool) return fail("Unexpected prediction pool response", 500);
    return { ok: true, value: pool };
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function joinPoolWith(
  idOrCode: string,
  deps: PoolsDeps,
): Promise<PoolsResult<PredictionPool>> {
  const trimmed = idOrCode.trim();
  if (!trimmed || !deps.baseUrl) {
    return fail("Missing pool code", 400);
  }

  try {
    const res = await invokeFetch(deps.fetch, `${poolUrl(deps.baseUrl, trimmed)}/join`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return fail(errorFromBody(body, "Could not join pool"), res.status);
    }
    const pool = poolFromBody(body);
    if (!pool) return fail("Unexpected prediction pool response", 500);
    return { ok: true, value: pool };
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function submitPoolPickWith(
  idOrCode: string,
  input: SubmitPoolPickInput,
  deps: PoolsDeps,
): Promise<PoolsResult<PredictionPool>> {
  const trimmed = idOrCode.trim();
  if (!trimmed || !deps.baseUrl) {
    return fail("Missing pool code", 400);
  }

  const payload: Record<string, unknown> = {};
  if (input.tip?.trim()) payload.tip = input.tip.trim();
  if (typeof input.homeScore === "number") payload.homeScore = input.homeScore;
  if (typeof input.awayScore === "number") payload.awayScore = input.awayScore;
  if (input.winner) payload.winner = input.winner;

  try {
    const res = await invokeFetch(deps.fetch, `${poolUrl(deps.baseUrl, trimmed)}/picks`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(payload),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return fail(errorFromBody(body, "Could not save pick"), res.status);
    }
    const pool = poolFromBody(body);
    if (!pool) return fail("Unexpected prediction pool response", 500);
    return { ok: true, value: pool };
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function getPoolStandingsWith(
  idOrCode: string,
  deps: PoolsDeps,
): Promise<PoolsResult<PoolStandings>> {
  const trimmed = idOrCode.trim();
  if (!trimmed || !deps.baseUrl) {
    return fail("Missing pool code", 400);
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${poolUrl(deps.baseUrl, trimmed)}/standings`,
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
      return fail(errorFromBody(body, "Could not load standings"), res.status);
    }
    const standings = parsePoolStandings(body);
    if (!standings) return fail("Unexpected standings response", 500);
    return { ok: true, value: standings };
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function recordPoolResultWith(
  idOrCode: string,
  input: RecordPoolResultInput,
  deps: PoolsDeps,
): Promise<PoolsResult<PredictionPool>> {
  const trimmed = idOrCode.trim();
  if (!trimmed || !deps.baseUrl) {
    return fail("Missing pool code", 400);
  }

  const payload: Record<string, unknown> = {
    homeScore: input.homeScore,
    awayScore: input.awayScore,
  };
  if (input.winner) payload.winner = input.winner;

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${poolUrl(deps.baseUrl, trimmed)}/result`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(payload),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return fail(errorFromBody(body, "Could not record result"), res.status);
    }
    const pool = poolFromBody(body);
    if (!pool) return fail("Unexpected prediction pool response", 500);
    return { ok: true, value: pool };
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function getPoolResult(
  idOrCode: string,
  options: { cookie?: string } = {},
): Promise<PoolsResult<PredictionPool>> {
  if (!isApiConfigured()) {
    return fail("API is not configured", 0);
  }
  return getPoolWith(idOrCode, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: null on 404 / migration lag / network failure. */
export async function getPool(
  idOrCode: string,
  options: { cookie?: string } = {},
): Promise<PredictionPool | null> {
  const result = await getPoolResult(idOrCode, options);
  return result.ok ? result.value : null;
}

export async function getPoolStandings(
  idOrCode: string,
  options: { cookie?: string } = {},
): Promise<PoolStandings | null> {
  if (!isApiConfigured()) return null;
  const result = await getPoolStandingsWith(idOrCode, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
  return result.ok ? result.value : null;
}

export async function createPool(
  input: CreatePoolInput,
): Promise<PoolsResult<PredictionPool>> {
  if (!isApiConfigured()) {
    return fail("API is not configured", 0);
  }
  try {
    return await createPoolWith(input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function joinPool(
  idOrCode: string,
): Promise<PoolsResult<PredictionPool>> {
  if (!isApiConfigured()) {
    return fail("API is not configured", 0);
  }
  try {
    return await joinPoolWith(idOrCode, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function submitPoolPick(
  idOrCode: string,
  input: SubmitPoolPickInput,
): Promise<PoolsResult<PredictionPool>> {
  if (!isApiConfigured()) {
    return fail("API is not configured", 0);
  }
  try {
    return await submitPoolPickWith(idOrCode, input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export async function recordPoolResult(
  idOrCode: string,
  input: RecordPoolResultInput,
): Promise<PoolsResult<PredictionPool>> {
  if (!isApiConfigured()) {
    return fail("API is not configured", 0);
  }
  try {
    return await recordPoolResultWith(idOrCode, input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return fail("Could not reach prediction pools API", 0);
  }
}

export function formatPoolWinner(winner: PoolWinner | null): string {
  if (winner === "home") return "Home";
  if (winner === "away") return "Away";
  if (winner === "draw") return "Draw";
  return "No pick";
}

export function formatMemberCount(count: number): string {
  return count === 1 ? "1 player" : `${count} players`;
}

export function isPoolsUnavailable(status: number): boolean {
  return status === 0 || status === 404 || status === 503;
}
