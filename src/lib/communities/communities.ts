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
