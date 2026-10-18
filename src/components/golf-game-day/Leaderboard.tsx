"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import type { BoardTab, GameDayFeedItem, GameDayLeaderboard, RankingRow } from "@/types/golf-game-day";
import {
  boardBadge,
  formatBoardScore,
  formatHandicap,
  formatToPar,
} from "@/lib/golf-game-day/scoring-ui";
import { Eyebrow, GameDayColumn } from "./ui";

const TABS: BoardTab[] = ["gross", "net", "stableford"];

type LeaderboardViewProps = {
  board: GameDayLeaderboard;
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  yourCardHref: string | null;
};

function feedClass(type: string): string {
  if (type === "lead_change") return "font-semibold text-zinc-950";
  if (type === "card_locked") return "text-zinc-500";
  return "text-green-800";
}

function useRowSlide(orderKey: string) {
  const nodes = useRef(new Map<string, HTMLElement>());
  const previous = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    nodes.current.forEach((element, id) => {
      if (element.getClientRects().length === 0) return;
      const top = element.getBoundingClientRect().top;
      const before = previous.current.get(id);
      if (!reduce && before != null && before !== top) {
        element.animate(
          [{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }],
          { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      }
      next.set(id, top);
    });
    previous.current = next;
  }, [orderKey]);
  return (id: string) => (element: HTMLElement | null) => {
    if (element) nodes.current.set(id, element);
    else nodes.current.delete(id);
  };
}

function rowTone(you: boolean): string {
  return you ? "bg-[#e5f6d8]" : "bg-white";
}

export function LeaderboardView({ board, tab, onTab, yourCardHref }: LeaderboardViewProps) {
  const rows = board.rankings[tab];
  const orderKey = rows.map((row) => row.playerId).join("|");
  const bind = useRowSlide(orderKey);
  const badge = boardBadge(board.status, board.access);

  return (
    <GameDayColumn wide>
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-12">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Eyebrow>{board.headline}</Eyebrow>
              <h1 className="mt-2 font-display text-5xl tracking-wide text-zinc-950">
                Leaderboard
              </h1>
            </div>
            <span className="mt-6 inline-flex rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {badge}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {board.cardsConfirmed} of {board.cardsTotal} cards confirmed
          </p>

          <div className="mt-5 flex gap-1 rounded-full bg-zinc-100 p-1" role="tablist" aria-label="Scoring">
            {TABS.map((item) => {
              const selected = item === tab;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onTab(item)}
                  className={
                    selected
                      ? "min-h-10 flex-1 rounded-full bg-zinc-950 text-sm font-semibold capitalize text-white"
                      : "min-h-10 flex-1 rounded-full text-sm font-semibold capitalize text-zinc-600"
                  }
                >
                  {item}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200 xl:hidden">
            {rows.map((row) => (
              <li
                key={row.playerId}
                ref={bind(row.playerId)}
                className={`flex items-center gap-3 px-2 py-3 ${rowTone(row.you)}`}
              >
                <MobileRow row={row} tab={tab} />
              </li>
            ))}
          </ul>

          <table className="mt-4 hidden w-full border-collapse xl:table">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                <th className="py-2 pr-3 font-semibold">Pos</th>
                <th className="py-2 pr-3 font-semibold">Player</th>
                <th className="py-2 pr-3 font-semibold">Thru</th>
                <th className="py-2 pr-3 font-semibold">Gross</th>
                <th className="py-2 pr-3 font-semibold">Net</th>
                <th className="py-2 font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.playerId} ref={bind(`desk-${row.playerId}`)} className={rowTone(row.you)}>
                  <td className="py-3 pr-3 font-semibold tabular-nums text-zinc-950">
                    {row.position ?? "–"}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-zinc-950">
                      {row.displayName}
                      {row.you ? " · You" : ""}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {[formatHandicap(row.handicapIndex), row.countbackNote].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td className="py-3 pr-3 tabular-nums text-zinc-700">{row.thru}</td>
                  <td className="py-3 pr-3 tabular-nums text-zinc-950">
                    {row.gross ?? "–"}
                    <span className="ml-1 text-zinc-500">{formatToPar(row.toPar)}</span>
                  </td>
                  <td className="py-3 pr-3 tabular-nums text-zinc-950">{row.net ?? "–"}</td>
                  <td className="py-3 font-semibold tabular-nums text-green-800">
                    {row.stableford ?? "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {yourCardHref ? (
            <Link href={yourCardHref} className="mt-5 inline-flex text-sm font-semibold text-zinc-950">
              Your card
            </Link>
          ) : null}
        </div>

        <aside className="mt-8 xl:mt-0" aria-label="Live feed">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Live
          </h2>
          <ul className="mt-3 space-y-3">
            {board.feed.length === 0 ? (
              <li className="text-sm text-zinc-500">Scores will show up here.</li>
            ) : (
              board.feed.map((item) => (
                <li key={item.id} className={`text-sm leading-snug ${feedClass(item.type)}`}>
                  <FeedLine item={item} />
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>
    </GameDayColumn>
  );
}

function MobileRow({ row, tab }: { row: RankingRow; tab: BoardTab }) {
  const score = formatBoardScore(tab, row);
  const handicap = formatHandicap(row.handicapIndex);
  return (
    <>
      <span className="w-8 shrink-0 font-semibold tabular-nums text-zinc-950">
        {row.position ?? "–"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-zinc-950">
          {row.displayName}
          {row.you ? " · You" : ""}
        </span>
        <span className="block text-xs text-zinc-500">
          {[handicap, `thru ${row.thru}`, row.countbackNote].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-display text-3xl leading-none text-zinc-950 tabular-nums">
          {score.primary}
        </span>
        {score.suffix ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-green-800">
            {score.suffix}
          </span>
        ) : null}
      </span>
    </>
  );
}

function FeedLine({ item }: { item: GameDayFeedItem }) {
  return <>{item.message}</>;
}
