"use client";

import { useEffect, useState } from "react";
import type { BoardTab, WeekendLeaderboard } from "@/types/golf-game-day";
import { fetchWeekendLeaderboard, GameDayApiError } from "@/lib/golf-game-day/api";
import {
  localStorageStore,
  readDevice,
  readWatchToken,
  sessionStore,
} from "@/lib/golf-game-day/storage";
import { GameDayColumn, ScreenTitle } from "./ui";

export function WeekendClient({ weekendEventId }: { weekendEventId: string }) {
  const [board, setBoard] = useState<WeekendLeaderboard | null>(null);
  const [tab, setTab] = useState<BoardTab>("gross");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const devices = localStorageStore();
    const watches = sessionStore();
    const device = Object.values(
      JSON.parse(devices.get("golf-gameday:v1:device") || "{}") as Record<
        string,
        { deviceToken?: string }
      >,
    ).find((item) => item.deviceToken);
    const watchMap = JSON.parse(watches.get("golf-gameday:v1:watch-session") || "{}") as Record<string, string>;
    const watchToken = Object.values(watchMap)[0] ?? null;
    let cancelled = false;
    fetchWeekendLeaderboard(weekendEventId, {
      deviceToken: device?.deviceToken ?? readDevice(devices, Object.keys(watchMap)[0] ?? "")?.deviceToken,
      watchToken: watchToken ?? (Object.keys(watchMap)[0] ? readWatchToken(watches, Object.keys(watchMap)[0]!) : null),
    })
      .then((next) => {
        if (!cancelled) setBoard(next);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof GameDayApiError ? cause.message : "Weekend board unavailable");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [weekendEventId]);

  if (!board) {
    return (
      <GameDayColumn>
        <ScreenTitle>Weekend</ScreenTitle>
        <p className="mt-3 text-sm text-zinc-600">{error ?? "Loading…"}</p>
      </GameDayColumn>
    );
  }

  const rows = board.rankings[tab];
  return (
    <GameDayColumn>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {board.gameDays.map((day) => day.dateLabel).join(" · ")}
      </p>
      <ScreenTitle>{board.name || "Weekend"}</ScreenTitle>
      <div className="mt-5 flex gap-1 rounded-full bg-zinc-100 p-1" role="tablist">
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
          const primary =
            tab === "stableford" ? row.stableford : tab === "net" ? row.net : row.gross;
          return (
            <li key={row.displayName} className="flex items-center gap-3 py-3">
              <span className="w-8 font-semibold">{row.position}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{row.displayName}</span>
                <span className="block text-xs text-zinc-500">{row.roundsPlayed} rounds</span>
              </span>
              <span className="font-display text-3xl leading-none">{primary ?? "–"}</span>
            </li>
          );
        })}
      </ul>
    </GameDayColumn>
  );
}
