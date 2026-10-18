"use client";

import * as Ably from "ably";
import { useCallback, useEffect, useState } from "react";
import type { BoardTab, GameDayLeaderboard } from "@/types/golf-game-day";
import {
  fetchLeaderboard,
  fetchWatchLeaderboard,
  GameDayApiError,
} from "@/lib/golf-game-day/api";
import { gameDayCardPath, gameDayWeekendPath } from "@/lib/golf-game-day/paths";
import { defaultBoardTab, mergeLeaderboard } from "@/lib/golf-game-day/scoring-ui";
import {
  localStorageStore,
  readDevice,
  readGameDayMeta,
  readWatchToken,
  rememberWatchToken,
  sessionStore,
} from "@/lib/golf-game-day/storage";
import { LeaderboardView } from "./Leaderboard";
import { ResultsView } from "./Results";
import { GameDayColumn } from "./ui";

type BoardClientProps = {
  gameDayId?: string;
  watchToken?: string;
};

export function BoardClient({ gameDayId, watchToken }: BoardClientProps) {
  const [board, setBoard] = useState<GameDayLeaderboard | null>(null);
  const [tab, setTab] = useState<BoardTab>(watchToken ? "net" : "stableford");
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((incoming: GameDayLeaderboard) => {
    const session = incoming.gameDayId
      ? readDevice(localStorageStore(), incoming.gameDayId)
      : null;
    setBoard((current) => mergeLeaderboard(current, incoming, session?.playerId ?? null));
    setTab((current) => current ?? defaultBoardTab(incoming));
  }, []);

  const load = useCallback(async () => {
    try {
      if (watchToken) {
        const incoming = await fetchWatchLeaderboard(watchToken);
        rememberWatchToken(sessionStore(), incoming.gameDayId, watchToken);
        apply(incoming);
        return incoming;
      }
      if (!gameDayId) return null;
      const session = readDevice(localStorageStore(), gameDayId);
      const watch = readWatchToken(sessionStore(), gameDayId);
      const incoming = await fetchLeaderboard(gameDayId, {
        deviceToken: session?.deviceToken,
        watchToken: watch,
      });
      apply(incoming);
      return incoming;
    } catch (cause) {
      setError(cause instanceof GameDayApiError ? cause.message : "Leaderboard unavailable");
      return null;
    }
  }, [apply, gameDayId, watchToken]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 20000);
    const onOnline = () => void load();
    window.addEventListener("online", onOnline);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [load]);

  useEffect(() => {
    const id = board?.gameDayId ?? gameDayId;
    if (!id) return;
    let client: Ably.Realtime | null = null;
    let cancelled = false;
    try {
      client = new Ably.Realtime({
        authUrl: `/api/realtime/token?sport=golf-gameday&gameDayId=${encodeURIComponent(id)}`,
        authMethod: "GET",
      });
    } catch {
      return;
    }
    const channel = client.channels.get(`golf-gameday:${id}`);
    const onEvent = (message: Ably.Message) => {
      if (cancelled) return;
      const data = message.data as { leaderboard?: GameDayLeaderboard; version?: number } | undefined;
      if (data?.leaderboard) apply(data.leaderboard);
    };
    const names = ["score.updated", "feed.birdie", "feed.lead_change", "card.locked"] as const;
    for (const name of names) channel.subscribe(name, onEvent);
    void channel.history({ limit: 25, direction: "backwards" }).then((page) => {
      if (cancelled) return;
      for (const item of [...(page.items ?? [])].reverse()) onEvent(item);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      for (const name of names) channel.unsubscribe(name, onEvent);
      client?.close();
    };
  }, [apply, board?.gameDayId, gameDayId]);

  if (!board) {
    return (
      <GameDayColumn>
        <h1 className="font-display text-5xl tracking-wide">Leaderboard</h1>
        <p className="mt-3 text-sm text-zinc-600">{error ?? "Loading the board…"}</p>
      </GameDayColumn>
    );
  }

  if (board.status === "final") {
    const weekendEventId = readGameDayMeta(localStorageStore(), board.gameDayId)?.weekendEventId ?? null;
    return (
      <ResultsView
        board={board}
        weekendHref={weekendEventId ? gameDayWeekendPath(weekendEventId) : null}
      />
    );
  }

  const session = readDevice(localStorageStore(), board.gameDayId);
  const yourCard = session?.cardId ? gameDayCardPath(board.gameDayId, session.cardId) : null;
  return (
    <LeaderboardView
      board={board}
      tab={tab}
      onTab={setTab}
      yourCardHref={board.access === "watch" ? null : yourCard}
    />
  );
}

