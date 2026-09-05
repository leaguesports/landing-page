"use client";

import {
  acceptFriend,
  removeFriend,
  requestFriend,
  type Friend,
  type FriendRequest,
  type FriendsSnapshot,
} from "@/lib/friends/friends";
import { UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

type FriendsPanelProps = {
  initial: FriendsSnapshot;
  /** Override outer spacing — use when the panel sits in its own hub tab. */
  className?: string;
  /** When false, skip the panel eyebrow (parent already titled the section). */
  showHeading?: boolean;
};

function FriendAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-10 w-10 rounded-full border border-white/10 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 font-display text-lg text-emerald-300">
      {name.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

export function FriendsPanel({
  initial,
  className = "mt-8",
  showHeading = true,
}: FriendsPanelProps) {
  const [friends, setFriends] = useState<Friend[]>(initial.friends);
  const [incoming, setIncoming] = useState<FriendRequest[]>(initial.incoming);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>(initial.outgoing);
  const [handle, setHandle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function clearFeedback() {
    setMessage(null);
    setError(null);
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    clearFeedback();
    const nextHandle = handle.trim();
    if (!nextHandle) {
      setError("Enter a handle");
      return;
    }

    startTransition(() => {
      void requestFriend(nextHandle).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setHandle("");
        if (result.status === "accepted") {
          setFriends((prev) =>
            prev.some((f) => f.id === result.friend.id)
              ? prev
              : [result.friend, ...prev],
          );
          setIncoming((prev) =>
            prev.filter((item) => item.user.id !== result.friend.id),
          );
          setOutgoing((prev) =>
            prev.filter((item) => item.user.id !== result.friend.id),
          );
          setMessage(`You’re now friends with @${result.friend.handle}`);
          return;
        }
        setOutgoing((prev) =>
          prev.some((item) => item.id === result.request.id)
            ? prev
            : [result.request, ...prev],
        );
        setMessage(`Request sent to @${result.request.user.handle}`);
      });
    });
  }

  function onAccept(request: FriendRequest) {
    clearFeedback();
    startTransition(() => {
      void acceptFriend(request.user.id).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setIncoming((prev) => prev.filter((item) => item.id !== request.id));
        setFriends((prev) =>
          prev.some((f) => f.id === result.friend.id)
            ? prev
            : [result.friend, ...prev],
        );
        setMessage(`You’re now friends with @${result.friend.handle}`);
      });
    });
  }

  function onRemove(userId: string, label: string) {
    clearFeedback();
    startTransition(() => {
      void removeFriend(userId).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setFriends((prev) => prev.filter((f) => f.id !== userId));
        setIncoming((prev) => prev.filter((item) => item.user.id !== userId));
        setOutgoing((prev) => prev.filter((item) => item.user.id !== userId));
        setMessage(label);
      });
    });
  }

  const empty =
    friends.length === 0 && incoming.length === 0 && outgoing.length === 0;

  return (
    <div className={className}>
      {showHeading ? (
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Friends
          </p>
        </div>
      ) : null}

      <form
        onSubmit={onAdd}
        className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label className="sr-only" htmlFor="friend-handle">
          Friend handle
        </label>
        <input
          id="friend-handle"
          type="text"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="@handle"
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Add friend
        </button>
      </form>

      {error ? (
        <p className="mb-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-3 text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}

      {empty ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No friends yet. Add someone by their @handle — you can still play
            with guests and WhatsApp share without being friends.
          </p>
          <Link
            href="/padel/new"
            className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Challenge a friend to padel
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {incoming.length > 0 ? (
            <ul className="space-y-2">
              {incoming.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FriendAvatar
                      name={request.user.displayName}
                      avatarUrl={request.user.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {request.user.displayName}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        @{request.user.handle} · wants to connect
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onAccept(request)}
                      className="rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      aria-label={`Decline ${request.user.handle}`}
                      onClick={() =>
                        onRemove(request.user.id, "Request declined")
                      }
                      className="rounded-full border border-white/12 p-1.5 text-zinc-500 hover:text-white disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {friends.length > 0 ? (
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FriendAvatar
                      name={friend.displayName}
                      avatarUrl={friend.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {friend.displayName}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        @{friend.handle}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href="/padel/new"
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                      Challenge
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      aria-label={`Remove ${friend.handle}`}
                      onClick={() =>
                        onRemove(friend.id, `Removed @${friend.handle}`)
                      }
                      className="rounded-full border border-white/12 p-1.5 text-zinc-500 hover:text-white disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {outgoing.length > 0 ? (
            <ul className="space-y-2">
              {outgoing.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FriendAvatar
                      name={request.user.displayName}
                      avatarUrl={request.user.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {request.user.displayName}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        @{request.user.handle} · pending
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      onRemove(request.user.id, "Request cancelled")
                    }
                    className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
