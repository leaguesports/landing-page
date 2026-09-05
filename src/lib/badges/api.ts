import { getRailwayApiOrigin, isApiConfigured } from "@/lib/api-origin";
import { invokeFetch } from "@/lib/invoke-fetch";
import { badgeById, type BadgeId } from "./catalog.ts";

export type PersistedBadge = {
  id: BadgeId;
  earnedAt: string;
};

export type BadgesSnapshot = {
  badges: PersistedBadge[];
  /** False when the API is missing or returned an error — UI should derive locally. */
  fromApi: boolean;
};

export type BadgesDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

function badgesUrl(baseUrl: string): string {
  const root = baseUrl.replace(/\/$/, "");
  return `${root}/api/me/badges`;
}

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
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

function parsePersistedBadge(value: unknown): PersistedBadge | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !badgeById(row.id)) return null;
  if (typeof row.earnedAt !== "string") return null;
  return { id: row.id as BadgeId, earnedAt: row.earnedAt };
}

function parseSnapshot(body: unknown): PersistedBadge[] {
  if (!body || typeof body !== "object") return [];
  const badges = (body as { badges?: unknown }).badges;
  if (!Array.isArray(badges)) return [];
  return badges
    .map(parsePersistedBadge)
    .filter((badge): badge is PersistedBadge => badge !== null);
}

export async function listBadgesWith(
  deps: BadgesDeps,
): Promise<BadgesSnapshot> {
  try {
    const res = await invokeFetch(deps.fetch, badgesUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    if (!res.ok) return { badges: [], fromApi: false };
    return { badges: parseSnapshot(await readJson(res)), fromApi: true };
  } catch {
    return { badges: [], fromApi: false };
  }
}

/** Idempotent upsert of earned badge ids. No-op when API is unavailable. */
export async function syncBadgesWith(
  earnedIds: BadgeId[],
  deps: BadgesDeps,
): Promise<BadgesSnapshot> {
  if (earnedIds.length === 0) {
    return { badges: [], fromApi: false };
  }

  try {
    const res = await invokeFetch(deps.fetch, badgesUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify({ earnedIds }),
      signal: deps.signal,
    });
    if (!res.ok) return { badges: [], fromApi: false };
    return { badges: parseSnapshot(await readJson(res)), fromApi: true };
  } catch {
    return { badges: [], fromApi: false };
  }
}

export async function listBadges(options: {
  cookie?: string;
  signal?: AbortSignal;
} = {}): Promise<BadgesSnapshot> {
  if (!isApiConfigured()) return { badges: [], fromApi: false };
  return listBadgesWith({
    fetch,
    baseUrl: getRailwayApiOrigin(),
    cookie: options.cookie,
    signal: options.signal,
  });
}

/** Browser helper — same-origin `/api` proxy. */
export async function syncBadgesBrowser(
  earnedIds: BadgeId[],
): Promise<BadgesSnapshot> {
  return syncBadgesWith(earnedIds, {
    fetch,
    baseUrl: "",
  });
}
