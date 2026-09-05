"use client";

import { Loader2, MessageCircle, Share2, Undo2, Wifi, WifiOff, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
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
  dismissPadelShareNudge,
  isPadelShareNudgeDismissed,
} from "@/lib/padel/share-nudge";
import {
  buildPadelLockedShare,
  buildPadelWhatsAppShare,
  type PadelLockedShareMatch,
  type PadelWhatsAppShareMatch,
} from "@/lib/padel/whatsapp-share";
import { markScorecardShared } from "@/lib/badges/share-signal";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { PadelMatch, PadelTeamId } from "@/types/padel-match";

const PADEL_HISTORY_PATH = "/padel/history";

type PadelScorecardProps = {
  initialMatch: PadelMatch;
};

/** Rough ladder rank for the progress bar (mirrors tennis/padel point steps). */
function pointRank(match: PadelMatch, team: PadelTeamId): number {
  const { game, ruleset } = match;
  if (game.isTieBreak) {
    return team === "A" ? game.tieBreakPointsA : game.tieBreakPointsB;
  }
  const pts = team === "A" ? game.pointsA : game.pointsB;
  const other = team === "A" ? game.pointsB : game.pointsA;
  const base = pts === 0 ? 0 : pts === 15 ? 1 : pts === 30 ? 2 : 3;
  if (pts === 40 && other === 40) {
    if (ruleset === "golden_point") return 3.5;
    if (game.advantage === team) return 4;
    return 3;
  }
  return base;
}

/** Team A share of current-game progress (0–100). */
function pointProgressPercent(match: PadelMatch): number {
  const a = pointRank(match, "A");
  const b = pointRank(match, "B");
  if (a === 0 && b === 0) return 50;
  return Math.round((a / (a + b)) * 100);
}

function StatusPill({
  locked,
  connectionState,
}: {
  locked: boolean;
  connectionState: ReturnType<typeof useMatchChannel>["connectionState"];
}) {
  if (locked) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
        Saved
      </span>
    );
  }

  const live = connectionState === "connected";
  const label =
    connectionState === "connected"
      ? "Live"
      : connectionState === "connecting"
        ? "Connecting…"
        : connectionState === "offline" || connectionState === "disconnected"
          ? "Offline"
          : "Unavailable";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
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
      {label}
    </span>
  );
}

function TeamPanel({
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
  const serving = match.servingTeam === team;
  const label = getTeamLabel(match, team);
  const leading =
    team === "A" ? set.gamesA >= set.gamesB : set.gamesB > set.gamesA;

  return (
    <div className="flex min-w-0 flex-col px-4 py-5 sm:px-5 sm:py-6">
      <div className="flex min-h-6 items-center gap-2">
        <p className="truncate text-xs text-zinc-500">{label}</p>
        {serving ? (
          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
            Serve
          </span>
        ) : null}
      </div>

      <p
        className={[
          "mt-2 font-display text-5xl tracking-wide tabular-nums sm:text-6xl",
          leading ? "text-white" : "text-zinc-400",
        ].join(" ")}
      >
        {games}
      </p>
      <p className="mt-1 text-xs text-zinc-500">Games</p>

      <button
        type="button"
        disabled={disabled}
        onClick={onScore}
        className={[
          "mt-5 flex min-h-14 w-full touch-manipulation items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-16 sm:text-base",
          team === "A"
            ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
            : "bg-sky-400 text-zinc-950 hover:bg-sky-300",
        ].join(" ")}
      >
        <span className="text-xl leading-none">+</span>
        Point
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
      onClick={() => markScorecardShared()}
      aria-label="Share match on WhatsApp"
      title="Share this match on WhatsApp"
      className="inline-flex min-h-9 shrink-0 touch-manipulation items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-400/25 hover:text-emerald-200"
    >
      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
      WhatsApp
    </a>
  );
}

/** First-open sticky nudge — does not auto-open WhatsApp; scoring stays usable. */
function LiveShareNudgeBar({
  match,
  onDismiss,
}: {
  match: PadelWhatsAppShareMatch;
  onDismiss: () => void;
}) {
  const origin = useShareOrigin();
  const share = buildPadelWhatsAppShare(match, origin);

  return (
    <div
      role="region"
      aria-label="Share this live match"
      className="border-t border-emerald-400/25 bg-[#0a120c]/95 px-4 py-3 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium text-emerald-100">
          WhatsApp the other pair
        </p>
        <a
          href={share.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => markScorecardShared()}
          className="inline-flex min-h-10 shrink-0 touch-manipulation items-center gap-1.5 rounded-full bg-emerald-400 px-3.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Share
        </a>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss share reminder"
          className="inline-flex min-h-10 min-w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Locked-result Share: Web Share API when available, else WhatsApp `wa.me`. */
function LockedResultShareButton({ match }: { match: PadelLockedShareMatch }) {
  const origin = useShareOrigin();
  const share = buildPadelLockedShare(match, origin);

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        // Text already includes the deep link — omit `url` to avoid duplication.
        await navigator.share({
          title: "Padel result",
          text: share.text,
        });
        markScorecardShared();
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    markScorecardShared();
    window.open(share.href, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-400/15 text-base font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/25"
    >
      <Share2 className="h-5 w-5" aria-hidden />
      Share
    </button>
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
  // Start hidden to avoid SSR/hydration flash; reveal after reading sessionStorage.
  const [shareNudgeDismissed, setShareNudgeDismissed] = useState(true);

  useEffect(() => {
    setShareNudgeDismissed(isPadelShareNudgeDismissed(match.id));
  }, [match.id]);

  const liveShareMatch = {
    id: match.id,
    pairings: match.pairings,
    venue: match.venue,
  };
  const showShareNudge = !locked && !shareNudgeDismissed;

  const setBadge = locked
    ? "Saved"
    : finalized
      ? "Final"
      : match.game.isTieBreak
        ? `Tie-break · Set ${match.currentSetIndex + 1}`
        : `Set ${match.currentSetIndex + 1}`;

  const pointA = formatGamePoint(match, "A");
  const pointB = formatGamePoint(match, "B");
  const progress = pointProgressPercent(match);

  function handleDismissShareNudge() {
    dismissPadelShareNudge(match.id);
    setShareNudgeDismissed(true);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0c0f0c] text-white">
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/padel/new"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          ← New
        </Link>
        <StatusPill locked={locked} connectionState={connectionState} />
        {locked ? (
          <span className="inline-block min-h-9 min-w-[5.5rem]" aria-hidden />
        ) : (
          <WhatsAppShareControl match={liveShareMatch} />
        )}
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-4 sm:px-6">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#101410]/90 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {locked ? "Locked · Padel" : "Live · Padel"}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-white">
                {match.venue?.name?.trim() || "Padel match"}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              {!locked && !finalized ? (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              ) : null}
              {setBadge}
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-white/8">
            <TeamPanel
              team="A"
              match={match}
              disabled={scoringDisabled}
              onScore={() => void scorePoint("A")}
            />
            <TeamPanel
              team="B"
              match={match}
              disabled={scoringDisabled}
              onScore={() => void scorePoint("B")}
            />
          </div>

          <div className="border-t border-white/8 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{match.game.isTieBreak ? "Tie-break" : "Point"}</span>
              <span className="font-display text-lg tracking-wide text-emerald-300 tabular-nums">
                {pointA} — {pointB}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600">
              <span>{rulesLabel}</span>
              {setHistory ? (
                <span className="truncate text-zinc-500">{setHistory}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6">
          {showShareNudge ? (
            <div className="mb-4 overflow-hidden rounded-2xl border border-emerald-400/25">
              <LiveShareNudgeBar
                match={liveShareMatch}
                onDismiss={handleDismissShareNudge}
              />
            </div>
          ) : null}

          <div className="pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {locked ? (
              <div className="space-y-3">
                <p className="text-center text-sm text-emerald-300">
                  Final — {winnerLabel ?? "a team"} win
                </p>
                <LockedResultShareButton
                  match={{
                    id: match.id,
                    pairings: match.pairings,
                    venue: match.venue,
                    sets: match.sets,
                    startsAt: match.startsAt,
                    lockedAt: match.lockedAt,
                    createdAt: match.createdAt,
                  }}
                />
                <Link
                  href="/padel/new"
                  className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Challenge a friend
                </Link>
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
                    Final — {winnerLabel ?? "a team"} win. End to save the
                    result.
                  </p>
                ) : (
                  <p className="text-center text-xs text-zinc-500">
                    WhatsApp this scorecard so the other pair can follow live.
                    End writes the result to history.
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
      </div>
    </div>
  );
}
