"use client";

import { PoolApiError, submitPrediction } from "@/lib/pool-api";
import { parseNonNegativeInt } from "@/lib/pool-utils";
import { useEffect, useState } from "react";

export default function PredictionForm({
  inviteCode,
  homeTeamName,
  awayTeamName,
  poolMemberId,
  existingPrediction,
  predictionsOpen,
  onSubmitted,
}: {
  inviteCode: string;
  homeTeamName: string;
  awayTeamName: string;
  poolMemberId: string;
  existingPrediction?: { predictedHomeScore: number; predictedAwayScore: number } | null;
  predictionsOpen: boolean;
  onSubmitted: () => void;
}) {
  const [homeScore, setHomeScore] = useState(
    existingPrediction?.predictedHomeScore?.toString() ?? "",
  );
  const [awayScore, setAwayScore] = useState(
    existingPrediction?.predictedAwayScore?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (existingPrediction) {
      setHomeScore(existingPrediction.predictedHomeScore.toString());
      setAwayScore(existingPrediction.predictedAwayScore.toString());
    }
  }, [existingPrediction]);

  if (!predictionsOpen) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="font-medium text-amber-300">Predictions are closed</p>
        <p className="mt-1 text-sm text-zinc-400">
          Kickoff has passed — no more predictions can be submitted.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const home = parseNonNegativeInt(homeScore);
    const away = parseNonNegativeInt(awayScore);

    if (home === null || away === null) {
      setError("Enter whole numbers (0 or greater) for both scores");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPrediction(inviteCode, poolMemberId, {
        predictedHomeScore: home,
        predictedAwayScore: away,
      });
      setSuccess(true);
      onSubmitted();
    } catch (err) {
      if (err instanceof PoolApiError) {
        setError(err.message);
      } else {
        setError("Could not save prediction. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
    >
      <h2 className="text-lg font-bold text-white">Your prediction</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Predict the full-time score before kickoff. You can update until then.
      </p>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label htmlFor="homeScore" className="block text-sm font-medium text-zinc-300">
            {homeTeamName}
          </label>
          <input
            id="homeScore"
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
          <label htmlFor="awayScore" className="block text-sm font-medium text-zinc-300">
            {awayTeamName}
          </label>
          <input
            id="awayScore"
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

      {success && (
        <p className="mt-3 text-sm text-green-400" role="status">
          Prediction saved!
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Saving…"
          : existingPrediction
            ? "Update prediction"
            : "Submit prediction"}
      </button>
    </form>
  );
}
