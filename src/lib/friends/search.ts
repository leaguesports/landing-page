import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import type { FriendUser } from "./friends.ts";

export type UserSearchRelationship =
  | "none"
  | "friend"
  | "incoming"
  | "outgoing"
  | "self";

export type UserSearchResult = FriendUser & {
  relationship: UserSearchRelationship;
};

export type SearchUsersDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

function requestHeaders(cookie?: string): HeadersInit {
  const headers: Record<string, string> = {};
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function searchUrl(baseUrl: string, query: string, limit: number): string {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/api/users/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  return url.toString();
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

function parseUser(value: unknown): UserSearchResult | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string"
  ) {
    return null;
  }
  const relationship = row.relationship;
  if (
    relationship !== "none" &&
    relationship !== "friend" &&
    relationship !== "incoming" &&
    relationship !== "outgoing" &&
    relationship !== "self"
  ) {
    return null;
  }
  return {
    id: row.id,
    displayName: row.displayName,
    handle: row.handle,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
    relationship,
  };
}

export type SearchUsersResult =
  | { ok: true; users: UserSearchResult[] }
  | { ok: false; error: string; status: number };

export async function searchUsersWith(
  query: string,
  deps: SearchUsersDeps,
  limit = 10,
): Promise<SearchUsersResult> {
  const trimmed = query.trim().replace(/^@/, "");
  if (!trimmed) {
    return { ok: true, users: [] };
  }
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      searchUrl(deps.baseUrl, trimmed, limit),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        error: `Could not search users (${res.status})`,
        status: res.status,
      };
    }

    const body = await readJson(res);
    const usersRaw =
      body && typeof body === "object"
        ? (body as { users?: unknown }).users
        : null;
    if (!Array.isArray(usersRaw)) {
      return { ok: false, error: "Unexpected search response", status: 500 };
    }

    return {
      ok: true,
      users: usersRaw
        .map(parseUser)
        .filter((item): item is UserSearchResult => !!item),
    };
  } catch {
    return { ok: false, error: "Could not reach user search API", status: 0 };
  }
}

export async function searchUsers(
  query: string,
  limit = 10,
): Promise<SearchUsersResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await searchUsersWith(
      query,
      {
        fetch,
        baseUrl:
          typeof window !== "undefined"
            ? window.location.origin
            : getRailwayApiOrigin(),
        signal: AbortSignal.timeout(8000),
      },
      limit,
    );
  } catch {
    return { ok: false, error: "Could not reach user search API", status: 0 };
  }
}
