"use client";

import {
  friendsSnapshotOrEmpty,
  useAuth,
  useFriendsSession,
} from "@/components/providers/AppSessionProvider";
import {
  acceptFriend,
  removeFriend,
  type FriendRequest,
  type FriendsSnapshot,
} from "@/lib/friends/friends";
import {
  applyInboxAllRead,
  applyInboxNotificationRead,
  dispatchInboxChanged,
  emptyInboxPage,
  formatUnreadBadge,
  inboxNotificationCopy,
  inboxNotificationHref,
  INBOX_CHANGED_EVENT,
  isOrganisedGameInvite,
  listInboxNotifications,
  markAllInboxNotificationsRead,
  markInboxNotificationRead,
  type InboxNotification,
  type InboxNotificationsPage,
} from "@/lib/notifications/inbox";
import {
  dispatchFriendsChanged,
  notificationsFromFriends,
  type AppNotification,
} from "@/lib/notifications/notifications";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import { Bell, Check, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

function ActorAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
      <img
        src={avatarUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-base text-emerald-300"
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function formatRelativeTime(iso: string, nowMs: number): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const deltaSec = Math.round((nowMs - then) / 1000);
  if (deltaSec < 60) return "just now";
  const deltaMin = Math.round(deltaSec / 60);
  if (deltaMin < 60) return `${deltaMin}m ago`;
  const deltaHr = Math.round(deltaMin / 60);
  if (deltaHr < 48) return `${deltaHr}h ago`;
  const deltaDay = Math.round(deltaHr / 24);
  return `${deltaDay}d ago`;
}

function inviteBody(item: InboxNotification, nowMs: number): string {
  const copy = inboxNotificationCopy(item);
  if (!isOrganisedGameInvite(item)) return copy.body;
  const when = formatHubWhen(item.payload.startsAt, new Date(nowMs));
  return when ? `${copy.body} · ${when}` : copy.body;
}

export default function NotificationCenter() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const {
    snapshot,
    status,
    error: loadError,
    applySnapshot,
    ensureLoaded,
  } = useFriendsSession();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [inbox, setInbox] = useState<InboxNotificationsPage | null>(null);
  const [inboxStatus, setInboxStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [inboxPending, setInboxPending] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  const refreshInbox = useCallback(() => {
    void listInboxNotifications({ limit: 20 }).then((result) => {
      if (result.ok) {
        setInbox(result.value);
        setInboxStatus("ready");
        setInboxError(null);
        return;
      }
      setInboxStatus("error");
      setInboxError(result.error);
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      void Promise.resolve().then(() => {
        setInbox(null);
        setInboxStatus("idle");
        setInboxError(null);
      });
      return;
    }
    refreshInbox();
  }, [isAuthenticated, isLoading, refreshInbox]);

  useEffect(() => {
    if (!isAuthenticated) return;

    function onInboxChanged() {
      refreshInbox();
    }

    function onVisibility() {
      if (document.visibilityState === "visible") refreshInbox();
    }

    window.addEventListener(INBOX_CHANGED_EVENT, onInboxChanged);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(INBOX_CHANGED_EVENT, onInboxChanged);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated, refreshInbox]);

  // Fetch the friends graph only when the inbox opens and no RSC seed exists.
  // Avoids GET /api/me/friends on every signed-in route view.
  useEffect(() => {
    if (!open) return;
    ensureLoaded();
  }, [open, ensureLoaded]);

  useEffect(() => {
    if (!open) return;
    refreshInbox();
  }, [open, refreshInbox]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const friendItems: AppNotification[] = snapshot
    ? notificationsFromFriends(snapshot)
    : [];
  const inboxItems = inbox?.notifications ?? [];
  const friendsLoaded = status === "ready" || status === "error";
  const inboxLoaded = inboxStatus === "ready" || inboxStatus === "error";
  const error =
    actionError ??
    inboxError ??
    (status === "error" ? loadError : null);

  function publishSnapshot(next: FriendsSnapshot) {
    applySnapshot(next);
    dispatchFriendsChanged(next);
  }

  function onAccept(request: FriendRequest) {
    setActionError(null);
    const current = friendsSnapshotOrEmpty(snapshot);
    startTransition(() => {
      void acceptFriend(request.user.id).then((result) => {
        if (!result.ok) {
          setActionError(result.error);
          return;
        }
        publishSnapshot({
          friends: current.friends.some((f) => f.id === result.friend.id)
            ? current.friends
            : [result.friend, ...current.friends],
          incoming: current.incoming.filter((item) => item.id !== request.id),
          outgoing: current.outgoing.filter(
            (item) => item.user.id !== result.friend.id,
          ),
        });
      });
    });
  }

  function onDecline(request: FriendRequest) {
    setActionError(null);
    const current = friendsSnapshotOrEmpty(snapshot);
    startTransition(() => {
      void removeFriend(request.user.id).then((result) => {
        if (!result.ok) {
          setActionError(result.error);
          return;
        }
        publishSnapshot({
          friends: current.friends.filter((f) => f.id !== request.user.id),
          incoming: current.incoming.filter((item) => item.id !== request.id),
          outgoing: current.outgoing.filter(
            (item) => item.user.id !== request.user.id,
          ),
        });
      });
    });
  }

  function onOpenInboxItem(item: InboxNotification) {
    setOpen(false);
    if (item.readAt) return;
    const readAt = new Date().toISOString();
    setInbox((current) =>
      current ? applyInboxNotificationRead(current, item.id, readAt) : current,
    );
    void markInboxNotificationRead(item.id).then((result) => {
      if (!result.ok) {
        refreshInbox();
        return;
      }
      const confirmed = result.value.readAt ?? readAt;
      setInbox((current) =>
        current
          ? applyInboxNotificationRead(current, item.id, confirmed)
          : current,
      );
    });
  }

  function onMarkAllRead() {
    const page = inbox ?? emptyInboxPage();
    if (page.unreadCount <= 0) return;
    setActionError(null);
    setInboxPending(true);
    const readAt = new Date().toISOString();
    setInbox(applyInboxAllRead(page, readAt));
    void markAllInboxNotificationsRead().then((result) => {
      setInboxPending(false);
      if (!result.ok) {
        setActionError(result.error);
        refreshInbox();
        return;
      }
      dispatchInboxChanged();
    });
  }

  if (isLoading) {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-full border border-white/8 bg-white/5"
        aria-hidden
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const inboxUnread = inbox?.unreadCount ?? 0;
  const count = inboxUnread + friendItems.length;
  const badgeLabel = formatUnreadBadge(count);
  const listEmpty =
    inboxStatus === "ready" &&
    friendsLoaded &&
    inboxItems.length === 0 &&
    friendItems.length === 0;
  const listLoading =
    !inboxLoaded &&
    !friendsLoaded &&
    inboxItems.length === 0 &&
    friendItems.length === 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          count > 0
            ? `Notifications, ${count} unread`
            : "Notifications"
        }
        onClick={() => {
          setNowMs(Date.now());
          setOpen((value) => !value);
        }}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {badgeLabel ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold leading-none text-zinc-950">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notification center"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#141814] shadow-[0_18px_40px_rgba(0,0,0,0.45)] max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-16 max-sm:mt-2 max-sm:w-auto"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Notifications</p>
              <p className="text-xs text-zinc-500">
                {count === 0
                  ? "You’re all caught up"
                  : count === 1
                    ? "1 unread"
                    : `${count} unread`}
              </p>
            </div>
            {inboxUnread > 0 ? (
              <button
                type="button"
                disabled={inboxPending}
                onClick={onMarkAllRead}
                className="shrink-0 text-xs font-medium text-emerald-300 hover:text-emerald-200 disabled:opacity-60"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {error ? (
            <p
              className="border-b border-white/8 px-4 py-2 text-sm text-red-300"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
            {listLoading ? (
              <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>
            ) : listEmpty ? (
              <div className="px-4 py-6">
                <p className="text-sm leading-relaxed text-zinc-400">
                  No notifications yet. Invites to organised games will show up
                  here.
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
                  onClick={() => setOpen(false)}
                >
                  Open your hub
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-white/6">
                {inboxItems.map((item) => {
                  const copy = inboxNotificationCopy(item);
                  const href = inboxNotificationHref(item);
                  const unread = item.readAt == null;
                  const inner = (
                    <div className="flex items-start gap-3">
                      <ActorAvatar
                        name={copy.title}
                        avatarUrl={item.actor?.avatarUrl ?? null}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className={[
                              "truncate text-sm font-medium",
                              unread ? "text-white" : "text-zinc-300",
                            ].join(" ")}
                          >
                            {copy.title}
                          </p>
                          <time
                            className="shrink-0 text-[11px] text-zinc-600"
                            dateTime={item.createdAt}
                          >
                            {formatRelativeTime(item.createdAt, nowMs)}
                          </time>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {inviteBody(item, nowMs)}
                        </p>
                      </div>
                      {unread ? (
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  );

                  return (
                    <li key={item.id} className="px-4 py-3">
                      {href ? (
                        <Link
                          href={href}
                          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                          onClick={() => onOpenInboxItem(item)}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div>{inner}</div>
                      )}
                    </li>
                  );
                })}
                {friendItems.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <ActorAvatar
                        name={item.title}
                        avatarUrl={item.request.user.avatarUrl}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium text-white">
                            {item.title}
                          </p>
                          <time
                            className="shrink-0 text-[11px] text-zinc-600"
                            dateTime={item.createdAt}
                          >
                            {formatRelativeTime(item.createdAt, nowMs)}
                          </time>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.body}
                        </p>
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => onAccept(item.request)}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            aria-label={`Decline ${item.request.user.handle}`}
                            onClick={() => onDecline(item.request)}
                            className="inline-flex items-center gap-1 rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-white/20 hover:text-white disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {!friendsLoaded ? (
                  <li className="px-4 py-3 text-sm text-zinc-500">Loading…</li>
                ) : null}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
