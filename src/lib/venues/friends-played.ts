import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { dartsNewHref, golfNewHref, padelNewHref } from "./quick-start.ts";

export const FRIENDS_PLAYED_CAP = 6 as const;

export const FRIENDS_PLAYED_SECTION_TITLE = "Friends who've played here";

export const FRIENDS_PLAYED_EMPTY_CTA =
  "Be the first of your friends to play here" as const;

export const FRIENDS_PLAYED_DEFAULT_CTA = "Beat their score" as const;

export type FriendsPlayedSummary = {
  sport: string;
  bestGross: number | null;
  bestNet: number | null;
};

export type FriendsPlayedFriend = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastPlayedAt: string;
  summary: FriendsPlayedSummary | null;
};

export type FriendsPlayedResponse = {
  venue: { id: string; cmsId: string; name: string };
  total: number;
  friends: FriendsPlayedFriend[];
};

export type FriendsPlayedDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type FriendsPlayedResult =
  | { ok: true; payload: FriendsPlayedResponse; status: 200 }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string): HeadersInit {
  const headers: Record<string, string> = {};
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function friendsPlayedUrl(baseUrl: string, venueId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/venues/${encodeURIComponent(venueId)}/friends-played`;
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

function apiError(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

function parseSummary(value: unknown): FriendsPlayedSummary | null {
  if (value == null) return null;
  if (typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.sport !== "string" || !row.sport.trim()) return null;
  return {
    sport: row.sport,
    bestGross: typeof row.bestGross === "number" ? row.bestGross : null,
    bestNet: typeof row.bestNet === "number" ? row.bestNet : null,
  };
}

function parseFriend(value: unknown): FriendsPlayedFriend | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.userId !== "string" || !row.userId.trim()) return null;
  if (typeof row.displayName !== "string") return null;
  return {
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
    lastPlayedAt: typeof row.lastPlayedAt === "string" ? row.lastPlayedAt : "",
    summary: parseSummary(row.summary),
  };
}

export function parseFriendsPlayedResponse(
  value: unknown,
): FriendsPlayedResponse | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const venue = row.venue;
  if (!venue || typeof venue !== "object") return null;
  const venueRow = venue as Record<string, unknown>;
  if (
    typeof venueRow.id !== "string" ||
    typeof venueRow.cmsId !== "string" ||
    typeof venueRow.name !== "string"
  ) {
    return null;
  }
  if (!Array.isArray(row.friends)) return null;
  const total =
    typeof row.total === "number" && Number.isFinite(row.total)
      ? Math.max(0, Math.floor(row.total))
      : row.friends.length;

  const friends: FriendsPlayedFriend[] = [];
  for (const item of row.friends) {
    const friend = parseFriend(item);
    if (friend) friends.push(friend);
  }

  return {
    venue: {
      id: venueRow.id,
      cmsId: venueRow.cmsId,
      name: venueRow.name,
    },
    total,
    friends,
  };
}

export async function getVenueFriendsPlayedWith(
  venueId: string,
  deps: FriendsPlayedDeps,
): Promise<FriendsPlayedResult> {
  const id = venueId.trim();
  if (!id) {
    return { ok: false, error: "Venue is required", status: 400 };
  }
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, friendsPlayedUrl(deps.baseUrl, id), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (res.status === 401) {
      return { ok: false, error: "Unauthorized", status: 401 };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: apiError(body, `Could not load friends (${res.status})`),
        status: res.status,
      };
    }

    const payload = parseFriendsPlayedResponse(body);
    if (!payload) {
      return {
        ok: false,
        error: "Unexpected friends-played response",
        status: 500,
      };
    }
    return { ok: true, payload, status: 200 };
  } catch {
    return { ok: false, error: "Could not reach friends-played API", status: 0 };
  }
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function getVenueFriendsPlayed(
  venueId: string,
  options: { cookie?: string } = {},
): Promise<FriendsPlayedResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return getVenueFriendsPlayedWith(venueId, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

const NAME_TOKEN = /^[\p{L}][\p{L}'’-]*$/u;

/** First word of a display name when it is a usable given name. */
export function friendFirstName(displayName: string): string | null {
  const token = displayName.trim().split(/\s+/)[0] ?? "";
  const cleaned = token.replace(/[.,]+$/g, "");
  if (cleaned.length < 2) return null;
  if (!NAME_TOKEN.test(cleaned)) return null;
  return cleaned;
}

export function listedFriendsPlayed<T>(
  friends: readonly T[],
  cap: number = FRIENDS_PLAYED_CAP,
): T[] {
  return friends.slice(0, Math.max(0, cap));
}

export function friendsPlayedOverflow(
  total: number,
  shownCount: number,
): number {
  if (!Number.isFinite(total) || total <= shownCount) return 0;
  return Math.max(0, Math.floor(total) - shownCount);
}

export function friendsPlayedOverflowLabel(overflow: number): string | null {
  if (overflow <= 0) return null;
  return `+${overflow}`;
}

/**
 * One friend with a parseable given name → “Beat Alex’s score”.
 * Otherwise “Beat their score”. Empty list → empty-state CTA.
 */
export function friendsPlayedCtaLabel(
  friends: readonly Pick<FriendsPlayedFriend, "displayName">[],
): string {
  if (friends.length === 0) return FRIENDS_PLAYED_EMPTY_CTA;
  if (friends.length === 1) {
    const first = friendFirstName(friends[0]?.displayName ?? "");
    if (first) return `Beat ${first}'s score`;
  }
  return FRIENDS_PLAYED_DEFAULT_CTA;
}

/** Start the venue’s primary play sport with `?venue=` prefilled. */
export function friendsPlayedStartHref(input: {
  venueSlug?: string | null;
  primarySport?: string | null;
}): string {
  const slug = input.venueSlug?.trim() ?? "";
  const sport = input.primarySport?.trim().toLowerCase() ?? "";
  if (sport === "golf") return golfNewHref(slug || null);
  if (sport === "darts") return dartsNewHref(slug || null);
  if (sport === "padel") return padelNewHref(slug || null);
  return "/play";
}

export function formatFriendsPlayedAt(
  iso: string,
  timeZone = "Africa/Johannesburg",
): string {
  if (!iso.trim()) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    timeZone,
  });
}

export type FriendsPlayedHideReason =
  | "anonymous"
  | "unauthorized"
  | "error"
  | "loading";

export type FriendsPlayedView =
  | { visible: false; reason: FriendsPlayedHideReason }
  | {
      visible: true;
      empty: boolean;
      title: string;
      friends: FriendsPlayedFriend[];
      overflow: number;
      overflowLabel: string | null;
      ctaLabel: string;
      startHref: string;
    };

export function friendsPlayedView(input: {
  isAuthenticated: boolean;
  authLoading?: boolean;
  result: FriendsPlayedResult | null;
  startHref: string;
}): FriendsPlayedView {
  if (input.authLoading) {
    return { visible: false, reason: "loading" };
  }
  if (!input.isAuthenticated) {
    return { visible: false, reason: "anonymous" };
  }
  if (!input.result) {
    return { visible: false, reason: "loading" };
  }
  if (!input.result.ok) {
    if (input.result.status === 401) {
      return { visible: false, reason: "unauthorized" };
    }
    return { visible: false, reason: "error" };
  }

  const listed = listedFriendsPlayed(input.result.payload.friends);
  const overflow = friendsPlayedOverflow(input.result.payload.total, listed.length);
  return {
    visible: true,
    empty: listed.length === 0,
    title: FRIENDS_PLAYED_SECTION_TITLE,
    friends: listed,
    overflow,
    overflowLabel: friendsPlayedOverflowLabel(overflow),
    ctaLabel: friendsPlayedCtaLabel(listed),
    startHref: input.startHref,
  };
}
