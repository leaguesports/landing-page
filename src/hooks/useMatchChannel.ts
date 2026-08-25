"use client";

import * as Ably from "ably";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  cacheMatchLocally,
  syncMatchEvent,
} from "@/lib/match-api";
import {
  classifyTransition,
  evaluatePadelPoint,
} from "@/lib/padel/padelReducer";
import type {
  MatchChannelEvent,
  MatchChannelEventType,
  PadelMatch,
  PadelTeamId,
} from "@/types/padel-match";

export type MatchConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "offline";

const CHANNEL_EVENTS: MatchChannelEventType[] = [
  "POINT_SCORED",
  "UNDO_POINT",
  "SET_COMPLETED",
  "MATCH_FINALIZED",
  "STATE_SYNC",
];

function channelName(sport: string, matchId: string) {
  return `${sport}:${matchId}`;
}

/**
 * Subscribes to `[sport]:[matchId]` (e.g. `padel:match_abc123`),
 * applies Ably events to local match state, and exposes `emitEvent`
 * for court-side scoring. Optimistic local updates + async DB sync.
 */
export function useMatchChannel(
  matchId: string,
  initialData: PadelMatch,
) {
  const [match, setMatch] = useState<PadelMatch>(initialData);
  const [connectionState, setConnectionState] =
    useState<MatchConnectionState>("connecting");
  const [historyLen, setHistoryLen] = useState(1);
  const historyRef = useRef<PadelMatch[]>([initialData]);
  const matchRef = useRef(match);
  const clientRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  const pushHistory = (next: PadelMatch) => {
    historyRef.current = [...historyRef.current, next].slice(-40);
    setHistoryLen(historyRef.current.length);
  };

  useEffect(() => {
    matchRef.current = match;
    cacheMatchLocally(match);
  }, [match]);

  useEffect(() => {
    if (!matchId) return;

    let cancelled = false;
    const sport = initialData.sport || "padel";

    const client = new Ably.Realtime({
      authUrl: `/api/realtime/token?sport=${encodeURIComponent(sport)}&matchId=${encodeURIComponent(matchId)}`,
      authMethod: "GET",
      autoConnect: true,
    });
    clientRef.current = client;

    const onConnection = () => {
      if (cancelled) return;
      const state = client.connection.state;
      if (state === "connected") setConnectionState("connected");
      else if (state === "connecting") setConnectionState("connecting");
      else if (state === "disconnected" || state === "suspended")
        setConnectionState("disconnected");
      else if (state === "failed" || state === "closed" || state === "closing")
        setConnectionState("failed");
      else setConnectionState("connecting");
    };

    client.connection.on(onConnection);
    onConnection();

    const channel = client.channels.get(channelName(sport, matchId));
    channelRef.current = channel;

    const onEvent = (message: Ably.Message) => {
      const event = message.data as MatchChannelEvent | undefined;
      if (!event?.state || event.matchId !== matchId) return;

      setMatch((prev) => {
        if (event.state.version < prev.version) return prev;
        return event.state;
      });
    };

    for (const name of CHANNEL_EVENTS) {
      channel.subscribe(name, onEvent);
    }

    // Hydrate from Ably history in case SSR/local cache was stale or empty
    void channel
      .history({ limit: 50, direction: "backwards" })
      .then((page) => {
        if (cancelled) return;
        let best: PadelMatch | null = null;
        for (const message of page.items ?? []) {
          const event = message.data as MatchChannelEvent | undefined;
          const state = event?.state;
          if (!state || state.id !== matchId) continue;
          if (!best || state.version >= best.version) best = state;
        }
        if (best) {
          setMatch((prev) =>
            best!.version >= prev.version ? best! : prev,
          );
        }
      })
      .catch((error) => {
        console.warn("[useMatchChannel] history hydrate failed", error);
      });

    return () => {
      cancelled = true;
      for (const name of CHANNEL_EVENTS) {
        channel.unsubscribe(name, onEvent);
      }
      client.connection.off(onConnection);
      client.close();
      clientRef.current = null;
      channelRef.current = null;
    };
  }, [matchId, initialData.sport]);

  const emitEvent = useCallback(
    async (
      eventType: MatchChannelEventType,
      payload: { state: PadelMatch; scoringTeam?: PadelTeamId },
      options?: { recordHistory?: boolean },
    ) => {
      const event: MatchChannelEvent = {
        type: eventType,
        matchId,
        state: payload.state,
        meta: {
          scoringTeam: payload.scoringTeam,
          clientEventId: crypto.randomUUID(),
          emittedAt: new Date().toISOString(),
        },
      };

      // Optimistic local apply
      setMatch(payload.state);
      if (options?.recordHistory !== false) {
        pushHistory(payload.state);
      }
      cacheMatchLocally(payload.state);

      const channel = channelRef.current;
      if (channel && clientRef.current?.connection.state === "connected") {
        try {
          await channel.publish(eventType, event);
        } catch (error) {
          console.warn("[useMatchChannel] publish failed", error);
        }
      }

      // Async DB sync — non-blocking
      void syncMatchEvent(event);
    },
    [matchId],
  );

  const scorePoint = useCallback(
    async (team: PadelTeamId) => {
      const before = matchRef.current;
      const after = evaluatePadelPoint(before, { type: "POINT", team });
      if (after.version === before.version) return after;

      const eventType = classifyTransition(before, after);
      await emitEvent(eventType, { state: after, scoringTeam: team });
      return after;
    },
    [emitEvent],
  );

  const undoPoint = useCallback(async () => {
    const history = historyRef.current;
    if (history.length < 2) return matchRef.current;

    const previous = history[history.length - 2]!;
    const after = evaluatePadelPoint(matchRef.current, {
      type: "UNDO",
      previous,
    });
    historyRef.current = history.slice(0, -1);
    setHistoryLen(historyRef.current.length);
    await emitEvent("UNDO_POINT", { state: after }, { recordHistory: false });
    return after;
  }, [emitEvent]);

  return {
    match,
    connectionState,
    emitEvent,
    scorePoint,
    undoPoint,
    canUndo: historyLen > 1,
  };
}
