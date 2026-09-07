import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import type { CommunitiesDeps, CommunitiesResult } from "./communities.ts";

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

/** Cap hub strip activity fetches so we never N+1 the full membership list. */
export const COMMUNITY_ACTIVITY_HUB_LIMIT = 5;

export const CHALLENGE_COMMUNITY_QUERY = "community";
export const CHALLENGE_GUEST_QUERY = "guest";

function requestHeaders(cookie?: string): HeadersInit {
  const headers: Record<string, string> = {};
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function activityUrl(baseUrl: string, id: string): string {
  const root = `${baseUrl.replace(/\/$/, "")}/api/communities`;
  return `${root}/${encodeURIComponent(id)}/activity`;
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

function isActivitySport(value: unknown): value is CommunityActivitySport {
  return value === "padel" || value === "golf";
}

function isActivityKind(value: unknown): value is CommunityActivityKind {
  return value === "match" || value === "round";
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

/**
 * Deep links from GET /activity are same-origin scorecard paths only.
 * Reject anything else so the feed cannot render an unexpected href.
 */
export function isCommunityActivityPath(
  path: string,
  sport?: CommunityActivitySport,
): boolean {
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

export async function listCommunityActivityWith(
  id: string,
  deps: CommunitiesDeps,
): Promise<CommunitiesResult<CommunityActivityItem[]>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing community id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, activityUrl(deps.baseUrl, trimmed), {
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
        error: errorFromBody(body, `Could not load activity (${res.status})`),
        status: res.status,
      };
    }

    return { ok: true, value: parseCommunityActivityItems(await readJson(res)) };
  } catch {
    return { ok: false, error: "Could not reach communities API", status: 0 };
  }
}

export async function listCommunityActivityResult(
  id: string,
  options: { cookie?: string } = {},
): Promise<CommunitiesResult<CommunityActivityItem[]>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listCommunityActivityWith(id, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/**
 * RSC-friendly helper: empty list on 404 / 503 / migration lag / network
 * failure. Never invents live activity.
 */
export async function listCommunityActivity(
  id: string,
  options: { cookie?: string } = {},
): Promise<CommunityActivityItem[]> {
  const result = await listCommunityActivityResult(id, options);
  return result.ok ? result.value : [];
}

export async function listLatestCommunityActivityByIdsWith(
  ids: readonly string[],
  deps: CommunitiesDeps & { limit?: number },
): Promise<Record<string, CommunityActivityItem>> {
  const cap = deps.limit ?? COMMUNITY_ACTIVITY_HUB_LIMIT;
  const unique = [
    ...new Set(ids.map((id) => id.trim()).filter(Boolean)),
  ].slice(0, Math.max(0, cap));

  const rows = await Promise.all(
    unique.map(async (id) => {
      const result = await listCommunityActivityWith(id, deps);
      const latest = result.ok ? result.value[0] : undefined;
      return latest ? ([id, latest] as const) : null;
    }),
  );

  const latest: Record<string, CommunityActivityItem> = {};
  for (const row of rows) {
    if (row) latest[row[0]] = row[1];
  }
  return latest;
}

/**
 * Latest locked result per community for the hub strip. Fetches only the
 * compact preview ids (default 5) in parallel. Failed/empty activity is
 * omitted so the strip can keep its current member-count row.
 */
export async function listLatestCommunityActivityByIds(
  ids: readonly string[],
  options: { cookie?: string; limit?: number } = {},
): Promise<Record<string, CommunityActivityItem>> {
  if (!isApiConfigured()) return {};
  return listLatestCommunityActivityByIdsWith(ids, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
    limit: options.limit,
  });
}
