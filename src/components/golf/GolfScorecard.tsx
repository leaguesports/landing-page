"use client";

import { PostActionShare } from "@/components/conversion/PostActionShare";
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GolfLockedScorecard } from "@/components/golf/GolfLockedScorecard";
import { GolfRoundInfoSheet } from "@/components/golf/GolfRoundInfoSheet";
import { GolfScoreStepper } from "@/components/golf/GolfScoreStepper";
import { lockGolfRound } from "@/lib/golf/api-round";
import { track } from "@/lib/analytics/track";
import {
  apiNetStrokesForHole,
  applyStrokeDelta,
  formatLiveHoleMeta,
  formatLiveLockHint,
  formatLivePlayingHcp,
  formatThisHoleNetLine,
  holeStrokeValue,
  liveCardVisibility,
  liveHeaderShowsStrokeIndex,
  liveHoleNet,
  seedHoleStrokesIfEmpty,
} from "@/lib/golf/live-hole-ui";
import { golfLayoutLabel } from "@/lib/golf/locked-scorecard";
import {
  clearGolfRoundLocal,
  readGolfRoundLocal,
  writeGolfRoundLocal,
} from "@/lib/golf/round-store";
import { toScorecardHoles } from "@/lib/golf/scorecard-holes";
import {
  allHolesScored,
  buildLockPayload,
  formatToPar,
  runningTotals,
  strokesFromScore,
} from "@/lib/golf/scoring";
import type {
  GolfCourseCms,
  GolfLiveStrokes,
  GolfPlayerSlot,
  GolfRound,
} from "@/types/golf-round";

type GolfScorecardProps = {
  initialRound: GolfRound;
  golfCourse?: GolfCourseCms | null;
};

export function GolfScorecard({
  initialRound,
  golfCourse = null,
}: GolfScorecardProps) {
  const [round, setRound] = useState(initialRound);
  const holes = useMemo(
    () => toScorecardHoles(round.course.holes, golfCourse, round.teeName),
    [round.course.holes, golfCourse, round.teeName],
  );
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
  const [infoOpen, setInfoOpen] = useState(false);

  const hole = holes[currentHoleIndex] ?? null;
  const canLock = !locked && allHolesScored(round.players, strokes, holes);
  const lockHint = formatLiveLockHint(canLock);
  const chrome = liveCardVisibility(round.players.length);
  const totals = useMemo(
    () => runningTotals(round.players, strokes, holes, round.score?.holes),
    [round.players, strokes, holes, round.score?.holes],
  );
  const lockedStrokes = round.score ? strokesFromScore(round.score) : strokes;
  const playerHoleNets = useMemo(() => {
    if (!hole) return [];
    return round.players.map((player) => {
      const value = holeStrokeValue(
        strokes,
        hole.number,
        player.slot,
        hole.par,
      );
      return {
        player,
        value,
        toPar: value - hole.par,
        holeNet: liveHoleNet({
          gross: value,
          playingHandicap: player.playingHandicap,
          holeNumber: hole.number,
          holes,
          apiNetStrokes: apiNetStrokesForHole(
            round.score,
            hole.number,
            player.slot,
          ),
        }),
      };
    });
  }, [hole, holes, round.players, round.score, strokes]);
  const showStrokeIndex = liveHeaderShowsStrokeIndex(
    playerHoleNets.map((row) => row.holeNet.strokesReceived),
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
      setStrokes((prev) =>
        seedHoleStrokesIfEmpty(prev, { number: holeNumber, par }, round.players),
      );
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
      const current = holeStrokeValue(prev, hole.number, slot, hole.par);
      const next = applyStrokeDelta(current, delta);
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
      track("game_lock", { page_type: "scorecard", sport: "golf" });
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

      <div className="px-4 pt-4">
        <PostActionShare
          url={`/golf/${round.id}`}
          text={`Golf round on LeagueSports\n{url}`}
          pageType="scorecard"
          sport="golf"
          heading={locked ? "Share this round" : "Share this live round"}
          compact={!locked}
        />
      </div>

      {locked ? (
        <div className="flex flex-1 flex-col px-4 py-5">
          <GolfLockedScorecard
            round={round}
            strokes={lockedStrokes}
            holes={holes}
          />
        </div>
      ) : (
        <div className="px-4 pt-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="inline-flex min-h-11 max-w-[85%] items-center justify-center truncate px-2 text-xs text-zinc-500 hover:text-zinc-300"
              aria-label="Round info"
            >
              {[round.venue?.name || round.course.name, round.teeName]
                .filter(Boolean)
                .join(" · ") || "Round info"}
            </button>
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              aria-label="Round info"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
            {golfLayoutLabel(round)}
          </p>
        </div>
      )}

      {!locked && hole ? (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={currentHoleIndex <= 0}
              onClick={() => setCurrentHoleIndex((i) => Math.max(0, i - 1))}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white disabled:opacity-30"
              aria-label="Previous hole"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-sm font-medium tabular-nums text-zinc-200">
                {formatLiveHoleMeta(hole, { showStrokeIndex })}
              </p>
            </div>
            <button
              type="button"
              disabled={currentHoleIndex >= holes.length - 1}
              onClick={() =>
                setCurrentHoleIndex((i) => Math.min(holes.length - 1, i + 1))
              }
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white disabled:opacity-30"
              aria-label="Next hole"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <ul className="mt-6 space-y-3">
            {playerHoleNets.map(({ player, value, toPar, holeNet }) => {
              const hcpLabel = formatLivePlayingHcp(player.playingHandicap);
              return (
                <li
                  key={player.slot}
                  className={
                    chrome.compactSinglePlayerCard
                      ? "px-1 py-2"
                      : "rounded-2xl border border-white/8 bg-[#141814] px-4 py-5"
                  }
                >
                  <GolfScoreStepper
                    value={value}
                    playerName={player.displayName}
                    disabled={locked}
                    strokesReceived={holeNet.strokesReceived}
                    onDecrease={() => adjustStroke(player.slot, -1)}
                    onIncrease={() => adjustStroke(player.slot, 1)}
                  />
                  <div className="mt-3 min-w-0 text-center">
                    {chrome.showPlayerNameOnCard ? (
                      <p
                        className={[
                          "truncate text-sm font-medium",
                          chrome.compactSinglePlayerCard
                            ? "text-zinc-400"
                            : "text-white",
                        ].join(" ")}
                      >
                        {player.displayName}
                      </p>
                    ) : null}
                    <p className="text-sm text-zinc-400">
                      {formatThisHoleNetLine({
                        net: holeNet.net,
                        toParLabel: formatToPar(toPar),
                      })}
                    </p>
                    {hcpLabel ? (
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        {hcpLabel}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Totals
            </p>
            <ul
              className={
                chrome.compactSinglePlayerCard
                  ? "px-1"
                  : "divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-[#141814]"
              }
            >
              {totals.map((total) => (
                <li
                  key={total.slot}
                  className={[
                    "flex items-center gap-3",
                    chrome.showPlayerNameInTotals
                      ? "justify-between px-4 py-3"
                      : "justify-center py-2",
                  ].join(" ")}
                >
                  {chrome.showPlayerNameInTotals ? (
                    <span className="truncate text-sm text-zinc-300">
                      {total.displayName}
                    </span>
                  ) : (
                    <span className="sr-only">{total.displayName}</span>
                  )}
                  <span className="text-right text-sm tabular-nums text-white">
                    {total.gross}
                    {total.net != null ? (
                      <span className="ml-2 text-emerald-300">
                        net {total.net}
                      </span>
                    ) : null}
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
            ) : lockHint ? (
              <p className="text-center text-sm text-emerald-300">{lockHint}</p>
            ) : null}
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

      {!locked ? (
        <GolfRoundInfoSheet
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          round={round}
          players={round.players}
          tees={hole?.tees ?? []}
          currentHoleIndex={currentHoleIndex}
          holeCount={holes.length}
        />
      ) : null}
    </div>
  );
}
