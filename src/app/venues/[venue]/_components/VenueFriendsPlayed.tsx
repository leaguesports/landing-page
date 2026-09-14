"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  formatFriendsPlayedAt,
  friendsPlayedStartHref,
  friendsPlayedView,
  getVenueFriendsPlayed,
  type FriendsPlayedResult,
} from "@/lib/venues/friends-played";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function FriendAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
      <img
        src={avatarUrl}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-base text-emerald-300"
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function VenueFriendsPlayed({
  venueId,
  venueName,
  venueSlug,
  primarySport,
  startHref,
}: {
  venueId: string;
  venueName: string;
  venueSlug: string;
  primarySport?: string | null;
  startHref?: string | null;
}) {
  const { isAuthenticated, isLoading: authLoading, promptSoftWall } = useAuth();
  const [fetched, setFetched] = useState<{
    venueId: string;
    result: FriendsPlayedResult;
  } | null>(null);

  const resolvedStartHref =
    startHref?.trim() ||
    friendsPlayedStartHref({
      venueSlug,
      primarySport,
    });

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    void getVenueFriendsPlayed(venueId).then((next) => {
      if (!cancelled) setFetched({ venueId, result: next });
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, venueId]);

  const result =
    isAuthenticated && !authLoading && fetched?.venueId === venueId
      ? fetched.result
      : null;

  const view = useMemo(
    () =>
      friendsPlayedView({
        isAuthenticated,
        authLoading,
        result,
        startHref: resolvedStartHref,
      }),
    [authLoading, isAuthenticated, resolvedStartHref, result],
  );

  if (!view.visible) return null;

  function handleStartClick(event: { preventDefault: () => void }) {
    if (isAuthenticated) return;
    event.preventDefault();
    promptSoftWall({
      reason: "start_match",
      returnTo: view.startHref,
      pageType: "venue",
    });
  }

  return (
    <section
      id="friends-played"
      className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Friends
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            {view.title}
          </h2>
          {view.empty ? (
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              No friends have a locked result at {venueName} yet.
            </p>
          ) : null}
        </header>

        <div className="max-w-3xl space-y-5">
          {view.empty ? null : (
            <ul className="divide-y divide-white/6 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
              {view.friends.map((row) => {
                const played = formatFriendsPlayedAt(row.lastPlayedAt);
                return (
                  <li
                    key={row.userId}
                    className="flex items-center gap-3 px-4 py-3 sm:px-5"
                  >
                    <FriendAvatar
                      name={row.displayName}
                      avatarUrl={row.avatarUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {row.displayName || "Friend"}
                      </p>
                      {played ? (
                        <p className="mt-0.5 text-xs text-zinc-500">{played}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
              {view.overflowLabel ? (
                <li className="px-4 py-3 text-xs font-medium text-zinc-500 sm:px-5">
                  {view.overflowLabel} more
                </li>
              ) : null}
            </ul>
          )}

          <Link
            href={view.startHref}
            onClick={handleStartClick}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            <Zap className="h-4 w-4" aria-hidden />
            {view.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
