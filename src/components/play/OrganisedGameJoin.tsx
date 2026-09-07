"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  formatOrganisedGameSport,
  formatOrganisedGameStatus,
  joinOrganisedGameInvite,
  organisedGameOccupiedCount,
  type OrganisedGame,
} from "@/lib/organised-games/organised-games";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import { hubOrganisedGameHref } from "@/lib/sports/hub-ia";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OrganisedGameJoinProps = {
  token: string;
  game: OrganisedGame;
  venueName: string | null;
};

export function OrganisedGameJoin({
  token,
  game,
  venueName,
}: OrganisedGameJoinProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const alreadyIn =
    game.viewer.role === "host" || game.viewer.role === "invitee";
  const when = formatHubWhen(game.startsAt);
  const occupied = organisedGameOccupiedCount(game);
  const loginHref = getLoginPageHref(`/play/join/${token}`);

  function sendToLogin() {
    window.location.href = getLoginPageHref(
      relativeAuthReturnTo() || `/play/join/${token}`,
    );
  }

  async function onJoin() {
    if (!isAuthenticated) {
      sendToLogin();
      return;
    }
    setError(null);
    setJoining(true);
    const result = await joinOrganisedGameInvite(token);
    if (!result.ok) {
      setJoining(false);
      if (result.status === 401) {
        sendToLogin();
        return;
      }
      setError(result.error);
      return;
    }
    router.push(hubOrganisedGameHref(result.value.id));
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Join {formatOrganisedGameSport(game.sport)}
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          {when ?? "Organised game"}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Hosted by {game.host.displayName}
          {venueName ? ` · ${venueName}` : ""}
          {` · ${formatOrganisedGameStatus(game.status)} · ${occupied}/${game.capacity}`}
        </p>
        {game.notes ? (
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            {game.notes}
          </p>
        ) : null}
      </header>

      {!isAuthenticated ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Sign in to join this game.{" "}
          <Link
            href={loginHref}
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            Sign in
          </Link>
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      {alreadyIn ? (
        <Link
          href={hubOrganisedGameHref(game.id)}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          View game
        </Link>
      ) : (
        <button
          type="button"
          disabled={joining || game.status !== "open"}
          onClick={() => void onJoin()}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {joining ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Joining…
            </>
          ) : (
            "Join game"
          )}
        </button>
      )}
    </div>
  );
}
