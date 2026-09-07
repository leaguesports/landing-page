import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { hubOrganisedGameHref } from "../sports/hub-ia.ts";

export const INBOX_CHANGED_EVENT = "leaguesports-inbox-changed";

export const INBOX_LIST_PATH = "/api/me/notifications";
export const INBOX_READ_ALL_PATH = "/api/me/notifications/read-all";

export const ORGANISED_GAME_INVITE_TYPE = "organised_game_invite" as const;

export type InboxActor = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
};

export type OrganisedGameInvitePayload = {
  organisedGameId: string;
  sport: "padel" | "golf";
  startsAt: string;
  venueCmsId: string | null;
};

export type InboxNotificationBase = {
  id: string;
  actor: InboxActor | null;
  readAt: string | null;
  createdAt: string;
};

export type OrganisedGameInviteNotification = InboxNotificationBase & {
  type: typeof ORGANISED_GAME_INVITE_TYPE;
  payload: OrganisedGameInvitePayload;
};

export type UnknownInboxNotification = InboxNotificationBase & {
  type: string;
  payload: unknown;
};

export type InboxNotification =
  | OrganisedGameInviteNotification
  | UnknownInboxNotification;

export type InboxNotificationsPage = {
  notifications: InboxNotification[];
  unreadCount: number;
  nextCursor: string | null;
};

export type InboxDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type InboxResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

export type ListInboxQuery = {
  limit?: number;
  cursor?: string;
};

export function inboxReadPath(id: string): string {
  return `/api/me/notifications/${encodeURIComponent(id.trim())}/read`;
}

export function inboxListUrl(
  baseUrl: string,
  query: ListInboxQuery = {},
): string {
  const root = `${baseUrl.replace(/\/$/, "")}${INBOX_LIST_PATH}`;
  const params = new URLSearchParams();
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);
  const qs = params.toString();
  return qs ? `${root}?${qs}` : root;
}

export function inboxReadUrl(baseUrl: string, id: string): string {
  return `${baseUrl.replace(/\/$/, "")}${inboxReadPath(id)}`;
}

export function inboxReadAllUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${INBOX_READ_ALL_PATH}`;
}

/** Explicit Railway rewrite sources — `read-all` before `:id/read`. */
export const INBOX_PROXY_SOURCES = [
  INBOX_LIST_PATH,
  INBOX_READ_ALL_PATH,
  "/api/me/notifications/:id/read",
] as const;

export function isOrganisedGameInvite(
  notification: InboxNotification,
): notification is OrganisedGameInviteNotification {
  return notification.type === ORGANISED_GAME_INVITE_TYPE;
}

/** Deep-link to organised game detail from an invite payload. */
export function organisedGameInviteHref(
  payload: Pick<OrganisedGameInvitePayload, "organisedGameId">,
): string {
  return hubOrganisedGameHref(payload.organisedGameId);
}

export function inboxNotificationHref(
  notification: InboxNotification,
): string | null {
  if (!isOrganisedGameInvite(notification)) return null;
  return organisedGameInviteHref(notification.payload);
}

/** Hub-header badge label. Null when nothing unread. Caps at 9+. */
export function formatUnreadBadge(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  const n = Math.floor(count);
  if (n > 9) return "9+";
  return String(n);
}

export function organisedGameInviteCopy(
  notification: OrganisedGameInviteNotification,
): { title: string; body: string } {
  const title = notification.actor?.displayName.trim() || "Someone";
  const sport = notification.payload.sport === "golf" ? "golf" : "padel";
  return { title, body: `invited you to ${sport}` };
}

export function unknownInboxCopy(
  notification: UnknownInboxNotification,
): { title: string; body: string } {
  const title = notification.actor?.displayName.trim() || "Notification";
  return { title, body: "sent a notification" };
}

export function inboxNotificationCopy(
  notification: InboxNotification,
): { title: string; body: string } {
  if (isOrganisedGameInvite(notification)) {
    return organisedGameInviteCopy(notification);
  }
  return unknownInboxCopy(notification);
}

export function applyInboxNotificationRead(
  page: InboxNotificationsPage,
  id: string,
  readAt: string,
): InboxNotificationsPage {
  let unreadDelta = 0;
  const notifications = page.notifications.map((item) => {
    if (item.id !== id) return item;
    if (item.readAt == null) unreadDelta = 1;
    return { ...item, readAt };
  });
  return {
    ...page,
    notifications,
    unreadCount: Math.max(0, page.unreadCount - unreadDelta),
  };
}

export function applyInboxAllRead(
  page: InboxNotificationsPage,
  readAt: string,
): InboxNotificationsPage {
  return {
    ...page,
    unreadCount: 0,
    notifications: page.notifications.map((item) => ({
      ...item,
      readAt: item.readAt ?? readAt,
    })),
  };
}

export function emptyInboxPage(): InboxNotificationsPage {
  return { notifications: [], unreadCount: 0, nextCursor: null };
}

/** Tell the header bell to refetch after auto-read (game detail / RSVP). */
export function dispatchInboxChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));
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

function errorFromBody(body: unknown, status: number, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

function parseActor(value: unknown): InboxActor | null {
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

function parseInvitePayload(value: unknown): OrganisedGameInvitePayload | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.organisedGameId !== "string" ||
    !row.organisedGameId.trim() ||
    (row.sport !== "padel" && row.sport !== "golf") ||
    typeof row.startsAt !== "string"
  ) {
    return null;
  }
  return {
    organisedGameId: row.organisedGameId,
    sport: row.sport,
    startsAt: row.startsAt,
    venueCmsId: typeof row.venueCmsId === "string" ? row.venueCmsId : null,
  };
}

export function parseInboxNotification(value: unknown): InboxNotification | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.createdAt !== "string") {
    return null;
  }
  if (typeof row.type !== "string" || !row.type.trim()) return null;

  const actor = parseActor(row.actor);
  const readAt = typeof row.readAt === "string" ? row.readAt : null;
  const base: InboxNotificationBase = {
    id: row.id,
    actor,
    readAt,
    createdAt: row.createdAt,
  };

  if (row.type === ORGANISED_GAME_INVITE_TYPE) {
    const payload = parseInvitePayload(row.payload);
    if (!payload) return null;
    return { ...base, type: ORGANISED_GAME_INVITE_TYPE, payload };
  }

  return { ...base, type: row.type, payload: row.payload };
}

function parseUnreadCount(
  value: unknown,
  notifications: readonly InboxNotification[],
): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  return notifications.filter((item) => item.readAt == null).length;
}

export function parseInboxNotificationsPage(
  value: unknown,
): InboxNotificationsPage | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!Array.isArray(row.notifications)) return null;

  const notifications = row.notifications
    .map(parseInboxNotification)
    .filter((item): item is InboxNotification => item !== null);

  const nextCursor =
    typeof row.nextCursor === "string" && row.nextCursor
      ? row.nextCursor
      : null;

  return {
    notifications,
    unreadCount: parseUnreadCount(row.unreadCount, notifications),
    nextCursor,
  };
}

export async function listInboxNotificationsWith(
  deps: InboxDeps,
  query: ListInboxQuery = {},
): Promise<InboxResult<InboxNotificationsPage>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, inboxListUrl(deps.baseUrl, query), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, res.status, "Could not load notifications"),
        status: res.status,
      };
    }
    const page = parseInboxNotificationsPage(body);
    if (!page) {
      return {
        ok: false,
        error: "Unexpected notifications response",
        status: 500,
      };
    }
    return { ok: true, value: page };
  } catch {
    return { ok: false, error: "Could not reach notifications API", status: 0 };
  }
}

export async function markInboxNotificationReadWith(
  id: string,
  deps: InboxDeps,
): Promise<InboxResult<InboxNotification>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing notification id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, inboxReadUrl(deps.baseUrl, trimmed), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, res.status, "Could not mark notification read"),
        status: res.status,
      };
    }
    const notification = parseInboxNotification(
      body && typeof body === "object"
        ? (body as { notification?: unknown }).notification
        : null,
    );
    if (!notification) {
      return {
        ok: false,
        error: "Unexpected notifications response",
        status: 500,
      };
    }
    return { ok: true, value: notification };
  } catch {
    return { ok: false, error: "Could not reach notifications API", status: 0 };
  }
}

export async function markAllInboxNotificationsReadWith(
  deps: InboxDeps,
): Promise<InboxResult<{ ok: true; unreadCount: 0 }>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, inboxReadAllUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(
          body,
          res.status,
          "Could not mark notifications read",
        ),
        status: res.status,
      };
    }
    return { ok: true, value: { ok: true, unreadCount: 0 } };
  } catch {
    return { ok: false, error: "Could not reach notifications API", status: 0 };
  }
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function listInboxNotifications(
  query: ListInboxQuery = {},
  options: { cookie?: string } = {},
): Promise<InboxResult<InboxNotificationsPage>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listInboxNotificationsWith(
    {
      fetch,
      baseUrl: browserBaseUrl(),
      cookie: options.cookie,
      signal: AbortSignal.timeout(8000),
    },
    query,
  );
}

export async function markInboxNotificationRead(
  id: string,
): Promise<InboxResult<InboxNotification>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await markInboxNotificationReadWith(id, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach notifications API", status: 0 };
  }
}

export async function markAllInboxNotificationsRead(): Promise<
  InboxResult<{ ok: true; unreadCount: 0 }>
> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await markAllInboxNotificationsReadWith({
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach notifications API", status: 0 };
  }
}
