"use client";

import { Loader2, MessageCircle, Undo2, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useLockPadelMatch } from "@/hooks/useLockPadelMatch";
import { useMatchChannel } from "@/hooks/useMatchChannel";
import { matchWinner } from "@/lib/padel/api-match";
import {
  formatGamePoint,
  formatSetHistory,
  getActiveSet,
  getTeamLabel,
} from "@/lib/padel/padelReducer";
import {
  buildPadelWhatsAppShare,
  type PadelWhatsAppShareMatch,
} from "@/lib/padel/whatsapp-share";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { PadelMatch, PadelTeamId } from "@/types/padel-match";

const PADEL_HISTORY_PATH = "/padel/history";

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

function subscribeNoop() {
  return () => {};
}

function useShareOrigin(): string {
  return useSyncExternalStore(
    subscribeNoop,
    () => window.location.origin,
    () => getSiteBaseUrl(),
  );
}

function WhatsAppShareControl({ match }: { match: PadelWhatsAppShareMatch }) {
  const origin = useShareOrigin();
  const share = buildPadelWhatsAppShare(match, origin);

  return (
    <a
      href={share.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share match on WhatsApp"
      title="Share this match on WhatsApp"
      className="inline-flex min-h-9 shrink-0 touch-manipulation items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-400/25 hover:text-emerald-200"
    >
      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
      WhatsApp
    </a>
  );
}

export function PadelScorecard({ initialMatch }: PadelScorecardProps) {
  const { match, connectionState, scorePoint, undoPoint, canUndo, emitEvent } =
    useMatchChannel(initialMatch.id, initialMatch);
  const { lockMatch, locking, lockError, canLock } = useLockPadelMatch(
    match,
    emitEvent,
  );
  const locked = Boolean(match.lockedAt);
  const finalized = match.status === "finalized" || locked;
  const scoringDisabled = finalized || locked;
  const setHistory = formatSetHistory(match);
  const rulesLabel =
    match.ruleset === "golden_point" ? "Golden Point" : "Advantage";
  const winner = matchWinner(match);
  const winnerLabel = winner ? getTeamLabel(match, winner) : null;

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
        <WhatsAppShareControl
          match={{
            id: match.id,
            pairings: match.pairings,
            venue: match.venue,
          }}
        />
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

      <div className="safe-area-pb border-t border-white/8 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {locked ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-emerald-300">
              Final — {winnerLabel ?? "a team"} win
            </p>
            <Link
              href={PADEL_HISTORY_PATH}
              className="flex min-h-10 w-full items-center justify-center text-sm font-medium text-zinc-400 hover:text-white"
            >
              Match history
            </Link>
            <Link
              href="/padel/new"
              className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-400 text-base font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              Play again
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lockError ? (
              <p className="text-center text-sm text-red-400">{lockError}</p>
            ) : finalized ? (
              <p className="text-center text-sm text-emerald-300">
                Final — {winnerLabel ?? "a team"} win. End to save the result.
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                WhatsApp this scorecard so the other pair can follow live. End
                writes the result to history.
              </p>
            )}
            <button
              type="button"
              disabled={!canUndo || scoringDisabled}
              onClick={() => void undoPoint()}
              className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="h-5 w-5" aria-hidden />
              Undo Point
            </button>
            <button
              type="button"
              disabled={!canLock || locking}
              onClick={() => void lockMatch()}
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
              {locking ? "Ending…" : "End match"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
