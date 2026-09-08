"use client";

import { TournamentBracket } from "@/components/tournaments/TournamentBracket";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  canCreateChallenge,
  datetimeLocalToIso,
  isoToDatetimeLocal,
  searchTeams,
  teamMatchHref,
  type PublicTeamRef,
} from "@/lib/team-matches/team-matches";
import {
  formatTeamSport,
  type PublicTeamSummary,
} from "@/lib/teams/teams";
import {
  TOURNAMENT_SIZES,
  TOURNAMENT_SPORTS,
  acceptRegistration,
  canDeleteDraft,
  canEditDraft,
  canGenerateDraw,
  canAcceptRegistration,
  canInviteTeam,
  canOpenRegistration,
  canRegisterTeam,
  canStartTournament,
  canWithdrawRegistration,
  deleteTournament,
  formatAcceptedProgress,
  formatRegistrationStatus,
  formatTournamentSize,
  formatTournamentSport,
  formatTournamentStatus,
  generateDraw,
  inviteTeam,
  openRegistration,
  registerTeam,
  startFixture,
  startTournament,
  tournamentHref,
  tournamentJoinHref,
  updateTournament,
  withdrawRegistration,
  type PublicTournament,
  type TournamentSize,
  type TournamentSport,
} from "@/lib/tournaments/tournaments";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type TournamentDetailProps = {
  tournament: PublicTournament;
  teams: PublicTeamSummary[];
};

function sendToLogin(id: string) {
  const returnTo =
    typeof window === "undefined"
      ? tournamentHref(id)
      : relativeAuthReturnTo() || tournamentHref(id);
  window.location.href = getLoginPageHref(returnTo);
}

function inviteUrl(token: string): string {
  const path = tournamentJoinHref(token);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function TournamentDetail({
  tournament,
  teams,
}: TournamentDetailProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [current, setCurrent] = useState(tournament);
  const [name, setName] = useState(tournament.name);
  const [sport, setSport] = useState(tournament.sport);
  const [size, setSize] = useState(tournament.size);
  const [startsAt, setStartsAt] = useState(
    isoToDatetimeLocal(tournament.startsAt),
  );
  const [registerTeamId, setRegisterTeamId] = useState("");
  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteResults, setInviteResults] = useState<PublicTeamRef[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const staffTeams = useMemo(
    () =>
      teams.filter(
        (team) =>
          canCreateChallenge(team.myRole) && team.sport === current.sport,
      ),
    [teams, current.sport],
  );

  const registerable = staffTeams.filter((team) =>
    canRegisterTeam(current, team.id, team.myRole),
  );
  const selectedRegisterId = registerable.some((team) => team.id === registerTeamId)
    ? registerTeamId
    : (registerable[0]?.id ?? "");

  const canInvite = canInviteTeam(current);
  const takenTeamIds = current.registrations.map((entry) => entry.team.id).join(",");

  useEffect(() => {
    if (!canInvite) return;
    const handle = window.setTimeout(() => {
      setSearching(true);
      void searchTeams(current.sport, inviteQuery).then((result) => {
        setSearching(false);
        if (!result.ok) {
          setInviteResults([]);
          return;
        }
        const taken = new Set(takenTeamIds.split(",").filter(Boolean));
        setInviteResults(result.value.filter((team) => !taken.has(team.id)));
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [canInvite, current.sport, inviteQuery, takenTeamIds]);

  const visibleInviteResults = canInvite ? inviteResults : [];

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function apply(next: PublicTournament) {
    setCurrent(next);
    setName(next.name);
    setSport(next.sport);
    setSize(next.size);
    setStartsAt(isoToDatetimeLocal(next.startsAt));
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
    work: () => Promise<
      | { ok: true; value: PublicTournament }
      | { ok: false; error: string; status: number }
    >,
    success?: string,
  ) {
    clearFeedback();
    startTransition(() => {
      void work().then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        apply(result.value);
        if (success) setMessage(success);
      });
    });
  }

  function onSaveDraft() {
    if (!canEditDraft(current)) return;
    runAction(
      () =>
        updateTournament(current.id, {
          name,
          sport,
          size,
          startsAt: datetimeLocalToIso(startsAt),
        }),
      "Draft updated.",
    );
  }

  function onDelete() {
    if (!canDeleteDraft(current)) return;
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(`Delete ${current.name}? This cannot be undone.`);
    if (!confirmed) return;
    clearFeedback();
    startTransition(() => {
      void deleteTournament(current.id).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        router.push("/tournaments");
        router.refresh();
      });
    });
  }

  async function onCopyInvite() {
    const token = current.inviteToken;
    if (!token) return;
    try {
      await navigator.clipboard.writeText(inviteUrl(token));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the invite link");
    }
  }

  function onStartFixture(slotId: string) {
    clearFeedback();
    startTransition(() => {
      void startFixture(current.id, slotId).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        apply(result.value.tournament);
        router.push(teamMatchHref(result.value.fixture.teamMatchId));
        router.refresh();
      });
    });
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
        <p className="text-sm text-zinc-400">Sign in to view this tournament.</p>
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

  const winner = current.registrations.find(
    (entry) => entry.team.id === current.winnerTeamId,
  )?.team;

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {formatTournamentSport(current.sport)} ·{" "}
          {formatTournamentStatus(current.status)}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
          {current.name}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          {formatTournamentSize(current.size)} ·{" "}
          {formatAcceptedProgress(current.acceptedCount, current.size)}
          {winner ? ` · Winner: ${winner.name}` : ""}
        </p>
      </header>

      {canEditDraft(current) ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Draft details
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="edit-tournament-name"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Name
              </label>
              <input
                id="edit-tournament-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              />
            </div>
            <div>
              <label
                htmlFor="edit-tournament-sport"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Sport
              </label>
              <select
                id="edit-tournament-sport"
                value={sport}
                onChange={(event) =>
                  setSport(event.target.value as TournamentSport)
                }
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                {TOURNAMENT_SPORTS.map((option) => (
                  <option key={option} value={option}>
                    {formatTournamentSport(option)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-tournament-size"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Size
              </label>
              <select
                id="edit-tournament-size"
                value={size}
                onChange={(event) =>
                  setSize(Number(event.target.value) as TournamentSize)
                }
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                {TOURNAMENT_SIZES.map((option) => (
                  <option key={option} value={option}>
                    {formatTournamentSize(option)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="edit-tournament-starts"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Starts
              </label>
              <input
                id="edit-tournament-starts"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={onSaveDraft}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
            >
              Save
            </button>
            {canDeleteDraft(current) ? (
              <button
                type="button"
                disabled={pending}
                onClick={onDelete}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-400/30 px-5 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60"
              >
                Delete draft
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {canOpenRegistration(current) ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Registration
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            Open the event so captains can register or join from an invite link.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              runAction(
                () => openRegistration(current.id),
                "Registration is open.",
              )
            }
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            Open registration
          </button>
        </section>
      ) : null}

      {current.status === "registration" ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            Entries
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            Draw generates when accepted teams equal {current.size}.
          </p>

          {current.inviteToken ? (
            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200">Invite link</h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  readOnly
                  value={inviteUrl(current.inviteToken)}
                  className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => void onCopyInvite()}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white/5"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          ) : null}

          {registerable.length > 0 ? (
            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200">
                Register your team
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedRegisterId}
                  onChange={(event) => setRegisterTeamId(event.target.value)}
                  className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
                >
                  {registerable.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({formatTeamSport(team.sport)})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={pending || !selectedRegisterId}
                  onClick={() =>
                    runAction(
                      () => registerTeam(current.id, selectedRegisterId),
                      "Team registered.",
                    )
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                >
                  Register
                </button>
              </div>
            </div>
          ) : null}

          {canInvite ? (
            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200">Invite a team</h3>
              <input
                type="search"
                value={inviteQuery}
                onChange={(event) => setInviteQuery(event.target.value)}
                placeholder="Search same-sport teams"
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
              />
              {searching ? (
                <p className="text-xs text-zinc-500">Searching…</p>
              ) : null}
              <ul className="space-y-1">
                {visibleInviteResults.slice(0, 6).map((team) => (
                  <li
                    key={team.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#101410] px-3 py-2"
                  >
                    <span className="truncate text-sm text-white">{team.name}</span>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        runAction(
                          () => inviteTeam(current.id, team.id),
                          `${team.name} invited.`,
                        )
                      }
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white disabled:opacity-60"
                    >
                      Invite
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <ul className="mt-5 space-y-2">
            {current.registrations.length === 0 ? (
              <li className="text-sm text-zinc-500">No entries yet.</li>
            ) : (
              current.registrations.map((entry) => (
                <li
                  key={entry.team.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-[#101410] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {entry.team.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatRegistrationStatus(entry.status)}
                      {entry.seed ? ` · seed ${entry.seed}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canWithdrawRegistration(current, entry) ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          runAction(
                            () => withdrawRegistration(current.id, entry.team.id),
                            "Entry withdrawn.",
                          )
                        }
                        className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white disabled:opacity-60"
                      >
                        Withdraw
                      </button>
                    ) : null}
                    {canAcceptRegistration(current, entry) ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          runAction(
                            () => acceptRegistration(current.id, entry.team.id),
                            "Entry accepted.",
                          )
                        }
                        className="rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                      >
                        Accept
                      </button>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {canGenerateDraw(current) ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  runAction(
                    () => generateDraw(current.id),
                    "Draw generated.",
                  )
                }
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
              >
                Generate draw
              </button>
            ) : null}
            {canStartTournament(current) ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  runAction(
                    () => startTournament(current.id),
                    "Tournament started.",
                  )
                }
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-60"
              >
                Start tournament
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {current.status === "active" || current.status === "completed" ? (
        <section>
          <h2 className="mb-3 font-display text-2xl tracking-wide text-white">
            Bracket
          </h2>
          <TournamentBracket
            tournament={current}
            pending={pending}
            onStartFixture={onStartFixture}
          />
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
