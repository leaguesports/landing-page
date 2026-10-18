"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Flag, Link2, MessageCircle } from "lucide-react";
import type { BoardTab, GameDayLeaderboard, RankingRow } from "@/types/golf-game-day";
import { gameDayBoardPath, presentGameDay, whatsAppShareUrl } from "@/lib/golf-game-day/paths";
import {
  defaultBoardTab,
  GAME_DAY_COURSE_PAR,
  resultShareText,
  resultsRowDetail,
  resultsTiebreakLine,
  resultsToParCell,
  resultsWinnerLine,
} from "@/lib/golf-game-day/scoring-ui";
import { useGameDayAction } from "./GameDayChrome";
import { GameDayColumn, primaryLinkClass } from "./ui";

type ResultsViewProps = {
  board: GameDayLeaderboard;
  weekendHref: string | null;
};

const TABS: BoardTab[] = ["gross", "net", "stableford"];

export function ResultsView({ board, weekendHref }: ResultsViewProps) {
  const [tab, setTab] = useState<BoardTab>(() => defaultBoardTab(board));
  const shown = presentGameDay(board);
  useGameDayAction("Brandon", "/login", "account");
  const rows = board.rankings[tab];
  const winner = rows.find((row) => row.positionNumber === 1) ?? rows[0] ?? null;
  const tiebreak = board.countbackApplied ? resultsTiebreakLine(rows, tab) : null;
  const countbackWon = tiebreak != null && tab !== "stableford";
  const line = winner
    ? resultsWinnerLine({
        tab,
        row: winner,
        coursePar: GAME_DAY_COURSE_PAR,
        countbackApplied: countbackWon,
      })
    : "";
  const shareText = winner
    ? resultShareText({
        name: winner.displayName,
        headline: shown.headline,
        score: line,
        line: winner.countbackNote ?? "",
      })
    : shown.headline;

  return (
    <GameDayColumn>
      <div className="flex h-10 items-center justify-between">
        <Link href={gameDayBoardPath(board.gameDayId)} className="inline-flex items-center gap-0.5 text-sm font-semibold text-zinc-950">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Game day
        </Link>
        <span className="text-sm font-semibold text-zinc-950">Results</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006045]">Final</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#3dff8a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
          <Check className="h-3 w-3" aria-hidden />
          {board.cardsConfirmed}/{board.cardsTotal} cards confirmed
        </span>
      </div>
      <h1 className="mt-3 font-display text-[42px] leading-none tracking-wide text-zinc-950">{shown.headline}</h1>

      <article className="mt-4 rounded-3xl bg-zinc-950 px-5 py-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C6FF00]">
          🏆 Winner · {tab}
        </p>
        <h2 className="mt-2 font-display text-6xl leading-[0.72] tracking-wide text-white">
          {winner?.displayName ?? "No winner yet"}
        </h2>
        <p className="mt-2 text-lg leading-tight text-white">{line}</p>
        {tiebreak ? <p className="mt-1 text-sm text-zinc-400">{tiebreak}</p> : null}
      </article>

      <div className="mt-5 flex gap-1 rounded-full border border-zinc-300 bg-white p-1" role="tablist" aria-label="Result">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={item === tab}
            onClick={() => setTab(item)}
            className={
              item === tab
                ? "min-h-10 flex-1 rounded-full bg-zinc-950 text-sm font-semibold capitalize text-white"
                : "min-h-10 flex-1 rounded-full text-sm font-semibold capitalize text-zinc-800"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-300">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-100 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              <th className="py-2 pr-2 font-semibold">Pos</th>
              <th className="py-2 pr-2 font-semibold">Player</th>
              <th className="py-2 pr-2 text-right font-semibold">
                {tab === "stableford" ? "Pts" : "To par"}
              </th>
              <th className="py-2 pr-2 text-right font-semibold">Net</th>
              <th className="py-2 text-right font-semibold">Gross</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ResultRow key={row.playerId} row={row} rows={rows} tab={tab} />
            ))}
          </tbody>
        </table>
      </div>

      {board.countback ? (
        <p className="mt-2 flex items-start gap-2 text-sm text-zinc-500">
          <Flag className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Ties split on countback: {board.countback}
        </p>
      ) : null}

      <a href={whatsAppShareUrl(shareText)} className={`${primaryLinkClass} mt-3`}>
        <MessageCircle className="h-5 w-5" aria-hidden />
        Share results
      </a>

      <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-zinc-300 px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-zinc-950" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-zinc-950">Add to weekend event</p>
            <p className="mt-1 text-sm text-zinc-800">Optional. Link with Sunday for one combined board.</p>
          </div>
        </div>
        {weekendHref ? (
          <a
            href={weekendHref}
            className="inline-flex shrink-0 items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-950"
          >
            Add
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex shrink-0 items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-40"
          >
            Add
          </button>
        )}
      </section>
    </GameDayColumn>
  );
}

function ResultRow({
  row,
  rows,
  tab,
}: {
  row: RankingRow;
  rows: RankingRow[];
  tab: BoardTab;
}) {
  const cell = resultsToParCell(tab, row, GAME_DAY_COURSE_PAR);
  const detail = resultsRowDetail(row, rows, tab);
  return (
    <tr className="border-b border-zinc-200">
      <td className="py-2 pr-2 font-semibold tabular-nums text-zinc-950">{row.position ?? "–"}</td>
      <td className="py-2 pr-2">
        <span className="font-bold text-zinc-950">
          {row.displayName}
          {row.you ? (
            <span className="ml-2 rounded-full bg-zinc-950 px-1.5 py-0.5 align-middle font-sans text-[10px] font-semibold uppercase tracking-wide text-white">
              You
            </span>
          ) : null}
        </span>
        {detail ? <span className="mt-0.5 block text-xs text-zinc-500">{detail}</span> : null}
      </td>
      <td
        className={`py-2 pr-2 text-right font-display text-3xl leading-none tabular-nums ${cell.under ? "text-green-800" : "text-zinc-950"}`}
      >
        {cell.text}
      </td>
      <td className="py-2 pr-2 text-right tabular-nums text-zinc-950">{row.net ?? "–"}</td>
      <td className="py-2 text-right tabular-nums text-zinc-950">{row.gross ?? "–"}</td>
    </tr>
  );
}
