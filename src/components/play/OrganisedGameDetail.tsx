"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
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
import { formatHubWhen } from "@/lib/sports/hub-feed";
import { hubOrganisedGameJoinHref } from "@/lib/sports/hub-ia";
import { Check, Copy, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OrganisedGameDetailProps = {
  game: OrganisedGame;
  venueName: string | null;
  venueHref: string | null;
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
}: OrganisedGameDetailProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"rsvp" | "start" | "cancel" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

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

  async function copyShareLink() {
    if (!shareHref) return;
    const url = `${window.location.origin}${shareHref}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the share link.");
    }
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
    setBusy("start");
    const result = await startOrganisedGame(game.id);
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
    router.push(result.value.live.path);
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
        {game.notes ? (
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            {game.notes}
          </p>
        ) : null}
      </header>

      {isHost && shareHref && isOpen ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-200">Share link</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3">
            <p className="min-w-0 flex-1 truncate text-sm text-zinc-400">
              {shareHref}
            </p>
            <button
              type="button"
              onClick={() => void copyShareLink()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white hover:bg-white/5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-300" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>
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
          <button
            type="button"
            disabled={busy !== null}
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
