"use client";

import { Clock, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics/track";
import {
  createDartsMatch,
  datetimeLocalToIso,
  toDatetimeLocalValue,
} from "@/lib/darts/api-match";
import { normalizePlayerCount } from "@/lib/darts/rules";
import {
  toDartsMatchVenue,
  type DartsVenueOption,
} from "@/lib/darts/venue-options";
import { consumeQuickStartPlayerSeed } from "@/lib/play/quick-start";
import type { DartsPlayer, DartsPlayerSlot } from "@/types/darts-match";
import {
  DARTS_MAX_PLAYERS,
  DARTS_MIN_PLAYERS,
} from "@/types/darts-match";

type DartsQuickStartProps = {
  venues: DartsVenueOption[];
  initialVenueSlug?: string | null;
  lockVenue?: boolean;
};

const EMPTY_NAMES = Array.from({ length: DARTS_MAX_PLAYERS }, () => "");
const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7, 8] as const;

function findVenueBySlug(
  venues: DartsVenueOption[],
  slug: string | null | undefined,
): DartsVenueOption | null {
  const key = slug?.trim().toLowerCase();
  if (!key) return null;
  return venues.find((venue) => venue.slug.toLowerCase() === key) ?? null;
}

function makeGuest(name: string, slot: DartsPlayerSlot): DartsPlayer {
  const trimmed = name.trim() || `Player ${slot}`;
  return {
    slot,
    displayName: trimmed,
    isGuest: true,
    userId: null,
    remaining: 501,
  };
}

export function DartsQuickStart({
  venues,
  initialVenueSlug,
  lockVenue = false,
}: DartsQuickStartProps) {
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const [venue, setVenue] = useState<DartsVenueOption | null>(() =>
    findVenueBySlug(venues, initialVenueSlug),
  );
  const [startsAtLocal, setStartsAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date()),
  );
  const [playerCount, setPlayerCount] = useState(DARTS_MIN_PLAYERS);
  const [names, setNames] = useState<string[]>(() => [...EMPTY_NAMES]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const companions = consumeQuickStartPlayerSeed("darts", initialVenueSlug);
    if (companions.length === 0) return;
    const companionNames = companions.map((player) => player.displayName);
    setPlayerCount(
      Math.min(
        DARTS_MAX_PLAYERS,
        Math.max(DARTS_MIN_PLAYERS, 1 + companionNames.length),
      ),
    );
    setNames((prev) => {
      const next = [...prev];
      companionNames.forEach((name, index) => {
        next[index + 1] = name;
      });
      return next;
    });
  }, [initialVenueSlug]);

  const selfName = useMemo(() => {
    if (isAuthenticated && user?.id) {
      return displayName?.trim() || "You";
    }
    return "";
  }, [isAuthenticated, user, displayName]);

  const resolvedNames = useMemo(() => {
    if (!selfName || names[0]?.trim()) return names;
    return [selfName, ...names.slice(1)];
  }, [names, selfName]);

  const startsAtIso = datetimeLocalToIso(startsAtLocal);
  const activeNames = resolvedNames.slice(0, playerCount);
  const namesReady = activeNames.every((name) => name.trim().length > 0);
  const ready = Boolean(startsAtIso) && namesReady && !starting && !isPending;

  function setNameAt(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleStart() {
    if (!startsAtIso) {
      setError("Set a start time");
      return;
    }
    if (!namesReady) {
      setError("Enter a name for each player");
      return;
    }

    setError(null);
    setStarting(true);

    const players: DartsPlayer[] = activeNames.map((name, index) => {
      const slot = (index + 1) as DartsPlayerSlot;
      const trimmed = name.trim();
      if (
        index === 0 &&
        isAuthenticated &&
        user?.id &&
        (trimmed === selfName || !names[0]?.trim())
      ) {
        return {
          slot,
          displayName: trimmed || selfName,
          isGuest: false,
          userId: user.id,
          remaining: 501,
        };
      }
      return makeGuest(trimmed, slot);
    });

    try {
      const match = await createDartsMatch(
        {
          venueCmsId: venue?.id ?? null,
          startsAt: startsAtIso,
          players,
        },
        venue ? toDartsMatchVenue(venue) : null,
      );
      track("game_start", { page_type: "scorecard", sport: "darts" });
      startTransition(() => {
        router.push(`/darts/${match.id}`);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start game");
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          New darts game
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          501 double-out
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Single leg. Enter visit totals. Venue is optional — home and pub
          games work without one.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Venue</h2>
        {lockVenue && venue ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{venue.name}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {[venue.suburb, venue.city].filter(Boolean).join(" · ") ||
                  "Selected venue"}
              </p>
            </div>
            <Link
              href="/darts/new"
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Choose a different venue
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setVenue(null)}
                className={[
                  "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium",
                  venue
                    ? "border border-white/12 bg-white/5 text-zinc-300 hover:bg-white/10"
                    : "bg-emerald-400 text-zinc-950",
                ].join(" ")}
              >
                Home / no venue
              </button>
            </div>
            {venues.length > 0 ? (
              <VenuePicker
                venues={venues}
                selected={venue}
                onSelect={(option) =>
                  setVenue(option as DartsVenueOption | null)
                }
                searchPlaceholder="Search darts venues…"
              />
            ) : (
              <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
                No tagged darts venues yet. You can still start a home game.
              </p>
            )}
          </>
        )}
      </section>

      <section className="min-w-0 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Start time</h2>
        <label className="relative block w-full min-w-0 max-w-full overflow-hidden">
          <span className="sr-only">Game start time</span>
          <Clock
            className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="datetime-local"
            value={startsAtLocal}
            onChange={(e) => setStartsAtLocal(e.target.value)}
            required
            className="box-border min-h-12 w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-datetime-edit]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0"
          />
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Players</h2>
          <div className="flex flex-wrap justify-end gap-1">
            {PLAYER_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setPlayerCount(normalizePlayerCount(count))}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  playerCount === count
                    ? "bg-emerald-400 text-zinc-950"
                    : "border border-white/12 bg-white/5 text-zinc-300 hover:bg-white/10",
                ].join(" ")}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          2–8 players. Guests need a display name only.
          {selfName
            ? " You are seated in slot 1 until you change the name."
            : null}
        </p>
        <div className="space-y-2">
          {Array.from({ length: playerCount }, (_, index) => (
            <label key={index} className="block">
              <span className="mb-1 block text-xs text-zinc-500">
                Player {index + 1}
              </span>
              <input
                type="text"
                value={resolvedNames[index] ?? ""}
                onChange={(e) => setNameAt(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
              />
            </label>
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
        onClick={() => void handleStart()}
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
            Start game
          </>
        )}
      </button>
    </div>
  );
}
