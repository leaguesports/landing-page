"use client";

import { PostActionShare } from "@/components/conversion/PostActionShare";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { GolfPreRoundHandicap } from "@/components/golf/GolfPreRoundHandicap";
import { GolfPreRoundSetup } from "@/components/golf/GolfPreRoundSetup";
import { useAuth } from "@/hooks/useAuth";
import { teeRatingsFromCms } from "@/lib/golf/handicap";
import { withRoundHandicapOverride } from "@/lib/golf/profile";
import { track } from "@/lib/analytics/track";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  isLobbySourceNote,
  lobbyGameStartParams,
} from "@/lib/lobby/lobby";
import {
  buildStartOrganisedGolfOverrides,
  isGolfStartReady,
} from "@/lib/golf/pre-round";
import { dispatchInboxChanged } from "@/lib/notifications/inbox";
import {
  cancelOrganisedGame,
  formatOrganisedGameRsvp,
  formatOrganisedGameSport,
  formatOrganisedGameStatus,
  organisedGameOccupiedCount,
  rsvpOrganisedGame,
  startOrganisedGame,
  type OrganisedGame,
} from "@/lib/organised-games/organised-games";
import type { GolfCourseCms, GolfHolesPlayed } from "@/types/golf-round";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import { hubOrganisedGameJoinHref } from "@/lib/sports/hub-ia";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OrganisedGameDetailProps = {
  game: OrganisedGame;
  venueName: string | null;
  venueHref: string | null;
  golfCourse?: GolfCourseCms | null;
};

function PersonRow({
  name,
  handle,
  avatarUrl,
  badge,
}: {
  name: string;
  handle: string;
  avatarUrl: string | null;
  badge: string;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
        <img
          src={avatarUrl}
          alt=""
          className="h-10 w-10 rounded-full border border-white/10 object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-lg text-emerald-300"
          aria-hidden
        >
          {name.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">
          {name}
        </span>
        {handle ? (
          <span className="block truncate text-xs text-zinc-500">@{handle}</span>
        ) : null}
      </span>
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
        {badge}
      </span>
    </li>
  );
}

export function OrganisedGameDetail({
  game: initial,
  venueName,
  venueHref,
  golfCourse = null,
}: OrganisedGameDetailProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [game, setGame] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"rsvp" | "start" | "cancel" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [teeName, setTeeName] = useState("");
  const [startingHole, setStartingHole] = useState(1);
  const [holesPlayed, setHolesPlayed] = useState<GolfHolesPlayed>(18);
  const [roundHi, setRoundHi] = useState<number | null>(null);
  const profileHi = user?.golfHandicapIndex ?? null;
  const teeRatings = useMemo(
    () => teeRatingsFromCms(golfCourse, teeName),
    [golfCourse, teeName],
  );

  useEffect(() => {
    setRoundHi(user?.golfHandicapIndex ?? null);
  }, [user?.golfHandicapIndex]);
  const golfStartReady =
    game.sport !== "golf" ||
    isGolfStartReady({ teeName, startingHole, holesPlayed });

  // Invitee GET / RSVP auto-reads the invite notice on the API — refresh the bell.
  useEffect(() => {
    dispatchInboxChanged();
  }, []);

  const isHost = game.viewer.role === "host";
  const isInvitee = game.viewer.role === "invitee";
  const isOpen = game.status === "open";
  const occupied = organisedGameOccupiedCount(game);
  const when = formatHubWhen(game.startsAt);
  const shareHref = useMemo(() => {
    if (!game.inviteToken) return null;
    return hubOrganisedGameJoinHref(game.inviteToken);
  }, [game.inviteToken]);

  function sendToLogin() {
    window.location.href = getLoginPageHref(
      relativeAuthReturnTo() || `/play/organised/${game.id}`,
    );
  }

  async function onRsvp(rsvp: "accepted" | "declined") {
    if (!isAuthenticated) {
      sendToLogin();
      return;
    }
    setError(null);
    setBusy("rsvp");
    const result = await rsvpOrganisedGame(game.id, rsvp);
    setBusy(null);
    if (!result.ok) {
      if (result.status === 401) {
        sendToLogin();
        return;
      }
      setError(result.error);
      return;
    }
    setGame(result.value);
    dispatchInboxChanged();
  }

  async function onStart() {
    if (!isAuthenticated) {
      sendToLogin();
      return;
    }
    setError(null);
    let startOverrides = undefined;
    if (game.sport === "golf") {
      const built = buildStartOrganisedGolfOverrides({
        teeName,
        startingHole,
        holesPlayed,
      });
      if (!built.ok) {
        setError(built.error);
        return;
      }
      startOverrides = built.overrides;
    }
    setBusy("start");
    try {
      const result = await withRoundHandicapOverride(
        profileHi,
        isAuthenticated ? roundHi : profileHi,
        () => startOrganisedGame(game.id, startOverrides),
      );
      setBusy(null);
      if (!result.ok) {
        if (result.status === 401) {
          sendToLogin();
          return;
        }
        setError(result.error);
        return;
      }
      setGame(result.value.game);
      if (isLobbySourceNote(game.notes)) {
        const sport = game.sport === "golf" ? "golf" : "padel";
        track("game_start", lobbyGameStartParams(sport));
      }
      router.push(result.value.live.path);
    } catch (err) {
      setBusy(null);
      setError(err instanceof Error ? err.message : "Could not start game");
    }
  }

  async function onCancel() {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    if (!isAuthenticated) {
      sendToLogin();
      return;
    }
    setError(null);
    setBusy("cancel");
    const result = await cancelOrganisedGame(game.id);
    setBusy(null);
    if (!result.ok) {
      if (result.status === 401) {
        sendToLogin();
        return;
      }
      setError(result.error);
      return;
    }
    setConfirmCancel(false);
    setGame(result.value);
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <DeepLinkLand pageType="organise" sport={game.sport} slug={game.id} />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {formatOrganisedGameSport(game.sport)} ·{" "}
          {formatOrganisedGameStatus(game.status)}
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          {when ?? "Organised game"}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          {venueHref && venueName ? (
            <Link
              href={venueHref}
              className="font-medium text-emerald-300 hover:text-emerald-200"
            >
              {venueName}
            </Link>
          ) : (
            venueName || "Venue TBC"
          )}
          {` · ${occupied}/${game.capacity} going`}
        </p>
        {game.notes && !isLobbySourceNote(game.notes) ? (
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            {game.notes}
          </p>
        ) : null}
      </header>

      {isHost && shareHref && isOpen ? (
        <PostActionShare
          url={shareHref}
          text={`Join this organised game\n{url}`}
          pageType="organise"
          sport={game.sport}
          heading="Share this game"
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Who&apos;s in</h2>
        <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
          <PersonRow
            name={game.host.displayName}
            handle={game.host.handle}
            avatarUrl={game.host.avatarUrl}
            badge="Host"
          />
          {game.invitees.map((invitee) => (
            <PersonRow
              key={invitee.inviteId}
              name={invitee.displayName}
              handle={invitee.handle}
              avatarUrl={invitee.avatarUrl}
              badge={formatOrganisedGameRsvp(invitee.rsvp)}
            />
          ))}
        </ul>
      </section>

      {error ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      {isInvitee && isOpen ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onRsvp("accepted")}
            className={[
              "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold",
              game.viewer.rsvp === "accepted"
                ? "bg-emerald-400 text-zinc-950"
                : "border border-white/15 text-white hover:bg-white/5",
            ].join(" ")}
          >
            {busy === "rsvp" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              "Accept"
            )}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onRsvp("declined")}
            className={[
              "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold",
              game.viewer.rsvp === "declined"
                ? "border border-amber-400/40 bg-amber-400/10 text-amber-100"
                : "border border-white/15 text-white hover:bg-white/5",
            ].join(" ")}
          >
            Decline
          </button>
        </div>
      ) : null}

      {isHost && isOpen ? (
        <div className="space-y-3">
          {game.sport === "golf" ? (
            <>
              <GolfPreRoundSetup
                golfCourse={golfCourse}
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
            </>
          ) : null}
          {game.sport === "golf" && !golfStartReady ? (
            <p className="text-center text-xs text-zinc-500">
              Pick a tee to enable Start.
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy !== null || !golfStartReady}
            onClick={() => void onStart()}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {busy === "start" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Starting…
              </>
            ) : (
              "Start game"
            )}
          </button>
          <p className="text-xs leading-relaxed text-zinc-500">
            You can start from 12 hours before until 24 hours after the start
            time.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onCancel()}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-zinc-300 hover:bg-white/5"
          >
            {busy === "cancel" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : confirmCancel ? (
              "Confirm cancel"
            ) : (
              <>
                <X className="h-4 w-4" aria-hidden />
                Cancel game
              </>
            )}
          </button>
        </div>
      ) : null}

      {game.status === "started" && game.live?.path ? (
        <Link
          href={game.live.path}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-emerald-400 px-6 text-base font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Open live scorecard
        </Link>
      ) : null}
    </div>
  );
}
