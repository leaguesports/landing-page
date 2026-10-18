"use client";

import { useState } from "react";
import type { BoardTab, GameDayLeaderboard } from "@/types/golf-game-day";
import {
  formatBoardScore,
  formatHandicap,
  resultShareText,
  winnerHero,
} from "@/lib/golf-game-day/scoring-ui";
import { whatsAppShareUrl } from "@/lib/golf-game-day/paths";
import { Eyebrow, GameDayColumn, primaryLinkClass } from "./ui";

type ResultsViewProps = {
  board: GameDayLeaderboard;
  weekendHref: string | null;
  holesPlayed?: number;
};

export function ResultsView({ board, weekendHref, holesPlayed = 18 }: ResultsViewProps) {
  const [tab, setTab] = useState<BoardTab>("gross");
  const rows = board.rankings[tab];
  const winner = rows.find((row) => row.positionNumber === 1) ?? null;
  const hero = winner ? winnerHero(tab, winner, holesPlayed) : null;
  const shareText = winner && hero
    ? resultShareText({
        name: winner.displayName,
        headline: board.headline,
        score: hero.score,
        line: hero.line,
      })
    : board.headline;

  return (
    <GameDayColumn>
      <article className="-mx-5 bg-zinc-950 px-6 py-10 text-white">
        <Eyebrow>
          <span className="text-zinc-400">{board.headline}</span>
        </Eyebrow>
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Winner
        </p>
        <h1 className="mt-2 font-display text-6xl tracking-wide text-white">
          {winner?.displayName ?? "No winner yet"}
        </h1>
        <p className="mt-4 font-display text-8xl leading-none text-[#C6FF00]">
          {hero?.score ?? "–"}
        </p>
        <p className="mt-2 text-2xl text-white">{hero?.line}</p>
        <p className="mt-3 text-sm text-zinc-400">{hero?.caption}</p>
      </article>

      <div className="mt-5 flex gap-1 rounded-full bg-zinc-100 p-1" role="tablist" aria-label="Result">
        {(["gross", "net", "stableford"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={item === tab}
            onClick={() => setTab(item)}
            className={
              item === tab
                ? "min-h-10 flex-1 rounded-full bg-zinc-950 text-sm font-semibold capitalize text-white"
                : "min-h-10 flex-1 rounded-full text-sm font-semibold capitalize text-zinc-600"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
        {rows.map((row) => {
          const score = formatBoardScore(tab, row);
          return (
            <li key={row.playerId} className="flex items-center gap-3 py-3">
              <span className="w-8 font-semibold tabular-nums">{row.position ?? "–"}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{row.displayName}</span>
                <span className="block text-xs text-zinc-500">
                  {formatHandicap(row.handicapIndex)}
                </span>
              </span>
              <span className="text-right font-display text-3xl leading-none tabular-nums">
                {score.primary}
                {score.suffix ? (
                  <span className="ml-1 font-sans text-[11px] font-semibold uppercase text-green-800">
                    {score.suffix}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>

      <a href={whatsAppShareUrl(shareText)} className={`${primaryLinkClass} mt-8`}>
        Share result
      </a>
      {weekendHref ? (
        <a href={weekendHref} className="mt-4 block text-center text-sm font-semibold text-zinc-950">
          Weekend leaderboard
        </a>
      ) : null}
    </GameDayColumn>
  );
}
