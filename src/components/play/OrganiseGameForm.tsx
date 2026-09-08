"use client";

import { VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import type { Friend } from "@/lib/friends/friends";
import {
  buildCreateOrganisedGamePayload,
  createOrganisedGame,
  ORGANISED_GAME_CAPACITY_DEFAULT,
  ORGANISED_GAME_CAPACITY_MAX,
  ORGANISED_GAME_CAPACITY_MIN,
  ORGANISED_GAME_NOTES_MAX,
  type OrganisedGameSport,
} from "@/lib/organised-games/organised-games";
import { datetimeLocalToIso, toDatetimeLocalValue } from "@/lib/padel/api-match";
import { findVenueBySlug } from "@/lib/padel/quick-start-defaults";
import type { VenueOption } from "@/lib/padel/venue-options";
import { hubOrganisedGameHref } from "@/lib/sports/hub-ia";
import { Clock, Loader2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type OrganiseGameFormProps = {
  sport: OrganisedGameSport;
  venues: VenueOption[];
  friends: Friend[];
  initialVenueSlug?: string | null;
  lockVenue?: boolean;
};

function defaultStartsAtLocal(): string {
  const next = new Date();
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return toDatetimeLocalValue(next);
}

function FriendAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
      <img
        src={avatarUrl}
        alt=""
        className="h-9 w-9 rounded-full border border-white/10 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-sm text-emerald-300"
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function OrganiseGameForm({
  sport,
  venues,
  friends,
  initialVenueSlug,
  lockVenue = false,
}: OrganiseGameFormProps) {
  const router = useRouter();
  const { isAuthenticated, promptSoftWall } = useAuth();
  const [venue, setVenue] = useState<VenueOption | null>(() =>
    findVenueBySlug(venues, initialVenueSlug),
  );
  const [startsAtLocal, setStartsAtLocal] = useState(defaultStartsAtLocal);
  const [notes, setNotes] = useState("");
  const [capacity, setCapacity] = useState(ORGANISED_GAME_CAPACITY_DEFAULT);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const venueNoun = sport === "golf" ? "course" : "court";
  const sportLabel = sport === "golf" ? "golf" : "padel";
  const startsAtIso = datetimeLocalToIso(startsAtLocal);
  const ready = Boolean(venue) && Boolean(startsAtIso) && !saving;

  const selectedSet = useMemo(
    () => new Set(selectedFriendIds),
    [selectedFriendIds],
  );

  function toggleFriend(id: string) {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function handleCreate() {
    if (!isAuthenticated) {
      promptSoftWall({
        reason: "organise",
        returnTo: sport === "golf" ? "/golf/organise" : "/padel/organise",
        pageType: "organise",
      });
      return;
    }
    if (!venue) {
      setError(`Pick a ${venueNoun} to organise`);
      return;
    }
    if (!startsAtIso) {
      setError("Set when the game starts");
      return;
    }

    const built = buildCreateOrganisedGamePayload({
      sport,
      venueCmsId: venue.id,
      startsAt: startsAtIso,
      notes,
      capacity,
      inviteUserIds: selectedFriendIds,
    });
    if (!built.ok) {
      setError(built.error);
      return;
    }

    setError(null);
    setSaving(true);
    const result = await createOrganisedGame(built.payload);
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    router.push(hubOrganisedGameHref(result.value.id));
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Organise {sportLabel}
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Set venue and time
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Invite friends now or share a link after you create. Start the live
          scorecard when everyone is ready.
        </p>
      </header>

      {!isAuthenticated ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Sign in to organise a game.{" "}
          <button
            type="button"
            onClick={() =>
              promptSoftWall({
                reason: "organise",
                returnTo: sport === "golf" ? "/golf/organise" : "/padel/organise",
                pageType: "organise",
              })
            }
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            Save to your account
          </button>
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">
          {sport === "golf" ? "Golf course" : "Padel court"}
        </h2>
        {lockVenue && venue ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{venue.name}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {[venue.suburb, venue.city].filter(Boolean).join(" · ") ||
                  `Selected ${venueNoun}`}
              </p>
            </div>
            <Link
              href={sport === "golf" ? "/golf/organise" : "/padel/organise"}
              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Choose a different {venueNoun}
            </Link>
          </div>
        ) : venues.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
            No {sportLabel} venues in the directory yet. A {venueNoun} is
            required to organise.
          </p>
        ) : (
          <VenuePicker
            venues={venues}
            selected={venue}
            onSelect={setVenue}
            searchPlaceholder={
              sport === "golf"
                ? "Search golf courses…"
                : "Search padel courts…"
            }
          />
        )}
      </section>

      <section className="min-w-0 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Starts at</h2>
        <label className="relative block w-full min-w-0 max-w-full overflow-hidden">
          <span className="sr-only">Game starts at</span>
          <Clock
            className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="datetime-local"
            value={startsAtLocal}
            onChange={(event) => setStartsAtLocal(event.target.value)}
            required
            className="box-border min-h-12 w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white outline-none [color-scheme:dark] focus:border-emerald-400/40 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-datetime-edit]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0"
          />
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Notes</h2>
          <p className="text-xs text-zinc-500 tabular-nums">
            {notes.length}/{ORGANISED_GAME_NOTES_MAX}
          </p>
        </div>
        <textarea
          value={notes}
          maxLength={ORGANISED_GAME_NOTES_MAX}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Optional — Sunday hit, bring balls…"
          className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Capacity</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease capacity"
            disabled={capacity <= ORGANISED_GAME_CAPACITY_MIN}
            onClick={() =>
              setCapacity((value) =>
                Math.max(ORGANISED_GAME_CAPACITY_MIN, value - 1),
              )
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <p className="min-w-10 text-center font-display text-2xl tracking-wide text-white tabular-nums">
            {capacity}
          </p>
          <button
            type="button"
            aria-label="Increase capacity"
            disabled={capacity >= ORGANISED_GAME_CAPACITY_MAX}
            onClick={() =>
              setCapacity((value) =>
                Math.min(ORGANISED_GAME_CAPACITY_MAX, value + 1),
              )
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
          <p className="text-sm text-zinc-500">Includes you. 2–8 players.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Invite friends</h2>
        {friends.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
            No accepted friends yet. You can still share a link after creating.
          </p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-y-auto overscroll-contain">
            {friends.map((friend) => {
              const selected = selectedSet.has(friend.id);
              return (
                <li key={friend.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleFriend(friend.id)}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-emerald-400/50 bg-emerald-400/10"
                        : "border-white/8 bg-[#141814] hover:border-white/16",
                    ].join(" ")}
                  >
                    <FriendAvatar
                      name={friend.displayName}
                      avatarUrl={friend.avatarUrl}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {friend.displayName}
                      </span>
                      {friend.handle ? (
                        <span className="block truncate text-xs text-zinc-500">
                          @{friend.handle}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={[
                        "text-xs font-medium",
                        selected ? "text-emerald-300" : "text-zinc-600",
                      ].join(" ")}
                    >
                      {selected ? "Invited" : "Invite"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {error ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!ready}
        onClick={() => void handleCreate()}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Creating…
          </>
        ) : (
          "Create game"
        )}
      </button>
    </div>
  );
}
