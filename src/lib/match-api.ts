import { ApiError } from "@/lib/api-client";
import {
  MATCH_API_UNAVAILABLE,
  parseApiMatch,
  toCreateMatchBody,
} from "@/lib/padel/api-match";
import type {
  CreatePadelMatchInput,
  MatchChannelEvent,
  PadelMatch,
  PadelMatchVenue,
} from "@/types/padel-match";

/**
 * Browser match API — same-origin `/api/matches*` so cookies stay first-party
 * (mirrors `api-client.ts` auth/pool pattern).
 *
 * Create/get identity is league-sports-api (proxied `/api/matches`).
 * `/api/matches/:id/events` stays on this Next app for Ably live scoring.
 */

function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://leaguesports.co.za").replace(
    /\/$/,
    "",
  );
}

function unavailableStatus(status: number): boolean {
  return (
    status === 0 ||
    status === 404 ||
    status === 405 ||
    status === 501 ||
    status === 502 ||
    status === 503
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

export async function createPadelMatch(
  input: CreatePadelMatchInput,
  display?: { venue?: PadelMatchVenue | null },
): Promise<PadelMatch> {
  const body = toCreateMatchBody(input);

  let created: unknown;
  try {
    created = await matchFetch<unknown>("/api/matches", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(0, MATCH_API_UNAVAILABLE);
    }
    if (error instanceof ApiError && unavailableStatus(error.status)) {
      throw new ApiError(
        error.status || 503,
        error.message && error.message !== "Match request failed"
          ? error.message
          : MATCH_API_UNAVAILABLE,
      );
    }
    throw error;
  }

  const match = parseApiMatch(created, { venue: display?.venue ?? null });
  if (!match?.id) {
    throw new ApiError(502, "Match API did not return a match id");
  }
  return match;
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
