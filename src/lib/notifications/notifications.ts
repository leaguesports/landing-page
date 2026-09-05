import type { FriendRequest, FriendsSnapshot } from "../friends/friends.ts";

export const FRIENDS_CHANGED_EVENT = "leaguesports-friends-changed";

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

export function dispatchFriendsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FRIENDS_CHANGED_EVENT));
}
