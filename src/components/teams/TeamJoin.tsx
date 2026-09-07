"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { joinTeam, teamJoinHref } from "@/lib/teams/teams";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TeamJoinProps = {
  token: string;
};

function sendToLogin(token: string) {
  const returnTo =
    typeof window === "undefined"
      ? teamJoinHref(token)
      : relativeAuthReturnTo() || teamJoinHref(token);
  window.location.href = getLoginPageHref(returnTo);
}

export function TeamJoin({ token }: TeamJoinProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onJoin() {
    setError(null);
    if (!isAuthenticated) {
      sendToLogin(token);
      return;
    }

    startTransition(() => {
      void joinTeam(token).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin(token);
            return;
          }
          setError(result.error);
          return;
        }
        router.push(`/teams/${result.value.id}`);
        router.refresh();
      });
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Join team
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
        You’ve been invited
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
        Join this squad from a shared link. You’ll land on the roster as an
        active member.
      </p>
      <button
        type="button"
        disabled={pending || authLoading}
        onClick={onJoin}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
      >
        {isAuthenticated ? "Join team" : "Sign in to join"}
      </button>
      {error ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
