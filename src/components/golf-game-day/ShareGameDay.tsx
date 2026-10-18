"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Copy, Eye, MessageCircle } from "lucide-react";
import type { GameDayCreated, GameDayPlayerSummary } from "@/types/golf-game-day";
import {
  gameDayBoardPath,
  gameDayCardPath,
  gameDayInvitePath,
  gameDayWatchPath,
  presentGameDay,
  whatsAppShareUrl,
} from "@/lib/golf-game-day/paths";
import { useGameDayAction } from "./GameDayChrome";
import { primaryLinkClass } from "./ui";

type ShareGameDayProps = {
  day: GameDayCreated;
  origin?: string;
  cardHref?: string;
};

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
        ? `${player.displayName} (Card ${player.cardNumber}, scoring)`
        : player.displayName,
    )
    .join(", ");
}

export function ShareGameDay({ day, origin = "", cardHref }: ShareGameDayProps) {
  const [copied, setCopied] = useState<"invite" | "watch" | null>(null);
  const shown = presentGameDay(day);
  useGameDayAction("Brandon", "/login", "account");
  const invitePath = gameDayInvitePath(day.inviteCode);
  const watchPath = gameDayWatchPath(day.watchToken);
  const inviteUrl = `${origin}${invitePath}`;
  const watchUrl = `${origin}${watchPath}`;
  const shareText = `Join the game day\n${inviteUrl}`;
  const seated = day.players.find((player) => player.cardId);
  const myCard =
    cardHref ??
    (seated?.cardId ? gameDayCardPath(day.id, seated.cardId) : gameDayBoardPath(day.id));

  async function copy(kind: "invite" | "watch", value: string) {
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
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col">
      <div className="flex-1 px-5 pb-4 pt-4">
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
              <p className="mt-1 font-display text-[52px] leading-none tracking-[0.38em] text-zinc-950">{day.inviteCode}</p>
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

        <section className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-bold text-zinc-950">Players added</h2>
            <span className="text-sm font-semibold text-zinc-700">{day.players.length} names</span>
          </div>
          <p className="mt-2 text-base font-medium leading-snug text-zinc-950">{rosterLine(day.players)}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-zinc-800">
            Friends tap their name, pick a card (max 4) and play. Anyone else taps &quot;Add me&quot;.
          </p>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-zinc-300 bg-white px-5 py-3">
        <Link
          href={myCard}
          className="inline-flex min-h-16 w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-base font-semibold text-zinc-950"
        >
          Go to my card
        </Link>
      </div>
    </div>
  );
}
