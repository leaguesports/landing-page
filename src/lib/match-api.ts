import { getRailwayApiOrigin } from "@/lib/api-origin";
import { getSiteBaseUrl } from "@/lib/site-url";
import {
  MATCH_API_UNAVAILABLE,
  createPadelMatchWith,
  listPlayerHistoryWith,
  listVenueHistoryWith,
  lockPadelMatchWith,
  parseApiMatch,
} from "@/lib/padel/api-match";
import type {
  CreatePadelMatchInput,
  LockPadelMatchBody,
  MatchChannelEvent,
  PadelHistoryItem,
  PadelMatch,
  PadelMatchVenue,
} from "@/types/padel-match";

/**
 * Browser match API — same-origin `/api` so cookies stay first-party.
 * Server-side uses `getRailwayApiOrigin()`.
 *
 * Create/get identity is league-sports-api. `/api/matches/:id/events`
 * stays on this Next app for Ably live scoring.
 */

function getRequestBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getRailwayApiOrigin() || getSiteBaseUrl();
}

async function matchFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = getRequestBase();
  const res = await fetch(`${base}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? MATCH_API_UNAVAILABLE);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function createPadelMatch(
  input: CreatePadelMatchInput,
  display: { venue: PadelMatchVenue },
): Promise<PadelMatch> {
  return createPadelMatchWith(input, display.venue, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

export async function fetchPadelMatch(matchId: string): Promise<PadelMatch> {
  const snapshot = await matchFetch<unknown>(
    `/api/matches/${encodeURIComponent(matchId)}`,
  );
  const match = parseApiMatch(snapshot);
  if (!match?.id) {
    throw new Error("Match not found");
  }
  return match;
}

export async function lockPadelMatch(
  matchId: string,
  body: LockPadelMatchBody,
  venue?: PadelMatchVenue | null,
): Promise<PadelMatch> {
  return lockPadelMatchWith(matchId, body, {
    fetch,
    baseUrl: getRequestBase(),
    venue,
  });
}

export async function listPlayerHistory(
  playerUserId: string,
): Promise<PadelHistoryItem[]> {
  return listPlayerHistoryWith(playerUserId, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

export async function listVenueHistory(
  venueCmsId: string,
): Promise<PadelHistoryItem[]> {
  return listVenueHistoryWith(venueCmsId, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

/** Fire-and-forget Ably cache warm after a client publish (does not throw). */
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
