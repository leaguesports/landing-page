"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, ChevronLeft, Link2, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createGameDay, GameDayApiError } from "@/lib/golf-game-day/api";
import {
  defaultGameDayDate,
  formatGameDayDateLong,
  localIsoDate,
  ZEBULA_VENUE_SLUG,
} from "@/lib/golf-game-day/paths";
import { preferredDefaultTee, teeChipLabel } from "@/lib/golf-game-day/scoring-ui";
import { useGameDayAction } from "./GameDayChrome";
import {
  Eyebrow,
  GameDayColumn,
  PrimaryButton,
  ScreenTitle,
  teeDotClass,
} from "./ui";

function LinkBack() {
  return (
    <Link href="/play/golf" className="inline-flex h-12 items-center gap-0.5 text-sm font-semibold text-zinc-950">
      <ChevronLeft className="h-4 w-4" aria-hidden />
      Golf
    </Link>
  );
}

export type GameDayVenueChoice = {
  id: string;
  slug: string;
  name: string;
  tees: Array<{ name: string; color: string | null }>;
};

type CreateGameDayProps = {
  venues: GameDayVenueChoice[];
  preview?: boolean;
  initialVenueSlug?: string;
  initialDate?: string;
  initialPlayers?: string[];
};

export function CreateGameDay({
  venues,
  preview = false,
  initialVenueSlug,
  initialDate,
  initialPlayers = [],
}: CreateGameDayProps) {
  const router = useRouter();
  const auth = useAuth();
  const today = localIsoDate();
  const startingSlug =
    initialVenueSlug ||
    venues.find((venue) => venue.slug === ZEBULA_VENUE_SLUG)?.slug ||
    venues[0]?.slug ||
    "";
  const [venueSlug, setVenueSlug] = useState(startingSlug);
  const venue = venues.find((item) => item.slug === venueSlug) ?? venues[0] ?? null;
  const [date, setDate] = useState(
    initialDate || defaultGameDayDate(venue?.slug ?? "", today),
  );
  const [tee, setTee] = useState(
    venue ? preferredDefaultTee(venue.tees) : "White",
  );
  const [players, setPlayers] = useState(initialPlayers);
  const [draftName, setDraftName] = useState("");
  const [weekend, setWeekend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useGameDayAction("Brandon", "/login", "account");

  const dateLabel = formatGameDayDateLong(date);
  const teeNames = useMemo(() => venue?.tees ?? [], [venue]);

  function selectVenue(slug: string) {
    setVenueSlug(slug);
    const next = venues.find((item) => item.slug === slug);
    if (!next) return;
    setTee(preferredDefaultTee(next.tees));
    if (!initialDate) setDate(defaultGameDayDate(next.slug, today));
  }

  function addName() {
    const name = draftName.trim();
    if (!name || players.length >= 16) return;
    setPlayers((current) => [...current, name]);
    setDraftName("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (preview) return;
    if (!auth.isAuthenticated) {
      auth.signIn("/golf/game-day/new");
      return;
    }
    if (!venue) {
      setError("Pick a course with a published scorecard.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const created = await createGameDay({
        venueCmsId: venue.id,
        date,
        defaultTee: tee,
        teeOptions: venue.tees.map((item) => item.name),
        format: "stroke",
        players: players.map((displayName) => ({ displayName, teeName: tee })),
        ...(weekend ? { weekendEvent: { name: `${venue.name} weekend` } } : {}),
      });
      router.push(`/golf/game-day/${created.id}`);
    } catch (cause) {
      setError(cause instanceof GameDayApiError ? cause.message : "Could not create the game day.");
      setPending(false);
    }
  }

  if (!preview && auth.isLoading) {
    return (
      <GameDayColumn>
        <p className="text-sm text-zinc-500">Loading…</p>
      </GameDayColumn>
    );
  }

  if (!preview && !auth.isAuthenticated) {
    return (
      <GameDayColumn>
        <ScreenTitle>New game day</ScreenTitle>
        <p className="mt-3 text-sm text-zinc-600">
          Sign in to start a game day. Players can join without an account.
        </p>
        <div className="mt-8">
          <PrimaryButton type="button" onClick={() => auth.signIn("/golf/game-day/new")}>
            Sign in
          </PrimaryButton>
        </div>
      </GameDayColumn>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col">
      <div className="px-5">
        <LinkBack />
      </div>
      <div className="border-t border-zinc-200" />
      <div className="flex-1 px-5 pb-6 pt-4">
        <Eyebrow>New game day</Eyebrow>
        <ScreenTitle>Set up game day</ScreenTitle>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">
          Pick the course and day. You&apos;ll get a link for the group.
        </p>

        <div className="mt-5">
          <p className="text-sm font-semibold text-zinc-950">Course</p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-zinc-950 px-4 py-3">
            <MapPin className="h-5 w-5 shrink-0 text-zinc-950" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-zinc-950">{venue?.name ?? "Choose a course"}</span>
              <span className="mt-0.5 block text-sm font-medium text-zinc-800">Bela-Bela · Limpopo</span>
            </span>
            <label className="shrink-0 text-sm font-semibold text-zinc-950">
              Change
              <select
                value={venue?.slug ?? ""}
                onChange={(event) => selectVenue(event.target.value)}
                aria-label="Course"
                className="sr-only"
              >
                {venues.length === 0 ? <option value="">No scorecard published</option> : null}
                {venues.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label className="relative mt-6 block">
          <span className="text-sm font-semibold text-zinc-950">Date</span>
          <span className="mt-2 flex min-h-14 items-center gap-3 rounded-2xl border border-zinc-300 bg-white px-4 text-base font-semibold text-zinc-950">
            <Calendar className="h-5 w-5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">{dateLabel}</span>
            <ChevronDown className="h-5 w-5 shrink-0" aria-hidden />
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
            }}
            aria-label="Date"
            className="absolute inset-0 mt-7 opacity-0"
          />
        </label>

        <fieldset className="mt-6">
          <legend className="flex w-full items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-zinc-950">Tee</span>
            <span className="text-sm text-zinc-500">default for everyone</span>
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {teeNames.map((item) => {
              const selected = item.name === tee;
              return (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTee(item.name)}
                  className={
                    selected
                      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-2 text-sm font-semibold text-white"
                      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-2 text-sm font-semibold text-zinc-950"
                  }
                >
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${teeDotClass(item.color || item.name)}`} />
                  {teeChipLabel(item)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-zinc-950">Format</legend>
          <div className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-zinc-950 px-4 py-3">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-zinc-950" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-950" />
            </span>
            <span>
              <span className="block font-semibold text-zinc-950">Stroke play</span>
              <span className="mt-1 block text-sm text-zinc-500">Gross, net or Stableford on the board.</span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-zinc-100 px-4 py-3 text-zinc-500">
            <span className="inline-flex h-5 w-5 shrink-0 rounded-full border-2 border-zinc-400" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Scramble</span>
              <span className="mt-0.5 block text-sm">Team format</span>
            </span>
            <span className="shrink-0 rounded-full border border-zinc-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Coming later
            </span>
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="flex w-full items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950">
              Players
              <span className="rounded-full bg-[#3dff8a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
                New
              </span>
            </span>
            <span className="text-right text-xs text-zinc-500">optional · they tap their name to join</span>
          </legend>
          <ul className="mt-3 flex flex-wrap gap-2">
            {players.map((name, index) => (
              <li
                key={`${name}-${index}`}
                className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 text-sm font-semibold text-zinc-950"
              >
                <span>{name}</span>
                {index === 0 ? (
                  <span className="text-xs font-semibold text-zinc-500">you</span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    className="inline-flex h-5 w-5 items-center justify-center text-zinc-950"
                    onClick={() => setPlayers((current) => current.filter((_, item) => item !== index))}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center rounded-2xl border border-zinc-300 bg-white pr-1.5">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Add a name"
              aria-label="Player name"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addName();
                }
              }}
            />
            <button
              type="button"
              onClick={addName}
              className="inline-flex h-11 min-w-[5.75rem] shrink-0 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white"
            >
              + Add
            </button>
          </div>
        </fieldset>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-zinc-300 px-4 py-4">
          <span className="inline-flex min-w-0 items-start gap-3">
            <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-zinc-950" aria-hidden />
            <span>
              <span className="block text-sm font-semibold text-zinc-950">Add to weekend event</span>
              <span className="mt-1 block text-sm text-zinc-800">Optional. Combine leaderboards across days.</span>
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={weekend}
            aria-label="Add to weekend event"
            onClick={() => setWeekend((current) => !current)}
            className={`relative h-7 w-12 shrink-0 rounded-full ${weekend ? "bg-zinc-950" : "bg-zinc-300"}`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${weekend ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

      </div>
      <div className="border-t border-zinc-200 px-5 py-3">
        <PrimaryButton type="submit" disabled={pending || !venue}>
          {pending ? "Creating…" : "Create game day"}
        </PrimaryButton>
      </div>
    </form>
  );
}

