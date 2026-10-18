"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import type { BoardTab, GameDayFeedItem, GameDayLeaderboard, RankingRow } from "@/types/golf-game-day";
import { johannesburgClock, presentGameDay } from "@/lib/golf-game-day/paths";
import { boardBadge, formatBoardScore, formatHandicap } from "@/lib/golf-game-day/scoring-ui";
import { useGameDayAction } from "./GameDayChrome";
import { Eyebrow, GameDayColumn } from "./ui";

const TABS: BoardTab[] = ["gross", "net", "stableford"];

type LeaderboardViewProps = {
  board: GameDayLeaderboard;
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  yourCardHref: string | null;
};

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

function scoringName(format: string): string {
  if (format === "stroke") return "Stroke play";
  return format;
}

function TabBar({
  tab,
  onTab,
  label,
}: {
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  label: string;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-zinc-100 p-1" role="tablist" aria-label={label}>
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
  );
}

export function LeaderboardView({ board, tab, onTab, yourCardHref }: LeaderboardViewProps) {
  const rows = board.rankings[tab];
  const orderKey = `${tab}:${rows.map((row) => row.playerId).join("|")}`;
  const bind = useRowSlide(orderKey);
  const badge = boardBadge(board.status, board.access);
  const shown = presentGameDay(board);
  const updated = board.updatedLabel || (board.feed[0] ? johannesburgClock(board.feed[0].at) : "");
  const watching = board.access === "watch";
  useGameDayAction(
    watching ? "Watching · view only" : "Sign in",
    watching ? "/" : "/login",
    watching ? "watch" : "default",
  );

  return (
    <>
      <div className="xl:hidden">
        <GameDayColumn wide>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Eyebrow>{shown.headline}</Eyebrow>
              <h1 className="mt-2 font-display text-5xl tracking-wide text-zinc-950">Leaderboard</h1>
            </div>
            <span className="mt-6 inline-flex rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {badge}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {board.cardsConfirmed} of {board.cardsTotal} cards confirmed
          </p>
          <div className="mt-5">
            <TabBar tab={tab} onTab={onTab} label="Scoring" />
          </div>
          <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
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
          {yourCardHref ? (
            <Link href={yourCardHref} className="mt-5 inline-flex text-sm font-semibold text-zinc-950">
              Your card
            </Link>
          ) : null}
        </GameDayColumn>
      </div>

      <div className="mx-auto hidden w-full px-6 py-6 xl:block">
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-700">
              Live leaderboard · {scoringName(board.format)} · {board.venueName}
            </p>
            <h1 className="mt-1 font-display text-6xl tracking-wide text-zinc-950">{shown.headline}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3 pb-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-950">
              <span className="h-2 w-2 rounded-full bg-green-600" aria-hidden />
              {board.status === "final" ? "Final" : "Live"}
            </span>
            {updated ? <span className="text-sm text-zinc-500">Updated {updated}</span> : null}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5">
          <div className="overflow-hidden rounded-2xl border border-zinc-300">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Live leaderboard</caption>
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <th className="py-3 pl-4 pr-2 font-semibold">Pos</th>
                  <th className="px-2 py-3 font-semibold">Move</th>
                  <th className="px-2 py-3 font-semibold">Player</th>
                  <th className="px-2 py-3 font-semibold">Card</th>
                  <th className="px-2 py-3 text-right font-semibold">Thru</th>
                  <th className="px-2 py-3 text-right font-semibold">Gross</th>
                  <th className="px-2 py-3 text-right font-semibold">Net</th>
                  <th className="py-3 pl-2 pr-4 text-right font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <DesktopRow key={row.playerId} row={row} bind={bind(`desk-${row.playerId}`)} />
                ))}
              </tbody>
            </table>
          </div>

          <aside className="min-w-0" aria-label="Live feed">
            <TabBar tab={tab} onTab={onTab} label="Scoring" />
            <div className="mt-4 flex items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950">
                Live feed
                <span className="rounded-full bg-[#C6FF00] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
                  New
                </span>
              </h2>
              <p className="text-xs text-zinc-500">newest first</p>
            </div>
            <ul className="mt-2 overflow-hidden rounded-2xl border border-zinc-300">
              {board.feed.length === 0 ? (
                <li className="px-3 py-3 text-sm text-zinc-500">Scores will show up here.</li>
              ) : (
                board.feed.map((item) => <FeedRow key={item.id} item={item} />)
              )}
            </ul>
            {board.cards.length > 0 ? (
              <ul className="mt-4 overflow-hidden rounded-2xl border border-zinc-300" aria-label="Card sync">
                {board.cards.map((card) => (
                  <li
                    key={card.id}
                    className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2.5 last:border-b-0"
                  >
                    <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                      Card {card.number}
                    </span>
                    <span className="text-sm tabular-nums text-zinc-700">Thru {card.thru}</span>
                    <span className="text-sm font-semibold text-green-800">
                      {card.syncedAt ? `✓ synced ${johannesburgClock(card.syncedAt)}` : "Waiting"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
        </div>

        <footer className="mt-4 flex items-center justify-between gap-4 text-sm text-zinc-500">
          <p>
            {board.countback
              ? `Ties split on countback: ${board.countback} (applied at the finish)`
              : "Ties split on countback at the finish"}
          </p>
          {board.watchLabel ? <p className="shrink-0">Watch: {board.watchLabel}</p> : null}
        </footer>
      </div>
    </>
  );
}

function DesktopRow({
  row,
  bind,
}: {
  row: RankingRow;
  bind: (element: HTMLTableRowElement | null) => void;
}) {
  const leader = row.positionNumber === 1;
  return (
    <tr ref={bind} className={leader ? "bg-[#e5f6d8]" : "bg-white"}>
      <td className="relative border-b border-zinc-200 py-2.5 pl-4 pr-2 font-display text-4xl leading-none tracking-wide text-zinc-950">
        {leader ? <span className="absolute inset-y-0 left-0 w-1 bg-zinc-950" aria-hidden /> : null}
        {row.position ?? "–"}
      </td>
      <td className="border-b border-zinc-200 px-2 py-2.5">
        <MovePill move={row.move} />
      </td>
      <td className="border-b border-zinc-200 px-2 py-2.5 font-semibold text-zinc-950">{row.displayName}</td>
      <td className="border-b border-zinc-200 px-2 py-2.5 tabular-nums text-zinc-700">{row.cardNumber}</td>
      <td className="border-b border-zinc-200 px-2 py-2.5 text-right tabular-nums text-zinc-700">{row.thru}</td>
      <td className="border-b border-zinc-200 px-2 py-2.5 text-right tabular-nums text-zinc-950">
        {row.gross ?? "–"}
      </td>
      <td className="border-b border-zinc-200 px-2 py-2.5 text-right tabular-nums text-zinc-950">
        {row.net ?? "–"}
      </td>
      <td className="border-b border-zinc-200 py-2.5 pl-2 pr-4 text-right font-display text-4xl leading-none tracking-wide text-zinc-950">
        {row.stableford ?? "–"}
      </td>
    </tr>
  );
}

function MovePill({ move }: { move: number | null | undefined }) {
  if (move == null || move === 0) return null;
  if (move > 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
        ▲{move}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
      ▼{Math.abs(move)}
    </span>
  );
}

function MobileRow({ row, tab }: { row: RankingRow; tab: BoardTab }) {
  const score = formatBoardScore(tab, row);
  const handicap = formatHandicap(row.handicapIndex);
  return (
    <>
      <span className="w-8 shrink-0 font-semibold tabular-nums text-zinc-950">{row.position ?? "–"}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-zinc-950">
          {row.displayName}
          {row.you ? (
            <span className="ml-2 rounded-full bg-zinc-950 px-1.5 py-0.5 align-middle font-sans text-[10px] font-semibold uppercase tracking-wide text-white">
              You
            </span>
          ) : null}
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
          <span className="text-[11px] font-semibold uppercase tracking-wide text-green-800">{score.suffix}</span>
        ) : null}
      </span>
    </>
  );
}

function FeedRow({ item }: { item: GameDayFeedItem }) {
  const lead = item.type === "lead_change";
  return (
    <li
      className={`flex items-center gap-3 border-b border-zinc-200 px-3 py-2.5 last:border-b-0 ${lead ? "bg-[#e5f6d8]" : "bg-white"}`}
    >
      <FeedMark item={item} />
      <p className={`min-w-0 flex-1 text-sm leading-snug ${lead ? "font-semibold text-zinc-950" : "text-zinc-800"}`}>
        {item.message}
      </p>
      <time className="shrink-0 text-xs tabular-nums text-zinc-500" dateTime={item.at}>
        {johannesburgClock(item.at)}
      </time>
    </li>
  );
}

function FeedMark({ item }: { item: GameDayFeedItem }) {
  if (item.type === "lead_change") {
    return (
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-green-800" aria-hidden>
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
          <path d="M10 1.6l2.2 4.7 5.1.5-3.8 3.5 1.1 5.1L10 13.1 5.4 15.4l1.1-5.1L2.7 6.8l5.1-.5L10 1.6z" />
        </svg>
      </span>
    );
  }
  if (item.type === "birdie") {
    return (
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-800 text-xs font-semibold text-white">
        B
      </span>
    );
  }
  if (item.type === "thru") {
    return (
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-200 text-xs font-semibold text-zinc-950">
        {item.holeNumber ?? "·"}
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-semibold text-zinc-500">
      ✓
    </span>
  );
}
