"use client";

import { GolfPreRoundSetup } from "@/components/golf/GolfPreRoundSetup";
import { GolfTourLeaderboard } from "@/components/golf-tours/GolfTourLeaderboard";
import {
  GolfTourPlayerSlots,
  emptyGolfTourSlots,
  golfTourFieldClass,
  type GolfTourSlotDraft,
} from "@/components/golf-tours/GolfTourPlayerSlots";
import { VenuePicker } from "@/components/padel/VenuePicker";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import { toCourseSnapshot } from "@/lib/golf/course";
import { isGolfStartReady } from "@/lib/golf/pre-round";
import type { GolfVenueOption } from "@/lib/golf/venue-options";
import type { Friend } from "@/lib/friends/friends";
import {
  addGolfTourCamp,
  addGolfTourFourball,
  addGolfTourRound,
  canCompleteTour,
  canMutateTour,
  canStartFourball,
  campById,
  completeGolfTour,
  formatFourballStatus,
  formatGolfTourStatus,
  formatIsoDayLabel,
  formatTourDateRange,
  fourballStartNavigateHref,
  fourballsForRound,
  getGolfTourLeaderboard,
  golfTourHref,
  golfTourHostNextStep,
  golfTourHostNextStepCopy,
  nextCampPlaceholder,
  shouldShowHostRoundComposer,
  startGolfTourFourball,
  updateGolfTour,
  updateGolfTourCamp,
  updateGolfTourFourball,
  updateGolfTourRound,
  type GolfTourPlayerInput,
  type PublicGolfTour,
  type PublicGolfTourFourball,
  type PublicGolfTourLeaderboard,
  type PublicGolfTourRound,
} from "@/lib/golf-tours/golf-tours";
import type { GolfHolesPlayed, GolfPlayerSlot } from "@/types/golf-round";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type GolfTourHubProps = {
  tour: PublicGolfTour;
  venues: GolfVenueOption[];
  friends: Friend[];
  initialLeaderboard: PublicGolfTourLeaderboard | null;
};

function sendToLogin(id: string) {
  const returnTo =
    typeof window === "undefined"
      ? golfTourHref(id)
      : relativeAuthReturnTo() || golfTourHref(id);
  window.location.href = getLoginPageHref(returnTo);
}

function playersFromSlots(slots: GolfTourSlotDraft[]): GolfTourPlayerInput[] {
  return slots.flatMap((slot, index) => {
    const displayName = slot.displayName.trim();
    if (!displayName) return [];
    const userId = slot.userId?.trim() || null;
    return [
      {
        slot: (index + 1) as GolfPlayerSlot,
        displayName,
        isGuest: !userId,
        userId,
      },
    ];
  });
}

function slotsFromPlayers(
  players: PublicGolfTourFourball["players"],
): GolfTourSlotDraft[] {
  const next = emptyGolfTourSlots();
  for (const player of players) {
    const index = player.slot - 1;
    if (index < 0 || index > 3) continue;
    next[index] = {
      displayName: player.displayName,
      userId: player.userId,
    };
  }
  return next;
}

function venueForCmsId(
  venues: GolfVenueOption[],
  cmsId: string,
): GolfVenueOption | null {
  return venues.find((venue) => venue.id === cmsId) ?? null;
}

function campDraftMap(camps: PublicGolfTour["camps"]): Record<string, string> {
  return Object.fromEntries(camps.map((camp) => [camp.id, camp.name]));
}

export function GolfTourHub({
  tour,
  venues,
  friends,
  initialLeaderboard,
}: GolfTourHubProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, displayName } =
    useAuth();
  const [current, setCurrent] = useState(tour);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [name, setName] = useState(tour.name);
  const [startDate, setStartDate] = useState(tour.startDate);
  const [endDate, setEndDate] = useState(tour.endDate);
  const [campDrafts, setCampDrafts] = useState(() => campDraftMap(tour.camps));
  const [campName, setCampName] = useState("");
  const [roundDate, setRoundDate] = useState(tour.startDate);
  const [roundLabel, setRoundLabel] = useState("");
  const [roundVenue, setRoundVenue] = useState<GolfVenueOption | null>(null);
  const [addingRound, setAddingRound] = useState(tour.rounds.length === 0);
  const [addingFourballFor, setAddingFourballFor] = useState<string | null>(
    null,
  );
  const [fourballCampId, setFourballCampId] = useState(tour.camps[0]?.id ?? "");
  const [fourballSlots, setFourballSlots] = useState<GolfTourSlotDraft[]>(() =>
    emptyGolfTourSlots(),
  );
  const [editingFourballId, setEditingFourballId] = useState<string | null>(
    null,
  );
  const [startingFourballId, setStartingFourballId] = useState<string | null>(
    null,
  );
  const [teeName, setTeeName] = useState("");
  const [startingHole, setStartingHole] = useState(1);
  const [holesPlayed, setHolesPlayed] = useState<GolfHolesPlayed>(9);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const host = canMutateTour(current, user?.id);
  const nextStep = golfTourHostNextStep(current);
  const nextStepCopy = golfTourHostNextStepCopy(nextStep);
  const showRoundComposer = shouldShowHostRoundComposer(
    host,
    current.rounds.length,
    addingRound,
  );
  const campPlaceholder = nextCampPlaceholder(current.camps);
  const playerSeed = {
    displayName: displayName || user?.displayName || user?.name || "",
    userId: user?.id ?? null,
  };

  const sortedCamps = useMemo(
    () =>
      [...current.camps].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      ),
    [current.camps],
  );
  const sortedRounds = useMemo(
    () => [...current.rounds].sort((a, b) => a.date.localeCompare(b.date)),
    [current.rounds],
  );

  function apply(next: PublicGolfTour) {
    setCurrent(next);
    setName(next.name);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
    setCampDrafts(campDraftMap(next.camps));
    if (!fourballCampId && next.camps[0]) setFourballCampId(next.camps[0].id);
    router.refresh();
  }

  function handleAuthFailure(status: number) {
    if (status === 401) {
      sendToLogin(current.id);
      return true;
    }
    return false;
  }

  function runTourAction(
    work: () => Promise<
      | { ok: true; value: PublicGolfTour }
      | { ok: false; error: string; status: number }
    >,
    options?: { success?: string; onSuccess?: () => void },
  ) {
    setError(null);
    setMessage(null);
    startTransition(() => {
      void work().then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        apply(result.value);
        if (options?.success) setMessage(options.success);
        options?.onSuccess?.();
      });
    });
  }

  function refreshLeaderboard() {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    void getGolfTourLeaderboard(current.id).then((next) => {
      setLeaderboardLoading(false);
      if (!next) {
        setLeaderboardError("Could not refresh leaderboard");
        return;
      }
      setLeaderboard(next);
    });
  }

  function onSaveDetails() {
    if (!host) return;
    runTourAction(
      () =>
        updateGolfTour(current.id, {
          name,
          startDate,
          endDate,
        }),
      { success: "Tour updated." },
    );
  }

  function onComplete() {
    if (!canCompleteTour(current, user?.id)) return;
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            `Complete ${current.name}? Fourballs can still finish, but the tour can no longer be edited.`,
          );
    if (!confirmed) return;
    runTourAction(() => completeGolfTour(current.id), {
      success: "Tour completed.",
    });
  }

  function onAddCamp() {
    const nextName = campName.trim() || campPlaceholder;
    runTourAction(
      () => addGolfTourCamp(current.id, { name: nextName }),
      {
        success: "Camp added.",
        onSuccess: () => setCampName(""),
      },
    );
  }

  function onRenameCamp(campId: string) {
    const nextName = (campDrafts[campId] ?? "").trim();
    if (!nextName) {
      setError("Camp name is required");
      return;
    }
    const currentName = campById(current, campId)?.name;
    if (nextName === currentName) return;
    runTourAction(
      () => updateGolfTourCamp(current.id, campId, { name: nextName }),
      { success: "Camp updated." },
    );
  }

  function onAddRound() {
    if (!roundVenue) {
      setError("Pick a golf course");
      return;
    }
    runTourAction(
      () =>
        addGolfTourRound(current.id, {
          date: roundDate,
          venueCmsId: roundVenue.id,
          label: roundLabel || null,
          venue: { name: roundVenue.name, slug: roundVenue.slug },
        }),
      {
        success: "Round added. Add a fourball next.",
        onSuccess: () => {
          setAddingRound(false);
          setRoundLabel("");
          setRoundVenue(null);
        },
      },
    );
  }

  function openAddFourball(roundId: string) {
    const opening = addingFourballFor !== roundId;
    setAddingFourballFor(opening ? roundId : null);
    setEditingFourballId(null);
    setFourballCampId(current.camps[0]?.id ?? "");
    setFourballSlots(emptyGolfTourSlots(playerSeed));
  }

  function onAddFourball(roundId: string) {
    const players = playersFromSlots(fourballSlots);
    if (players.length < 1) {
      setError("Add at least one player to this fourball");
      return;
    }
    if (!fourballCampId) {
      setError("Pick a camp for this fourball");
      return;
    }
    runTourAction(
      () =>
        addGolfTourFourball(current.id, roundId, {
          campId: fourballCampId,
          players,
        }),
      {
        success: "Fourball added. Start it when the group is ready.",
        onSuccess: () => {
          setAddingFourballFor(null);
          setFourballSlots(emptyGolfTourSlots(playerSeed));
        },
      },
    );
  }

  function onSaveFourball(fourballId: string) {
    const players = playersFromSlots(fourballSlots);
    if (players.length < 1) {
      setError("Add at least one player to this fourball");
      return;
    }
    runTourAction(
      () =>
        updateGolfTourFourball(current.id, fourballId, {
          campId: fourballCampId,
          players,
        }),
      {
        success: "Fourball updated.",
        onSuccess: () => setEditingFourballId(null),
      },
    );
  }

  function onCancelFourball(fourballId: string) {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Cancel this fourball?");
    if (!confirmed) return;
    runTourAction(
      () =>
        updateGolfTourFourball(current.id, fourballId, { status: "cancelled" }),
      { success: "Fourball cancelled." },
    );
  }

  function openScorecard(row: PublicGolfTourFourball) {
    const href = fourballStartNavigateHref(row);
    if (!href) return;
    router.push(href);
  }

  function onStartFourball(row: PublicGolfTourFourball, round: PublicGolfTourRound) {
    const href = fourballStartNavigateHref(row);
    if (row.status === "live" || row.status === "locked") {
      if (href) router.push(href);
      return;
    }

    const venue = venueForCmsId(venues, round.venueCmsId);
    const course = toCourseSnapshot(venue?.golfCourse, holesPlayed, startingHole);
    if (!isGolfStartReady({ teeName, startingHole, holesPlayed })) {
      setError("Pick a tee, starting hole, and holes played");
      return;
    }
    if (holesPlayed === 18 && !course) {
      setError("This course is missing hole data for 18 holes");
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(() => {
      void startGolfTourFourball(current.id, row.id, {
        teeName,
        holesPlayed,
        startingHole,
        ...(course ? { course } : {}),
      }).then((result) => {
        if (!result.ok) {
          if (handleAuthFailure(result.status)) return;
          setError(result.error);
          return;
        }
        apply(result.value.tour);
        const path = fourballStartNavigateHref(result.value);
        if (path) router.push(path);
        router.refresh();
      });
    });
  }

  const fieldClass = golfTourFieldClass();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Golf tour · {formatGolfTourStatus(current.status)}
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          {current.name}
        </h1>
        <p className="text-sm text-zinc-400">
          {formatTourDateRange(current.startDate, current.endDate)}
        </p>
        {canCompleteTour(current, user?.id) ? (
          <button
            type="button"
            disabled={pending}
            onClick={onComplete}
            className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 text-sm font-medium text-zinc-200 hover:border-white/20 disabled:opacity-60"
          >
            Complete tour
          </button>
        ) : null}
      </header>

      {!isAuthenticated && !authLoading ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
          <p className="text-sm text-amber-100">
            Sign in to edit this tour or start a fourball.
          </p>
          <button
            type="button"
            onClick={() => sendToLogin(current.id)}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Sign in
          </button>
        </div>
      ) : null}

      {host && nextStepCopy ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Continue setup
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-50">
            {nextStepCopy}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-emerald-200">{message}</p> : null}

      {host ? (
        <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">Details</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Name
              </label>
              <input
                type="text"
                value={name}
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onSaveDetails}
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            Save details
          </button>
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
        <h2 className="font-display text-2xl tracking-wide text-white">Camps</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
          Camps are the teams. The tour starts with Camp A and Camp B — rename
          them or add another.
        </p>
        <ul className="mt-4 space-y-2">
          {sortedCamps.map((camp) => (
            <li
              key={camp.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/8 px-4 py-3 sm:flex-row sm:items-center"
            >
              {host ? (
                <>
                  <label className="block min-w-0 flex-1">
                    <span className="mb-1 block text-xs text-zinc-500">
                      Camp name
                    </span>
                    <input
                      type="text"
                      value={campDrafts[camp.id] ?? camp.name}
                      maxLength={40}
                      onChange={(event) =>
                        setCampDrafts((drafts) => ({
                          ...drafts,
                          [camp.id]: event.target.value,
                        }))
                      }
                      className={fieldClass}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={
                      pending ||
                      (campDrafts[camp.id] ?? camp.name).trim() === camp.name ||
                      !(campDrafts[camp.id] ?? "").trim()
                    }
                    onClick={() => onRenameCamp(camp.id)}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-zinc-200 hover:border-white/20 disabled:opacity-50"
                  >
                    Save name
                  </button>
                </>
              ) : (
                <span className="text-sm text-white">{camp.name}</span>
              )}
            </li>
          ))}
        </ul>
        {host ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="block min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                New camp
              </span>
              <input
                type="text"
                value={campName}
                maxLength={40}
                placeholder={campPlaceholder}
                onChange={(event) => setCampName(event.target.value)}
                className={fieldClass}
              />
            </label>
            <button
              type="button"
              disabled={pending}
              onClick={onAddCamp}
              className="mt-0 inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60 sm:mt-6"
            >
              Add camp
            </button>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-wide text-white">Rounds</h2>
          {host && sortedRounds.length > 0 ? (
            <button
              type="button"
              onClick={() => setAddingRound((open) => !open)}
              className="inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              {addingRound ? "Cancel" : "Add round"}
            </button>
          ) : null}
        </div>

        {showRoundComposer ? (
          <div className="rounded-3xl border border-emerald-400/20 bg-[#141814] p-5 space-y-4">
            <h3 className="text-lg font-medium text-white">Add a round</h3>
            <p className="text-sm leading-relaxed text-zinc-500">
              Pick a date in the tour window and a golf course. Fourballs on
              this round use that venue.
            </p>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Date
              </span>
              <input
                type="date"
                value={roundDate}
                min={current.startDate}
                max={current.endDate}
                onChange={(event) => setRoundDate(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Label (optional)
              </span>
              <input
                type="text"
                value={roundLabel}
                placeholder="Saturday AM"
                onChange={(event) => setRoundLabel(event.target.value)}
                className={fieldClass}
              />
            </label>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Golf course</p>
              {venues.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No golf courses with scorecard data yet. Add hole data in CMS
                  before creating a round.
                </p>
              ) : (
                <VenuePicker
                  venues={venues}
                  selected={roundVenue}
                  onSelect={(option) =>
                    setRoundVenue(option as GolfVenueOption | null)
                  }
                  searchPlaceholder="Search golf courses…"
                />
              )}
            </div>
            <button
              type="button"
              disabled={pending || venues.length === 0}
              onClick={onAddRound}
              className="inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
            >
              Save round
            </button>
          </div>
        ) : null}

        {sortedRounds.length === 0 && !host ? (
          <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
            <p className="text-sm leading-relaxed text-zinc-400">
              No rounds yet. The host adds a date and golf venue so fourballs
              have a course to play.
            </p>
          </div>
        ) : null}

        {sortedRounds.map((round) => {
            const venue = venueForCmsId(venues, round.venueCmsId);
            const roundFourballs = fourballsForRound(current, round.id);
            return (
              <article
                key={round.id}
                className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                      {formatIsoDayLabel(round.date)}
                    </p>
                    <h3 className="mt-1 text-lg font-medium text-white">
                      {round.label || venue?.name || "Golf round"}
                    </h3>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {venue
                        ? [venue.name, venue.suburb, venue.city]
                            .filter(Boolean)
                            .join(" · ")
                        : "Golf course"}
                    </p>
                  </div>
                  {host ? (
                    <button
                      type="button"
                      onClick={() => openAddFourball(round.id)}
                      className="inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                    >
                      {addingFourballFor === round.id ? "Cancel" : "Add fourball"}
                    </button>
                  ) : null}
                </div>

                {host ? (
                  <label className="mt-3 block max-w-xs">
                    <span className="mb-1 block text-xs text-zinc-500">
                      Move date
                    </span>
                    <input
                      type="date"
                      defaultValue={round.date}
                      min={current.startDate}
                      max={current.endDate}
                      onBlur={(event) => {
                        const next = event.target.value;
                        if (next && next !== round.date) {
                          runTourAction(
                            () =>
                              updateGolfTourRound(current.id, round.id, {
                                date: next,
                              }),
                            { success: "Round updated." },
                          );
                        }
                      }}
                      className={fieldClass}
                    />
                  </label>
                ) : null}

                {addingFourballFor === round.id && host ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-emerald-400/20 p-4">
                    <h4 className="text-sm font-medium text-white">
                      New fourball
                    </h4>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Camp
                      </span>
                      <select
                        value={fourballCampId}
                        onChange={(event) => setFourballCampId(event.target.value)}
                        className={fieldClass}
                      >
                        {sortedCamps.map((camp) => (
                          <option key={camp.id} value={camp.id}>
                            {camp.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <GolfTourPlayerSlots
                      slots={fourballSlots}
                      friends={friends}
                      onChange={setFourballSlots}
                      disabled={pending}
                    />
                    <button
                      type="button"
                      disabled={pending || !fourballCampId}
                      onClick={() => onAddFourball(round.id)}
                      className="inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                    >
                      Save fourball
                    </button>
                  </div>
                ) : null}

                {roundFourballs.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/12 px-4 py-4">
                    <p className="text-sm text-zinc-500">
                      No fourballs on this round yet.
                      {host
                        ? " Assign a camp and 1–4 players, then start when the group is ready."
                        : ""}
                    </p>
                    {host && addingFourballFor !== round.id ? (
                      <button
                        type="button"
                        onClick={() => openAddFourball(round.id)}
                        className="mt-3 inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
                      >
                        Add fourball
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {roundFourballs.map((row) => {
                      const camp = campById(current, row.campId);
                      const names = row.players
                        .map((player) => player.displayName)
                        .join(", ");
                      const startable = canStartFourball(current, row, user?.id);
                      const openHref = fourballStartNavigateHref(row);
                      const starting = startingFourballId === row.id;
                      const editing = editingFourballId === row.id;
                      return (
                        <li
                          key={row.id}
                          className="rounded-2xl border border-white/8 px-4 py-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                                {camp?.name ?? "Camp"} · {formatFourballStatus(row.status)}
                              </p>
                              <p className="mt-1 text-sm text-white">
                                {names || "No players assigned"}
                              </p>
                              {host && row.status === "pending" && row.players.length === 0 ? (
                                <p className="mt-1 text-xs text-zinc-500">
                                  Assign at least one player to start this fourball.
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {openHref && row.status !== "pending" ? (
                                <button
                                  type="button"
                                  onClick={() => openScorecard(row)}
                                  className="inline-flex min-h-9 items-center rounded-full bg-emerald-400 px-3 text-xs font-semibold text-zinc-950 hover:bg-emerald-300"
                                >
                                  Open scorecard
                                </button>
                              ) : null}
                              {startable && row.status === "pending" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStartingFourballId(
                                      starting ? null : row.id,
                                    );
                                    setTeeName("");
                                  }}
                                  className="inline-flex min-h-9 items-center rounded-full bg-emerald-400 px-3 text-xs font-semibold text-zinc-950 hover:bg-emerald-300"
                                >
                                  {starting ? "Cancel start" : "Start fourball"}
                                </button>
                              ) : null}
                              {host && row.status === "pending" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingFourballId(editing ? null : row.id);
                                      setAddingFourballFor(null);
                                      setFourballCampId(row.campId);
                                      setFourballSlots(slotsFromPlayers(row.players));
                                    }}
                                    className="inline-flex min-h-9 items-center rounded-full border border-white/12 px-3 text-xs font-medium text-zinc-300"
                                  >
                                    {editing ? "Close" : "Edit"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onCancelFourball(row.id)}
                                    className="inline-flex min-h-9 items-center rounded-full border border-white/12 px-3 text-xs font-medium text-zinc-400"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {editing && host ? (
                            <div className="mt-3 space-y-3">
                              <select
                                value={fourballCampId}
                                onChange={(event) =>
                                  setFourballCampId(event.target.value)
                                }
                                className={fieldClass}
                              >
                                {sortedCamps.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                              <GolfTourPlayerSlots
                                slots={fourballSlots}
                                friends={friends}
                                onChange={setFourballSlots}
                                disabled={pending}
                              />
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() => onSaveFourball(row.id)}
                                className="inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                              >
                                Save players
                              </button>
                            </div>
                          ) : null}

                          {starting ? (
                            <div className="mt-3 space-y-4">
                              <GolfPreRoundSetup
                                golfCourse={venue?.golfCourse}
                                teeName={teeName}
                                onTeeNameChange={setTeeName}
                                startingHole={startingHole}
                                onStartingHoleChange={setStartingHole}
                                holesPlayed={holesPlayed}
                                onHolesPlayedChange={setHolesPlayed}
                              />
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() => onStartFourball(row, round)}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                              >
                                Open golf scorecard
                              </button>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
      </section>

      <GolfTourLeaderboard
        leaderboard={leaderboard}
        loading={leaderboardLoading}
        error={leaderboardError}
        onRefresh={refreshLeaderboard}
      />
    </div>
  );
}
