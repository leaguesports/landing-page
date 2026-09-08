"use client";

import { Clock, Loader2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
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
import {
  inferPadelMatchWinner,
  inferPadelSetWinner,
} from "@/lib/padel/capture";
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
  PadelTeamId,
} from "@/types/padel-match";

type PadelCaptureFormProps = {
  venues: VenueOption[];
  initialVenueSlug?: string | null;
  lockVenue?: boolean;
  initialSelf?: QuickStartInitialSelf | null;
};

function emptySet(): CapturePadelSetInput {
  return { gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" };
}

function showTieBreak(set: CapturePadelSetInput): boolean {
  return (
    (set.gamesA === 6 && set.gamesB === 6) ||
    (set.gamesA === 7 && set.gamesB === 6) ||
    (set.gamesA === 6 && set.gamesB === 7)
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
  const [sets, setSets] = useState<CapturePadelSetInput[]>([emptySet()]);
  const [winner, setWinner] = useState<PadelTeamId>("A");
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
  const inferredWinner = inferPadelMatchWinner(sets, winner) ?? winner;

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
    Boolean(inferredWinner) &&
    !saving &&
    !isPending;

  function applySets(next: CapturePadelSetInput[]) {
    setSets(next);
    const nextWinner = inferPadelMatchWinner(next);
    if (nextWinner) setWinner(nextWinner);
  }

  function updateSet(index: number, patch: Partial<CapturePadelSetInput>) {
    applySets(
      sets.map((set, i) => {
        if (i !== index) return set;
        const next = { ...set, ...patch };
        next.winner = inferPadelSetWinner(next);
        if (!showTieBreak(next)) next.tieBreak = null;
        return next;
      }),
    );
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
    if (!inferredWinner) {
      setError("Pick the match winner");
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
          score: { sets },
          winner: inferredWinner,
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
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Set scores</h2>
          <button
            type="button"
            disabled={sets.length >= 5}
            onClick={() => applySets([...sets, emptySet()])}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add set
          </button>
        </div>
        <div className="space-y-3">
          {sets.map((set, index) => (
            <div
              key={index}
              className="space-y-3 rounded-3xl border border-white/8 bg-[#141814] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Set {index + 1}
                </p>
                {sets.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      applySets(sets.filter((_, i) => i !== index))
                    }
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-zinc-500">
                    Team A games
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={set.gamesA}
                    onChange={(e) =>
                      updateSet(index, {
                        gamesA: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/40"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-zinc-500">
                    Team B games
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={set.gamesB}
                    onChange={(e) =>
                      updateSet(index, {
                        gamesB: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/40"
                  />
                </label>
              </div>
              {showTieBreak(set) ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-500">
                      Tie-break A
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={set.tieBreak?.pointsA ?? 0}
                      onChange={(e) =>
                        updateSet(index, {
                          tieBreak: {
                            pointsA: Number.parseInt(e.target.value, 10) || 0,
                            pointsB: set.tieBreak?.pointsB ?? 0,
                          },
                        })
                      }
                      className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-500">
                      Tie-break B
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={set.tieBreak?.pointsB ?? 0}
                      onChange={(e) =>
                        updateSet(index, {
                          tieBreak: {
                            pointsA: set.tieBreak?.pointsA ?? 0,
                            pointsB: Number.parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-400/40"
                    />
                  </label>
                </div>
              ) : null}
              <div className="flex gap-2">
                {(["A", "B"] as const).map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => updateSet(index, { winner: team })}
                    className={[
                      "min-h-10 flex-1 rounded-full border text-sm font-medium",
                      set.winner === team
                        ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                        : "border-white/10 bg-white/5 text-zinc-300",
                    ].join(" ")}
                  >
                    Set to Team {team}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Match winner</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["A", "B"] as const).map((team) => (
            <button
              key={team}
              type="button"
              onClick={() => setWinner(team)}
              className={[
                "min-h-12 rounded-2xl border text-sm font-medium",
                inferredWinner === team
                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                  : "border-white/10 bg-white/5 text-zinc-300",
              ].join(" ")}
            >
              Team {team}
            </button>
          ))}
        </div>
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
