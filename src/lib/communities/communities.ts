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

export type CommunityActivitySport = "padel" | "golf";
export type CommunityActivityKind = "match" | "round";

export type CommunityActivityPlayer = {
  userId: string | null;
  displayName: string;
  isGuest: boolean;
};

export type CommunityActivityItem = {
  id: string;
  sport: CommunityActivitySport;
  kind: CommunityActivityKind;
  lockedAt: string;
  venueCmsId: string | null;
  venueName: string | null;
  path: string;
  summary: string;
  players: CommunityActivityPlayer[];
};

export type CreateCommunityInput = {
  name: string;
  city: string;
  sport?: CommunitySport | null;
};

/** Cap hub strip activity fetches so we never N+1 the full membership list. */
export const COMMUNITY_ACTIVITY_HUB_LIMIT = 5;

export const CHALLENGE_COMMUNITY_QUERY = "community";
export const CHALLENGE_GUEST_QUERY = "guest";

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

function activityUrl(baseUrl: string, id: string): string {
  return `${communityUrl(baseUrl, id)}/activity`;
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

function isActivitySport(value: unknown): value is CommunityActivitySport {
  return value === "padel" || value === "golf";
}

function isActivityKind(value: unknown): value is CommunityActivityKind {
  return value === "match" || value === "round";
}

/**
 * Deep links from GET /activity are same-origin scorecard paths only.
 * Reject anything else so the feed cannot render an unexpected href.
 */
export function isCommunityActivityPath(path: string, sport?: CommunityActivitySport): boolean {
  if (sport === "padel") return /^\/padel\/[A-Za-z0-9_-]+$/.test(path);
  if (sport === "golf") return /^\/golf\/[A-Za-z0-9_-]+$/.test(path);
  return /^\/(padel|golf)\/[A-Za-z0-9_-]+$/.test(path);
}

export function parseCommunityActivityPlayer(
  value: unknown,
): CommunityActivityPlayer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.displayName !== "string" || typeof row.isGuest !== "boolean") {
    return null;
  }
  if (row.userId !== null && row.userId !== undefined && typeof row.userId !== "string") {
    return null;
  }
  return {
    userId: typeof row.userId === "string" ? row.userId : null,
    displayName: row.displayName,
    isGuest: row.isGuest,
  };
}

export function parseCommunityActivityItem(
  value: unknown,
): CommunityActivityItem | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !row.id.trim() ||
    !isActivitySport(row.sport) ||
    !isActivityKind(row.kind) ||
    typeof row.lockedAt !== "string" ||
    typeof row.path !== "string" ||
    typeof row.summary !== "string"
  ) {
    return null;
  }
  if (row.sport === "padel" && row.kind !== "match") return null;
  if (row.sport === "golf" && row.kind !== "round") return null;
  if (!isCommunityActivityPath(row.path, row.sport)) return null;
  if (row.venueCmsId !== null && row.venueCmsId !== undefined && typeof row.venueCmsId !== "string") {
    return null;
  }
  if (row.venueName !== null && row.venueName !== undefined && typeof row.venueName !== "string") {
    return null;
  }

  const players = Array.isArray(row.players)
    ? row.players
        .map(parseCommunityActivityPlayer)
        .filter((item): item is CommunityActivityPlayer => !!item)
    : [];

  return {
    id: row.id,
    sport: row.sport,
    kind: row.kind,
    lockedAt: row.lockedAt,
    venueCmsId: typeof row.venueCmsId === "string" ? row.venueCmsId : null,
    venueName: typeof row.venueName === "string" ? row.venueName : null,
    path: row.path,
    summary: row.summary,
    players,
  };
}

export function parseCommunityActivityItems(body: unknown): CommunityActivityItem[] {
  if (!body || typeof body !== "object") return [];
  const rows = (body as { items?: unknown }).items;
  if (!Array.isArray(rows)) return [];
  return rows
    .map(parseCommunityActivityItem)
    .filter((item): item is CommunityActivityItem => !!item);
}

/**
 * `/padel/new` challenge query params (documented for issue #140):
 * - `community` — originating community id (context only; not persisted on the match)
 * - `guest` — opponent display name, prefilled as a Team B guest when present
 *
 * Guests are still allowed on create. Either param may be omitted.
 */
export function communityChallengeHref(opts: {
  communityId?: string | null;
  guestName?: string | null;
} = {}): string {
  const params = new URLSearchParams();
  const communityId = opts.communityId?.trim();
  if (communityId) params.set(CHALLENGE_COMMUNITY_QUERY, communityId);
  const guestName = opts.guestName?.trim();
  if (guestName) params.set(CHALLENGE_GUEST_QUERY, guestName);
  const query = params.toString();
  return query ? `/padel/new?${query}` : "/padel/new";
}

export function formatActivitySport(sport: CommunityActivitySport): string {
  return sport === "golf" ? "Golf" : "Padel";
}

export function formatActivityWhen(iso: string, nowMs = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const deltaSec = Math.round((nowMs - then) / 1000);
  if (deltaSec < 45) return "just now";
  const deltaMin = Math.round(deltaSec / 60);
  if (deltaMin < 60) return `${Math.max(1, deltaMin)}m ago`;
  const deltaHr = Math.round(deltaMin / 60);
  if (deltaHr < 48) return `${deltaHr}h ago`;
  const parsed = new Date(iso);
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function challengeGuestFromActivity(
  item: Pick<CommunityActivityItem, "players">,
  selfUserId?: string | null,
): string | undefined {
  const self = selfUserId?.trim() || null;
  const opponent = item.players.find((player) => {
    const name = player.displayName.trim();
    if (!name) return false;
    if (self && player.userId === self) return false;
    return true;
  });
  return opponent?.displayName.trim() || undefined;
}
