"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { submitDartsTurn } from "@/lib/darts/api-match";
import { dartsMatchWinnerName } from "@/lib/darts/history";
import {
  evaluateVisit,
  shouldOfferCheckout,
} from "@/lib/darts/rules";
import type { DartsMatch, DartsPlayerSlot } from "@/types/darts-match";
import { DARTS_MAX_TURN_SCORE } from "@/types/darts-match";

type DartsScorecardProps = {
  initialMatch: DartsMatch;
};

export function DartsScorecard({ initialMatch }: DartsScorecardProps) {
  const [match, setMatch] = useState(initialMatch);
  const [activeSlot, setActiveSlot] = useState<DartsPlayerSlot>(
    initialMatch.nextSuggestedSlot ?? initialMatch.players[0]?.slot ?? 1,
  );
  const [score, setScore] = useState("");
  const [checkout, setCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = match.status === "locked" || Boolean(match.lockedAt);
  const thrower =
    match.players.find((player) => player.slot === activeSlot) ??
    match.players[0];
  const remaining = thrower?.remaining ?? 501;
  const scoreNum = Number.parseInt(score, 10);
  const visit = Number.isNaN(scoreNum) ? null : evaluateVisit(remaining, scoreNum);
  const offerCheckout = shouldOfferCheckout(remaining, scoreNum);
  const lastTurn = match.turns[match.turns.length - 1] ?? null;
  const winnerName = dartsMatchWinnerName(match);

  const suggested = match.nextSuggestedSlot;

  const recentTurns = useMemo(
    () => match.turns.slice(-8).reverse(),
    [match.turns],
  );

  async function handleSubmit() {
    if (!thrower || locked) return;
    if (!visit || visit.kind === "invalid") {
      setError(visit?.message ?? `Visit score must be 0–${DARTS_MAX_TURN_SCORE}`);
      return;
    }
    if (visit.kind === "illegal_finish") {
      setError(visit.message ?? "Not a legal double-out checkout");
      return;
    }
    if (visit.kind === "finish" && !checkout) {
      setError("Tick checkout to finish on a double-out");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const next = await submitDartsTurn(
        match.id,
        {
          playerSlot: thrower.slot,
          userId: thrower.userId,
          score: scoreNum,
          checkout: visit.kind === "finish" ? true : undefined,
        },
        remaining,
        match.venue,
      );
      setMatch(next);
      setScore("");
      setCheckout(false);
      if (next.nextSuggestedSlot) {
        setActiveSlot(next.nextSuggestedSlot);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit visit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#050705] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <Link
          href="/darts/new"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← New
        </Link>
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-lg tracking-wide">DARTS 501</span>
          {locked ? (
            <span className="inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-zinc-700/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              Live · double-out
            </span>
          )}
        </div>
        <Link
          href="/darts/history"
          className="text-sm text-zinc-400 hover:text-white"
        >
          History
        </Link>
      </header>

      <div className="px-4 pt-4 text-center">
        {match.venue?.name ? (
          <p className="truncate text-xs text-zinc-500">{match.venue.name}</p>
        ) : (
          <p className="text-xs text-zinc-500">Home game</p>
        )}
      </div>

      <ul className="mt-4 space-y-2 px-4">
        {match.players.map((player) => {
          const isSuggested = !locked && suggested === player.slot;
          const isWinner = locked && match.winnerSlot === player.slot;
          return (
            <li
              key={player.slot}
              className={[
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3",
                isWinner
                  ? "border-emerald-400/40 bg-emerald-400/10"
                  : isSuggested
                    ? "border-emerald-400/30 bg-emerald-400/8"
                    : "border-white/8 bg-[#141814]",
              ].join(" ")}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {player.displayName}
                </p>
                <p className="text-xs text-zinc-500">
                  {isWinner
                    ? "Winner"
                    : isSuggested
                      ? "To throw"
                      : `Slot ${player.slot}`}
                </p>
              </div>
              <span className="font-display text-4xl tabular-nums text-white">
                {player.remaining}
              </span>
            </li>
          );
        })}
      </ul>

      {lastTurn?.bust ? (
        <p className="px-4 pt-4 text-center text-sm text-amber-200">
          Bust — {lastTurn.score} left remaining unchanged.
        </p>
      ) : null}

      <div className="flex-1 px-4 py-6">
        {recentTurns.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Recent visits
            </p>
            <ol className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-[#141814]">
              {recentTurns.map((turn) => {
                const player = match.players.find(
                  (p) => p.slot === turn.playerSlot,
                );
                return (
                  <li
                    key={turn.turnNumber}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <span className="truncate text-sm text-zinc-300">
                      {player?.displayName ?? `Slot ${turn.playerSlot}`}
                    </span>
                    <span className="text-sm tabular-nums text-white">
                      {turn.score}
                      {turn.bust ? (
                        <span className="ml-2 text-amber-300">bust</span>
                      ) : null}
                      {turn.checkout ? (
                        <span className="ml-2 text-emerald-300">out</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="text-center text-sm text-zinc-500">
            Enter visit totals 0–180. Checkout only on a legal double-out.
          </p>
        )}
      </div>

      <div className="safe-area-pb border-t border-white/8 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {locked ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-emerald-300">
              {winnerName
                ? `${winnerName} checked out`
                : "Game locked to history"}
            </p>
            <Link
              href="/darts/history"
              className="flex min-h-10 w-full items-center justify-center text-sm font-medium text-zinc-400 hover:text-white"
            >
              Game history
            </Link>
            <Link
              href="/darts/new"
              className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-400 text-base font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              Play again
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {match.players.map((player) => (
                <button
                  key={player.slot}
                  type="button"
                  onClick={() => setActiveSlot(player.slot)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-medium",
                    activeSlot === player.slot
                      ? "bg-emerald-400 text-zinc-950"
                      : "border border-white/12 bg-white/5 text-zinc-300",
                  ].join(" ")}
                >
                  {player.displayName}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="sr-only">Visit score</span>
              <input
                type="number"
                min={0}
                max={DARTS_MAX_TURN_SCORE}
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  setCheckout(false);
                }}
                placeholder="Visit total 0–180"
                className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-center font-display text-3xl tabular-nums text-white outline-none placeholder:text-sm placeholder:font-sans placeholder:text-zinc-600 focus:border-emerald-400/40"
              />
            </label>
            {visit?.kind === "bust" ? (
              <p className="text-center text-sm text-amber-200">
                {visit.message}
              </p>
            ) : null}
            {offerCheckout ? (
              <label className="flex items-center justify-center gap-3 text-sm text-emerald-200">
                <input
                  type="checkbox"
                  checked={checkout}
                  onChange={(e) => setCheckout(e.target.checked)}
                  className="h-4 w-4 accent-emerald-400"
                />
                Double-out checkout
              </label>
            ) : null}
            {error ? (
              <p className="text-center text-sm text-red-400">{error}</p>
            ) : null}
            <button
              type="button"
              disabled={submitting || score === ""}
              onClick={() => void handleSubmit()}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 text-base font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : null}
              {submitting ? "Saving…" : "Submit visit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
