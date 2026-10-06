"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  followVenue,
  getVenueFollowStatus,
  unfollowVenue,
} from "@/lib/venues/follow";
import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type VenueFollowButtonProps = {
  venueCmsId: string;
  venueName: string;
  venueSlug: string;
  /** visual variant for hero vs footer CTA */
  variant?: "primary" | "secondary";
  /** Square neon control on Scoreboard venue pages. */
  appearance?: "default" | "scoreboard";
  className?: string;
};

type FollowStatus = "idle" | "loading" | "following" | "not_following";

export function VenueFollowButton({
  venueCmsId,
  venueName,
  venueSlug,
  variant = "primary",
  appearance = "default",
  className = "",
}: VenueFollowButtonProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, signIn } = useAuth();
  const [remoteStatus, setRemoteStatus] = useState<FollowStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    void getVenueFollowStatus(venueCmsId).then((status) => {
      if (cancelled) return;
      setRemoteStatus(status?.following ? "following" : "not_following");
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, venueCmsId]);

  const statusReady =
    !isAuthenticated ||
    remoteStatus === "following" ||
    remoteStatus === "not_following";

  function handleClick() {
    setError(null);

    if (!isAuthenticated) {
      signIn(pathname || `/venues/${venueSlug}`);
      return;
    }

    startTransition(async () => {
      if (remoteStatus === "following") {
        const next = await unfollowVenue(venueCmsId);
        if (!next) {
          setError("Could not unfollow. Try again.");
          return;
        }
        setRemoteStatus("not_following");
        return;
      }

      const next = await followVenue({
        cmsId: venueCmsId,
        name: venueName,
        slug: venueSlug,
      });
      if (!next) {
        setError("Could not follow this venue. Try again.");
        return;
      }
      setRemoteStatus("following");
    });
  }

  const busy = authLoading || pending || (isAuthenticated && !statusReady);
  const isFollowing = isAuthenticated && remoteStatus === "following";
  const label =
    appearance === "scoreboard"
      ? !isAuthenticated
        ? "Follow"
        : isFollowing
          ? "Following"
          : "Follow"
      : !isAuthenticated
        ? "Follow venue"
        : isFollowing
          ? "Following"
          : "Follow venue";

  const baseClass =
    appearance === "scoreboard"
      ? isFollowing
        ? "inline-flex h-full min-h-12 w-full items-center justify-center gap-2 rounded-none bg-[#C6FF00] px-2 font-display text-base uppercase tracking-wide text-black transition-colors hover:bg-white disabled:opacity-60 sm:px-3 sm:text-xl"
        : "inline-flex h-full min-h-12 w-full items-center justify-center gap-2 rounded-none bg-transparent px-2 font-display text-base uppercase tracking-wide text-[#C6FF00] transition-colors hover:bg-[#C6FF00] hover:text-black disabled:opacity-60 sm:px-3 sm:text-xl"
      : variant === "primary"
      ? isFollowing
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-brand)]/50 bg-[var(--color-brand)]/15 px-5 py-2.5 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/25 disabled:opacity-60"
        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[var(--color-brand)] disabled:opacity-60"
      : isFollowing
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-700/30 bg-emerald-50 px-5 py-2.5 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 disabled:opacity-60"
        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-950 disabled:opacity-60";

  const shell =
    appearance === "scoreboard"
      ? `flex h-full min-h-12 min-w-0 flex-col border-y-2 border-r-2 border-[#C6FF00] ${className}`
      : className;

  return (
    <div className={shell}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy && isAuthenticated}
        aria-pressed={isAuthenticated ? isFollowing : undefined}
        className={baseClass}
      >
        <Heart
          className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`}
          aria-hidden
        />
        {pending ? (isFollowing ? "Updating…" : "Following…") : label}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      ) : appearance === "scoreboard" ? null : !isAuthenticated && !authLoading ? (
        <p className="sr-only">
          Sign in to save this venue to your list.
        </p>
      ) : null}
    </div>
  );
}
