"use client";

import { getGoogleSignInUrl } from "@/lib/api-client";
import { isApiConfigured } from "@/lib/api-origin";
import { stashAuthReturnTo } from "@/lib/auth-return-to";
import { track } from "@/lib/analytics/track";
import type { PageType } from "@/lib/analytics/track";
import { X } from "lucide-react";
import { useEffect, useId } from "react";

export type SoftWallReason =
  | "save_history"
  | "join_team"
  | "organise"
  | "lobby"
  | "venue_leaderboards";

export type SoftWallState = {
  reason: SoftWallReason;
  returnTo?: string;
  pageType?: PageType;
} | null;

function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const COPY: Record<SoftWallReason, { title: string; body: string }> = {
  save_history: {
    title: "Save to your account",
    body: "Keep this history on your athlete hub. Or stay a guest — scoring still works.",
  },
  join_team: {
    title: "Save to your account",
    body: "Join this squad with Google. You can keep browsing as a guest.",
  },
  organise: {
    title: "Save to your account",
    body: "Organising a game needs an account so friends can RSVP. Keep browsing as a guest.",
  },
  lobby: {
    title: "Save to your account",
    body: "Looking and posting an open game need an account so players can find you. Keep browsing the lobby as a guest.",
  },
  venue_leaderboards: {
    title: "Save to your account",
    body: "Venue leaderboards need a signed-in session. Keep browsing as a guest.",
  },
};

export function AuthSoftWallSheet({
  state,
  onDismiss,
}: {
  state: SoftWallState;
  onDismiss: () => void;
}) {
  const titleId = useId();
  const open = Boolean(state);

  useEffect(() => {
    if (!state) return;
    track("auth_soft_wall", {
      page_type: state.pageType ?? "other",
      reason: state.reason,
    });
  }, [state]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  if (!state) return null;

  const copy = COPY[state.reason];
  const apiReady = isApiConfigured();
  const signInUrl = apiReady
    ? getGoogleSignInUrl(state.returnTo || "/")
    : "";

  function handleGoogle() {
    if (!signInUrl) return;
    stashAuthReturnTo(state?.returnTo);
    window.location.href = signInUrl;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/60"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#101410] p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <h2 id={titleId} className="pr-12 text-xl font-semibold text-white">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{copy.body}</p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={!signInUrl}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleMark className="h-5 w-5 shrink-0" />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex min-h-11 w-full items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white hover:text-zinc-950"
          >
            Keep as guest
          </button>
        </div>
      </div>
    </div>
  );
}
