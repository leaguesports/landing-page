"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Copy, Eye, Link2, MessageCircle } from "lucide-react";
import type { GameDayCreated, GameDayPlayerSummary, PatchGameDayPlayerInput } from "@/types/golf-game-day";
import {
  gameDayBoardPath,
  gameDayCardPath,
  gameDayInvitePath,
  gameDayOrganiserPath,
  gameDayWatchPath,
  presentGameDay,
  whatsAppShareUrl,
} from "@/lib/golf-game-day/paths";
import { DesktopShare } from "./DesktopShare";
import { FIXTURE_DAY_ID } from "@/lib/golf-game-day/fixtures";
import { useGameDayAction } from "./GameDayChrome";
import { primaryLinkClass } from "./ui";

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function rosterLine(players: GameDayPlayerSummary[]): string {
  return players
    .map((player, index) =>
      index === 0 && player.cardNumber
        ? `${player.displayName} (Card ${player.cardNumber})`
        : player.displayName,
    )
    .join(", ");
}

type ShareGameDayProps = {
  day: GameDayCreated;
  origin?: string;
  cardHref?: string;
  organiserToken?: string | null;
  onSavePlayer?: (playerId: string, body: PatchGameDayPlayerInput) => Promise<void>;
};

export function ShareGameDay({
  day,
  origin = "",
  cardHref,
  organiserToken = null,
  onSavePlayer,
}: ShareGameDayProps) {
  const [copied, setCopied] = useState<"invite" | "watch" | "organiser" | null>(null);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { displayName: string; handicap: string; teeName: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const shown = presentGameDay(day);
  useGameDayAction("Brandon", "/login", "account");
  const invitePath = gameDayInvitePath(day.inviteCode);
  const watchPath = gameDayWatchPath(day.watchToken);
  const inviteUrl = `${origin}${invitePath}`;
  const watchUrl = `${origin}${watchPath}`;
  const organiserPath = organiserToken ? gameDayOrganiserPath(day.id, organiserToken) : "";
  const organiserUrl = organiserPath ? `${origin}${organiserPath}` : "";
  const shareText = `Join the game day\n${inviteUrl}`;
  const seated = day.players.find((player) => player.cardId);
  const myCard =
    cardHref ??
    (seated?.cardId ? gameDayCardPath(day.id, seated.cardId) : gameDayBoardPath(day.id));

  async function copy(kind: "invite" | "watch" | "organiser", value: string) {
    const ok = await copyText(value);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    }
  }

  async function moreOptions() {
    const url = inviteUrl || invitePath;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shown.headline, text: "Join the game day", url });
        return;
      } catch {
        return;
      }
    }
    await copy("invite", url);
  }

  return (
    <>
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col pb-[6.75rem] lg:hidden">
      <div className="gd-phone">
      <div className="flex-1 px-5 pt-4">
        <div className="flex h-10 items-center justify-between">
          <Link href="/play/golf" className="inline-flex items-center gap-0.5 text-sm font-semibold text-zinc-950">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Game day
          </Link>
          <span className="text-sm font-semibold text-zinc-950">Ready to share</span>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[#3dff8a]">
            <Check className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006045]">
              Stroke play · {day.defaultTee} tee
            </p>
            <h1 className="mt-1 font-display text-[34px] leading-none tracking-wide text-zinc-950">{shown.headline}</h1>
          </div>
        </div>

        <h2 className="mt-2 text-base font-bold text-zinc-950">Join · for players</h2>
        <section className="mt-3 rounded-2xl border border-zinc-300 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-950">Join code</p>
              <p className="mt-1 font-display text-[52px] leading-none !tracking-[0.12em] text-zinc-950">{day.inviteCode}</p>
            </div>
            <p className="pb-1 text-right text-sm font-normal leading-snug text-zinc-950">
              leaguesports.co.za
              <span className="block">/g/{day.inviteCode}</span>
            </p>
          </div>
          <a href={whatsAppShareUrl(shareText)} className={`${primaryLinkClass} mt-4`}>
            <MessageCircle className="h-5 w-5" aria-hidden />
            Share on WhatsApp
          </a>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => copy("invite", inviteUrl || invitePath)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-950"
            >
              <Copy className="h-4 w-4" aria-hidden />
              {copied === "invite" ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => void moreOptions()}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-950"
            >
              More options
            </button>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-950">Watch link</h2>
            <span className="rounded-full bg-[#3dff8a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
              New
            </span>
            <span className="ml-auto text-xs text-zinc-600">view only</span>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-zinc-300 bg-zinc-100 px-3 py-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
              <Eye className="h-5 w-5 text-zinc-950" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-950">Watch link · view only</p>
              <p className="mt-0.5 break-all text-xs text-zinc-600">leaguesports.co.za/w/{day.watchToken}</p>
            </div>
            <button
              type="button"
              onClick={() => copy("watch", watchUrl || watchPath)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-950"
            >
              <Copy className="h-4 w-4" aria-hidden />
              {copied === "watch" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {organiserToken ? (
          <section className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-950">Save your organiser link</h2>
              <span className="ml-auto text-xs text-zinc-600">organiser only</span>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-zinc-300 bg-zinc-100 px-3 py-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <Link2 className="h-5 w-5 text-zinc-950" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-950">Organiser link</p>
                <p className="mt-0.5 truncate text-xs text-zinc-600">leaguesports.co.za{organiserPath}</p>
              </div>
              <button
                type="button"
                onClick={() => copy("organiser", organiserUrl || organiserPath)}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-950"
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copied === "organiser" ? "Copied" : "Copy"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-bold text-zinc-950">Players added</h2>
            <span className="flex items-center gap-3">
              {onSavePlayer ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing((open) => !open);
                    setDrafts(
                      Object.fromEntries(
                        day.players.map((player) => [
                          player.id,
                          {
                            displayName: player.displayName,
                            handicap: player.handicapIndex == null ? "" : String(player.handicapIndex),
                            teeName: player.teeName,
                          },
                        ]),
                      ),
                    );
                    setEditError(null);
                  }}
                  className="text-sm font-semibold text-zinc-950"
                >
                  {editing ? "Done" : "Edit"}
                </button>
              ) : null}
              <span className="text-sm font-semibold text-zinc-700">{day.players.length} names</span>
            </span>
          </div>
          {editing && onSavePlayer ? (
            <ul className="mt-3 space-y-3">
              {day.players.map((player) => {
                const draft = drafts[player.id] ?? {
                  displayName: player.displayName,
                  handicap: player.handicapIndex == null ? "" : String(player.handicapIndex),
                  teeName: player.teeName,
                };
                return (
                  <li key={player.id} className="rounded-2xl border border-zinc-300 px-3 py-3">
                    <label className="block text-sm font-semibold text-zinc-950">
                      Name
                      <input
                        value={draft.displayName}
                        aria-label={`Name for ${player.displayName}`}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [player.id]: { ...draft, displayName: event.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-base font-medium text-zinc-950"
                      />
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="block text-sm font-semibold text-zinc-950">
                        Handicap
                        <input
                          value={draft.handicap}
                          inputMode="decimal"
                          aria-label={`Handicap for ${player.displayName}`}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [player.id]: { ...draft, handicap: event.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-base font-medium text-zinc-950"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-zinc-950">
                        Tee
                        <select
                          value={draft.teeName}
                          aria-label={`Tee for ${player.displayName}`}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [player.id]: { ...draft, teeName: event.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-base font-medium text-zinc-950"
                        >
                          {day.teeOptions.map((tee) => (
                            <option key={tee} value={tee}>
                              {tee}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <button
                      type="button"
                      disabled={savingId === player.id}
                      onClick={() => {
                        const handicap = draft.handicap.trim();
                        const parsed = handicap === "" ? null : Number(handicap);
                        if (parsed != null && Number.isNaN(parsed)) {
                          setEditError("Handicap needs to be a number.");
                          return;
                        }
                        const body: PatchGameDayPlayerInput = {};
                        if (draft.displayName.trim() && draft.displayName.trim() !== player.displayName) {
                          body.displayName = draft.displayName.trim();
                        }
                        if (draft.teeName !== player.teeName) body.teeName = draft.teeName;
                        if (parsed !== player.handicapIndex) body.handicapIndex = parsed;
                        if (Object.keys(body).length === 0) return;
                        setSavingId(player.id);
                        setEditError(null);
                        onSavePlayer(player.id, body)
                          .catch((cause: unknown) => {
                            setEditError(cause instanceof Error ? cause.message : "Could not save that player.");
                          })
                          .finally(() => setSavingId(null));
                      }}
                      className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-950 disabled:opacity-40"
                    >
                      {savingId === player.id ? "Saving…" : "Save"}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-base font-medium leading-snug text-zinc-950">{rosterLine(day.players)}</p>
          )}
          {editError ? (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {editError}
            </p>
          ) : null}
          <p className="mt-1 text-sm font-medium leading-snug text-zinc-800">
            Friends tap their name, pick a card (max 4) and play. Anyone else taps &quot;Add me&quot;.
          </p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30">
        <div className="mx-auto w-full max-w-[420px] border-t border-zinc-300 bg-white px-5 py-3">
          <Link
            href={myCard}
            className="inline-flex min-h-16 w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-base font-semibold text-zinc-950"
          >
            Go to my card
          </Link>
        </div>
      </div>
      </div>
    </div>
    <DesktopShare
      day={day}
      copied={copied}
      sample={day.id === FIXTURE_DAY_ID}
      onCopy={(kind) => {
        if (kind === "invite") void copy("invite", inviteUrl || invitePath);
        if (kind === "watch") void copy("watch", watchUrl || watchPath);
        if (kind === "organiser") void copy("organiser", organiserUrl || organiserPath);
      }}
    />
    </>
  );
}
