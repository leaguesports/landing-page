"use client";

import { PoolApiError, submitPrediction } from "@/lib/pool-api";
import { getPredictionTypeLabel, parseNonNegativeInt } from "@/lib/pool-utils";
import type {
  PredictionFormState,
  PredictionType,
  PredictionWinnerSide,
} from "@/types/pool";
import { useEffect, useState } from "react";

const MODES: PredictionType[] = ["EXACT_SCORE", "TOTAL_SCORE", "MARGIN"];

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
  existingPrediction?: PredictionFormState | null;
  predictionsOpen: boolean;
  onSubmitted: () => void;
}) {
  const [mode, setMode] = useState<PredictionType>(
    existingPrediction?.type ?? "EXACT_SCORE",
  );
  const [homeScore, setHomeScore] = useState(
    existingPrediction?.type === "EXACT_SCORE"
      ? existingPrediction.home.toString()
      : "",
  );
  const [awayScore, setAwayScore] = useState(
    existingPrediction?.type === "EXACT_SCORE"
      ? existingPrediction.away.toString()
      : "",
  );
  const [totalScore, setTotalScore] = useState(
    existingPrediction?.type === "TOTAL_SCORE"
      ? existingPrediction.total.toString()
      : "",
  );
  const [marginSide, setMarginSide] = useState<PredictionWinnerSide>(
    existingPrediction?.type === "MARGIN" ? existingPrediction.side : "HOME",
  );
  const [margin, setMargin] = useState(
    existingPrediction?.type === "MARGIN" && existingPrediction.side !== "DRAW"
      ? (existingPrediction.margin?.toString() ?? "")
      : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!existingPrediction) {
      return;
    }
    setMode(existingPrediction.type);
    if (existingPrediction.type === "EXACT_SCORE") {
      setHomeScore(existingPrediction.home.toString());
      setAwayScore(existingPrediction.away.toString());
    } else if (existingPrediction.type === "TOTAL_SCORE") {
      setTotalScore(existingPrediction.total.toString());
    } else {
      setMarginSide(existingPrediction.side);
      setMargin(
        existingPrediction.side !== "DRAW"
          ? (existingPrediction.margin?.toString() ?? "")
          : "",
      );
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

  function buildFormState(): PredictionFormState | null {
    if (mode === "EXACT_SCORE") {
      const home = parseNonNegativeInt(homeScore);
      const away = parseNonNegativeInt(awayScore);
      if (home === null || away === null) {
        setError("Enter whole numbers (0 or greater) for both scores");
        return null;
      }
      return { type: "EXACT_SCORE", home, away };
    }

    if (mode === "TOTAL_SCORE") {
      const total = parseNonNegativeInt(totalScore);
      if (total === null) {
        setError("Enter a whole number (0 or greater) for total points");
        return null;
      }
      return { type: "TOTAL_SCORE", total };
    }

    if (marginSide === "DRAW") {
      return { type: "MARGIN", side: "DRAW" };
    }

    const marginValue = parseNonNegativeInt(margin);
    if (marginValue === null) {
      setError("Enter the winning margin (0 or greater)");
      return null;
    }
    return { type: "MARGIN", side: marginSide, margin: marginValue };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = buildFormState();
    if (!form) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPrediction(inviteCode, poolMemberId, form);
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
        Choose how you want to predict. You can update until kickoff.
      </p>

      <div
        className="mt-4 flex gap-1 rounded-xl border border-white/10 bg-black/40 p-1"
        role="tablist"
        aria-label="Prediction mode"
      >
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
              mode === m
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {getPredictionTypeLabel(m)}
          </button>
        ))}
      </div>

      {mode === "EXACT_SCORE" && (
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
      )}

      {mode === "TOTAL_SCORE" && (
        <div className="mt-5">
          <label htmlFor="totalScore" className="block text-sm font-medium text-zinc-300">
            How many points in the game?
          </label>
          <input
            id="totalScore"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={totalScore}
            onChange={(e) => setTotalScore(e.target.value)}
            placeholder="e.g. 45"
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-2xl font-bold tabular-nums text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
          />
        </div>
      )}

      {mode === "MARGIN" && (
        <div className="mt-5 space-y-4">
          <fieldset>
            <legend className="block text-sm font-medium text-zinc-300">
              Who wins?
            </legend>
            <div className="mt-2 space-y-2">
              {(
                [
                  { side: "HOME" as const, label: homeTeamName },
                  { side: "AWAY" as const, label: awayTeamName },
                  { side: "DRAW" as const, label: "Draw" },
                ] as const
              ).map(({ side, label }) => (
                <label
                  key={side}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    marginSide === side
                      ? "border-green-500/40 bg-green-500/10"
                      : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="marginSide"
                    value={side}
                    checked={marginSide === side}
                    onChange={() => {
                      setMarginSide(side);
                      setError(null);
                    }}
                    className="accent-green-500"
                  />
                  <span className="text-sm font-medium text-white">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {marginSide !== "DRAW" && (
            <div>
              <label htmlFor="margin" className="block text-sm font-medium text-zinc-300">
                Winning margin
              </label>
              <input
                id="margin"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="e.g. 12"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-2xl font-bold tabular-nums text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              />
            </div>
          )}
        </div>
      )}

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
