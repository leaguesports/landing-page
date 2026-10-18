"use client";

import { useState } from "react";
import Link from "next/link";
import type { GameDayCreated } from "@/types/golf-game-day";
import { gameDayBoardPath, gameDayInvitePath, gameDayWatchPath, whatsAppShareUrl } from "@/lib/golf-game-day/paths";
import { Eyebrow, GameDayColumn, primaryLinkClass, ScreenTitle, WhatsAppIcon } from "./ui";

type ShareGameDayProps = {
  day: GameDayCreated;
  origin?: string;
};

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function ShareGameDay({ day, origin = "" }: ShareGameDayProps) {
  const [copied, setCopied] = useState<"invite" | "watch" | null>(null);
  const invitePath = gameDayInvitePath(day.inviteCode);
  const watchPath = gameDayWatchPath(day.watchToken);
  const inviteUrl = `${origin}${invitePath}`;
  const watchUrl = `${origin}${watchPath}`;
  const shareText = `Join the game day\n${inviteUrl}`;

  async function copy(kind: "invite" | "watch", value: string) {
    const ok = await copyText(value);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    }
  }

  return (
    <GameDayColumn>
      <Eyebrow>{day.headline}</Eyebrow>
      <ScreenTitle>Share</ScreenTitle>
      <p className="mt-3 text-sm text-zinc-600">
        {day.venueName} · {day.dateLabel}
      </p>

      <section className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Invite code
        </h2>
        <p className="mt-2 font-display text-6xl tracking-[0.12em] text-zinc-950">
          {day.inviteCode}
        </p>
        <p className="mt-2 break-all text-sm text-zinc-500">g/{day.inviteCode}</p>
        <button
          type="button"
          onClick={() => copy("invite", inviteUrl || invitePath)}
          className="mt-3 text-sm font-semibold text-zinc-950"
        >
          {copied === "invite" ? "Copied" : "Copy link"}
        </button>
      </section>

      <div className="mt-6">
        <a href={whatsAppShareUrl(shareText)} className={primaryLinkClass}>
          <WhatsAppIcon />
          Share on WhatsApp
        </a>
      </div>

      <section className="mt-10 border-t border-zinc-200 pt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Watch link
        </h2>
        <p className="mt-2 break-all text-sm font-semibold text-zinc-950">w/{day.watchToken}</p>
        <button
          type="button"
          onClick={() => copy("watch", watchUrl || watchPath)}
          className="mt-3 text-sm font-semibold text-zinc-950"
        >
          {copied === "watch" ? "Copied" : "Copy watch link"}
        </button>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Anyone with this link can watch. They can&apos;t score.
        </p>
      </section>

      <Link
        href={gameDayBoardPath(day.id)}
        className="mt-8 block text-center text-sm font-semibold text-zinc-950"
      >
        Open leaderboard
      </Link>
    </GameDayColumn>
  );
}
