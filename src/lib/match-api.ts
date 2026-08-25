import type {
  CreatePadelMatchInput,
  MatchChannelEvent,
  PadelMatch,
} from "@/types/padel-match";
import { ApiError } from "@/lib/api-client";

/**
 * Browser match API — same-origin `/api/matches*` so cookies stay first-party
 * (mirrors `api-client.ts` auth/pool pattern).
 */

function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://leaguesports.co.za").replace(
    /\/$/,
    "",
  );
}

async function matchFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${siteOrigin()}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? "Match request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function createPadelMatch(input: CreatePadelMatchInput) {
  return matchFetch<PadelMatch>("/api/matches", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchPadelMatch(matchId: string) {
  return matchFetch<PadelMatch>(`/api/matches/${encodeURIComponent(matchId)}`);
}

/** Fire-and-forget DB sync after Ably publish (does not throw to callers). */
export async function syncMatchEvent(event: MatchChannelEvent): Promise<void> {
  try {
    await matchFetch(`/api/matches/${encodeURIComponent(event.matchId)}/events`, {
      method: "POST",
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.warn("[match-api] async event sync failed", error);
  }
}

const CACHE_KEY = (id: string) => `padel-match:${id}`;

export function cacheMatchLocally(match: PadelMatch): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY(match.id), JSON.stringify(match));
  } catch {
    // quota / private mode
  }
}

export function readCachedMatch(matchId: string): PadelMatch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY(matchId));
    if (!raw) return null;
    return JSON.parse(raw) as PadelMatch;
  } catch {
    return null;
  }
}
