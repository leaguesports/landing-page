import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export type FriendUser = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
};

export type Friend = FriendUser & {
  since: string;
};

export type FriendRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  createdAt: string;
  user: FriendUser;
};

export type FriendsSnapshot = {
  friends: Friend[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};

export type FriendsDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function friendsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/friends`;
}

function friendUserUrl(baseUrl: string, userId: string): string {
  return `${friendsUrl(baseUrl)}/${encodeURIComponent(userId)}`;
}

function acceptUrl(baseUrl: string, userId: string): string {
  return `${friendUserUrl(baseUrl, userId)}/accept`;
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

function parseFriendUser(value: unknown): FriendUser | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    displayName: row.displayName,
    handle: row.handle,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
  };
}

function parseFriend(value: unknown): Friend | null {
  const user = parseFriendUser(value);
  if (!user || !value || typeof value !== "object") return null;
  const since = (value as { since?: unknown }).since;
  if (typeof since !== "string") return null;
  return { ...user, since };
}

function parseRequest(value: unknown): FriendRequest | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const user = parseFriendUser(row.user);
  if (
    typeof row.id !== "string" ||
    (row.direction !== "incoming" && row.direction !== "outgoing") ||
    typeof row.createdAt !== "string" ||
    !user
  ) {
    return null;
  }
  return {
    id: row.id,
    direction: row.direction,
    createdAt: row.createdAt,
    user,
  };
}

function parseSnapshot(body: unknown): FriendsSnapshot {
  if (!body || typeof body !== "object") {
    return { friends: [], incoming: [], outgoing: [] };
  }
  const row = body as Record<string, unknown>;
  return {
    friends: Array.isArray(row.friends)
      ? row.friends.map(parseFriend).filter((item): item is Friend => !!item)
      : [],
    incoming: Array.isArray(row.incoming)
      ? row.incoming
          .map(parseRequest)
          .filter((item): item is FriendRequest => !!item)
      : [],
    outgoing: Array.isArray(row.outgoing)
      ? row.outgoing
          .map(parseRequest)
          .filter((item): item is FriendRequest => !!item)
      : [],
  };
}

export function emptyFriendsSnapshot(): FriendsSnapshot {
  return { friends: [], incoming: [], outgoing: [] };
}

export async function listFriendsWith(
  deps: FriendsDeps,
): Promise<FriendsSnapshot> {
  if (!deps.baseUrl) return emptyFriendsSnapshot();

  const res = await invokeFetch(deps.fetch, friendsUrl(deps.baseUrl), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (!res.ok) return emptyFriendsSnapshot();
  return parseSnapshot(await readJson(res));
}

export type RequestFriendResult =
  | { ok: true; status: "pending"; request: FriendRequest }
  | { ok: true; status: "accepted"; friend: Friend }
  | { ok: false; error: string; status: number };

export async function requestFriendWith(
  handle: string,
  deps: FriendsDeps,
): Promise<RequestFriendResult> {
  const trimmed = handle.trim().replace(/^@/, "");
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Enter a handle", status: 400 };
  }

  const res = await invokeFetch(deps.fetch, friendsUrl(deps.baseUrl), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie, true),
    body: JSON.stringify({ handle: trimmed }),
    signal: deps.signal,
  });

  const body = await readJson(res);
  if (!res.ok) {
    const error =
      body &&
      typeof body === "object" &&
      typeof (body as { error?: unknown }).error === "string"
        ? (body as { error: string }).error
        : "Could not send friend request";
    return { ok: false, error, status: res.status };
  }

  if (
    body &&
    typeof body === "object" &&
    (body as { status?: unknown }).status === "accepted"
  ) {
    const friend = parseFriend((body as { friend?: unknown }).friend);
    if (friend) return { ok: true, status: "accepted", friend };
  }

  const request = parseRequest((body as { request?: unknown }).request);
  if (request) return { ok: true, status: "pending", request };

  return { ok: false, error: "Unexpected friends response", status: 500 };
}

export async function acceptFriendWith(
  userId: string,
  deps: FriendsDeps,
): Promise<{ ok: true; friend: Friend } | { ok: false; error: string }> {
  const id = userId.trim();
  if (!id || !deps.baseUrl) {
    return { ok: false, error: "Missing friend id" };
  }

  const res = await invokeFetch(deps.fetch, acceptUrl(deps.baseUrl, id), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  const body = await readJson(res);
  if (!res.ok) {
    const error =
      body &&
      typeof body === "object" &&
      typeof (body as { error?: unknown }).error === "string"
        ? (body as { error: string }).error
        : "Could not accept friend request";
    return { ok: false, error };
  }

  const friend = parseFriend((body as { friend?: unknown }).friend);
  if (!friend) return { ok: false, error: "Unexpected friends response" };
  return { ok: true, friend };
}

export async function removeFriendWith(
  userId: string,
  deps: FriendsDeps,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = userId.trim();
  if (!id || !deps.baseUrl) {
    return { ok: false, error: "Missing friend id" };
  }

  const res = await invokeFetch(deps.fetch, friendUserUrl(deps.baseUrl, id), {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (!res.ok) {
    const body = await readJson(res);
    const error =
      body &&
      typeof body === "object" &&
      typeof (body as { error?: unknown }).error === "string"
        ? (body as { error: string }).error
        : "Could not remove friend";
    return { ok: false, error };
  }

  return { ok: true };
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function listFriends(options: {
  cookie?: string;
} = {}): Promise<FriendsSnapshot> {
  if (!isApiConfigured()) return emptyFriendsSnapshot();
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : getRailwayApiOrigin();
    return await listFriendsWith({
      fetch,
      baseUrl,
      cookie: options.cookie,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return emptyFriendsSnapshot();
  }
}

export async function requestFriend(
  handle: string,
): Promise<RequestFriendResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await requestFriendWith(handle, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach friends API", status: 0 };
  }
}

export async function acceptFriend(
  userId: string,
): Promise<{ ok: true; friend: Friend } | { ok: false; error: string }> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured" };
  }
  try {
    return await acceptFriendWith(userId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach friends API" };
  }
}

export async function removeFriend(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured" };
  }
  try {
    return await removeFriendWith(userId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach friends API" };
  }
}
