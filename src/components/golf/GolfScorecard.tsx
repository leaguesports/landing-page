"use client";

import { ChevronLeft, ChevronRight, Loader2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { lockGolfRound } from "@/lib/golf/api-round";
import {
  clearGolfRoundLocal,
  readGolfRoundLocal,
  writeGolfRoundLocal,
} from "@/lib/golf/round-store";
import { GolfHoleLayout } from "@/components/golf/GolfHoleLayout";
import {
  allHolesScored,
  buildLockPayload,
  clampStrokes,
  formatToPar,
  runningTotals,
  strokesFromScore,
} from "@/lib/golf/scoring";
import type {
  GolfLiveStrokes,
  GolfPlayerSlot,
  GolfRound,
} from "@/types/golf-round";

type GolfScorecardProps = {
  initialRound: GolfRound;
};

function layoutLabel(round: GolfRound): string {
  if (round.holesPlayed === 18) return "18 holes";
  if (round.startingHole === 10) return "Back 9";
  return "Front 9";
}

export function GolfScorecard({ initialRound }: GolfScorecardProps) {
  const [round, setRound] = useState(initialRound);
  const holes = round.course.holes;
  const locked = Boolean(round.lockedAt) || round.status === "locked";

  const [currentHoleIndex, setCurrentHoleIndex] = useState(() => {
    const local = readGolfRoundLocal(initialRound.id);
    if (local && local.currentHoleIndex < holes.length) {
      return local.currentHoleIndex;
    }
    return 0;
  });

  const [strokes, setStrokes] = useState<GolfLiveStrokes>(() => {
    if (initialRound.score) return strokesFromScore(initialRound.score);
    const local = readGolfRoundLocal(initialRound.id);
    return local?.strokes ?? {};
  });

  const [locking, setLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  const hole = holes[currentHoleIndex] ?? null;
  const canLock = !locked && allHolesScored(round.players, strokes, holes);
  const totals = useMemo(
    () => runningTotals(round.players, strokes, holes),
    [round.players, strokes, holes],
  );

  useEffect(() => {
    if (locked) return;
    writeGolfRoundLocal({
      roundId: round.id,
      currentHoleIndex,
      strokes,
      updatedAt: new Date().toISOString(),
    });
  }, [round.id, currentHoleIndex, strokes, locked]);

  const ensureHoleDefault = useCallback(
    (holeNumber: number, par: number) => {
      setStrokes((prev) => {
        const existing = prev[holeNumber];
        if (existing && Object.keys(existing).length > 0) return prev;
        const seeded: Record<string, number> = {};
        for (const player of round.players) {
          seeded[String(player.slot)] = clampStrokes(par);
        }
        return { ...prev, [holeNumber]: seeded };
      });
    },
    [round.players],
  );

  useEffect(() => {
    if (!hole || locked) return;
    ensureHoleDefault(hole.number, hole.par);
  }, [hole, locked, ensureHoleDefault]);

  function adjustStroke(slot: GolfPlayerSlot, delta: number) {
    if (!hole || locked) return;
    setStrokes((prev) => {
      const key = String(slot);
      const current =
        prev[hole.number]?.[key] ?? clampStrokes(hole.par);
      const next = clampStrokes(current + delta);
      return {
        ...prev,
        [hole.number]: {
          ...(prev[hole.number] ?? {}),
          [key]: next,
        },
      };
    });
  }

  async function handleLock() {
    const payload = buildLockPayload(round.players, strokes, holes);
    if (!payload) {
      setLockError("Enter strokes for every player on every hole");
      return;
    }
    setLocking(true);
    setLockError(null);
    try {
      const lockedRound = await lockGolfRound(round.id, payload, round.venue);
      setRound(lockedRound);
      clearGolfRoundLocal(round.id);
    } catch (err) {
      setLockError(
        err instanceof Error ? err.message : "Could not lock round",
      );
    } finally {
      setLocking(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#050705] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <Link
          href="/golf/new"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← New
        </Link>
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-lg tracking-wide">GOLF</span>
          {locked ? (
            <span className="inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Saved
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-zinc-700/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              Live
            </span>
          )}
        </div>
        <Link
          href="/golf/history"
          className="text-sm text-zinc-400 hover:text-white"
        >
          History
        </Link>
      </header>

      <div className="px-4 pt-4 text-center">
        {round.venue?.name || round.course.name ? (
          <p className="truncate text-xs text-zinc-500">
            {round.venue?.name || round.course.name}
            {round.teeName ? ` · ${round.teeName}` : ""}
          </p>
        ) : null}
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
          {locked ? "Result locked" : layoutLabel(round)}
        </p>
      </div>

      {hole ? (
        <div className="flex flex-1 flex-col px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentHoleIndex <= 0}
              onClick={() => setCurrentHoleIndex((i) => Math.max(0, i - 1))}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white disabled:opacity-30"
              aria-label="Previous hole"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                Hole {currentHoleIndex + 1} of {holes.length}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Par {hole.par} · SI {hole.strokeIndex}
                {typeof hole.meters === "number" ? ` · ${Math.round(hole.meters)} m` : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={currentHoleIndex >= holes.length - 1}
              onClick={() =>
                setCurrentHoleIndex((i) => Math.min(holes.length - 1, i + 1))
              }
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white disabled:opacity-30"
              aria-label="Next hole"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <GolfHoleLayout
            holeNumber={hole.number}
            par={hole.par}
            strokeIndex={hole.strokeIndex}
            meters={hole.meters}
            className="mt-5"
          />

          <ul className="mt-6 space-y-3">
            {round.players.map((player) => {
              const key = String(player.slot);
              const value =
                strokes[hole.number]?.[key] ?? clampStrokes(hole.par);
              const toPar = value - hole.par;
              return (
                <li
                  key={player.slot}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {player.displayName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatToPar(toPar)} this hole
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={locked || value <= 1}
                      onClick={() => adjustStroke(player.slot, -1)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white disabled:opacity-30"
                      aria-label={`Fewer strokes for ${player.displayName}`}
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="w-10 text-center font-display text-3xl tabular-nums text-white">
                      {value}
                    </span>
                    <button
                      type="button"
                      disabled={locked || value >= 15}
                      onClick={() => adjustStroke(player.slot, 1)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 disabled:opacity-30"
                      aria-label={`More strokes for ${player.displayName}`}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Totals
            </p>
            <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-[#141814]">
              {totals.map((total) => (
                <li
                  key={total.slot}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="truncate text-sm text-zinc-300">
                    {total.displayName}
                  </span>
                  <span className="text-sm tabular-nums text-white">
                    {total.gross}
                    <span className="ml-2 text-zinc-500">
                      {formatToPar(total.toPar)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="safe-area-pb border-t border-white/8 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {locked ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-emerald-300">
              Round locked to history
            </p>
            <Link
              href="/golf/history"
              className="flex min-h-10 w-full items-center justify-center text-sm font-medium text-zinc-400 hover:text-white"
            >
              Round history
            </Link>
            <Link
              href="/golf/new"
              className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-400 text-base font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              Play again
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lockError ? (
              <p className="text-center text-sm text-red-400">{lockError}</p>
            ) : canLock ? (
              <p className="text-center text-sm text-emerald-300">
                All holes scored. Lock to save the round.
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                Enter strokes hole by hole. Lock writes the result to history.
              </p>
            )}
            <button
              type="button"
              disabled={!canLock || locking}
              onClick={() => void handleLock()}
              className={[
                "inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-colors disabled:cursor-not-allowed",
                canLock
                  ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
                  : "border border-white/15 bg-white/5 text-zinc-400 opacity-50",
              ].join(" ")}
            >
              {locking ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : null}
              {locking ? "Locking…" : "Lock round"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
