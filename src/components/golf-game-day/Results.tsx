"use client";

import { useState } from "react";
import type { BoardTab, GameDayLeaderboard, RankingRow } from "@/types/golf-game-day";
import { presentGameDay, whatsAppShareUrl } from "@/lib/golf-game-day/paths";
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
import { GameDayColumn, primaryLinkClass, WhatsAppIcon } from "./ui";

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
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Final</p>
        <span className="rounded-full border border-zinc-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
          ✓ {board.cardsConfirmed}/{board.cardsTotal} cards confirmed
        </span>
      </div>
      <h1 className="mt-3 font-display text-5xl tracking-wide text-zinc-950">{shown.dateLabel}</h1>

      <article className="mt-5 rounded-3xl bg-zinc-950 px-5 py-6 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C6FF00]">
          🏆 Winner · {tab}
        </p>
        <h2 className="mt-3 font-display text-6xl tracking-wide text-white">
          {winner?.displayName ?? "No winner yet"}
        </h2>
        <p className="mt-3 text-lg text-white">{line}</p>
        {tiebreak ? <p className="mt-2 text-sm text-zinc-400">{tiebreak}</p> : null}
      </article>

      <div className="mt-5 flex gap-1 rounded-full bg-zinc-100 p-1" role="tablist" aria-label="Result">
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
                : "min-h-10 flex-1 rounded-full text-sm font-semibold capitalize text-zinc-600"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
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
        <p className="mt-4 text-sm text-zinc-500">Ties split on countback: {board.countback}</p>
      ) : null}

      <a href={whatsAppShareUrl(shareText)} className={`${primaryLinkClass} mt-6`}>
        <WhatsAppIcon />
        Share results
      </a>

      <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-zinc-300 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-zinc-950">Add to weekend event</p>
          <p className="mt-1 text-sm text-zinc-500">Keep this round on the weekend board.</p>
        </div>
        {weekendHref ? (
          <a
            href={weekendHref}
            className="inline-flex shrink-0 items-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex shrink-0 items-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
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
      <td className="py-3 pr-2 font-semibold tabular-nums text-zinc-950">{row.position ?? "–"}</td>
      <td className="py-3 pr-2">
        <span className="font-semibold text-zinc-950">
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
        className={`py-3 pr-2 text-right font-display text-3xl leading-none tabular-nums ${cell.under ? "text-green-800" : "text-zinc-950"}`}
      >
        {cell.text}
      </td>
      <td className="py-3 pr-2 text-right tabular-nums text-zinc-950">{row.net ?? "–"}</td>
      <td className="py-3 text-right tabular-nums text-zinc-950">{row.gross ?? "–"}</td>
    </tr>
  );
}
