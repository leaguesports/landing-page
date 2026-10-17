"use client";

import { Clock, Loader2, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  PlayerPairings,
  swapTeamSlots,
  type SlotKey,
} from "@/components/padel/PlayerPairings";
import { RulesToggle } from "@/components/padel/RulesToggle";
import { SwapTeamsButton, VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { capturePadelMatch } from "@/lib/match-api";
import { track } from "@/lib/analytics/track";
import {
  datetimeLocalToIso,
  toDatetimeLocalValue,
} from "@/lib/padel/api-match";
import { derivePadelMatchWinner } from "@/lib/padel/capture";
import {
  buildDemoGuestSlots,
  playerFromInitialSelf,
  resolveInitialQuickStartSlots,
  seatSelfInA1IfNeeded,
  selectDefaultPadelVenue,
  writeLastPadelVenueSlug,
  type QuickStartInitialSelf,
} from "@/lib/padel/quick-start-defaults";
import { makeUserPlayer, rememberPlayers } from "@/lib/padel/recent-players";
import { formatCaptureThrownError } from "@/lib/play/capture-error";
import {
  toMatchVenue,
  type VenueOption,
} from "@/lib/padel/venue-options";
import type {
  CapturePadelSetInput,
  PadelPlayer,
  PadelRuleset,
} from "@/types/padel-match";

const MAX_SETS = 5;
const MAX_GAMES = 20;
const MAX_TIE_BREAK = 30;

type PadelCaptureFormProps = {
  venues: VenueOption[];
  initialVenueSlug?: string | null;
  lockVenue?: boolean;
  initialSelf?: QuickStartInitialSelf | null;
};

function emptySet(): CapturePadelSetInput {
  return { gamesA: 0, gamesB: 0, tieBreak: null };
}

function showTieBreak(set: CapturePadelSetInput): boolean {
  return (
    (set.gamesA === 6 && set.gamesB === 6) ||
    (set.gamesA === 7 && set.gamesB === 6) ||
    (set.gamesA === 6 && set.gamesB === 7)
  );
}

function scoreOnlySet(set: CapturePadelSetInput): CapturePadelSetInput {
  return {
    gamesA: set.gamesA,
    gamesB: set.gamesB,
    tieBreak: showTieBreak(set) ? (set.tieBreak ?? null) : null,
  };
}

function pairingLabel(
  players: Array<PadelPlayer | null | undefined>,
  fallback: string,
): string {
  const names = players
    .map((player) => player?.displayName?.trim() ?? "")
    .filter((name) => name.length > 0);
  return names.length > 0 ? names.join(" / ") : fallback;
}

function ScoreStepper({
  value,
  max,
  label,
  onChange,
  compact = false,
}: {
  value: number;
  max: number;
  label: string;
  onChange: (next: number) => void;
  compact?: boolean;
}) {
  const buttonClass = [
    "inline-flex items-center justify-center rounded-full disabled:opacity-30",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
    compact
      ? "h-6 w-6 text-zinc-400 hover:bg-white/10 hover:text-white"
      : "h-7 w-7 text-zinc-200 hover:bg-emerald-400/15 hover:text-emerald-200",
  ].join(" ");

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border bg-[#0c0f0c]",
        compact
          ? "gap-0.5 border-white/8 px-0.5 py-0.5"
          : "gap-0.5 border-white/10 px-0.5 py-0.5",
      ].join(" ")}
    >
      {compact ? (
        <span className="pl-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
          TB
        </span>
      ) : null}
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className={buttonClass}
      >
        <Minus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      </button>
      <span
        className={[
          "text-center tabular-nums",
          compact
            ? "min-w-4 text-xs font-medium text-zinc-200"
            : "min-w-6 font-display text-xl tracking-wide text-white",
        ].join(" ")}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={buttonClass}
      >
        <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      </button>
    </div>
  );
}

function TeamScoreRow({
  label,
  fallback,
  isWinner,
  sets,
  team,
  onGames,
  onTieBreak,
  trailing,
}: {
  label: string;
  fallback: string;
  isWinner: boolean;
  sets: CapturePadelSetInput[];
  team: "A" | "B";
  onGames: (index: number, games: number) => void;
  onTieBreak: (index: number, points: number) => void;
  trailing?: ReactNode;
}) {
  const named = label !== fallback;
  return (
    <tr className={isWinner ? "bg-emerald-400/10" : undefined}>
      <th
        scope="row"
        className={[
          "sticky left-0 z-10 min-w-[6.75rem] max-w-[9.5rem] px-3 py-2.5 text-left",
          isWinner ? "bg-[#163028] text-emerald-200" : "bg-[#141814] text-white",
        ].join(" ")}
      >
        <span className="block truncate text-sm font-semibold" title={label}>
          {label}
        </span>
        {isWinner ? (
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            Winner
          </span>
        ) : named ? (
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            {fallback}
          </span>
        ) : null}
      </th>
      {sets.map((set, index) => {
        const games = team === "A" ? set.gamesA : set.gamesB;
        const tieBreakPoints =
          team === "A"
            ? (set.tieBreak?.pointsA ?? 0)
            : (set.tieBreak?.pointsB ?? 0);
        const setLabel = `set ${index + 1}`;
        return (
          <td key={index} className="px-1.5 py-2 text-center align-middle">
            <div className="flex flex-col items-center gap-1">
              <ScoreStepper
                value={games}
                max={MAX_GAMES}
                label={`${label} games in ${setLabel}`}
                onChange={(next) => onGames(index, next)}
              />
              {showTieBreak(set) ? (
                <ScoreStepper
                  compact
                  value={tieBreakPoints}
                  max={MAX_TIE_BREAK}
                  label={`${label} tie-break in ${setLabel}`}
                  onChange={(next) => onTieBreak(index, next)}
                />
              ) : null}
            </div>
          </td>
        );
      })}
      {trailing}
    </tr>
  );
}

export function PadelCaptureForm({
  venues,
  initialVenueSlug,
  lockVenue = false,
  initialSelf = null,
}: PadelCaptureFormProps) {
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const [ruleset, setRuleset] = useState<PadelRuleset>("golden_point");
  const [venue, setVenue] = useState<VenueOption | null>(() =>
    selectDefaultPadelVenue(venues, { initialVenueSlug }),
  );
  const [playedAtLocal, setPlayedAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date()),
  );
  const [slots, setSlots] = useState<Record<SlotKey, PadelPlayer | null>>(() =>
    resolveInitialQuickStartSlots(initialSelf),
  );
  const [sets, setSets] = useState<CapturePadelSetInput[]>([
    emptySet(),
    emptySet(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const seededSelfPlayer = useMemo(
    () => playerFromInitialSelf(initialSelf),
    [initialSelf],
  );

  const selfPlayer = useMemo(() => {
    if (isAuthenticated && user?.id) {
      return makeUserPlayer({
        id: user.id,
        displayName: displayName || "You",
        userId: user.id,
      });
    }
    return null;
  }, [isAuthenticated, user, displayName]);

  const knownSelf = selfPlayer ?? seededSelfPlayer;

  const resolvedSlots = useMemo(
    () => (knownSelf ? seatSelfInA1IfNeeded(slots, knownSelf) : slots),
    [slots, knownSelf],
  );

  const playedAtIso = datetimeLocalToIso(playedAtLocal);
  const derivedWinner = derivePadelMatchWinner(sets);
  const teamALabel = pairingLabel(
    [resolvedSlots.a1, resolvedSlots.a2],
    "Team A",
  );
  const teamBLabel = pairingLabel(
    [resolvedSlots.b1, resolvedSlots.b2],
    "Team B",
  );

  const ready =
    Boolean(venue) &&
    Boolean(playedAtIso) &&
    Boolean(
      resolvedSlots.a1 &&
        resolvedSlots.a2 &&
        resolvedSlots.b1 &&
        resolvedSlots.b2,
    ) &&
    sets.length > 0 &&
    Boolean(derivedWinner) &&
    !saving &&
    !isPending;

  function applySets(next: CapturePadelSetInput[]) {
    setSets(next.map(scoreOnlySet));
  }

  function updateSet(index: number, patch: Partial<CapturePadelSetInput>) {
    applySets(
      sets.map((set, i) => (i === index ? { ...set, ...patch } : set)),
    );
  }

  function updateTieBreak(index: number, team: "A" | "B", points: number) {
    const set = sets[index];
    if (!set) return;
    const current = set.tieBreak ?? { pointsA: 0, pointsB: 0 };
    updateSet(index, {
      tieBreak: {
        pointsA: team === "A" ? points : current.pointsA,
        pointsB: team === "B" ? points : current.pointsB,
      },
    });
  }

  async function handleCapture() {
    if (!isAuthenticated || !user?.id) {
      window.location.href = getLoginPageHref(
        relativeAuthReturnTo() || "/padel/capture",
      );
      return;
    }
    if (!venue) {
      setError("Pick a padel court to capture");
      return;
    }
    if (!playedAtIso) {
      setError("Set when the match was played");
      return;
    }
    if (
      !resolvedSlots.a1 ||
      !resolvedSlots.a2 ||
      !resolvedSlots.b1 ||
      !resolvedSlots.b2
    ) {
      setError("Pick all four players");
      return;
    }
    if (!derivedWinner) {
      setError("This score does not decide a winner.");
      return;
    }

    setError(null);
    setSaving(true);

    const pairings = {
      teamA: [resolvedSlots.a1, resolvedSlots.a2] as [
        PadelPlayer,
        PadelPlayer,
      ],
      teamB: [resolvedSlots.b1, resolvedSlots.b2] as [
        PadelPlayer,
        PadelPlayer,
      ],
    };
    rememberPlayers([...pairings.teamA, ...pairings.teamB]);

    try {
      const match = await capturePadelMatch(
        {
          venueCmsId: venue.id,
          playedAt: playedAtIso,
          ruleset,
          pairings,
          servingTeam: "A",
          score: {
            sets: sets.map((set) => ({
              gamesA: set.gamesA,
              gamesB: set.gamesB,
              tieBreak: set.tieBreak ?? null,
            })),
          },
          winner: derivedWinner,
        },
        { venue: toMatchVenue(venue)! },
      );
      writeLastPadelVenueSlug(venue.slug);
      track("game_lock", { page_type: "scorecard", sport: "padel" });
      startTransition(() => {
        router.push(`/padel/${match.id}`);
      });
    } catch (err) {
      setError(formatCaptureThrownError(err));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Capture padel result
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Finished score
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Record a completed four-ball. No live scorecard — this locks the
          result immediately.
        </p>
      </header>

      {!isAuthenticated && !initialSelf ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Sign in so we can seat you as a named player.{" "}
          <Link
            href={getLoginPageHref("/padel/capture")}
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            Sign in
          </Link>
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Padel court</h2>
        {lockVenue && venue ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{venue.name}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {[venue.suburb, venue.city].filter(Boolean).join(" · ") ||
                  "Selected court"}
              </p>
            </div>
            <Link
              href="/padel/capture"
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Choose a different court
            </Link>
          </div>
        ) : venues.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
            No padel courts in the directory yet. A court is required to
            capture.
          </p>
        ) : (
          <VenuePicker venues={venues} selected={venue} onSelect={setVenue} />
        )}
      </section>

      <section className="min-w-0 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Played at</h2>
        <label className="relative block w-full min-w-0 max-w-full overflow-hidden">
          <span className="sr-only">Match played at</span>
          <Clock
            className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="datetime-local"
            value={playedAtLocal}
            onChange={(e) => setPlayedAtLocal(e.target.value)}
            required
            className="box-border min-h-12 w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-datetime-edit]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Rules</h2>
        <RulesToggle value={ruleset} onChange={setRuleset} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">
            Pairings · Team A / Team B
          </h2>
          <button
            type="button"
            onClick={() => setSlots(buildDemoGuestSlots(knownSelf))}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            Quick-fill guests
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          You must be seated as a named player.
          {knownSelf
            ? " You are in Team A until you pick someone else."
            : null}
        </p>
        <PlayerPairings
          slots={resolvedSlots}
          onChange={setSlots}
          selfPlayer={knownSelf}
        />
        <SwapTeamsButton
          onSwap={() => setSlots(swapTeamSlots(resolvedSlots))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Set scores</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#141814]">
          <table className="w-full border-collapse">
            <caption className="sr-only">
              Padel scoreboard. The match winner is the side that wins more
              sets.
            </caption>
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-[#141814] px-3 py-2 text-left"
                >
                  Pair
                </th>
                {sets.map((_, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-1.5 py-2 text-center"
                  >
                    <span className="block">Set {index + 1}</span>
                    {sets.length > 1 ? (
                      <button
                        type="button"
                        aria-label={`Remove set ${index + 1}`}
                        onClick={() =>
                          applySets(sets.filter((_, i) => i !== index))
                        }
                        className="mx-auto mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-zinc-500 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </button>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              <TeamScoreRow
                label={teamALabel}
                fallback="Team A"
                isWinner={derivedWinner === "A"}
                sets={sets}
                team="A"
                onGames={(index, games) => updateSet(index, { gamesA: games })}
                onTieBreak={(index, points) =>
                  updateTieBreak(index, "A", points)
                }
                trailing={
                  sets.length < MAX_SETS ? (
                    <td
                      rowSpan={2}
                      className="border-l border-white/8 bg-[#141814] px-2 align-middle"
                    >
                      <button
                        type="button"
                        onClick={() => applySets([...sets, emptySet()])}
                        className="inline-flex min-h-24 min-w-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-emerald-400/30 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                        Add set
                      </button>
                    </td>
                  ) : null
                }
              />
              <TeamScoreRow
                label={teamBLabel}
                fallback="Team B"
                isWinner={derivedWinner === "B"}
                sets={sets}
                team="B"
                onGames={(index, games) => updateSet(index, { gamesB: games })}
                onTieBreak={(index, points) =>
                  updateTieBreak(index, "B", points)
                }
              />
            </tbody>
          </table>
        </div>
        <p
          role="status"
          className={
            derivedWinner
              ? "text-sm font-medium text-emerald-300"
              : "text-sm text-zinc-400"
          }
        >
          {derivedWinner
            ? `${derivedWinner === "A" ? teamALabel : teamBLabel} won`
            : "This score does not decide a winner."}
        </p>
      </section>

      {error ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!ready}
        onClick={() => void handleCapture()}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {saving || isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Save result"
        )}
      </button>
    </div>
  );
}
