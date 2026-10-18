"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Eye, Flag, Star } from "lucide-react";
import type { BoardTab, GameDayFeedItem, GameDayLeaderboard, RankingRow } from "@/types/golf-game-day";
import { johannesburgClock, presentGameDay } from "@/lib/golf-game-day/paths";
import {
  formatHandicap,
  LEAD_DOT_HALF_MS,
  LEAD_SLIDE_MS,
  leadChangePlan,
  netToPar,
  signedScore,
} from "@/lib/golf-game-day/scoring-ui";
import { useGameDayAction } from "./GameDayChrome";

const TABS: BoardTab[] = ["gross", "net", "stableford"];

/** Pos, move, player, score, thru. Move has no header label. */
const PHONE_GRID = "grid grid-cols-[2.25rem_2.5rem_minmax(0,1fr)_2.2rem_2rem] gap-1";

type LeaderboardViewProps = {
  board: GameDayLeaderboard;
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  yourCardHref: string | null;
  /** Phone mockups stay a column. Desktop is the 1280 board. Responsive follows the viewport. */
  layout?: "phone" | "desktop" | "responsive";
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
          { duration: LEAD_SLIDE_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
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

function scoringName(format: string): string {
  if (format === "stroke") return "Stroke play";
  return format;
}

function TabBar({
  tab,
  onTab,
  label,
  large = false,
  boxed = false,
}: {
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  label: string;
  large?: boolean;
  boxed?: boolean;
}) {
  const height = large ? "h-[38px] text-[15px]" : "min-h-10 text-sm";
  const track = large
    ? "flex w-full gap-0 pr-1.5"
    : boxed
      ? "flex gap-1 rounded-full border border-zinc-300 bg-white p-1"
      : "flex gap-1 rounded-full bg-zinc-100 p-1";
  return (
    <div
      className={track}
      role="tablist"
      aria-label={label}
    >
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
                ? `${height} flex-1 rounded-full bg-zinc-950 font-semibold capitalize text-white`
                : `${height} flex-1 rounded-full font-semibold capitalize ${large || boxed ? "text-zinc-800" : "text-zinc-600"}`
            }
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export function LeaderboardView({
  board,
  tab,
  onTab,
  yourCardHref,
  layout = "responsive",
}: LeaderboardViewProps) {
  const rows = board.rankings[tab];
  const orderKey = `${tab}:${rows.map((row) => row.playerId).join("|")}`;
  const bind = useRowSlide(orderKey);
  const shown = presentGameDay(board);
  const updated = board.updatedLabel || (board.feed[0] ? johannesburgClock(board.feed[0].at) : "");
  const watching = board.access === "watch";
  const desktopChrome = layout === "desktop";
  const [blink, setBlink] = useState(false);
  const previousIds = useRef<string[] | null>(null);
  useEffect(() => {
    const nextIds = rows.map((row) => row.playerId);
    const previous = previousIds.current;
    previousIds.current = nextIds;
    if (!previous) return;
    const plan = leadChangePlan(previous, nextIds);
    if (!plan.blinkMs) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setBlink(true);
    const timer = window.setTimeout(() => setBlink(false), plan.blinkMs);
    return () => window.clearTimeout(timer);
  }, [orderKey, rows]);
  useGameDayAction(
    desktopChrome ? "Watching · view only" : watching ? "Watching" : "Score",
    watching || desktopChrome ? "/" : yourCardHref || "/golf/game-day/preview/score",
    desktopChrome || watching ? "watch" : "default",
    desktopChrome,
  );
  const phoneClass = layout === "desktop" ? "hidden" : layout === "responsive" ? "xl:hidden" : "";
  const desktopClass = layout === "phone" ? "hidden" : layout === "responsive" ? "hidden xl:block" : "";

  return (
    <>
      <style>{`@keyframes gameday-dot{0%,49%{background:#3dff8a}50%,100%{background:#14532d}}.gameday-dot-blink{animation:gameday-dot ${LEAD_DOT_HALF_MS * 2}ms steps(1,end) infinite}@media (prefers-reduced-motion:reduce){.gameday-dot-blink{animation:none}}`}</style>
      <div className={phoneClass}>
        {watching ? (
          <SpectatorPhone
            board={board}
            rows={rows}
            tab={tab}
            onTab={onTab}
            updated={updated}
            blink={blink}
            bind={bind}
            headline={shown.headline}
          />
        ) : (
          <div className="mx-auto w-full max-w-[420px] overflow-x-hidden px-4 pb-10 pt-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-950 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                <span className={`h-2 w-2 rounded-full bg-[#3dff8a] ${blink ? "gameday-dot-blink" : ""}`} aria-hidden />
                Live
              </span>
              {updated ? <p className="text-sm text-zinc-500">Updated {updated}</p> : null}
            </div>
            <h1 className="mt-3 font-display text-[42px] leading-none tracking-wide text-zinc-950">{shown.headline}</h1>
            <div className="mt-4">
              <TabBar tab={tab} onTab={onTab} label="Scoring" />
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-300">
              <div className={`${PHONE_GRID} bg-zinc-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500`}>
                <span>Pos</span>
                <span className="sr-only">Move</span>
                <span>Player</span>
                <span className="text-right">{tab === "stableford" ? "Pts" : "To par"}</span>
                <span className="text-right">Thru</span>
              </div>
              <ul>
                {rows.map((row) => (
                  <li
                    key={row.playerId}
                    ref={bind(row.playerId)}
                    className={`relative ${PHONE_GRID} items-center border-b border-zinc-200 px-2 py-2.5 last:border-b-0 ${row.positionNumber === 1 ? "bg-[#e9fff1]" : "bg-white"}`}
                  >
                    {row.positionNumber === 1 ? (
                      <span className="absolute inset-y-0 left-0 w-1 bg-zinc-950" aria-hidden />
                    ) : null}
                    <MobileRow row={row} tab={tab} />
                  </li>
                ))}
              </ul>
            </div>
            {board.countback ? (
              <p className="mt-4 flex items-start gap-2 text-sm text-zinc-500">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Ties split on countback: {board.countback}
              </p>
            ) : null}
            <div className="mt-5">
              <FeedBlock board={board} showCards={false} hideThru />
            </div>
          </div>
        )}
      </div>

      <div className={`mx-auto w-full px-10 py-5 ${desktopClass}`}>
        <div className="flex items-start justify-between gap-7">
          <div className="min-w-0 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#006045]">
              Live leaderboard · {scoringName(board.format)} · {board.venueName}
            </p>
            <h1 className="mt-3 font-display text-[60px] leading-none tracking-wide text-zinc-950">{shown.headline}</h1>
          </div>
          <div className="flex w-[396px] shrink-0 flex-col gap-5">
            <div className="flex items-center justify-end gap-3.5">
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-950 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                <span
                  className={`h-2 w-2 rounded-full bg-[#3dff8a] ${blink ? "gameday-dot-blink" : ""}`}
                  aria-hidden
                />
                {board.status === "final" ? "Final" : "Live"}
              </span>
              {updated ? <span className="text-[15px] font-medium text-zinc-800">Updated {updated}</span> : null}
            </div>
            <TabBar tab={tab} onTab={onTab} label="Scoring" large />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-7">
          <div className="overflow-hidden rounded-xl border border-zinc-300">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">Live leaderboard</caption>
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[6.4%]" />
                <col className="w-[23%]" />
                <col className="w-[14.5%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[14.1%]" />
              </colgroup>
              <thead>
                <tr className="h-10 border-b border-zinc-200 bg-zinc-100 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <th className="pl-8 pr-2 text-left font-semibold">Pos</th>
                  <th className="px-2 text-left font-semibold">Move</th>
                  <th className="px-2 text-left font-semibold">Player</th>
                  <th className="px-2 text-left font-semibold">Card</th>
                  <th className="px-2 text-right font-semibold">Thru</th>
                  <th className="px-2 text-right font-semibold">Gross</th>
                  <th className="px-2 text-right font-semibold">Net</th>
                  <th className="pl-2 pr-6 text-right font-semibold">Pts</th>
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
            <FeedBlock board={board} large />
          </aside>
        </div>

        <footer className="mt-4 flex items-center justify-between gap-4 text-sm text-zinc-500">
          <p className="flex items-center gap-2">
            <Flag className="h-4 w-4 shrink-0" aria-hidden />
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
    <tr ref={bind} className={`h-[50px] ${leader ? "bg-[#e9fff1]" : "bg-white"}`}>
      <td className="relative border-b border-zinc-200 pl-8 pr-2 font-display text-[32px] leading-none tracking-wide text-zinc-950">
        {leader ? <span className="absolute inset-y-0 left-0 w-[5px] bg-zinc-950" aria-hidden /> : null}
        {row.position ?? "–"}
      </td>
      <td className="border-b border-zinc-200 px-2">
        <MovePill move={row.move} />
      </td>
      <td className="border-b border-zinc-200 px-2 text-[15px] font-bold text-zinc-950">{row.displayName}</td>
      <td className="border-b border-zinc-200 px-2 text-[15px] whitespace-nowrap text-zinc-700">
        Card {row.cardNumber}
      </td>
      <td className="border-b border-zinc-200 px-2 text-right text-[15px] tabular-nums text-zinc-700">{row.thru}</td>
      <td className="border-b border-zinc-200 px-2 text-right text-[15px] tabular-nums text-zinc-950">
        {row.gross ?? "–"}
      </td>
      <td className="border-b border-zinc-200 px-2 text-right text-[15px] tabular-nums text-zinc-950">
        {row.net ?? "–"}
      </td>
      <td className="border-b border-zinc-200 pl-2 pr-6 text-right font-display text-[36px] leading-none tracking-wide text-zinc-950">
        {row.stableford ?? "–"}
      </td>
    </tr>
  );
}

function MovePill({ move, compact = false }: { move: number | null | undefined; compact?: boolean }) {
  if (move == null || move === 0) return null;
  if (move > 0) {
    const size = compact ? "px-1 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
    return (
      <span className={`inline-flex items-center rounded-full bg-[#3dff8a] font-semibold text-zinc-950 ${size}`}>
        ▲{move}
      </span>
    );
  }
  return (
    <span className={`font-semibold text-red-700 ${compact ? "text-[11px]" : "text-xs"}`}>▼{Math.abs(move)}</span>
  );
}

function MobileRow({ row, tab }: { row: RankingRow; tab: BoardTab }) {
  const handicap = formatHandicap(row.handicapIndex);
  const score =
    tab === "stableford"
      ? row.stableford == null
        ? "–"
        : String(row.stableford)
      : tab === "gross"
        ? signedScore(row.toPar)
        : signedScore(netToPar(row));
  return (
    <>
      <span className="font-display text-2xl leading-none text-zinc-950">{row.position ?? "–"}</span>
      <span className="flex items-center">
        <MovePill move={row.move} compact />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-zinc-950">
          {row.displayName}
          {row.you ? (
            <span className="ml-1.5 rounded-full bg-zinc-950 px-1.5 py-0.5 align-middle font-sans text-[10px] font-semibold uppercase tracking-wide text-white">
              You
            </span>
          ) : null}
        </span>
        <span className="block truncate text-[11px] text-zinc-500">
          Card {row.cardNumber} · {handicap ?? "no hcp"}
        </span>
      </span>
      <span className="text-right font-display text-2xl leading-none text-zinc-950 tabular-nums">{score}</span>
      <span className="text-right text-sm tabular-nums text-zinc-700">{row.thru}</span>
    </>
  );
}

function FeedBlock({
  board,
  showCards = true,
  hideThru = false,
  large = false,
}: {
  board: GameDayLeaderboard;
  showCards?: boolean;
  hideThru?: boolean;
  large?: boolean;
}) {
  const feed = hideThru ? board.feed.filter((item) => item.type !== "thru") : board.feed;
  const copy = large ? "text-[15px]" : "text-sm";
  return (
    <>
      <div className={`flex items-center justify-between gap-2 ${large ? "" : "mt-4"}`}>
        <h2 className={`inline-flex items-center gap-2 font-semibold text-zinc-950 ${large ? "text-base" : "text-sm"}`}>
          Live feed
          <span className="rounded-full bg-[#3dff8a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
            New
          </span>
        </h2>
        <p className="text-xs text-zinc-500">newest first</p>
      </div>
      <ul className={`overflow-hidden rounded-2xl border border-zinc-300 ${large ? "mt-2.5" : "mt-2"}`}>
        {feed.length === 0 ? (
          <li className="px-3 py-3 text-sm text-zinc-500">Scores will show up here.</li>
        ) : (
          feed.map((item) => <FeedRow key={item.id} item={item} large={large} />)
        )}
      </ul>
      {showCards && board.cards.length > 0 ? (
        <ul
          className={
            large
              ? "mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 py-2.5"
              : "mt-4 overflow-hidden rounded-2xl border border-zinc-300"
          }
          aria-label="Card sync"
        >
          {board.cards.map((card) => (
            <li
              key={card.id}
              className={
                large
                  ? "flex h-[38px] items-center gap-3 px-4"
                  : "flex items-center gap-3 border-b border-zinc-200 px-3 py-2.5 last:border-b-0"
              }
            >
              <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Card {card.number}
              </span>
              <span className={`tabular-nums text-zinc-700 ${copy}`}>Thru {card.thru}</span>
              <span className={`ml-auto font-semibold text-green-800 ${copy}`}>
                {card.syncedAt ? `✓ synced ${johannesburgClock(card.syncedAt)}` : "Waiting"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function FeedMessage({ item }: { item: GameDayFeedItem }) {
  const name = item.playerName ?? item.leaderName ?? null;
  if (!name) return item.message;
  const at = item.message.indexOf(name);
  if (at < 0) return item.message;
  return (
    <>
      {item.message.slice(0, at)}
      <span className="font-bold text-zinc-950">{name}</span>
      {item.message.slice(at + name.length)}
    </>
  );
}

function FeedRow({ item, large = false }: { item: GameDayFeedItem; large?: boolean }) {
  const lead = item.type === "lead_change";
  return (
    <li
      className={`relative flex gap-3 border-b border-zinc-200 last:border-b-0 ${large ? "h-[50px] items-center px-4" : "items-start px-3 py-2.5"} ${lead ? "bg-[#e9fff1]" : "bg-white"}`}
    >
      {lead ? <span className="absolute inset-y-0 left-0 w-1 bg-zinc-950" aria-hidden /> : null}
      <FeedMark item={item} large={large} />
      <p className={`min-w-0 flex-1 leading-snug ${large ? "text-[15px]" : "text-sm"} ${lead ? "font-medium text-zinc-950" : "text-zinc-800"}`}>
        <FeedMessage item={item} />
      </p>
      <time
        className={`shrink-0 text-right tabular-nums text-zinc-500 ${large ? "text-sm" : "text-xs"}`}
        dateTime={item.at}
      >
        {johannesburgClock(item.at)}
      </time>
    </li>
  );
}

function SpectatorPhone({
  board,
  rows,
  tab,
  onTab,
  updated,
  blink,
  bind,
  headline,
}: {
  board: GameDayLeaderboard;
  rows: RankingRow[];
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  updated: string;
  blink: boolean;
  bind: (id: string) => (element: HTMLElement | null) => void;
  headline: string;
}) {
  const players = rows.length;
  const cards = board.cardsTotal;
  return (
    <div className="mx-auto w-full max-w-[420px] pb-10">
      <div className="flex items-center gap-2 bg-[#3dff8a] px-4 py-2.5 text-sm font-semibold text-zinc-950">
        <Eye className="h-4 w-4 shrink-0" aria-hidden />
        View only · you can&apos;t enter or change scores
      </div>
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-950 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            <span className={`h-2 w-2 rounded-full bg-[#3dff8a] ${blink ? "gameday-dot-blink" : ""}`} aria-hidden />
            Live
          </span>
          {updated ? <p className="text-sm font-medium text-zinc-950">Updated {updated} · refreshes itself</p> : null}
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006045]">
          {scoringName(board.format)} · {players} players · {cards} cards
        </p>
        <h1 className="mt-1 font-display text-[42px] leading-none tracking-wide text-zinc-950">{headline}</h1>

        <section className="mt-5" aria-label="Latest">
          <h2 className="text-sm font-semibold text-zinc-950">Latest</h2>
          <ul className="mt-2 overflow-hidden rounded-2xl border border-zinc-300">
            {board.feed.slice(0, 3).map((item) => (
              <FeedRow key={item.id} item={item} />
            ))}
          </ul>
        </section>

        <div className="mt-4">
          <TabBar tab={tab} onTab={onTab} label="Scoring" boxed />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-300">
          <div className="grid grid-cols-[2.4rem_minmax(0,1fr)_3.2rem_2.4rem] gap-2 border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            <span>Pos</span>
            <span>Player</span>
            <span className="text-right">{tab === "stableford" ? "Pts" : "To par"}</span>
            <span className="text-right">Thru</span>
          </div>
          <ul>
            {rows.map((row) => {
              const cell = spectatorCell(tab, row);
              return (
                <li
                  key={row.playerId}
                  ref={bind(row.playerId)}
                  className="grid grid-cols-[2.4rem_minmax(0,1fr)_3.2rem_2.4rem] items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 last:border-b-0"
                >
                  <span className="font-display text-[22px] leading-none text-zinc-950">{row.position ?? "–"}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-zinc-950">{row.displayName}</span>
                    <span className="block text-xs text-zinc-500">
                      Card {row.cardNumber} · {formatHandicap(row.handicapIndex) ?? "no hcp"}
                    </span>
                  </span>
                  <span
                    className={`text-right font-display text-3xl leading-none tabular-nums ${cell.under ? "text-green-800" : "text-zinc-950"}`}
                  >
                    {cell.text}
                  </span>
                  <span className="text-right text-sm tabular-nums text-zinc-700">{row.thru}</span>
                </li>
              );
            })}
          </ul>
        </div>
        {board.countback ? (
          <p className="mt-4 flex items-start gap-2 text-sm text-zinc-500">
            <Flag className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Ties split on countback: {board.countback}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function spectatorCell(tab: BoardTab, row: RankingRow): { text: string; under: boolean } {
  if (tab === "stableford") return { text: row.stableford == null ? "–" : String(row.stableford), under: false };
  if (tab === "gross") return { text: signedScore(row.toPar), under: (row.toPar ?? 0) < 0 };
  const value = netToPar(row);
  return { text: signedScore(value), under: (value ?? 0) < 0 };
}

function FeedMark({ item, large = false }: { item: GameDayFeedItem; large?: boolean }) {
  const size = large ? "h-6 w-6" : "h-7 w-7";
  if (item.type === "lead_change") {
    return (
      <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white`} aria-hidden>
        <Star className={large ? "h-3 w-3 fill-current" : "h-3.5 w-3.5 fill-current"} />
      </span>
    );
  }
  if (item.type === "birdie") {
    return (
      <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-950`}>
        B
      </span>
    );
  }
  if (item.type === "thru") {
    return (
      <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-950`}>
        {item.holeNumber ?? "·"}
      </span>
    );
  }
  return (
    <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-950`}>
      <Check className={large ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
    </span>
  );
}
