"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
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
  ChoiceChip,
  Eyebrow,
  FieldLabel,
  GameDayColumn,
  PrimaryButton,
  ScreenTitle,
  teeDotClass,
  textFieldClass,
} from "./ui";

function LinkBack() {
  return (
    <Link href="/play/golf" className="mb-4 inline-flex text-sm font-semibold text-zinc-950">
      ‹ Golf
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
    <GameDayColumn>
      <form onSubmit={onSubmit}>
        <LinkBack />
        <Eyebrow>New game day</Eyebrow>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Pick the course and day. You&apos;ll get a link for the group.
        </p>

        <div className="mt-8">
          <FieldLabel>Course</FieldLabel>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-zinc-300 px-4 py-3">
            <span>
              <span className="block font-semibold text-zinc-950">{venue?.name ?? "Choose a course"}</span>
              <span className="mt-0.5 block text-sm text-zinc-500">Bela-Bela · Limpopo</span>
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
          <FieldLabel>Date</FieldLabel>
          <span className={`${textFieldClass()} flex min-h-12 items-center`}>{dateLabel}</span>
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
            }}
            aria-label="Date"
            className="absolute inset-0 mt-6 opacity-0"
          />
        </label>

        <fieldset className="mt-6">
          <legend>
            <FieldLabel>Tee default for everyone</FieldLabel>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {teeNames.map((item) => (
              <ChoiceChip
                key={item.name}
                selected={item.name === tee}
                onClick={() => setTee(item.name)}
              >
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${teeDotClass(item.color || item.name)}`} />
                {teeChipLabel(item)}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend>
            <FieldLabel>Format</FieldLabel>
          </legend>
          <div className="mt-3 rounded-2xl border border-zinc-950 px-4 py-3">
            <p className="font-semibold text-zinc-950">Stroke play</p>
            <p className="mt-1 text-sm text-zinc-500">Gross, net or Stableford on the board.</p>
          </div>
          <div className="mt-2 rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-400">
            <p className="flex items-center gap-2 font-semibold">
              Scramble
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                Coming later
              </span>
            </p>
            <p className="mt-1 text-sm">Team format</p>
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend>
            <FieldLabel>Players (new) optional · they tap their name to join</FieldLabel>
          </legend>
          <ul className="mt-3 flex flex-wrap gap-2">
            {players.map((name, index) => (
              <li
                key={`${name}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-sm"
              >
                <span>{name}</span>
                {index === 0 ? (
                  <span className="text-xs font-semibold uppercase text-zinc-500">you</span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    className="text-zinc-500"
                    onClick={() => setPlayers((current) => current.filter((_, item) => item !== index))}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Add a name"
              aria-label="Player name"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base"
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
              className="shrink-0 rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold"
            >
              Add
            </button>
          </div>
        </fieldset>

        <label className="mt-6 flex items-start justify-between gap-3 rounded-2xl border border-zinc-300 px-4 py-4">
          <span>
            <span className="block text-sm font-semibold text-zinc-950">Add to weekend event</span>
            <span className="mt-1 block text-sm text-zinc-500">Optional. Combine leaderboards across days.</span>
          </span>
          <input
            type="checkbox"
            checked={weekend}
            onChange={(event) => setWeekend(event.target.checked)}
            className="mt-1 h-5 w-5"
          />
        </label>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={pending || !venue}>
            {pending ? "Creating…" : "Create game day"}
          </PrimaryButton>
        </div>
      </form>
    </GameDayColumn>
  );
}

