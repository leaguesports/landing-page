"use client";

import { PoolApiError, submitResult } from "@/lib/pool-api";
import { parseNonNegativeInt } from "@/lib/pool-utils";
import type { Leaderboard } from "@/types/pool";
import { useState } from "react";

export default function SubmitResultForm({
  inviteCode,
  homeTeamName,
  awayTeamName,
  onSubmitted,
}: {
  inviteCode: string;
  homeTeamName: string;
  awayTeamName: string;
  onSubmitted: (leaderboard: Leaderboard) => void;
}) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const home = parseNonNegativeInt(homeScore);
    const away = parseNonNegativeInt(awayScore);

    if (home === null || away === null) {
      setError("Enter whole numbers (0 or greater) for both scores");
      return;
    }

    setIsSubmitting(true);
    try {
      const leaderboard = await submitResult(inviteCode, home, away);
      onSubmitted(leaderboard);
    } catch (err) {
      if (err instanceof PoolApiError) {
        setError(err.message);
      } else {
        setError("Could not submit result. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5"
    >
      <h2 className="text-lg font-bold text-white">Submit final result</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Enter the final score to calculate points and reveal the winner. Anyone with this
        device&apos;s pool link can submit.
      </p>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label htmlFor="resultHome" className="block text-sm font-medium text-zinc-300">
            {homeTeamName}
          </label>
          <input
            id="resultHome"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-2xl font-bold tabular-nums text-white focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
          />
        </div>
        <span className="pb-3 text-xl font-bold text-zinc-500">–</span>
        <div>
          <label htmlFor="resultAway" className="block text-sm font-medium text-zinc-300">
            {awayTeamName}
          </label>
          <input
            id="resultAway"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-2xl font-bold tabular-nums text-white focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit result & score pool"}
      </button>
    </form>
  );
}
