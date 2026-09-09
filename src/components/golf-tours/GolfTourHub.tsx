"use client";

import { GolfPreRoundSetup } from "@/components/golf/GolfPreRoundSetup";
import { GolfTourHowItWorks } from "@/components/golf-tours/GolfTourHowItWorks";
import { GolfTourLeaderboard } from "@/components/golf-tours/GolfTourLeaderboard";
import {
  GolfTourPlayerSlots,
  emptyGolfTourSlots,
  golfTourFieldClass,
  golfTourOutlineButtonClass,
  golfTourPrimaryButtonClass,
  type GolfTourSlotDraft,
} from "@/components/golf-tours/GolfTourPlayerSlots";
import { GolfTourShareButton } from "@/components/golf-tours/GolfTourShareButton";
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
  addGolfTourRosterMember,
  addGolfTourRound,
  addGolfTourStandingFourball,
  canCompleteTour,
  canMutateTour,
  canStartFourball,
  campById,
  completeGolfTour,
  copyGolfTourRoundFrom,
  fourballSharePath,
  formatFourballStatus,
  formatGolfTourStatus,
  formatIsoDayLabel,
  formatTourDateRange,
  fourballStartNavigateHref,
  fourballsForRound,
  getGolfTourLeaderboard,
  golfTourHref,
  golfTourHostNextStep,
  golfTourHostNextStepAction,
  golfTourHostNextStepCopy,
  golfTourHostNextStepHref,
  nextCampPlaceholder,
  prepareGolfTourRound,
  previousRound,
  removeGolfTourRosterMember,
  removeGolfTourStandingFourball,
  roundNeedsPrepare,
  scoringPlayers,
  shouldShowHostRoundComposer,
  startGolfTourFourball,
  updateGolfTour,
  updateGolfTourCamp,
  updateGolfTourFourball,
  updateGolfTourRound,
  updateGolfTourStandingFourball,
  type GolfTourPlayerInput,
  type GolfTourStandingPlayerInput,
  type PublicGolfTour,
  type PublicGolfTourFourball,
  type PublicGolfTourLeaderboard,
  type PublicGolfTourRosterMember,
  type PublicGolfTourRound,
  type PublicGolfTourStandingFourball,
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

function standingPlayersFromRoster(
  members: PublicGolfTourRosterMember[],
): GolfTourStandingPlayerInput[] {
  return members.slice(0, 4).map((member, index) => ({
    slot: (index + 1) as GolfPlayerSlot,
    rosterMemberId: member.id,
  }));
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
  const [addingPlayersFor, setAddingPlayersFor] = useState<string | null>(null);
  const [rosterGuestName, setRosterGuestName] = useState("");
  const [roundDate, setRoundDate] = useState(tour.startDate);
  const [roundLabel, setRoundLabel] = useState("");
  const [roundVenue, setRoundVenue] = useState<GolfVenueOption | null>(null);
  const [addingRound, setAddingRound] = useState(false);
  const [addingStanding, setAddingStanding] = useState(false);
  const [editingStandingId, setEditingStandingId] = useState<string | null>(
    null,
  );
  const [standingCampId, setStandingCampId] = useState(tour.camps[0]?.id ?? "");
  const [standingName, setStandingName] = useState("");
  const [standingMemberIds, setStandingMemberIds] = useState<string[]>([]);
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
  const nextStepAction = golfTourHostNextStepAction(nextStep);
  const showRoundComposer = shouldShowHostRoundComposer(
    host,
    addingRound,
    nextStep,
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
  const sortedStanding = useMemo(
    () =>
      [...current.standingFourballs].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
      ),
    [current.standingFourballs],
  );
  const standingRoster = useMemo(
    () =>
      sortedCamps.find((camp) => camp.id === standingCampId)?.roster ?? [],
    [sortedCamps, standingCampId],
  );

  function apply(next: PublicGolfTour) {
    setCurrent(next);
    setName(next.name);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
    setCampDrafts(campDraftMap(next.camps));
    if (!fourballCampId && next.camps[0]) setFourballCampId(next.camps[0].id);
    if (!standingCampId && next.camps[0]) setStandingCampId(next.camps[0].id);
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

  function onAddRosterMember(
    campId: string,
    input: { displayName: string; isGuest: boolean; userId?: string | null },
  ) {
    if (!input.displayName.trim()) {
      setError("Player name is required");
      return;
    }
    runTourAction(
      () => addGolfTourRosterMember(current.id, campId, input),
      {
        success: "Player added to roster.",
        onSuccess: () => setRosterGuestName(""),
      },
    );
  }

  function onRemoveRosterMember(campId: string, memberId: string) {
    runTourAction(
      () => removeGolfTourRosterMember(current.id, campId, memberId),
      { success: "Player removed from roster." },
    );
  }

  function toggleStandingMember(memberId: string) {
    setStandingMemberIds((currentIds) => {
      if (currentIds.includes(memberId)) {
        return currentIds.filter((id) => id !== memberId);
      }
      if (currentIds.length >= 4) return currentIds;
      return [...currentIds, memberId];
    });
  }

  function standingPlayersFromSelection(): GolfTourStandingPlayerInput[] {
    const selected = standingMemberIds
      .map((id) => standingRoster.find((member) => member.id === id))
      .filter((member): member is PublicGolfTourRosterMember => Boolean(member));
    return standingPlayersFromRoster(selected);
  }

  function openStandingComposer(template?: PublicGolfTourStandingFourball) {
    if (template) {
      const editing = editingStandingId !== template.id;
      setEditingStandingId(editing ? template.id : null);
      setAddingStanding(false);
      setStandingCampId(template.campId);
      setStandingName(template.name ?? "");
      const camp = campById(current, template.campId);
      const ids = template.players.flatMap((player) => {
        const match = camp?.roster.find((member) => {
          if (player.userId) return member.userId === player.userId;
          return (
            member.isGuest &&
            member.displayName.trim().toLowerCase() ===
              player.displayName.trim().toLowerCase()
          );
        });
        return match ? [match.id] : [];
      });
      setStandingMemberIds(ids);
      return;
    }
    setAddingStanding((open) => !open);
    setEditingStandingId(null);
    setStandingCampId(current.camps[0]?.id ?? "");
    setStandingName("");
    setStandingMemberIds([]);
  }

  function onSaveStanding(templateId?: string) {
    const players = standingPlayersFromSelection();
    if (players.length < 1) {
      setError("Pick at least one roster player for this fourball");
      return;
    }
    if (!standingCampId) {
      setError("Pick a camp for this fourball");
      return;
    }
    if (templateId) {
      runTourAction(
        () =>
          updateGolfTourStandingFourball(current.id, templateId, {
            campId: standingCampId,
            name: standingName || null,
            players,
          }),
        {
          success: "Standing fourball updated.",
          onSuccess: () => {
            setEditingStandingId(null);
            setStandingName("");
            setStandingMemberIds([]);
          },
        },
      );
      return;
    }
    runTourAction(
      () =>
        addGolfTourStandingFourball(current.id, {
          campId: standingCampId,
          name: standingName || null,
          players,
        }),
      {
        success: "Standing fourball added. Add a round to prepare instances.",
        onSuccess: () => {
          setAddingStanding(false);
          setStandingName("");
          setStandingMemberIds([]);
        },
      },
    );
  }

  function onRemoveStanding(templateId: string) {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            "Remove this standing fourball? Existing round instances stay, but will no longer follow the template.",
          );
    if (!confirmed) return;
    runTourAction(
      () => removeGolfTourStandingFourball(current.id, templateId),
      { success: "Standing fourball removed." },
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
        success:
          current.standingFourballs.length > 0
            ? "Round added. Standing fourballs were prepared."
            : "Round added. Build standing fourballs, then prepare.",
        onSuccess: () => {
          setAddingRound(false);
          setRoundLabel("");
          setRoundVenue(null);
        },
      },
    );
  }

  function onPrepareRound(roundId: string) {
    runTourAction(() => prepareGolfTourRound(current.id, roundId), {
      success: "Round prepared from standing fourballs.",
    });
  }

  function onCopyFromPrevious(roundId: string, sourceRoundId: string) {
    runTourAction(
      () => copyGolfTourRoundFrom(current.id, roundId, sourceRoundId),
      { success: "Copied groups from the previous round." },
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
        success: "One-off fourball added for this round.",
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
        success: "This-round players updated. Standing template unchanged.",
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

  function onSitOutGroup(row: PublicGolfTourFourball, sitOut: boolean) {
    runTourAction(
      () => updateGolfTourFourball(current.id, row.id, { sitOut }),
      { success: sitOut ? "Group sitting out this round." : "Group is playing." },
    );
  }

  function onSitOutPlayer(
    row: PublicGolfTourFourball,
    slot: GolfPlayerSlot,
    sitOut: boolean,
  ) {
    runTourAction(
      () =>
        updateGolfTourFourball(current.id, row.id, {
          playerSitOuts: [{ slot, sitOut }],
        }),
      {
        success: sitOut
          ? "Player sitting out this round."
          : "Player is scoring this round.",
      },
    );
  }

  function openScorecard(row: PublicGolfTourFourball) {
    const href = fourballStartNavigateHref(row);
    if (!href) return;
    router.push(href);
  }

  function onStartFourball(
    row: PublicGolfTourFourball,
    round: PublicGolfTourRound,
  ) {
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

  function onNextStepAction() {
    if (nextStep === "complete") {
      onComplete();
      return;
    }
    if (nextStep === "camps") {
      document.getElementById("golf-tour-camps")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (nextStep === "roster") {
      setAddingPlayersFor(sortedCamps[0]?.id ?? null);
      document.getElementById("golf-tour-camps")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (nextStep === "standing") {
      if (!addingStanding) openStandingComposer();
      document.getElementById("golf-tour-standing")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (nextStep === "rounds") {
      setAddingRound(true);
      document.getElementById("golf-tour-rounds")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (nextStep === "prepare") {
      const round = sortedRounds.find((item) =>
        roundNeedsPrepare(current, item.id),
      );
      if (round) onPrepareRound(round.id);
      document.getElementById("golf-tour-rounds")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    document.getElementById("golf-tour-rounds")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
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
        <div className="flex flex-wrap gap-2">
          {canCompleteTour(current, user?.id) ? (
            <button
              type="button"
              disabled={pending}
              onClick={onComplete}
              className={golfTourOutlineButtonClass()}
            >
              Complete tour
            </button>
          ) : null}
          <GolfTourShareButton
            path={golfTourHref(current.id)}
            title={current.name}
            label="Share tour"
          />
        </div>
      </header>

      {!isAuthenticated && !authLoading ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
          <p className="text-sm text-amber-100">
            Sign in to edit this tour or start a fourball.
          </p>
          <button
            type="button"
            onClick={() => sendToLogin(current.id)}
            className={`mt-3 ${golfTourPrimaryButtonClass()}`}
          >
            Sign in
          </button>
        </div>
      ) : null}

      {host ? <GolfTourHowItWorks /> : null}

      {host && nextStepCopy ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Continue setup
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-50">
            {nextStepCopy}
          </p>
          {nextStepAction ? (
            <button
              type="button"
              disabled={pending}
              onClick={onNextStepAction}
              className={`mt-3 ${golfTourPrimaryButtonClass()}`}
            >
              {nextStepAction}
            </button>
          ) : null}
          <a href={golfTourHostNextStepHref(nextStep)} className="sr-only">
            {nextStepAction || "Continue setup"}
          </a>
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
            className={`mt-4 ${golfTourPrimaryButtonClass()}`}
          >
            Save details
          </button>
        </section>
      ) : null}

      <section
        id="golf-tour-camps"
        className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
      >
        <h2 className="font-display text-2xl tracking-wide text-white">
          Camps + roster
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
          Camps are the teams. Add registered or guest players once — standing
          fourballs pick from this roster.
        </p>
        <ul className="mt-4 space-y-4">
          {sortedCamps.map((camp) => (
            <li
              key={camp.id}
              className="rounded-2xl border border-white/8 px-4 py-4"
            >
              {host ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
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
                    className={golfTourOutlineButtonClass("shrink-0")}
                  >
                    Save name
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium text-white">{camp.name}</p>
              )}

              {camp.roster.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">
                  No players on this roster yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {camp.roster.map((member) => (
                    <li
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 px-3 py-2"
                    >
                      <span className="text-sm text-white">
                        {member.displayName}
                        {member.isGuest ? (
                          <span className="ml-2 text-[11px] uppercase tracking-wide text-zinc-500">
                            Guest
                          </span>
                        ) : null}
                      </span>
                      {host ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => onRemoveRosterMember(camp.id, member.id)}
                          className={golfTourOutlineButtonClass("min-h-9 px-3 text-xs")}
                        >
                          Remove
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}

              {host ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setAddingPlayersFor((open) =>
                        open === camp.id ? null : camp.id,
                      )
                    }
                    className={golfTourPrimaryButtonClass()}
                  >
                    {addingPlayersFor === camp.id ? "Close" : "Add players"}
                  </button>
                  {addingPlayersFor === camp.id ? (
                    <div className="mt-3 space-y-3 rounded-2xl border border-emerald-400/20 p-4">
                      {friends.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {friends.slice(0, 8).map((friend) => {
                            const already = camp.roster.some(
                              (member) => member.userId === friend.id,
                            );
                            return (
                              <button
                                key={friend.id}
                                type="button"
                                disabled={pending || already}
                                onClick={() =>
                                  onAddRosterMember(camp.id, {
                                    displayName: friend.displayName,
                                    isGuest: false,
                                    userId: friend.id,
                                  })
                                }
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-white/20 disabled:opacity-50"
                              >
                                {friend.displayName}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {playerSeed.displayName && playerSeed.userId ? (
                        <button
                          type="button"
                          disabled={
                            pending ||
                            camp.roster.some(
                              (member) => member.userId === playerSeed.userId,
                            )
                          }
                          onClick={() =>
                            onAddRosterMember(camp.id, {
                              displayName: playerSeed.displayName,
                              isGuest: false,
                              userId: playerSeed.userId,
                            })
                          }
                          className={golfTourOutlineButtonClass()}
                        >
                          Add me
                        </button>
                      ) : null}
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                          Guest name
                        </span>
                        <input
                          type="text"
                          value={rosterGuestName}
                          maxLength={80}
                          placeholder="Pat"
                          onChange={(event) =>
                            setRosterGuestName(event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={pending || !rosterGuestName.trim()}
                        onClick={() =>
                          onAddRosterMember(camp.id, {
                            displayName: rosterGuestName,
                            isGuest: true,
                          })
                        }
                        className={golfTourPrimaryButtonClass()}
                      >
                        Add players
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
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
              className={`${golfTourPrimaryButtonClass("shrink-0 sm:mt-6")}`}
            >
              Add camp
            </button>
          </div>
        ) : null}
      </section>

      <section
        id="golf-tour-standing"
        className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-white">
              Standing fourballs
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              Tour-level groups of up to 4, tagged to a camp. New rounds spawn
              instances from these templates.
            </p>
          </div>
          {host ? (
            <button
              type="button"
              onClick={() => openStandingComposer()}
              className={golfTourPrimaryButtonClass()}
            >
              {addingStanding ? "Cancel" : "Build standing fourballs"}
            </button>
          ) : null}
        </div>

        {addingStanding && host ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-emerald-400/20 p-4">
            <h3 className="text-sm font-medium text-white">New standing fourball</h3>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Camp
              </span>
              <select
                value={standingCampId}
                onChange={(event) => {
                  setStandingCampId(event.target.value);
                  setStandingMemberIds([]);
                }}
                className={fieldClass}
              >
                {sortedCamps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Name (optional)
              </span>
              <input
                type="text"
                value={standingName}
                maxLength={40}
                placeholder="Morning group"
                onChange={(event) => setStandingName(event.target.value)}
                className={fieldClass}
              />
            </label>
            {standingRoster.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Add players to this camp roster first.
              </p>
            ) : (
              <fieldset>
                <legend className="mb-2 text-xs font-medium text-zinc-400">
                  Players (up to 4)
                </legend>
                <div className="space-y-2">
                  {standingRoster.map((member) => {
                    const checked = standingMemberIds.includes(member.id);
                    const disabled =
                      pending || (!checked && standingMemberIds.length >= 4);
                    return (
                      <label
                        key={member.id}
                        className="flex min-h-11 items-center gap-3 rounded-xl border border-white/8 px-3"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleStandingMember(member.id)}
                        />
                        <span className="text-sm text-white">
                          {member.displayName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
            <button
              type="button"
              disabled={pending || standingMemberIds.length < 1}
              onClick={() => onSaveStanding()}
              className={golfTourPrimaryButtonClass()}
            >
              Save standing fourball
            </button>
          </div>
        ) : null}

        {sortedStanding.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No standing fourballs yet.
            {host
              ? " Build them from the camp roster so you do not rebuild pairings every round."
              : ""}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sortedStanding.map((template) => {
              const camp = campById(current, template.campId);
              const names = template.players
                .map((player) => player.displayName)
                .join(", ");
              const editing = editingStandingId === template.id;
              return (
                <li
                  key={template.id}
                  className="rounded-2xl border border-white/8 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                        {camp?.name ?? "Camp"}
                      </p>
                      <p className="mt-1 text-sm text-white">
                        {template.name || names || "Untitled fourball"}
                      </p>
                      {template.name && names ? (
                        <p className="mt-0.5 text-xs text-zinc-500">{names}</p>
                      ) : null}
                    </div>
                    {host ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openStandingComposer(template)}
                          className={golfTourOutlineButtonClass()}
                        >
                          {editing ? "Close" : "Edit"}
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => onRemoveStanding(template.id)}
                          className={golfTourOutlineButtonClass()}
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {editing && host ? (
                    <div className="mt-3 space-y-3">
                      <select
                        value={standingCampId}
                        onChange={(event) => {
                          setStandingCampId(event.target.value);
                          setStandingMemberIds([]);
                        }}
                        className={fieldClass}
                      >
                        {sortedCamps.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={standingName}
                        maxLength={40}
                        onChange={(event) => setStandingName(event.target.value)}
                        className={fieldClass}
                      />
                      <div className="space-y-2">
                        {standingRoster.map((member) => {
                          const checked = standingMemberIds.includes(member.id);
                          const disabled =
                            pending ||
                            (!checked && standingMemberIds.length >= 4);
                          return (
                            <label
                              key={member.id}
                              className="flex min-h-11 items-center gap-3 rounded-xl border border-white/8 px-3"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggleStandingMember(member.id)}
                              />
                              <span className="text-sm text-white">
                                {member.displayName}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        disabled={pending || standingMemberIds.length < 1}
                        onClick={() => onSaveStanding(template.id)}
                        className={golfTourPrimaryButtonClass()}
                      >
                        Save standing fourball
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="golf-tour-rounds" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-wide text-white">Rounds</h2>
          {host && sortedRounds.length > 0 ? (
            <button
              type="button"
              onClick={() => setAddingRound((open) => !open)}
              className={golfTourPrimaryButtonClass()}
            >
              {addingRound ? "Cancel" : "Add round"}
            </button>
          ) : null}
        </div>

        {showRoundComposer ? (
          <div className="space-y-4 rounded-3xl border border-emerald-400/20 bg-[#141814] p-5">
            <h3 className="text-lg font-medium text-white">Add a round</h3>
            <p className="text-sm leading-relaxed text-zinc-500">
              Pick a date in the tour window and a golf course. Standing
              fourballs are prepared automatically.
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
              className={golfTourPrimaryButtonClass()}
            >
              Add round
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

        {host && sortedRounds.length === 0 && !showRoundComposer ? (
          <div className="rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-6">
            <p className="text-sm text-zinc-500">
              Add players and standing fourballs first, then add a round.
            </p>
            <button
              type="button"
              onClick={() => setAddingRound(true)}
              className={`mt-3 ${golfTourOutlineButtonClass()}`}
            >
              Add round
            </button>
          </div>
        ) : null}

        {sortedRounds.map((round) => {
          const venue = venueForCmsId(venues, round.venueCmsId);
          const roundFourballs = fourballsForRound(current, round.id).filter(
            (row) => row.status !== "cancelled",
          );
          const needsPrepare = roundNeedsPrepare(current, round.id);
          const source = previousRound(current.rounds, round.id);
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
                  <div className="flex flex-wrap gap-2">
                    {needsPrepare ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onPrepareRound(round.id)}
                        className={golfTourPrimaryButtonClass()}
                      >
                        Prepare round
                      </button>
                    ) : null}
                    {source ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onCopyFromPrevious(round.id, source.id)}
                        className={golfTourOutlineButtonClass()}
                      >
                        Copy from previous
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => openAddFourball(round.id)}
                      className={golfTourOutlineButtonClass()}
                    >
                      {addingFourballFor === round.id
                        ? "Cancel"
                        : "Add one-off fourball"}
                    </button>
                  </div>
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
                <div className="mt-4 space-y-3 rounded-2xl border border-white/12 p-4">
                  <h4 className="text-sm font-medium text-white">
                    One-off fourball
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Escape hatch for a group that is not on the standing list.
                    It will not write back to standing fourballs.
                  </p>
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
                    className={golfTourPrimaryButtonClass()}
                  >
                    Save fourball
                  </button>
                </div>
              ) : null}

              {roundFourballs.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-white/12 px-4 py-4">
                  <p className="text-sm text-zinc-500">
                    No fourballs on this round yet.
                    {host && current.standingFourballs.length > 0
                      ? " Prepare the round to spawn standing groups."
                      : host
                        ? " Build standing fourballs, then prepare — or add a one-off group."
                        : ""}
                  </p>
                  {host && needsPrepare ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onPrepareRound(round.id)}
                      className={`mt-3 ${golfTourPrimaryButtonClass()}`}
                    >
                      Prepare round
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
                    const sharePath = fourballSharePath(row);
                    const starting = startingFourballId === row.id;
                    const editing = editingFourballId === row.id;
                    const scoring = scoringPlayers(row);
                    return (
                      <li
                        key={row.id}
                        className="rounded-2xl border border-white/8 px-4 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                              {camp?.name ?? "Camp"} · {formatFourballStatus(row.status)}
                              {row.sitOut ? " · Sitting out" : ""}
                            </p>
                            <p className="mt-1 text-sm text-white">
                              {names || "No players assigned"}
                            </p>
                            {row.standingFourballId ? (
                              <p className="mt-0.5 text-xs text-zinc-500">
                                Standing fourball
                              </p>
                            ) : (
                              <p className="mt-0.5 text-xs text-zinc-500">
                                One-off this round
                              </p>
                            )}
                            {host &&
                            row.status === "pending" &&
                            scoring.length === 0 ? (
                              <p className="mt-1 text-xs text-zinc-500">
                                Assign at least one scoring player to start.
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sharePath && row.status !== "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openScorecard(row)}
                                  className={golfTourPrimaryButtonClass()}
                                >
                                  Open scorecard
                                </button>
                                <GolfTourShareButton
                                  path={sharePath}
                                  title={`${current.name} scorecard`}
                                />
                              </>
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
                                className={golfTourPrimaryButtonClass()}
                              >
                                {starting ? "Cancel start" : "Start scorecard"}
                              </button>
                            ) : null}
                            {host && row.status !== "cancelled" ? (
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() => onSitOutGroup(row, !row.sitOut)}
                                className={golfTourOutlineButtonClass()}
                              >
                                {row.sitOut ? "Play this round" : "Sit out group"}
                              </button>
                            ) : null}
                            {host && row.status === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFourballId(
                                      editing ? null : row.id,
                                    );
                                    setAddingFourballFor(null);
                                    setFourballCampId(row.campId);
                                    setFourballSlots(
                                      slotsFromPlayers(row.players),
                                    );
                                  }}
                                  className={golfTourOutlineButtonClass()}
                                >
                                  {editing ? "Close" : "Custom this round"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onCancelFourball(row.id)}
                                  className={golfTourOutlineButtonClass()}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {host && row.players.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {row.players.map((player) => (
                              <button
                                key={`${row.id}-${player.slot}`}
                                type="button"
                                disabled={pending || row.status === "cancelled"}
                                onClick={() =>
                                  onSitOutPlayer(
                                    row,
                                    player.slot,
                                    !player.sitOut,
                                  )
                                }
                                className={golfTourOutlineButtonClass(
                                  player.sitOut
                                    ? "border-amber-400/30 text-amber-100"
                                    : "",
                                )}
                              >
                                {player.displayName}
                                {player.sitOut ? " · sitting out" : " · play"}
                              </button>
                            ))}
                          </div>
                        ) : null}

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
                              className={golfTourPrimaryButtonClass()}
                            >
                              Save this-round players
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
                              className={`${golfTourPrimaryButtonClass("w-full")}`}
                            >
                              Open scorecard
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
