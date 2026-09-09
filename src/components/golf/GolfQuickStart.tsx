"use client";

import { Clock, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics/track";
import {
  createGolfRound,
  datetimeLocalToIso,
  toDatetimeLocalValue,
} from "@/lib/golf/api-round";
import { courseParTotal, toCourseSnapshot } from "@/lib/golf/course";
import { teeRatingsFromCms } from "@/lib/golf/handicap";
import { isGolfStartReady } from "@/lib/golf/pre-round";
import { withRoundHandicapOverride } from "@/lib/golf/profile";
import { cacheGolfRoundSnapshot } from "@/lib/golf/round-store";
import {
  isGolfVenue,
  toGolfRoundVenue,
  type GolfVenueOption,
} from "@/lib/golf/venue-options";
import { consumeQuickStartPlayerSeed } from "@/lib/play/quick-start";
import type {
  GolfHolesPlayed,
  GolfPlayer,
  GolfPlayerSlot,
} from "@/types/golf-round";
import { GolfPreRoundHandicap } from "./GolfPreRoundHandicap";
import { GolfPreRoundSetup } from "./GolfPreRoundSetup";

type GolfQuickStartProps = {
  venues: GolfVenueOption[];
  initialVenueSlug?: string | null;
  lockVenue?: boolean;
};

function findVenueBySlug(
  venues: GolfVenueOption[],
  slug: string | null | undefined,
): GolfVenueOption | null {
  const key = slug?.trim().toLowerCase();
  if (!key) return null;
  return venues.find((venue) => venue.slug.toLowerCase() === key) ?? null;
}

function makeGuest(name: string, slot: GolfPlayerSlot): GolfPlayer {
  const trimmed = name.trim() || `Player ${slot}`;
  return {
    slot,
    displayName: trimmed,
    isGuest: true,
    userId: null,
  };
}

export function GolfQuickStart({
  venues,
  initialVenueSlug,
  lockVenue = false,
}: GolfQuickStartProps) {
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const [venue, setVenue] = useState<GolfVenueOption | null>(() =>
    findVenueBySlug(venues, initialVenueSlug),
  );
  const [startsAtLocal, setStartsAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date()),
  );
  const [holesPlayed, setHolesPlayed] = useState<GolfHolesPlayed>(18);
  const [startingHole, setStartingHole] = useState(1);
  const [teeName, setTeeName] = useState("");
  const [roundHi, setRoundHi] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [names, setNames] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const companions = consumeQuickStartPlayerSeed("golf", initialVenueSlug);
    if (companions.length === 0) return;
    const companionNames = companions.map((player) => player.displayName);
    setPlayerCount(Math.min(4, 1 + companionNames.length));
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

  const profileHi = user?.golfHandicapIndex ?? null;

  useEffect(() => {
    setRoundHi(user?.golfHandicapIndex ?? null);
  }, [user?.golfHandicapIndex]);

  // Prefill slot 1 with signed-in user when empty.
  const resolvedNames = useMemo(() => {
    if (!selfName || names[0]?.trim()) return names;
    return [selfName, names[1], names[2], names[3]];
  }, [names, selfName]);

  const startsAtIso = datetimeLocalToIso(startsAtLocal);
  const activeNames = resolvedNames.slice(0, playerCount);
  const namesReady = activeNames.every((name) => name.trim().length > 0);
  const preRoundReady = isGolfStartReady({
    teeName,
    startingHole,
    holesPlayed,
  });
  const ready =
    Boolean(venue) &&
    Boolean(startsAtIso) &&
    namesReady &&
    preRoundReady &&
    !starting &&
    !isPending;

  const teeRatings = useMemo(() => {
    const holes = venue
      ? toCourseSnapshot(venue.golfCourse, holesPlayed, startingHole)?.holes
      : null;
    return teeRatingsFromCms(
      venue?.golfCourse,
      teeName,
      holes ? courseParTotal(holes) : null,
    );
  }, [venue, teeName, holesPlayed, startingHole]);

  function setNameAt(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleVenueSelect(option: GolfVenueOption | null) {
    setVenue(option);
    setTeeName("");
  }

  async function handleStart() {
    if (!venue || !isGolfVenue(venue)) {
      setError("Pick a golf course with a scorecard to start");
      return;
    }
    if (!startsAtIso) {
      setError("Set a start time");
      return;
    }
    if (!namesReady) {
      setError("Enter a name for each player");
      return;
    }
    if (!preRoundReady) {
      setError("Pick a tee, starting hole, and holes played");
      return;
    }

    const course = toCourseSnapshot(
      venue.golfCourse,
      holesPlayed,
      startingHole,
    );
    if (!course) {
      setError(
        holesPlayed === 9 && startingHole === 10
          ? "This course needs holes 10–18 for a back nine"
          : "This course is missing hole data for that layout",
      );
      return;
    }

    setError(null);
    setStarting(true);

    const players: GolfPlayer[] = activeNames.map((name, index) => {
      const slot = (index + 1) as GolfPlayerSlot;
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
        };
      }
      return makeGuest(trimmed, slot);
    });

    const seatedSelf = Boolean(
      players[0] && !players[0].isGuest && players[0].userId,
    );

    try {
      const round = await withRoundHandicapOverride(
        profileHi,
        seatedSelf ? roundHi : profileHi,
        () =>
          createGolfRound(
            {
              venueCmsId: venue.id,
              startsAt: startsAtIso,
              holesPlayed,
              startingHole,
              teeName: teeName.trim(),
              course,
              players,
              ...teeRatings,
            },
            toGolfRoundVenue(venue)!,
          ),
      );
      cacheGolfRoundSnapshot(round);
      track("game_start", { page_type: "scorecard", sport: "golf" });
      startTransition(() => {
        router.push(`/golf/${round.id}`);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start round");
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          New golf round
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          {lockVenue && venue ? "Tee and players" : "Course, tee, players"}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          {lockVenue && venue
            ? `Starting at ${venue.name}. Pick tee, starting hole, holes played, and 1–4 players, then open the scorecard.`
            : "A course with hole data is required. Pick tee, starting hole, holes played, and 1–4 players."}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Golf course</h2>
        {lockVenue && venue ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{venue.name}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {[venue.suburb, venue.city].filter(Boolean).join(" · ") ||
                  "Selected course"}
              </p>
            </div>
            <Link
              href="/golf/new"
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Choose a different course
            </Link>
          </div>
        ) : venues.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
            No golf courses with scorecard data yet. Add hole par and stroke
            index in Sanity to enable rounds.
          </p>
        ) : (
          <VenuePicker
            venues={venues}
            selected={venue}
            onSelect={(option) =>
              handleVenueSelect(option as GolfVenueOption | null)
            }
            searchPlaceholder="Search golf courses…"
          />
        )}
      </section>

      <section className="min-w-0 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Start time</h2>
        <label className="relative block w-full min-w-0 max-w-full overflow-hidden">
          <span className="sr-only">Round start time</span>
          <Clock
            className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="datetime-local"
            value={startsAtLocal}
            onChange={(e) => setStartsAtLocal(e.target.value)}
            required
            className="box-border min-h-12 w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-datetime-edit]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0"
          />
        </label>
      </section>

      <GolfPreRoundSetup
        golfCourse={venue?.golfCourse}
        teeName={teeName}
        onTeeNameChange={setTeeName}
        startingHole={startingHole}
        onStartingHoleChange={setStartingHole}
        holesPlayed={holesPlayed}
        onHolesPlayedChange={setHolesPlayed}
      />

      <GolfPreRoundHandicap
        profileHi={profileHi}
        signedIn={Boolean(isAuthenticated && user?.id)}
        ratings={teeRatings}
        roundHi={roundHi}
        onRoundHiChange={setRoundHi}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Players</h2>
          <div className="flex gap-1">
            {([1, 2, 3, 4] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setPlayerCount(count)}
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
          1–4 players. Guests need a display name only.
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

      {venue && !preRoundReady ? (
        <p className="text-center text-xs text-zinc-500">
          Pick a tee to enable Start.
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
            Start Round
          </>
        )}
      </button>
    </div>
  );
}
