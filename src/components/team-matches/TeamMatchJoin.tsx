"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  canCreateChallenge,
  joinTeamMatch,
  teamMatchHref,
  teamMatchJoinHref,
} from "@/lib/team-matches/team-matches";
import {
  formatTeamSport,
  type PublicTeamSummary,
} from "@/lib/teams/teams";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TeamMatchJoinProps = {
  token: string;
  teams: PublicTeamSummary[];
};

function sendToLogin(token: string) {
  const returnTo =
    typeof window === "undefined"
      ? teamMatchJoinHref(token)
      : relativeAuthReturnTo() || teamMatchJoinHref(token);
  window.location.href = getLoginPageHref(returnTo);
}

export function TeamMatchJoin({ token, teams }: TeamMatchJoinProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const staffTeams = teams.filter((team) => canCreateChallenge(team.myRole));
  const [teamId, setTeamId] = useState(staffTeams[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onJoin() {
    setError(null);
    if (!isAuthenticated) {
      sendToLogin(token);
      return;
    }
    startTransition(() => {
      void joinTeamMatch({ token, teamId }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin(token);
            return;
          }
          setError(result.error);
          return;
        }
        router.push(teamMatchHref(result.value.id));
        router.refresh();
      });
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Team match
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
        You’ve been challenged
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
        Join with a same-sport team you own or captain. After you accept, both
        sides set a lineup and start the live scorecard.
      </p>

      {staffTeams.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-400">
          You need an owner or captain role on a team to join this challenge.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          <label
            htmlFor="join-team"
            className="block text-xs font-medium text-zinc-400"
          >
            Join as
          </label>
          <select
            id="join-team"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="min-h-11 w-full max-w-md rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            {staffTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({formatTeamSport(team.sport)})
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        disabled={pending || authLoading || !teamId}
        onClick={onJoin}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
      >
        {isAuthenticated ? "Accept challenge" : "Sign in to join"}
      </button>
      {error ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
