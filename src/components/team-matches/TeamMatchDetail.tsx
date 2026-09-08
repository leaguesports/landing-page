"use client";

import { TeamAvatar } from "@/components/teams/TeamAvatar";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  acceptTeamMatch,
  canAcceptChallenge,
  canCancelMatch,
  canDeclineChallenge,
  canScheduleMatch,
  canSetLineup,
  canStartMatch,
  cancelTeamMatch,
  datetimeLocalToIso,
  declineTeamMatch,
  formatLineupRule,
  formatTeamMatchSport,
  formatTeamMatchStatus,
  formatTeamMatchVersus,
  isoToDatetimeLocal,
  readStashedChallengeToken,
  scheduleTeamMatch,
  scorecardNavigatePath,
  setTeamMatchLineup,
  startBlockedReason,
  startTeamMatch,
  teamMatchHref,
  teamMatchJoinHref,
  type PublicTeamMatch,
  type PublicUser,
} from "@/lib/team-matches/team-matches";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type VenueChoice = { id: string; name: string };

type TeamMatchDetailProps = {
  match: PublicTeamMatch;
  homeMembers: PublicUser[];
  awayMembers: PublicUser[];
  venues: VenueChoice[];
};

function sendToLogin(id: string) {
  const returnTo =
    typeof window === "undefined"
      ? teamMatchHref(id)
      : relativeAuthReturnTo() || teamMatchHref(id);
  window.location.href = getLoginPageHref(returnTo);
}

function challengeUrl(token: string): string {
  const path = teamMatchJoinHref(token);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function LineupList({ players }: { players: PublicUser[] }) {
  if (players.length === 0) {
    return <p className="text-sm text-zinc-500">No lineup yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {players.map((player) => (
        <li key={player.id} className="flex items-center gap-3">
          <TeamAvatar name={player.displayName} avatarUrl={player.avatarUrl} />
          <span>
            <span className="block text-sm font-medium text-white">
              {player.displayName}
            </span>
            <span className="block text-xs text-zinc-500">@{player.handle}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TeamMatchDetail({
  match: initial,
  homeMembers,
  awayMembers,
  venues,
}: TeamMatchDetailProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [current, setCurrent] = useState(initial);
  const [startsAt, setStartsAt] = useState(isoToDatetimeLocal(initial.startsAt));
  const [venueCmsId, setVenueCmsId] = useState(initial.venueCmsId ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initial.viewer.role === "away_staff") {
      return initial.lineups.away.map((player) => player.id);
    }
    return initial.lineups.home.map((player) => player.id);
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(
    initial.challengeToken,
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const stashed = readStashedChallengeToken(initial.id);
    if (stashed) setChallengeToken(stashed);
  }, [initial.id]);

  const roster = useMemo(() => {
    if (current.viewer.role === "away_staff") return awayMembers;
    if (current.viewer.role === "home_staff") return homeMembers;
    return [];
  }, [awayMembers, current.viewer.role, homeMembers]);

  const lineupTeamId =
    current.viewer.role === "away_staff"
      ? current.awayTeam?.id
      : current.homeTeam.id;

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function applyMatch(next: PublicTeamMatch) {
    setCurrent(next);
    setStartsAt(isoToDatetimeLocal(next.startsAt));
    setVenueCmsId(next.venueCmsId ?? "");
    if (next.viewer.role === "away_staff") {
      setSelectedIds(next.lineups.away.map((player) => player.id));
    } else {
      setSelectedIds(next.lineups.home.map((player) => player.id));
    }
    router.refresh();
  }

  function handleAuthFailure(status: number) {
    if (status === 401) {
      sendToLogin(current.id);
      return true;
    }
    return false;
  }

  function runAction(
    work: () => Promise<{ ok: true; value: PublicTeamMatch } | { ok: false; error: string; status: number }>,
    success: string,
  ) {
    clearFeedback();
    startTransition(() => {
      void work().then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        applyMatch(result.value);
        setMessage(success);
      });
    });
  }

  function togglePlayer(id: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id],
    );
  }

  function onSaveLineup() {
    if (!lineupTeamId || !canSetLineup(current, lineupTeamId)) return;
    runAction(
      () =>
        setTeamMatchLineup(
          current.id,
          { userIds: selectedIds, teamId: lineupTeamId },
          current.sport,
        ),
      "Lineup saved.",
    );
  }

  function onSaveSchedule() {
    if (!canScheduleMatch(current)) return;
    runAction(
      () =>
        scheduleTeamMatch(current.id, {
          startsAt: datetimeLocalToIso(startsAt),
          venueCmsId: venueCmsId || null,
        }),
      "Schedule updated.",
    );
  }

  function onStart() {
    clearFeedback();
    startTransition(() => {
      void startTeamMatch(current.id).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        applyMatch(result.value.match);
        const path = scorecardNavigatePath(result.value.scorecard);
        if (!path) {
          setError("Scorecard path was missing");
          return;
        }
        router.push(path);
      });
    });
  }

  async function onCopyLink() {
    const token = challengeToken;
    if (!token) return;
    try {
      await navigator.clipboard.writeText(challengeUrl(token));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the challenge link");
    }
  }

  const scorecardPath = scorecardNavigatePath(current.scorecard);
  const blocked = startBlockedReason(current);
  const winnerName =
    current.winnerTeamId === current.homeTeam.id
      ? current.homeTeam.name
      : current.winnerTeamId === current.awayTeam?.id
        ? current.awayTeam.name
        : null;

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
        <p className="text-sm text-zinc-400">Sign in to manage this match.</p>
        <button
          type="button"
          onClick={() => sendToLogin(current.id)}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {formatTeamMatchSport(current.sport)} · {formatTeamMatchStatus(current.status)}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
          {formatTeamMatchVersus(current)}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          {formatHubWhen(current.startsAt) ?? "Time TBC"}
          {winnerName ? ` · ${winnerName} won` : ""}
        </p>
        {scorecardPath ? (
          <Link
            href={scorecardPath}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Open scorecard
          </Link>
        ) : null}
      </header>

      {challengeToken && current.viewer.role === "home_staff" ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Challenge link
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            Share this with the other team’s owner or captain.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              readOnly
              value={challengeUrl(challengeToken)}
              className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-zinc-300"
            />
            <button
              type="button"
              onClick={() => void onCopyLink()}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white/5"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canAcceptChallenge(current) ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => runAction(() => acceptTeamMatch(current.id), "Challenge accepted.")}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            Accept
          </button>
        ) : null}
        {canDeclineChallenge(current) ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => runAction(() => declineTeamMatch(current.id), "Challenge declined.")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-60"
          >
            Decline
          </button>
        ) : null}
        {canCancelMatch(current) ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => runAction(() => cancelTeamMatch(current.id), "Match cancelled.")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
        {canStartMatch(current) ? (
          <button
            type="button"
            disabled={pending}
            onClick={onStart}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            Start scorecard
          </button>
        ) : blocked &&
          (current.viewer.role === "home_staff" ||
            current.viewer.role === "away_staff") &&
          current.status === "scheduled" ? (
          <p className="text-sm text-zinc-500">{blocked}</p>
        ) : null}
      </div>

      {canScheduleMatch(current) ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Schedule
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="match-starts-at"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Starts
              </label>
              <input
                id="match-starts-at"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              />
            </div>
            <div>
              <label
                htmlFor="match-venue"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Venue{current.sport === "darts" ? " (optional)" : ""}
              </label>
              <select
                id="match-venue"
                value={venueCmsId}
                onChange={(event) => setVenueCmsId(event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                <option value="">No venue yet</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onSaveSchedule}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            Save schedule
          </button>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            {current.homeTeam.name}
          </h2>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
            Home · {formatLineupRule(current.sport)}
          </p>
          <div className="mt-4">
            <LineupList players={current.lineups.home} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            {current.awayTeam?.name ?? "Waiting for opponent"}
          </h2>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
            Away · {formatLineupRule(current.sport)}
          </p>
          <div className="mt-4">
            <LineupList players={current.lineups.away} />
          </div>
        </div>
      </section>

      {canSetLineup(current) && roster.length > 0 ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Your lineup
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            {formatTeamMatchSport(current.sport)} is {formatLineupRule(current.sport)}.
            Only active members.
          </p>
          <ul className="mt-4 max-h-72 space-y-1 overflow-y-auto">
            {roster.map((member) => {
              const selected = selectedIds.includes(member.id);
              return (
                <li key={member.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => togglePlayer(member.id)}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left",
                      selected
                        ? "border-emerald-400/50 bg-emerald-400/10"
                        : "border-white/8 bg-[#101410] hover:border-white/16",
                    ].join(" ")}
                  >
                    <TeamAvatar
                      name={member.displayName}
                      avatarUrl={member.avatarUrl}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {member.displayName}
                      </span>
                      <span className="block truncate text-xs text-zinc-500">
                        @{member.handle}
                      </span>
                    </span>
                    <span
                      className={
                        selected
                          ? "text-xs font-medium text-emerald-300"
                          : "text-xs text-zinc-600"
                      }
                    >
                      {selected ? "In" : "Add"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            disabled={pending}
            onClick={onSaveLineup}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            Save lineup
          </button>
        </section>
      ) : null}

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
