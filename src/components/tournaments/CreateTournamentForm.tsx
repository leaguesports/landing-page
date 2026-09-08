"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { datetimeLocalToIso } from "@/lib/team-matches/team-matches";
import {
  TOURNAMENT_SIZES,
  TOURNAMENT_SPORTS,
  TOURNAMENTS_NEW_HREF,
  createTournament,
  formatTournamentSize,
  formatTournamentSport,
  tournamentHref,
  type TournamentSize,
  type TournamentSport,
} from "@/lib/tournaments/tournaments";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

type CreateTournamentFormProps = {
  venues?: Array<{ id: string; name: string }>;
};

function sendToLogin() {
  const returnTo = relativeAuthReturnTo();
  window.location.href = getLoginPageHref(returnTo || TOURNAMENTS_NEW_HREF);
}

export function CreateTournamentForm({ venues = [] }: CreateTournamentFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [sport, setSport] = useState<TournamentSport>("padel");
  const [size, setSize] = useState<TournamentSize>(4);
  const [venueCmsId, setVenueCmsId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      sendToLogin();
      return;
    }

    const nextName = name.trim();
    if (!nextName) {
      setError("Name is required");
      return;
    }

    startTransition(() => {
      void createTournament({
        name: nextName,
        sport,
        size,
        venueCmsId: venueCmsId || null,
        startsAt: datetimeLocalToIso(startsAt),
      }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
            return;
          }
          setError(result.error);
          return;
        }
        router.push(tournamentHref(result.value.id));
        router.refresh();
      });
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
    >
      <h2 className="font-display text-2xl tracking-wide text-white">
        Create a tournament
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
        One sport, one bracket. Size is 4, 8, or 16 teams — no byes. You do not
        need to be on a team to organize.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="tournament-name"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Name
          </label>
          <input
            id="tournament-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            autoComplete="off"
            placeholder="Sunday Cup"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
          />
        </div>
        <div>
          <label
            htmlFor="tournament-sport"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Sport
          </label>
          <select
            id="tournament-sport"
            required
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
            htmlFor="tournament-size"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Bracket size
          </label>
          <select
            id="tournament-size"
            required
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
        {venues.length > 0 ? (
          <div className="sm:col-span-2">
            <label
              htmlFor="tournament-venue"
              className="mb-1.5 block text-xs font-medium text-zinc-400"
            >
              Venue (optional)
            </label>
            <select
              id="tournament-venue"
              value={venueCmsId}
              onChange={(event) => setVenueCmsId(event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
            >
              <option value="">Decide later</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <label
            htmlFor="tournament-starts"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Starts (optional)
          </label>
          <input
            id="tournament-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {isAuthenticated ? (
        <button
          type="submit"
          disabled={pending || authLoading}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
        >
          Create draft
        </button>
      ) : (
        <button
          type="button"
          disabled={authLoading}
          onClick={sendToLogin}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
        >
          Sign in to create
        </button>
      )}
    </form>
  );
}
