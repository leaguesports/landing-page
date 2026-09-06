"use client";

import { getPublicSiteOrigin } from "@/lib/api-origin";

/** Mirrors API `PredictionPoolHttp` plus optional standings. */
export type PoolPick = {
  tip: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: "home" | "away" | "draw" | null;
};

export type PoolMember = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  role: "owner" | "member";
  joinedAt: string;
  pick: PoolPick | null;
};

export type PoolResult = {
  homeScore: number;
  awayScore: number;
  winner: "home" | "away" | "draw";
};

export type PredictionPool = {
  id: string;
  fixtureSlug: string;
  title: string;
  inviteCode: string;
  createdByUserId: string;
  kicksOffAt: string | null;
  lockedAt: string | null;
  locked: boolean;
  result: PoolResult | null;
  memberCount: number;
  joined: boolean;
  role: "owner" | "member" | null;
  myPick: PoolPick | null;
  createdAt: string;
  members: PoolMember[];
};

export type PoolStandingRow = {
  userId: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  role: "owner" | "member";
  points: number;
  rank: number;
  pick: PoolPick | null;
};

export type PoolStandings = {
  locked: boolean;
  result: PoolResult | null;
  standings: PoolStandingRow[];
};

export type PoolsErrorCode =
  | "unauthenticated"
  | "not_found"
  | "validation"
  | "conflict"
  | "forbidden"
  | "unavailable"
  | "network";

export type PoolsResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PoolsErrorCode; status: number; message: string };

function parseWinner(value: unknown): "home" | "away" | "draw" | null {
  return value === "home" || value === "away" || value === "draw" ? value : null;
}

function parsePick(value: unknown): PoolPick | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const pick = value as Record<string, unknown>;
  const homeScore =
    typeof pick.homeScore === "number" && Number.isFinite(pick.homeScore)
      ? pick.homeScore
      : null;
  const awayScore =
    typeof pick.awayScore === "number" && Number.isFinite(pick.awayScore)
      ? pick.awayScore
      : null;
  return {
    tip: typeof pick.tip === "string" ? pick.tip : null,
    homeScore,
    awayScore,
    winner: parseWinner(pick.winner),
  };
}

function parseResult(value: unknown): PoolResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const result = value as Record<string, unknown>;
  if (typeof result.homeScore !== "number" || typeof result.awayScore !== "number") {
    return null;
  }
  const winner = parseWinner(result.winner);
  if (!winner) {
    return null;
  }
  return {
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    winner,
  };
}

function parseMember(value: unknown): PoolMember | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const member = value as Record<string, unknown>;
  if (typeof member.id !== "string" || typeof member.displayName !== "string") {
    return null;
  }
  return {
    id: member.id,
    displayName: member.displayName,
    handle: typeof member.handle === "string" ? member.handle : "",
    avatarUrl: typeof member.avatarUrl === "string" ? member.avatarUrl : null,
    role: member.role === "owner" ? "owner" : "member",
    joinedAt: typeof member.joinedAt === "string" ? member.joinedAt : "",
    pick: parsePick(member.pick),
  };
}

export function parsePredictionPool(value: unknown): PredictionPool | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const pool = value as Record<string, unknown>;
  if (
    typeof pool.id !== "string" ||
    typeof pool.fixtureSlug !== "string" ||
    typeof pool.inviteCode !== "string" ||
    typeof pool.title !== "string"
  ) {
    return null;
  }
  const members = Array.isArray(pool.members)
    ? pool.members.map(parseMember).filter((member): member is PoolMember => member !== null)
    : [];
  return {
    id: pool.id,
    fixtureSlug: pool.fixtureSlug,
    title: pool.title,
    inviteCode: pool.inviteCode,
    createdByUserId: typeof pool.createdByUserId === "string" ? pool.createdByUserId : "",
    kicksOffAt: typeof pool.kicksOffAt === "string" ? pool.kicksOffAt : null,
    lockedAt: typeof pool.lockedAt === "string" ? pool.lockedAt : null,
    locked: pool.locked === true,
    result: parseResult(pool.result),
    memberCount: typeof pool.memberCount === "number" ? pool.memberCount : members.length,
    joined: pool.joined === true,
    role: pool.role === "owner" || pool.role === "member" ? pool.role : null,
    myPick: parsePick(pool.myPick),
    createdAt: typeof pool.createdAt === "string" ? pool.createdAt : "",
    members,
  };
}

export function parsePoolStandings(value: unknown): PoolStandings | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const body = value as Record<string, unknown>;
  const standings = Array.isArray(body.standings)
    ? body.standings.flatMap((row): PoolStandingRow[] => {
        if (!row || typeof row !== "object") {
          return [];
        }
        const standing = row as Record<string, unknown>;
        if (typeof standing.userId !== "string" || typeof standing.displayName !== "string") {
          return [];
        }
        return [
          {
            userId: standing.userId,
            displayName: standing.displayName,
            handle: typeof standing.handle === "string" ? standing.handle : "",
            avatarUrl: typeof standing.avatarUrl === "string" ? standing.avatarUrl : null,
            role: standing.role === "owner" ? "owner" : "member",
            points: typeof standing.points === "number" ? standing.points : 0,
            rank: typeof standing.rank === "number" ? standing.rank : 1,
            pick: parsePick(standing.pick),
          },
        ];
      })
    : [];
  return {
    locked: body.locked === true,
    result: parseResult(body.result),
    standings,
  };
}

function parsePoolEnvelope(value: unknown): PredictionPool | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const envelope = value as Record<string, unknown>;
  return parsePredictionPool(envelope.pool);
}

function mapStatus(status: number): PoolsErrorCode {
  if (status === 401) {
    return "unauthenticated";
  }
  if (status === 403) {
    return "forbidden";
  }
  if (status === 404) {
    return "not_found";
  }
  if (status === 409) {
    return "conflict";
  }
  if (status === 400) {
    return "validation";
  }
  if (status === 0 || status === 502 || status === 503) {
    return "unavailable";
  }
  return "network";
}

function messageFor(code: PoolsErrorCode, fallback: string): string {
  switch (code) {
    case "unauthenticated":
      return "Sign in to create or join a pool.";
    case "not_found":
      return "This pool is not live yet.";
    case "validation":
      return fallback || "Check the pool details and try again.";
    case "conflict":
      return fallback || "Tips are locked for this fixture.";
    case "forbidden":
      return "Only the pool owner can record the result.";
    case "unavailable":
      return "Prediction pools are not live yet. Check back after the next deploy.";
    default:
      return fallback || "Could not reach prediction pools. Try again.";
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorFromResponse(status: number, body: unknown, fallback: string): PoolsResult<never> {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const apiMessage = typeof record.message === "string" ? record.message : "";
  const code = mapStatus(status);
  return {
    ok: false,
    error: code,
    status,
    message: messageFor(code, apiMessage || fallback),
  };
}

function networkError(): PoolsResult<never> {
  return {
    ok: false,
    error: "network",
    status: 0,
    message: messageFor("unavailable", ""),
  };
}

async function requestPool(
  path: string,
  init: RequestInit,
  fallback: string,
): Promise<PoolsResult<PredictionPool>> {
  try {
    const response = await fetch(path, {
      ...init,
      credentials: "include",
    });
    const body = await readJson(response);
    if (!response.ok) {
      return errorFromResponse(response.status, body, fallback);
    }
    const pool = parsePoolEnvelope(body);
    if (!pool) {
      return {
        ok: false,
        error: "network",
        status: response.status,
        message: "Unexpected pool response.",
      };
    }
    return { ok: true, data: pool };
  } catch {
    return networkError();
  }
}

export async function createPool(input: {
  fixtureSlug: string;
  title?: string;
  kicksOffAt?: string;
}): Promise<PoolsResult<PredictionPool>> {
  return requestPool(
    "/api/pools",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fixtureSlug: input.fixtureSlug,
        ...(input.title ? { title: input.title } : {}),
        ...(input.kicksOffAt ? { kicksOffAt: input.kicksOffAt } : {}),
      }),
    },
    "Could not create the pool.",
  );
}

export async function getPool(idOrCode: string): Promise<PoolsResult<PredictionPool>> {
  return requestPool(`/api/pools/${encodeURIComponent(idOrCode)}`, { method: "GET" }, "Pool not found.");
}

export async function joinPool(idOrCode: string): Promise<PoolsResult<PredictionPool>> {
  return requestPool(
    `/api/pools/${encodeURIComponent(idOrCode)}/join`,
    { method: "POST" },
    "Could not join the pool.",
  );
}

export async function submitPoolPick(
  idOrCode: string,
  pick: { tip?: string; homeScore?: number; awayScore?: number; winner?: "home" | "away" | "draw" },
): Promise<PoolsResult<PredictionPool>> {
  return requestPool(
    `/api/pools/${encodeURIComponent(idOrCode)}/picks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pick),
    },
    "Could not save your tip.",
  );
}

export async function recordPoolResult(
  idOrCode: string,
  result: { homeScore: number; awayScore: number; winner?: "home" | "away" | "draw" },
): Promise<PoolsResult<PredictionPool>> {
  return requestPool(
    `/api/pools/${encodeURIComponent(idOrCode)}/result`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    },
    "Could not record the result.",
  );
}

export async function getPoolStandings(idOrCode: string): Promise<PoolsResult<PoolStandings>> {
  try {
    const response = await fetch(`/api/pools/${encodeURIComponent(idOrCode)}/standings`, {
      method: "GET",
      credentials: "include",
    });
    const body = await readJson(response);
    if (!response.ok) {
      return errorFromResponse(response.status, body, "Standings not available.");
    }
    const standings = parsePoolStandings(body);
    if (!standings) {
      return {
        ok: false,
        error: "network",
        status: response.status,
        message: "Unexpected standings response.",
      };
    }
    return { ok: true, data: standings };
  } catch {
    return networkError();
  }
}

export function isPoolsUnavailable(result: PoolsResult<unknown>): boolean {
  return !result.ok && (result.error === "unavailable" || result.status === 404 || result.status === 0);
}

export function poolSharePath(inviteCode: string): string {
  return `/pools/${encodeURIComponent(inviteCode)}`;
}

export function poolShareUrl(inviteCode: string, origin = getPublicSiteOrigin()): string {
  return `${origin}${poolSharePath(inviteCode)}`;
}
