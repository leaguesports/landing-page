"use client";

import { Clock, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { datetimeLocalToIso, toDatetimeLocalValue } from "@/lib/darts/api-match";
import { captureDartsMatch, playersFromNames } from "@/lib/darts/capture";
import { track } from "@/lib/analytics/track";
import {
  evaluateVisit,
  emptyReplayState,
  normalizePlayerCount,
  replayTurns,
  shouldOfferCheckout,
} from "@/lib/darts/rules";
import {
  toDartsMatchVenue,
  type DartsVenueOption,
} from "@/lib/darts/venue-options";
import { formatCaptureThrownError } from "@/lib/play/capture-error";
import type {
  CaptureDartsTurnInput,
  DartsPlayerSlot,
} from "@/types/darts-match";
import {
  DARTS_MAX_PLAYERS,
  DARTS_MAX_TURN_SCORE,
  DARTS_MIN_PLAYERS,
  DARTS_STARTING_SCORE,
} from "@/types/darts-match";

type DartsCaptureFormProps = {
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

export function DartsCaptureForm({
  venues,
  initialVenueSlug,
  lockVenue = false,
}: DartsCaptureFormProps) {
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const [venue, setVenue] = useState<DartsVenueOption | null>(() =>
    findVenueBySlug(venues, initialVenueSlug),
  );
  const [playedAtLocal, setPlayedAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date()),
  );
  const [playerCount, setPlayerCount] = useState(DARTS_MIN_PLAYERS);
  const [names, setNames] = useState<string[]>(() => [...EMPTY_NAMES]);
  const [turns, setTurns] = useState<CaptureDartsTurnInput[]>([]);
  const [draftSlot, setDraftSlot] = useState<DartsPlayerSlot>(1);
  const [draftScore, setDraftScore] = useState("");
  const [draftCheckout, setDraftCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

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

  const playedAtIso = datetimeLocalToIso(playedAtLocal);
  const activeNames = resolvedNames.slice(0, playerCount);
  const namesReady = activeNames.every((name) => name.trim().length > 0);
  const players = playersFromNames(
    activeNames,
    isAuthenticated && user?.id
      ? { userId: user.id, displayName: selfName }
      : null,
  );
  const replay = replayTurns(players, turns);
  const remainings = replay.ok
    ? replay.state.remaining
    : emptyReplayState(players.map((player) => player.slot)).remaining;
  const winnerSlot = replay.ok ? replay.state.winnerSlot : null;
  const draftRemaining = remainings[draftSlot] ?? DARTS_STARTING_SCORE;
  const draftScoreNum = Number.parseInt(draftScore, 10);
  const draftVisit = Number.isNaN(draftScoreNum)
    ? null
    : evaluateVisit(draftRemaining, draftScoreNum);
  const offerCheckout = shouldOfferCheckout(draftRemaining, draftScoreNum);

  const ready =
    Boolean(playedAtIso) &&
    namesReady &&
    Boolean(winnerSlot) &&
    !saving &&
    !isPending;

  function setNameAt(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handlePlayerCount(count: number) {
    const next = normalizePlayerCount(count);
    setPlayerCount(next);
    setTurns((prev) => prev.filter((turn) => turn.playerSlot <= next));
    if (draftSlot > next) setDraftSlot(1);
  }

  function addTurn() {
    if (winnerSlot) {
      setError("Game already finished — remove the checkout to add more visits");
      return;
    }
    if (!draftVisit || draftVisit.kind === "invalid") {
      setError(
        draftVisit?.message ??
          `Visit score must be 0–${DARTS_MAX_TURN_SCORE}`,
      );
      return;
    }
    if (draftVisit.kind === "illegal_finish") {
      setError(draftVisit.message ?? "Not a legal double-out checkout");
      return;
    }
    if (draftVisit.kind === "finish" && !draftCheckout) {
      setError("Tick checkout to finish on a double-out");
      return;
    }
    setError(null);
    setTurns((prev) => [
      ...prev,
      {
        playerSlot: draftSlot,
        score: draftScoreNum,
        ...(draftVisit.kind === "finish" && draftCheckout
          ? { checkout: true }
          : {}),
      },
    ]);
    setDraftScore("");
    setDraftCheckout(false);
    const nextHint = ((draftSlot % playerCount) + 1) as DartsPlayerSlot;
    setDraftSlot(nextHint);
  }

  async function handleCapture() {
    if (!isAuthenticated || !user?.id) {
      window.location.href = getLoginPageHref(
        relativeAuthReturnTo() || "/darts/capture",
      );
      return;
    }
    if (!playedAtIso) {
      setError("Set when the game was played");
      return;
    }
    if (!namesReady) {
      setError("Enter a name for each player");
      return;
    }
    if (!winnerSlot) {
      setError("Add visits until someone checks out");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const match = await captureDartsMatch(
        {
          venueCmsId: venue?.id ?? null,
          playedAt: playedAtIso,
          players,
          turns,
        },
        venue ? toDartsMatchVenue(venue) : null,
      );
      track("game_lock", { page_type: "scorecard", sport: "darts" });
      startTransition(() => {
        router.push(`/darts/${match.id}`);
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
          Capture darts result
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Finished 501
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Replay the visit log, including the finishing checkout. No live
          scorecard — this locks immediately.
        </p>
      </header>

      {!isAuthenticated ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Sign in so we can seat you as a named player.{" "}
          <Link
            href={getLoginPageHref("/darts/capture")}
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            Sign in
          </Link>
        </p>
      ) : null}

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
              href="/darts/capture"
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Choose a different venue
            </Link>
          </div>
        ) : (
          <>
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
            {venues.length > 0 ? (
              <VenuePicker
                venues={venues}
                selected={venue}
                onSelect={(option) =>
                  setVenue(option as DartsVenueOption | null)
                }
                searchPlaceholder="Search darts venues…"
              />
            ) : null}
          </>
        )}
      </section>

      <section className="min-w-0 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Played at</h2>
        <label className="relative block w-full min-w-0 max-w-full overflow-hidden">
          <span className="sr-only">Game played at</span>
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
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Players</h2>
          <div className="flex flex-wrap justify-end gap-1">
            {PLAYER_COUNTS.map((count) => (
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
          2–8 players. You must be a named player in the group.
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Remaining</h2>
        <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-[#141814]">
          {players.map((player) => (
            <li
              key={player.slot}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="truncate text-sm text-zinc-300">
                {player.displayName}
                {winnerSlot === player.slot ? (
                  <span className="ml-2 text-xs text-emerald-300">Winner</span>
                ) : null}
              </span>
              <span className="font-display text-2xl tabular-nums text-white">
                {remainings[player.slot] ?? DARTS_STARTING_SCORE}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Visit log</h2>
        {turns.length > 0 ? (
          <ol className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-[#141814]">
            {turns.map((turn, index) => {
              const player = players.find((p) => p.slot === turn.playerSlot);
              return (
                <li
                  key={`${turn.playerSlot}-${index}`}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">
                      {player?.displayName ?? `Slot ${turn.playerSlot}`}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {turn.checkout
                        ? "Checkout"
                        : `Visit ${index + 1}`}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums text-white">
                    {turn.score}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm text-zinc-500">
            Add each visit total. Busts stay in the log; remaining does not
            change.
          </p>
        )}

        {!winnerSlot ? (
          <div className="space-y-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-500">Thrower</span>
                <select
                  value={draftSlot}
                  onChange={(e) =>
                    setDraftSlot(Number(e.target.value) as DartsPlayerSlot)
                  }
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-emerald-400/40"
                >
                  {players.map((player) => (
                    <option key={player.slot} value={player.slot}>
                      {player.displayName} · {remainings[player.slot]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-500">Score</span>
                <input
                  type="number"
                  min={0}
                  max={DARTS_MAX_TURN_SCORE}
                  value={draftScore}
                  onChange={(e) => {
                    setDraftScore(e.target.value);
                    setDraftCheckout(false);
                  }}
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-center text-sm text-white outline-none focus:border-emerald-400/40"
                />
              </label>
            </div>
            {draftVisit?.kind === "bust" ? (
              <p className="text-sm text-amber-200">{draftVisit.message}</p>
            ) : null}
            {offerCheckout ? (
              <label className="flex items-center gap-3 text-sm text-emerald-200">
                <input
                  type="checkbox"
                  checked={draftCheckout}
                  onChange={(e) => setDraftCheckout(e.target.checked)}
                  className="h-4 w-4 accent-emerald-400"
                />
                Double-out checkout
              </label>
            ) : null}
            <button
              type="button"
              onClick={addTurn}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add visit
            </button>
          </div>
        ) : null}

        {turns.length > 0 ? (
          <button
            type="button"
            onClick={() => setTurns((prev) => prev.slice(0, -1))}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove last visit
          </button>
        ) : null}
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
