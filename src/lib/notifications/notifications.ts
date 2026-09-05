import type { FriendRequest, FriendsSnapshot } from "../friends/friends.ts";

export const FRIENDS_CHANGED_EVENT = "leaguesports-friends-changed";

export type FriendsChangedDetail = {
  snapshot: FriendsSnapshot;
};

export type FriendRequestNotification = {
  id: string;
  kind: "friend_request";
  createdAt: string;
  title: string;
  body: string;
  request: FriendRequest;
};

export type AppNotification = FriendRequestNotification;

/** Map friends snapshot into actionable inbox items (newest first). */
export function notificationsFromFriends(
  snapshot: Pick<FriendsSnapshot, "incoming">,
): AppNotification[] {
  return [...snapshot.incoming]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((request) => ({
      id: `friend_request:${request.id}`,
      kind: "friend_request" as const,
      createdAt: request.createdAt,
      title: request.user.displayName,
      body: `@${request.user.handle} wants to connect`,
      request,
    }));
}

export function unreadNotificationCount(
  notifications: readonly AppNotification[],
): number {
  return notifications.length;
}

/** Broadcast an authoritative post-mutation friends snapshot (no refetch required). */
export function dispatchFriendsChanged(snapshot: FriendsSnapshot): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<FriendsChangedDetail>(FRIENDS_CHANGED_EVENT, {
      detail: { snapshot },
    }),
  );
}

/** Read the snapshot from a friends-changed event, if present and well-formed. */
export function readFriendsChangedSnapshot(
  event: Event,
): FriendsSnapshot | null {
  if (!(event instanceof CustomEvent)) return null;
  const detail = event.detail as FriendsChangedDetail | null | undefined;
  const snapshot = detail?.snapshot;
  if (!snapshot || typeof snapshot !== "object") return null;
  if (
    !Array.isArray(snapshot.friends) ||
    !Array.isArray(snapshot.incoming) ||
    !Array.isArray(snapshot.outgoing)
  ) {
    return null;
  }
  return snapshot;
}
