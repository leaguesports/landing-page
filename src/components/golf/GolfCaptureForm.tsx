"use client";

import { Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { datetimeLocalToIso, toDatetimeLocalValue } from "@/lib/golf/api-round";
import {
  captureGolfRound,
  playersFromNames,
} from "@/lib/golf/capture";
import { courseParTotal, toCourseSnapshot } from "@/lib/golf/course";
import { teeRatingsFromCms } from "@/lib/golf/handicap";
import { isGolfStartReady } from "@/lib/golf/pre-round";
import { withRoundHandicapOverride } from "@/lib/golf/profile";
import { track } from "@/lib/analytics/track";
import {
  clampStrokes,
  formatToPar,
  runningTotals,
} from "@/lib/golf/scoring";
import {
  isGolfVenue,
  toGolfRoundVenue,
  type GolfVenueOption,
} from "@/lib/golf/venue-options";
import { formatCaptureThrownError } from "@/lib/play/capture-error";
import type {
  GolfHolesPlayed,
  GolfLiveStrokes,
  GolfPlayerSlot,
} from "@/types/golf-round";
import { GolfPreRoundHandicap } from "./GolfPreRoundHandicap";
import { GolfPreRoundSetup } from "./GolfPreRoundSetup";

type GolfCaptureFormProps = {
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

function seedStrokes(
  holes: Array<{ number: number; par: number }>,
  playerCount: number,
  previous: GolfLiveStrokes,
): GolfLiveStrokes {
  const next: GolfLiveStrokes = {};
  for (const hole of holes) {
    const existing = previous[hole.number] ?? {};
    const strokes: Record<string, number> = {};
    for (let slot = 1; slot <= playerCount; slot++) {
      const key = String(slot);
      strokes[key] = existing[key] ?? clampStrokes(hole.par);
    }
    next[hole.number] = strokes;
  }
  return next;
}

export function GolfCaptureForm({
  venues,
  initialVenueSlug,
  lockVenue = false,
}: GolfCaptureFormProps) {
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const [venue, setVenue] = useState<GolfVenueOption | null>(() =>
    findVenueBySlug(venues, initialVenueSlug),
  );
  const [playedAtLocal, setPlayedAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date()),
  );
  const [holesPlayed, setHolesPlayed] = useState<GolfHolesPlayed>(18);
  const [startingHole, setStartingHole] = useState(1);
  const [teeName, setTeeName] = useState("");
  const [roundHi, setRoundHi] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [names, setNames] = useState<string[]>(["", "", "", ""]);
  const [strokes, setStrokes] = useState<GolfLiveStrokes>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const course = venue
    ? toCourseSnapshot(venue.golfCourse, holesPlayed, startingHole)
    : null;

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

  const teeRatings = useMemo(
    () =>
      teeRatingsFromCms(
        venue?.golfCourse,
        teeName,
        course ? courseParTotal(course.holes) : null,
      ),
    [venue, teeName, course],
  );

  const resolvedNames = useMemo(() => {
    if (!selfName || names[0]?.trim()) return names;
    return [selfName, names[1], names[2], names[3]];
  }, [names, selfName]);

  const playedAtIso = datetimeLocalToIso(playedAtLocal);
  const activeNames = resolvedNames.slice(0, playerCount);
  const namesReady = activeNames.every((name) => name.trim().length > 0);
  const players = playersFromNames(
    activeNames,
    isAuthenticated && user?.id
      ? { userId: user.id, displayName: selfName }
      : null,
  );
  const scored = useMemo(
    () =>
      course ? seedStrokes(course.holes, playerCount, strokes) : {},
    [course, playerCount, strokes],
  );
  const totals = useMemo(
    () => (course ? runningTotals(players, scored, course.holes) : []),
    [course, players, scored],
  );

  const preRoundReady = isGolfStartReady({
    teeName,
    startingHole,
    holesPlayed,
  });
  const ready =
    Boolean(venue) &&
    Boolean(course) &&
    Boolean(playedAtIso) &&
    namesReady &&
    preRoundReady &&
    !saving &&
    !isPending;

  function setNameAt(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function refreshStrokesFor(
    nextVenue: GolfVenueOption | null,
    nextHolesPlayed: GolfHolesPlayed,
    nextStartingHole: number,
    nextPlayerCount: number,
  ) {
    if (!nextVenue) return;
    const nextCourse = toCourseSnapshot(
      nextVenue.golfCourse,
      nextHolesPlayed,
      nextStartingHole,
    );
    if (nextCourse) {
      setStrokes((prev) =>
        seedStrokes(nextCourse.holes, nextPlayerCount, prev),
      );
    }
  }

  function handleVenueSelect(option: GolfVenueOption | null) {
    setVenue(option);
    setTeeName("");
    refreshStrokesFor(option, holesPlayed, startingHole, playerCount);
  }

  function handleHolesPlayed(next: GolfHolesPlayed) {
    setHolesPlayed(next);
    refreshStrokesFor(venue, next, startingHole, playerCount);
  }

  function handleStartingHole(next: number) {
    setStartingHole(next);
    refreshStrokesFor(venue, holesPlayed, next, playerCount);
  }

  function handlePlayerCount(count: number) {
    setPlayerCount(count);
    if (course) {
      setStrokes((prev) => seedStrokes(course.holes, count, prev));
    }
  }

  function setStroke(holeNumber: number, slot: GolfPlayerSlot, value: number) {
    setStrokes((prev) => ({
      ...prev,
      [holeNumber]: {
        ...(prev[holeNumber] ?? {}),
        [String(slot)]: clampStrokes(value),
      },
    }));
  }

  async function handleCapture() {
    if (!isAuthenticated || !user?.id) {
      window.location.href = getLoginPageHref(
        relativeAuthReturnTo() || "/golf/capture",
      );
      return;
    }
    if (!venue || !isGolfVenue(venue) || !course) {
      setError("Pick a golf course with a scorecard");
      return;
    }
    if (!playedAtIso) {
      setError("Set when the round was played");
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

    const seeded = seedStrokes(course.holes, playerCount, scored);
    setError(null);
    setSaving(true);

    const seatedSelf = Boolean(
      players[0] && !players[0].isGuest && players[0].userId,
    );

    try {
      const round = await withRoundHandicapOverride(
        profileHi,
        seatedSelf ? roundHi : profileHi,
        () =>
          captureGolfRound(
            {
              venueCmsId: venue.id,
              playedAt: playedAtIso,
              holesPlayed,
              startingHole,
              teeName: teeName.trim(),
              course,
              players,
              score: {
                holes: course.holes.map((hole) => ({
                  number: hole.number,
                  strokes: seeded[hole.number] ?? {},
                })),
              },
              ...teeRatings,
            },
            toGolfRoundVenue(venue)!,
          ),
      );
      track("game_lock", { page_type: "scorecard", sport: "golf" });
      startTransition(() => {
        router.push(`/golf/${round.id}`);
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
          Capture golf result
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Finished score
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Record a completed round. Set tee, starting hole, and holes played
          first. No live scorecard — this locks the result immediately.
        </p>
      </header>

      {!isAuthenticated ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Sign in so we can seat you as a named player.{" "}
          <Link
            href={getLoginPageHref("/golf/capture")}
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            Sign in
          </Link>
        </p>
      ) : null}

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
              href="/golf/capture"
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Choose a different course
            </Link>
          </div>
        ) : venues.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
            No golf courses with scorecard data yet. A course is required to
            capture.
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
        <h2 className="text-sm font-semibold text-zinc-200">Played at</h2>
        <label className="relative block w-full min-w-0 max-w-full overflow-hidden">
          <span className="sr-only">Round played at</span>
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

      <GolfPreRoundSetup
        golfCourse={venue?.golfCourse}
        teeName={teeName}
        onTeeNameChange={setTeeName}
        startingHole={startingHole}
        onStartingHoleChange={handleStartingHole}
        holesPlayed={holesPlayed}
        onHolesPlayedChange={handleHolesPlayed}
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
                onClick={() => handlePlayerCount(count)}
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
          1–4 players. You must be a named player in the group.
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

      {course ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-200">Hole scores</h2>
          <p className="text-xs text-zinc-500">
            Strokes default to par. Adjust every hole before saving.
          </p>
          <div className="overflow-x-auto rounded-3xl border border-white/8 bg-[#141814]">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs uppercase tracking-[0.12em] text-zinc-500">
                  <th className="px-3 py-3 font-medium">Hole</th>
                  <th className="px-3 py-3 font-medium">Par</th>
                  {players.map((player) => (
                    <th key={player.slot} className="px-3 py-3 font-medium">
                      {player.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {course.holes.map((hole) => (
                  <tr key={hole.number} className="border-b border-white/6">
                    <td className="px-3 py-2 tabular-nums text-white">
                      {hole.number}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-zinc-400">
                      {hole.par}
                    </td>
                    {players.map((player) => {
                      const value =
                        scored[hole.number]?.[String(player.slot)] ??
                        clampStrokes(hole.par);
                      return (
                        <td key={player.slot} className="px-2 py-2">
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={value}
                            aria-label={`Hole ${hole.number} strokes for ${player.displayName}`}
                            onChange={(e) =>
                              setStroke(
                                hole.number,
                                player.slot,
                                Number.parseInt(e.target.value, 10) || hole.par,
                              )
                            }
                            className="min-h-10 w-16 rounded-xl border border-white/10 bg-white/5 px-2 text-center text-sm text-white outline-none focus:border-emerald-400/40"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totals.length > 0 ? (
            <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-[#141814]">
              {totals.map((total) => (
                <li
                  key={total.slot}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="truncate text-sm text-zinc-300">
                    {total.displayName}
                  </span>
                  <span className="text-sm tabular-nums text-white">
                    {total.gross}
                    <span className="ml-2 text-zinc-500">
                      {formatToPar(total.toPar)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : venue ? (
        <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
          This course is missing hole data for that layout.
        </p>
      ) : null}

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
