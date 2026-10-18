"use client";

import { useEffect, useState } from "react";
import type { GameDayCreated } from "@/types/golf-game-day";
import { fetchOrganiserGameDay, GameDayApiError } from "@/lib/golf-game-day/api";
import { localStorageStore, writeGameDayMeta } from "@/lib/golf-game-day/storage";
import { ShareGameDay } from "./ShareGameDay";
import { GameDayColumn, PrimaryButton, ScreenTitle } from "./ui";
import { useAuth } from "@/hooks/useAuth";

export function ShareClient({ gameDayId }: { gameDayId: string }) {
  const auth = useAuth();
  const [day, setDay] = useState<GameDayCreated | null>(null);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    let cancelled = false;
    fetchOrganiserGameDay(gameDayId)
      .then((next) => {
        if (cancelled) return;
        setDay(next);
        writeGameDayMeta(localStorageStore(), next.id, {
          weekendEventId: next.weekendEventId,
        });
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof GameDayApiError ? cause.message : "Could not open this game day.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, gameDayId]);

  if (auth.isLoading) {
    return (
      <GameDayColumn>
        <p className="text-sm text-zinc-500">Loading…</p>
      </GameDayColumn>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <GameDayColumn>
        <ScreenTitle>Share</ScreenTitle>
        <p className="mt-3 text-sm text-zinc-600">Sign in as the organiser to open the invite.</p>
        <div className="mt-8">
          <PrimaryButton type="button" onClick={() => auth.signIn(`/golf/game-day/${gameDayId}`)}>
            Sign in
          </PrimaryButton>
        </div>
      </GameDayColumn>
    );
  }

  if (!day) {
    return (
      <GameDayColumn>
        <ScreenTitle>Share</ScreenTitle>
        <p className="mt-3 text-sm text-zinc-600">{error ?? "Loading the invite…"}</p>
      </GameDayColumn>
    );
  }

  return <ShareGameDay day={day} origin={origin} />;
}
