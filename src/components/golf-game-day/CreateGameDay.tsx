"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createGameDay, GameDayApiError } from "@/lib/golf-game-day/api";
import {
  defaultGameDayDate,
  formatGameDayDate,
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
  const [adding, setAdding] = useState(false);
  const [weekend, setWeekend] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useGameDayAction("Sign in", "/login");

  const dateLabel = formatGameDayDate(date);
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
    setAdding(false);
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
        ...(weekend.trim() ? { weekendEvent: { name: weekend.trim() } } : {}),
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
        <Eyebrow>New game day</Eyebrow>
        <ScreenTitle>New game day</ScreenTitle>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          One course, a few cards, live for everyone who joins.
        </p>

        <label className="mt-8 block">
          <FieldLabel>Venue</FieldLabel>
          <select
            value={venue?.slug ?? ""}
            onChange={(event) => selectVenue(event.target.value)}
            className={textFieldClass()}
          >
            {venues.length === 0 ? <option value="">No scorecard published</option> : null}
            {venues.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

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
            <FieldLabel>Default tee</FieldLabel>
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

        <fieldset className="mt-8">
          <legend>
            <FieldLabel>Players — add names (optional)</FieldLabel>
          </legend>
          <ul className="mt-3">
            {players.map((name, index) => (
              <li
                key={`${name}-${index}`}
                className="flex items-center justify-between border-b border-zinc-200 py-3 text-base"
              >
                <span>{name}</span>
                <button
                  type="button"
                  className="text-sm text-zinc-500"
                  onClick={() => setPlayers((current) => current.filter((_, item) => item !== index))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {adding ? (
            <div className="mt-3 flex gap-2">
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Name"
                aria-label="Player name"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base"
              />
              <button
                type="button"
                onClick={addName}
                className="shrink-0 rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-3 text-sm font-semibold text-zinc-950"
            >
              + Add a name
            </button>
          )}
        </fieldset>

        <label className="mt-6 block">
          <FieldLabel>Weekend name (optional)</FieldLabel>
          <input
            value={weekend}
            onChange={(event) => setWeekend(event.target.value)}
            placeholder="Zebula weekend"
            className={textFieldClass()}
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
        <p className="mt-4 text-center text-xs text-zinc-500">
          Scramble is coming later. This day is stroke play.
        </p>
      </form>
    </GameDayColumn>
  );
}

