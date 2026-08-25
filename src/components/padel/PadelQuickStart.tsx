"use client";

import { Loader2, Zap } from "lucide-react";
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

  const ready =
    slots.a1 && slots.a2 && slots.b1 && slots.b2 && !starting && !isPending;

  async function handleStart() {
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
      const match = await createPadelMatch({
        ruleset,
        venue: toMatchVenue(venue),
        pairings,
        servingTeam: "A",
        createdByUserId: user?.id ?? null,
      });
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
          Padel Quick-Start
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          New match
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Pick a court, set the rules, load four players — then go live. No lobby
          wait.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Venue</h2>
        <VenuePicker venues={venues} selected={venue} onSelect={setVenue} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Rules</h2>
        <RulesToggle value={ruleset} onChange={setRuleset} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Pairings</h2>
          <button
            type="button"
            onClick={fillDemoGuests}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            Quick-fill guests
          </button>
        </div>
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
