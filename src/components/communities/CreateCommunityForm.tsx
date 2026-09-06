"use client";

import { useAuth } from "@/hooks/useAuth";
import { CITY_DIRECTORY } from "@/data/cities";
import {
  createCommunity,
  type CommunitySport,
} from "@/lib/communities/communities";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const CITY_NAMES = CITY_DIRECTORY.map((city) => city.name);

function sendToLogin() {
  const returnTo = relativeAuthReturnTo();
  window.location.href = getLoginPageHref(returnTo || "/communities");
}

export function CreateCommunityForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [sport, setSport] = useState<"" | CommunitySport>("");
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
    const nextCity = city.trim();
    if (!nextName || !nextCity) {
      setError("Name and city are required");
      return;
    }
    if (nextName.length > 80 || nextCity.length > 80) {
      setError("Name and city must be 80 characters or fewer");
      return;
    }

    startTransition(() => {
      void createCommunity({
        name: nextName,
        city: nextCity,
        sport: sport || null,
      }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
            return;
          }
          setError(result.error);
          return;
        }
        router.push(`/communities/${result.value.id}`);
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
        Start a community
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
        Open groups for Sunday leagues, regular hit-arounds, or anyone in your
        city who wants a game.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="community-name" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Name
          </label>
          <input
            id="community-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            autoComplete="off"
            placeholder="Sunday Beers"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
          />
        </div>
        <div>
          <label htmlFor="community-city" className="mb-1.5 block text-xs font-medium text-zinc-400">
            City
          </label>
          <input
            id="community-city"
            type="text"
            list="community-city-options"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={80}
            required
            autoComplete="off"
            placeholder="Cape Town"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
          />
          <datalist id="community-city-options">
            {CITY_NAMES.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="community-sport" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Sport
          </label>
          <select
            id="community-sport"
            value={sport}
            onChange={(event) =>
              setSport(event.target.value as "" | CommunitySport)
            }
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            <option value="">Any sport</option>
            <option value="padel">Padel</option>
            <option value="multi">Multi-sport</option>
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
          Create community
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
