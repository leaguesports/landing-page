"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  TEAM_SPORTS,
  createTeam,
  formatTeamSport,
  type KnownTeamSport,
} from "@/lib/teams/teams";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

function sendToLogin() {
  const returnTo = relativeAuthReturnTo();
  window.location.href = getLoginPageHref(returnTo || "/teams/new");
}

export function CreateTeamForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [sport, setSport] = useState<KnownTeamSport>("padel");
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
    if (nextName.length > 80) {
      setError("Name must be 80 characters or fewer");
      return;
    }

    startTransition(() => {
      void createTeam({ name: nextName, sport }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
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
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
    >
      <h2 className="font-display text-2xl tracking-wide text-white">
        Create a team
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
        Name plus a required sport. You become the owner and can invite friends
        or share a join link.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="team-name"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Name
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            autoComplete="off"
            placeholder="Sunday Smash"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="team-sport"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Sport
          </label>
          <select
            id="team-sport"
            required
            value={sport}
            onChange={(event) =>
              setSport(event.target.value as KnownTeamSport)
            }
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            {TEAM_SPORTS.map((option) => (
              <option key={option} value={option}>
                {formatTeamSport(option)}
              </option>
            ))}
          </select>
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
          Create team
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
