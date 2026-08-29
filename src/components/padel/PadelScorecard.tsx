"use client";

import { Loader2, Share2, Undo2, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMatchChannel } from "@/hooks/useMatchChannel";
import { lockPadelMatch } from "@/lib/match-api";
import {
  MatchApiError,
  matchWinner,
  toLockMatchBody,
} from "@/lib/padel/api-match";
import {
  formatGamePoint,
  formatSetHistory,
  getActiveSet,
  getTeamLabel,
} from "@/lib/padel/padelReducer";
import type { PadelMatch, PadelTeamId } from "@/types/padel-match";

export const PADEL_HISTORY_PATH = "/padel/history";

type PadelScorecardProps = {
  initialMatch: PadelMatch;
};

function ConnectionBadge({
  state,
}: {
  state: ReturnType<typeof useMatchChannel>["connectionState"];
}) {
  const live = state === "connected";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        live
          ? "bg-emerald-400/15 text-emerald-300"
          : "bg-zinc-700/80 text-zinc-300",
      ].join(" ")}
    >
      {live ? (
        <Wifi className="h-3 w-3" aria-hidden />
      ) : (
        <WifiOff className="h-3 w-3" aria-hidden />
      )}
      {state === "connected"
        ? "Live"
        : state === "connecting"
          ? "Connecting…"
          : state === "offline" || state === "disconnected"
            ? "Offline · local"
            : "Realtime unavailable"}
    </span>
  );
}

function ScoreColumn({
  team,
  match,
  onScore,
  disabled,
}: {
  team: PadelTeamId;
  match: PadelMatch;
  onScore: () => void;
  disabled: boolean;
}) {
  const set = getActiveSet(match);
  const games = team === "A" ? set.gamesA : set.gamesB;
  const point = formatGamePoint(match, team);
  const serving = match.servingTeam === team;
  const label = getTeamLabel(match, team);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <p className="max-w-[9rem] truncate text-center text-sm font-medium text-zinc-300 sm:max-w-[12rem]">
          {label}
        </p>
        {serving ? (
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
            Serve
          </span>
        ) : null}
      </div>

      <p className="font-display text-7xl leading-none tracking-wide text-white tabular-nums sm:text-8xl">
        {point}
      </p>

      <p className="text-sm text-zinc-500">
        Games · <span className="tabular-nums text-zinc-200">{games}</span>
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={onScore}
        className={[
          "mt-auto flex min-h-28 w-full max-w-[11rem] touch-manipulation flex-col items-center justify-center rounded-3xl text-lg font-bold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-32 sm:max-w-[14rem] sm:text-xl",
          team === "A"
            ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
            : "bg-sky-400 text-zinc-950 hover:bg-sky-300",
        ].join(" ")}
      >
        <span className="text-3xl leading-none sm:text-4xl">+</span>
        <span className="mt-1">Point</span>
        <span className="text-sm font-semibold opacity-80">Team {team}</span>
      </button>
    </div>
  );
}

function padelShareUrl(matchId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/padel/${matchId}`;
  }
  return `/padel/${matchId}`;
}

export function PadelScorecard({ initialMatch }: PadelScorecardProps) {
  const { match, connectionState, scorePoint, undoPoint, canUndo, emitEvent } =
    useMatchChannel(initialMatch.id, initialMatch);
  const [locking, setLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const locked = Boolean(match.lockedAt);
  const finalized = match.status === "finalized" || locked;
  const scoringDisabled = finalized || locked;
  const setHistory = formatSetHistory(match);
  const rulesLabel =
    match.ruleset === "golden_point" ? "Golden Point" : "Advantage";
  const lockBody = toLockMatchBody(match);
  const winner = matchWinner(match);
  const winnerLabel = winner ? getTeamLabel(match, winner) : null;

  async function handleShare() {
    const url = padelShareUrl(match.id);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Padel match",
          url,
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleEnd() {
    if (!lockBody || locked || locking) return;
    setLockError(null);
    setLocking(true);
    try {
      const lockedMatch = await lockPadelMatch(
        match.id,
        lockBody,
        match.venue,
      );
      const next: PadelMatch = {
        ...match,
        ...lockedMatch,
        status: "finalized",
        lockedAt: lockedMatch.lockedAt ?? new Date().toISOString(),
        winner: lockedMatch.winner ?? lockBody.winner,
        sets: lockedMatch.sets.length ? lockedMatch.sets : match.sets,
        version: Math.max(lockedMatch.version, match.version) + 1,
      };
      await emitEvent("STATE_SYNC", { state: next });
    } catch (error) {
      if (error instanceof MatchApiError) {
        setLockError(error.message);
      } else if (error instanceof Error) {
        setLockError(error.message);
      } else {
        setLockError("Could not lock the match");
      }
    } finally {
      setLocking(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#050705] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <Link
          href="/padel/new"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← New
        </Link>
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-lg tracking-wide">
            PADEL
          </span>
          {locked ? (
            <span className="inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Saved
            </span>
          ) : (
            <ConnectionBadge state={connectionState} />
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex items-center gap-1.5 text-right text-[11px] font-medium text-zinc-300 hover:text-white"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          {copied ? "Copied" : "Share"}
        </button>
      </header>

      <div className="px-4 pt-4 text-center">
        {match.venue?.name ? (
          <p className="truncate text-xs text-zinc-500">{match.venue.name}</p>
        ) : null}
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
          {locked
            ? "Result locked"
            : finalized
              ? "Match complete"
              : match.game.isTieBreak
                ? `Tie-break · Set ${match.currentSetIndex + 1}`
                : `Set ${match.currentSetIndex + 1}`}
        </p>
        <p className="mt-1 text-[11px] text-zinc-600">{rulesLabel}</p>
        {setHistory ? (
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            {setHistory}
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 items-stretch gap-3 px-3 py-6 sm:gap-6 sm:px-6">
        <ScoreColumn
          team="A"
          match={match}
          disabled={scoringDisabled}
          onScore={() => void scorePoint("A")}
        />
        <div className="flex w-px shrink-0 flex-col items-center justify-center self-stretch py-8">
          <div className="h-full w-px bg-white/10" />
        </div>
        <ScoreColumn
          team="B"
          match={match}
          disabled={scoringDisabled}
          onScore={() => void scorePoint("B")}
        />
      </div>

      <div className="safe-area-pb border-t border-white/8 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {locked ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-emerald-300">
              Final — {winnerLabel ?? "a team"} win
            </p>
            <Link
              href="/padel/new"
              className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-400 text-base font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              Play again
            </Link>
            <Link
              href={PADEL_HISTORY_PATH}
              className="flex min-h-12 w-full items-center justify-center text-sm font-medium text-zinc-400 hover:text-white"
            >
              Match history
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              disabled={!canUndo || scoringDisabled}
              onClick={() => void undoPoint()}
              className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="h-5 w-5" aria-hidden />
              Undo Point
            </button>
            <button
              type="button"
              disabled={!lockBody || locking}
              onClick={() => void handleEnd()}
              className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-emerald-400 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {locking ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : null}
              {locking ? "Ending…" : "End match"}
            </button>
            {finalized ? (
              <p className="text-center text-sm text-emerald-300">
                Final — {winnerLabel ?? "a team"} win. End to save the result.
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                Share{" "}
                <span className="font-mono text-zinc-400">
                  /padel/{match.id}
                </span>{" "}
                so the other pair opens this scorecard. End writes the result
                to history.
              </p>
            )}
            {lockError ? (
              <p className="text-center text-sm text-red-400">{lockError}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
