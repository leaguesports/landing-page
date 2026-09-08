"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  canCreateChallenge,
  createTeamMatch,
  formatTeamMatchSport,
  searchTeams,
  teamMatchHref,
  TEAM_MATCHES_NEW_HREF,
  type PublicTeamRef,
  type TeamMatchSport,
} from "@/lib/team-matches/team-matches";
import {
  formatTeamSport,
  type PublicTeamSummary,
} from "@/lib/teams/teams";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type ChallengeFormProps = {
  teams: PublicTeamSummary[];
  initialTeamId?: string;
};

function sendToLogin() {
  const returnTo =
    typeof window === "undefined"
      ? TEAM_MATCHES_NEW_HREF
      : relativeAuthReturnTo() || TEAM_MATCHES_NEW_HREF;
  window.location.href = getLoginPageHref(returnTo);
}

export function ChallengeForm({ teams, initialTeamId }: ChallengeFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const staffTeams = useMemo(
    () => teams.filter((team) => canCreateChallenge(team.myRole)),
    [teams],
  );
  const [homeTeamId, setHomeTeamId] = useState(
    staffTeams.some((team) => team.id === initialTeamId)
      ? initialTeamId ?? ""
      : staffTeams[0]?.id ?? "",
  );
  const [mode, setMode] = useState<"pick" | "link">("pick");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicTeamRef[]>([]);
  const [awayTeamId, setAwayTeamId] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const homeTeam = staffTeams.find((team) => team.id === homeTeamId) ?? null;
  const sport = (homeTeam?.sport ?? "") as TeamMatchSport | "";

  useEffect(() => {
    if (mode !== "pick" || !sport) {
      setResults([]);
      return;
    }
    const trimmed = query.trim();
    const handle = window.setTimeout(() => {
      setSearching(true);
      void searchTeams(sport, trimmed).then((result) => {
        setSearching(false);
        if (!result.ok) {
          setResults([]);
          return;
        }
        setResults(result.value.filter((team) => team.id !== homeTeamId));
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [mode, sport, query, homeTeamId]);

  function onSubmit() {
    setError(null);
    if (!isAuthenticated) {
      sendToLogin();
      return;
    }
    startTransition(() => {
      void createTeamMatch({
        homeTeamId,
        awayTeamId: mode === "pick" ? awayTeamId : null,
        generateChallengeLink: mode === "link",
      }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
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

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
        <p className="text-sm text-zinc-400">Sign in to challenge a team.</p>
        <button
          type="button"
          onClick={sendToLogin}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (staffTeams.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
        <p className="text-sm leading-relaxed text-zinc-400">
          Only owners and captains can send a challenge. Create a team or ask a
          captain to start one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
      <div>
        <label
          htmlFor="challenge-home-team"
          className="mb-1.5 block text-xs font-medium text-zinc-400"
        >
          Your team
        </label>
        <select
          id="challenge-home-team"
          value={homeTeamId}
          onChange={(event) => {
            setHomeTeamId(event.target.value);
            setAwayTeamId("");
          }}
          className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
        >
          {staffTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({formatTeamSport(team.sport)})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={mode === "pick"}
          onClick={() => setMode("pick")}
          className={[
            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]",
            mode === "pick"
              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
              : "border-white/12 text-zinc-400 hover:text-white",
          ].join(" ")}
        >
          Pick opponent
        </button>
        <button
          type="button"
          aria-pressed={mode === "link"}
          onClick={() => setMode("link")}
          className={[
            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]",
            mode === "link"
              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
              : "border-white/12 text-zinc-400 hover:text-white",
          ].join(" ")}
        >
          Challenge link
        </button>
      </div>

      {mode === "pick" ? (
        <div className="space-y-3">
          <label
            htmlFor="challenge-search"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Search {sport ? formatTeamMatchSport(sport) : ""} teams
          </label>
          <input
            id="challenge-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Friends’ teams or a name"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
          />
          {searching ? (
            <p className="text-sm text-zinc-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No same-sport teams yet. Try another name or share a link.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto overscroll-contain">
              {results.map((team) => {
                const selected = awayTeamId === team.id;
                return (
                  <li key={team.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setAwayTeamId(team.id)}
                      className={[
                        "flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left",
                        selected
                          ? "border-emerald-400/50 bg-emerald-400/10"
                          : "border-white/8 bg-[#101410] hover:border-white/16",
                      ].join(" ")}
                    >
                      <span>
                        <span className="block text-sm font-medium text-white">
                          {team.name}
                        </span>
                        <span className="block text-xs text-zinc-500">
                          {formatTeamMatchSport(team.sport)}
                        </span>
                      </span>
                      <span
                        className={
                          selected
                            ? "text-xs font-medium text-emerald-300"
                            : "text-xs text-zinc-600"
                        }
                      >
                        {selected ? "Selected" : "Pick"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-zinc-400">
          We’ll create a captain link. The other team’s owner or captain joins
          with one of their {sport ? formatTeamMatchSport(sport) : ""} squads.
        </p>
      )}

      <button
        type="button"
        disabled={pending || !homeTeamId || (mode === "pick" && !awayTeamId)}
        onClick={onSubmit}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
      >
        {mode === "link" ? "Create challenge link" : "Send challenge"}
      </button>
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
