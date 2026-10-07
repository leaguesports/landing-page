"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  followFixture,
  getFixtureFollowStatus,
  unfollowFixture,
} from "@/lib/events/follow";
import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type FixtureFollowButtonProps = {
  slug: string;
  className?: string;
  /** Primary is the filled watch CTA; follow is secondary on fixture pages. */
  variant?: "primary" | "secondary";
  /** Outline button on light pages, matching venue follow. */
  surface?: "dark" | "light";
};

type FollowStatus = "idle" | "loading" | "following" | "not_following";

export function FixtureFollowButton({
  slug,
  className = "",
  variant = "secondary",
  surface = "dark",
}: FixtureFollowButtonProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, signIn } = useAuth();
  const [remoteStatus, setRemoteStatus] = useState<FollowStatus>("idle");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    void getFixtureFollowStatus(slug).then((status) => {
      if (cancelled) return;
      // 401 / 404 / missing API → treat as not following; keep the button.
      setRemoteStatus(status?.following ? "following" : "not_following");
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, slug]);

  const statusReady =
    !isAuthenticated ||
    remoteStatus === "following" ||
    remoteStatus === "not_following";

  function handleClick() {
    if (!isAuthenticated) {
      const returnTo = pathname || `/events/${slug}`;
      signIn(returnTo);
      return;
    }

    startTransition(async () => {
      if (remoteStatus === "following") {
        const next = await unfollowFixture(slug);
        if (!next) return;
        setRemoteStatus("not_following");
        return;
      }

      const next = await followFixture(slug);
      if (!next) return;
      setRemoteStatus("following");
    });
  }

  const busy = authLoading || pending || (isAuthenticated && !statusReady);
  const isFollowing = isAuthenticated && remoteStatus === "following";
  const label = !isAuthenticated
    ? "Follow fixture"
    : isFollowing
      ? "Following"
      : "Follow fixture";

  const followingClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-brand)]/50 bg-[var(--color-brand)]/15 px-6 py-2.5 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/25 disabled:opacity-60";
  const primaryClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white disabled:opacity-60";
  const secondaryClass =
    surface === "light"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-950 disabled:opacity-60"
      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950 disabled:opacity-60";
  const followingClassName =
    surface === "light"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-700/30 bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 disabled:opacity-60"
      : followingClass;

  const buttonClass = isFollowing
    ? followingClassName
    : variant === "primary"
      ? primaryClass
      : secondaryClass;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy && isAuthenticated}
        aria-pressed={isAuthenticated ? isFollowing : undefined}
        className={buttonClass}
      >
        <Heart
          className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`}
          aria-hidden
        />
        {pending ? (isFollowing ? "Updating…" : "Following…") : label}
      </button>
      {!isAuthenticated && !authLoading ? (
        <p className={surface === "light" ? "sr-only" : "mt-2 text-xs text-zinc-500"}>
          Sign in to follow this fixture and find it again when you come back.
        </p>
      ) : null}
    </div>
  );
}
