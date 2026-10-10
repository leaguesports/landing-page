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
  /** Primary is the filled watch CTA; poster matches the light split-poster hero. */
  variant?: "primary" | "secondary" | "poster";
};

type FollowStatus = "idle" | "loading" | "following" | "not_following";

export function FixtureFollowButton({
  slug,
  className = "",
  variant = "secondary",
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
  const followLabel = variant === "poster" ? "Follow event" : "Follow fixture";
  const label = !isAuthenticated
    ? followLabel
    : isFollowing
      ? "Following"
      : followLabel;

  const followingClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-brand)]/50 bg-[var(--color-brand)]/15 px-6 py-2.5 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/25 disabled:opacity-60";
  const primaryClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white disabled:opacity-60";
  const secondaryClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950 disabled:opacity-60";
  const posterClass = isFollowing
    ? "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#0F6B45] bg-white px-5 text-sm font-medium text-[#0F6B45] transition-colors hover:border-[#0B0B0B] disabled:opacity-60"
    : "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d5d6da] bg-white px-5 text-sm font-medium text-[#1d2024] transition-colors hover:border-[#0B0B0B] disabled:opacity-60";

  const buttonClass = isFollowing && variant !== "poster"
    ? followingClass
    : variant === "primary"
      ? primaryClass
      : variant === "poster"
        ? posterClass
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
      {variant !== "poster" && !isAuthenticated && !authLoading ? (
        <p className="mt-2 text-xs text-zinc-500">
          Sign in to follow this fixture and find it again when you come back.
        </p>
      ) : null}
    </div>
  );
}
