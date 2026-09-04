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
  className?: string;
};

type FollowStatus = "idle" | "loading" | "following" | "not_following";

export function VenueFollowButton({
  venueCmsId,
  venueName,
  venueSlug,
  variant = "primary",
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
  const label = !isAuthenticated
    ? "Follow venue"
    : isFollowing
      ? "Following"
      : "Follow venue";

  const baseClass =
    variant === "primary"
      ? isFollowing
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-brand)]/50 bg-[var(--color-brand)]/15 px-5 py-2.5 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/25 disabled:opacity-60"
        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[var(--color-brand)] disabled:opacity-60"
      : isFollowing
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-brand)]/40 bg-[var(--color-brand)]/10 px-8 py-2.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20 disabled:opacity-60"
        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-8 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-60";

  return (
    <div className={className}>
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
      ) : null}
      {!isAuthenticated && !authLoading ? (
        <p className="mt-2 text-xs text-zinc-500">
          Sign in to save this venue to your list.
        </p>
      ) : null}
    </div>
  );
}
