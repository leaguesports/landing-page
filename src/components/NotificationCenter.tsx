"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  acceptFriend,
  listFriends,
  removeFriend,
  type FriendRequest,
} from "@/lib/friends/friends";
import {
  dispatchFriendsChanged,
  FRIENDS_CHANGED_EVENT,
  notificationsFromFriends,
  type AppNotification,
} from "@/lib/notifications/notifications";
import { Bell, Check, UserPlus, X } from "lucide-react";
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

export default function NotificationCenter() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  const applySnapshot = useCallback((snapshot: Awaited<ReturnType<typeof listFriends>>) => {
    setItems(notificationsFromFriends(snapshot));
    setError(null);
    setLoaded(true);
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoaded(true);
      return;
    }
    try {
      applySnapshot(await listFriends());
    } catch {
      setError("Could not load notifications");
      setLoaded(true);
    }
  }, [applySnapshot, isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!isAuthenticated) {
        // Yield so signed-out clears are not synchronous setState-in-effect.
        await Promise.resolve();
        if (cancelled) return;
        setItems([]);
        setLoaded(true);
        return;
      }

      try {
        const snapshot = await listFriends();
        if (cancelled) return;
        applySnapshot(snapshot);
      } catch {
        if (cancelled) return;
        setError("Could not load notifications");
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applySnapshot, isAuthenticated]);

  useEffect(() => {
    function onFriendsChanged() {
      void refresh();
    }
    window.addEventListener(FRIENDS_CHANGED_EVENT, onFriendsChanged);
    return () => {
      window.removeEventListener(FRIENDS_CHANGED_EVENT, onFriendsChanged);
    };
  }, [refresh]);

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

  function onAccept(request: FriendRequest) {
    setError(null);
    startTransition(() => {
      void acceptFriend(request.user.id).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setItems((prev) =>
          prev.filter((item) => item.request.id !== request.id),
        );
        dispatchFriendsChanged();
      });
    });
  }

  function onDecline(request: FriendRequest) {
    setError(null);
    startTransition(() => {
      void removeFriend(request.user.id).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setItems((prev) =>
          prev.filter((item) => item.request.id !== request.id),
        );
        dispatchFriendsChanged();
      });
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

  const count = items.length;
  const badgeLabel =
    count > 9 ? "9+" : count > 0 ? String(count) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          count > 0
            ? `Notifications, ${count} pending`
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
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#141814] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Notifications</p>
              <p className="text-xs text-zinc-500">
                {count === 0
                  ? "You’re all caught up"
                  : count === 1
                    ? "1 item needs a look"
                    : `${count} items need a look`}
              </p>
            </div>
            <UserPlus className="h-4 w-4 text-emerald-300/80" aria-hidden />
          </div>

          {error ? (
            <p className="border-b border-white/8 px-4 py-2 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
            {!loaded ? (
              <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>
            ) : count === 0 ? (
              <div className="px-4 py-6">
                <p className="text-sm leading-relaxed text-zinc-400">
                  No pending friend requests. When someone wants to connect,
                  it will show up here.
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
                {items.map((item) => (
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
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
