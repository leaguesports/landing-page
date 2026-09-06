import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export const COMMUNITY_SPORTS = ["padel", "multi"] as const;
export type CommunitySport = (typeof COMMUNITY_SPORTS)[number];

export const COMMUNITY_ROLES = ["owner", "member"] as const;
export type CommunityRole = (typeof COMMUNITY_ROLES)[number];

export type CommunitySummary = {
  id: string;
  name: string;
  city: string;
  sport: CommunitySport | null;
  memberCount: number;
  createdAt: string;
  joined: boolean;
  role: CommunityRole | null;
};

export type CommunityMember = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  role: CommunityRole;
  joinedAt: string;
};

export type Community = CommunitySummary & {
  members: CommunityMember[];
};

export type MyCommunity = CommunitySummary & {
  joinedAt: string;
};

export type CreateCommunityInput = {
  name: string;
  city: string;
  sport?: CommunitySport | null;
};

export type CommunitiesDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type CommunitiesResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function rootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/communities`;
}

function communityUrl(baseUrl: string, id: string): string {
  return `${rootUrl(baseUrl)}/${encodeURIComponent(id)}`;
}

function joinUrl(baseUrl: string, id: string): string {
  return `${communityUrl(baseUrl, id)}/join`;
}

function meUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/communities`;
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

function isCommunitySport(value: unknown): value is CommunitySport {
  return value === "padel" || value === "multi";
}

function isCommunityRole(value: unknown): value is CommunityRole {
  return value === "owner" || value === "member";
}

export function parseCommunitySummary(value: unknown): CommunitySummary | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    typeof row.city !== "string" ||
    typeof row.memberCount !== "number" ||
    !Number.isFinite(row.memberCount) ||
    typeof row.createdAt !== "string"
  ) {
    return null;
  }
  if (row.sport !== null && row.sport !== undefined && !isCommunitySport(row.sport)) {
    return null;
  }
  if (row.role !== null && row.role !== undefined && !isCommunityRole(row.role)) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    sport: isCommunitySport(row.sport) ? row.sport : null,
    memberCount: row.memberCount,
    createdAt: row.createdAt,
    joined: row.joined === true,
    role: isCommunityRole(row.role) ? row.role : null,
  };
}

export function parseCommunityMember(value: unknown): CommunityMember | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string" ||
    !isCommunityRole(row.role) ||
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
  };
}

export function parseCommunity(value: unknown): Community | null {
  const summary = parseCommunitySummary(value);
  if (!summary || !value || typeof value !== "object") return null;
  const members = (value as { members?: unknown }).members;
  if (!Array.isArray(members)) return null;
  return {
    ...summary,
    members: members
      .map(parseCommunityMember)
      .filter((item): item is CommunityMember => !!item),
  };
}

export function parseMyCommunity(value: unknown): MyCommunity | null {
  const summary = parseCommunitySummary(value);
  if (!summary || !value || typeof value !== "object") return null;
  const joinedAt = (value as { joinedAt?: unknown }).joinedAt;
  if (typeof joinedAt !== "string") return null;
  return { ...summary, joinedAt };
}

function parseCommunityList(body: unknown): CommunitySummary[] {
  if (!body || typeof body !== "object") return [];
  const rows = (body as { communities?: unknown }).communities;
  if (!Array.isArray(rows)) return [];
  return rows
    .map(parseCommunitySummary)
    .filter((item): item is CommunitySummary => !!item);
}

function parseMyCommunityList(body: unknown): MyCommunity[] {
  if (!body || typeof body !== "object") return [];
  const rows = (body as { communities?: unknown }).communities;
  if (!Array.isArray(rows)) return [];
  return rows
    .map(parseMyCommunity)
    .filter((item): item is MyCommunity => !!item);
}

export function formatCommunitySport(sport: CommunitySport | null): string {
  if (sport === "padel") return "Padel";
  if (sport === "multi") return "Multi-sport";
  return "Any sport";
}

export function formatMemberCount(count: number): string {
  return count === 1 ? "1 member" : `${count} members`;
}

/** Hide Leave when the caller is the only owner (or members are unknown). */
export function isSoleOwnerLeaveBlocked(
  community: Pick<CommunitySummary, "role"> & {
    members?: ReadonlyArray<Pick<CommunityMember, "role">>;
  },
): boolean {
  if (community.role !== "owner") return false;
  if (!community.members) return true;
  return community.members.filter((member) => member.role === "owner").length <= 1;
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function listCommunitiesWith(
  deps: CommunitiesDeps,
): Promise<CommunitiesResult<CommunitySummary[]>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, rootUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Could not load communities (${res.status})`,
        status: res.status,
      };
    }

    return { ok: true, value: parseCommunityList(await readJson(res)) };
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function getCommunityWith(
  id: string,
  deps: CommunitiesDeps,
): Promise<CommunitiesResult<Community>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing community id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, communityUrl(deps.baseUrl, trimmed), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, `Could not load community (${res.status})`),
        status: res.status,
      };
    }

    const community = parseCommunity(
      body && typeof body === "object"
        ? (body as { community?: unknown }).community
        : null,
    );
    if (!community) {
      return { ok: false, error: "Unexpected community response", status: 500 };
    }
    return { ok: true, value: community };
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function createCommunityWith(
  input: CreateCommunityInput,
  deps: CommunitiesDeps,
): Promise<CommunitiesResult<Community>> {
  const name = input.name.trim();
  const city = input.city.trim();
  if (!name || !city || !deps.baseUrl) {
    return { ok: false, error: "Name and city are required", status: 400 };
  }

  const payload: Record<string, string> = { name, city };
  if (input.sport === "padel" || input.sport === "multi") {
    payload.sport = input.sport;
  }

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
      return {
        ok: false,
        error: errorFromBody(body, "Could not create community"),
        status: res.status,
      };
    }

    const community = parseCommunity(
      body && typeof body === "object"
        ? (body as { community?: unknown }).community
        : null,
    );
    if (!community) {
      return { ok: false, error: "Unexpected community response", status: 500 };
    }
    return { ok: true, value: community };
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function joinCommunityWith(
  id: string,
  deps: CommunitiesDeps,
): Promise<CommunitiesResult<Community>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing community id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, joinUrl(deps.baseUrl, trimmed), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not join community"),
        status: res.status,
      };
    }

    const community = parseCommunity(
      body && typeof body === "object"
        ? (body as { community?: unknown }).community
        : null,
    );
    if (!community) {
      return { ok: false, error: "Unexpected community response", status: 500 };
    }
    return { ok: true, value: community };
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function leaveCommunityWith(
  id: string,
  deps: CommunitiesDeps,
): Promise<CommunitiesResult<true>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing community id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, joinUrl(deps.baseUrl, trimmed), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    if (!res.ok) {
      const body = await readJson(res);
      return {
        ok: false,
        error: errorFromBody(body, "Could not leave community"),
        status: res.status,
      };
    }

    return { ok: true, value: true };
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function listMyCommunitiesWith(
  deps: CommunitiesDeps,
): Promise<CommunitiesResult<MyCommunity[]>> {
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
      return {
        ok: false,
        error: `Could not load your communities (${res.status})`,
        status: res.status,
      };
    }

    return { ok: true, value: parseMyCommunityList(await readJson(res)) };
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function listCommunitiesResult(options: {
  cookie?: string;
} = {}): Promise<CommunitiesResult<CommunitySummary[]>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listCommunitiesWith({
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: empty list on 404 / migration lag / network failure. */
export async function listCommunities(options: {
  cookie?: string;
} = {}): Promise<CommunitySummary[]> {
  const result = await listCommunitiesResult(options);
  return result.ok ? result.value : [];
}

export async function getCommunityResult(
  id: string,
  options: { cookie?: string } = {},
): Promise<CommunitiesResult<Community>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return getCommunityWith(id, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: null on 404 / migration lag / network failure. */
export async function getCommunity(
  id: string,
  options: { cookie?: string } = {},
): Promise<Community | null> {
  const result = await getCommunityResult(id, options);
  return result.ok ? result.value : null;
}

export async function listMyCommunitiesResult(options: {
  cookie?: string;
} = {}): Promise<CommunitiesResult<MyCommunity[]>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listMyCommunitiesWith({
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: empty list on 401 / 404 / migration lag. */
export async function listMyCommunities(options: {
  cookie?: string;
} = {}): Promise<MyCommunity[]> {
  const result = await listMyCommunitiesResult(options);
  return result.ok ? result.value : [];
}

export async function createCommunity(
  input: CreateCommunityInput,
): Promise<CommunitiesResult<Community>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await createCommunityWith(input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function joinCommunity(
  id: string,
): Promise<CommunitiesResult<Community>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await joinCommunityWith(id, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function leaveCommunity(
  id: string,
): Promise<CommunitiesResult<true>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await leaveCommunityWith(id, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}
