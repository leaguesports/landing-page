"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  GOLF_TOURS_NEW_HREF,
  addDaysIso,
  createGolfTour,
  golfTourHref,
  todayIsoDay,
} from "@/lib/golf-tours/golf-tours";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

function sendToLogin() {
  const returnTo = relativeAuthReturnTo();
  window.location.href = getLoginPageHref(returnTo || GOLF_TOURS_NEW_HREF);
}

export function CreateGolfTourForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(() => todayIsoDay());
  const [endDate, setEndDate] = useState(
    () => addDaysIso(todayIsoDay(), 2) ?? todayIsoDay(),
  );
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
      void createGolfTour({
        name: nextName,
        startDate,
        endDate,
      }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
            return;
          }
          setError(result.error);
          return;
        }
        router.push(golfTourHref(result.value.id));
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
        Create a golf tour
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
        Multi-day, multi-course camps. Defaults to two teams (Camp A and Camp
        B). On the next screen you can rename camps, add rounds, then add
        fourballs. Stroke play only for v1.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="golf-tour-name"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Name
          </label>
          <input
            id="golf-tour-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            autoComplete="off"
            placeholder="Friends Cup"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
          />
        </div>
        <div>
          <label
            htmlFor="golf-tour-start"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Start date
          </label>
          <input
            id="golf-tour-start"
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40"
          />
        </div>
        <div>
          <label
            htmlFor="golf-tour-end"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            End date
          </label>
          <input
            id="golf-tour-end"
            type="date"
            required
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40"
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
          Create tour
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
