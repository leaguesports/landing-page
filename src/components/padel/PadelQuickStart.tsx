"use client";

import { Clock, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
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
  buildDemoGuestSlots,
  playerFromInitialSelf,
  readLastPadelVenueSlug,
  resolveInitialQuickStartSlots,
  seatSelfInA1IfNeeded,
  selectDefaultPadelVenue,
  writeLastPadelVenueSlug,
  type QuickStartInitialSelf,
} from "@/lib/padel/quick-start-defaults";
import { makeUserPlayer, rememberPlayers } from "@/lib/padel/recent-players";
import {
  toMatchVenue,
  type VenueOption,
} from "@/lib/padel/venue-options";
import type { PadelPlayer, PadelRuleset } from "@/types/padel-match";

type PadelQuickStartProps = {
  venues: VenueOption[];
  initialVenueSlug?: string | null;
  lockVenue?: boolean;
  /** Server-seeded self so first paint seats A1 before client auth resolves. */
  initialSelf?: QuickStartInitialSelf | null;
};

export function PadelQuickStart({
  venues,
  initialVenueSlug,
  lockVenue = false,
  initialSelf = null,
}: PadelQuickStartProps) {
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const [ruleset, setRuleset] = useState<PadelRuleset>("golden_point");
  // First paint: locked slug or first court (SSR-safe). Last-used applied after mount.
  const [venue, setVenue] = useState<VenueOption | null>(() =>
    selectDefaultPadelVenue(venues, { initialVenueSlug }),
  );
  const [startsAtLocal, setStartsAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date()),
  );
  // Seed from server auth when present; otherwise four guests for one-tap.
  // Client useAuth still re-seats when auth resolves later / changes.
  const [slots, setSlots] = useState<Record<SlotKey, PadelPlayer | null>>(() =>
    resolveInitialQuickStartSlots(initialSelf),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [starting, setStarting] = useState(false);

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

  // Prefer live client auth; fall back to RSC seed until /api/auth/me resolves.
  const knownSelf = selfPlayer ?? seededSelfPlayer;

  useEffect(() => {
    if (lockVenue || initialVenueSlug) return;
    const lastUsed = selectDefaultPadelVenue(venues, {
      lastUsedSlug: readLastPadelVenueSlug(),
    });
    if (!lastUsed) return;
    setVenue((current) => {
      if (current?.slug.toLowerCase() === lastUsed.slug.toLowerCase()) {
        return current;
      }
      // Only upgrade from the SSR/first-court default — keep user picks.
      const first = venues[0];
      if (
        current &&
        first &&
        current.slug.toLowerCase() !== first.slug.toLowerCase()
      ) {
        return current;
      }
      return lastUsed;
    });
  }, [venues, lockVenue, initialVenueSlug]);

  useEffect(() => {
    if (!selfPlayer) return;
    setSlots((prev) => seatSelfInA1IfNeeded(prev, selfPlayer));
  }, [selfPlayer]);

  // Keep signed-in user in A1 when that slot is empty so history binds.
  const resolvedSlots = useMemo(() => {
    if (!knownSelf) return slots;
    const alreadySeated = Object.values(slots).some(
      (player) => player?.userId === knownSelf.userId,
    );
    if (alreadySeated || slots.a1) return slots;
    return { ...slots, a1: knownSelf };
  }, [slots, knownSelf]);

  const startsAtIso = datetimeLocalToIso(startsAtLocal);
  const ready =
    Boolean(venue) &&
    Boolean(startsAtIso) &&
    Boolean(
      resolvedSlots.a1 &&
        resolvedSlots.a2 &&
        resolvedSlots.b1 &&
        resolvedSlots.b2,
    ) &&
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

    // Use resolvedSlots only: fills empty A1 with known self, but never
    // overwrites an intentional A1 pick (seatSelfInA1IfNeeded would).
    if (
      !resolvedSlots.a1 ||
      !resolvedSlots.a2 ||
      !resolvedSlots.b1 ||
      !resolvedSlots.b2
    ) {
      setError("Pick all four players to start");
      return;
    }

    setError(null);
    setStarting(true);

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
      const match = await createPadelMatch(
        {
          venueCmsId: venue.id,
          startsAt: startsAtIso,
          ruleset,
          pairings,
          servingTeam: "A",
        },
        { venue: toMatchVenue(venue)! },
      );
      writeLastPadelVenueSlug(venue.slug);
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
    setSlots(buildDemoGuestSlots(knownSelf));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          New padel match
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          {lockVenue && venue ? "Time and players" : "Court, time, players"}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          {lockVenue && venue
            ? `Starting at ${venue.name}. Set the start time, load two pairs, then open the live scorecard.`
            : "A padel court is required. Set the start time, load two pairs, then open the live scorecard."}
        </p>
      </header>

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
              href="/padel/new"
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Choose a different court
            </Link>
          </div>
        ) : venues.length === 0 ? (
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
          {knownSelf
            ? " You are seated in Team A until you pick someone else."
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
