"use client";

import { Clock, Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  PlayerPairings,
  swapTeamSlots,
  type SlotKey,
} from "@/components/padel/PlayerPairings";
import { RulesToggle } from "@/components/padel/RulesToggle";
import {
  SwapTeamsButton,
  VenuePicker,
} from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { createPadelMatch, cacheMatchLocally } from "@/lib/match-api";
import {
  datetimeLocalToIso,
  toDatetimeLocalValue,
} from "@/lib/padel/api-match";
import {
  makeGuestPlayer,
  makeUserPlayer,
  rememberPlayers,
} from "@/lib/padel/recent-players";
import {
  toMatchVenue,
  type VenueOption,
} from "@/lib/padel/venue-options";
import type { PadelPlayer, PadelRuleset } from "@/types/padel-match";

const EMPTY_SLOTS: Record<SlotKey, PadelPlayer | null> = {
  a1: null,
  a2: null,
  b1: null,
  b2: null,
};

type PadelQuickStartProps = {
  venues: VenueOption[];
};

export function PadelQuickStart({ venues }: PadelQuickStartProps) {
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const [ruleset, setRuleset] = useState<PadelRuleset>("golden_point");
  const [venue, setVenue] = useState<VenueOption | null>(null);
  const [startsAtLocal, setStartsAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date()),
  );
  const [slots, setSlots] = useState(EMPTY_SLOTS);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [starting, setStarting] = useState(false);

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

  const startsAtIso = datetimeLocalToIso(startsAtLocal);
  const ready =
    Boolean(venue) &&
    Boolean(startsAtIso) &&
    Boolean(slots.a1 && slots.a2 && slots.b1 && slots.b2) &&
    !starting &&
    !isPending;

  async function handleStart() {
    if (!venue) {
      setError("Pick a padel court to start");
      return;
    }
    if (!startsAtIso) {
      setError("Set a start time");
      return;
    }
    if (!slots.a1 || !slots.a2 || !slots.b1 || !slots.b2) {
      setError("Pick all four players to start");
      return;
    }

    setError(null);
    setStarting(true);

    const pairings = {
      teamA: [slots.a1, slots.a2] as [PadelPlayer, PadelPlayer],
      teamB: [slots.b1, slots.b2] as [PadelPlayer, PadelPlayer],
    };

    rememberPlayers([...pairings.teamA, ...pairings.teamB]);

    try {
      const match = await createPadelMatch(
        {
          venueCmsId: venue.id,
          startsAt: startsAtIso,
          ruleset,
          pairings,
          servingTeam: "A",
        },
        { venue: toMatchVenue(venue) },
      );
      cacheMatchLocally(match);
      startTransition(() => {
        router.push(`/padel/${match.id}`);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start match");
      setStarting(false);
    }
  }

  function fillDemoGuests() {
    setSlots({
      a1: selfPlayer ?? makeGuestPlayer("Alex"),
      a2: makeGuestPlayer("Sam"),
      b1: makeGuestPlayer("Jordan"),
      b2: makeGuestPlayer("Riley"),
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          New padel match
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Court, time, players
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          A padel court is required. Set the start time, load two pairs, then
          open the live scorecard.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Padel court</h2>
        {venues.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
            No padel courts in the directory yet. Sports bars and watch venues
            are not listed here.
          </p>
        ) : (
          <VenuePicker venues={venues} selected={venue} onSelect={setVenue} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Start time</h2>
        <label className="relative block">
          <span className="sr-only">Match start time</span>
          <Clock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="datetime-local"
            value={startsAtLocal}
            onChange={(e) => setStartsAtLocal(e.target.value)}
            required
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40"
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
            onClick={fillDemoGuests}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            Quick-fill guests
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Named account or guest display name — four players required.
        </p>
        <PlayerPairings
          slots={slots}
          onChange={setSlots}
          selfPlayer={selfPlayer}
        />
        <SwapTeamsButton onSwap={() => setSlots((s) => swapTeamSlots(s))} />
      </section>

      {error ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!ready}
        onClick={handleStart}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {starting || isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Starting…
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" aria-hidden />
            Start Match
          </>
        )}
      </button>
    </div>
  );
}
