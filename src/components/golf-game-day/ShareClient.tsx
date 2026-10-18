"use client";

import { useEffect, useState } from "react";
import type { GameDayCreated, PatchGameDayPlayerInput } from "@/types/golf-game-day";
import {
  claimGameDay,
  fetchOrganiserGameDay,
  GameDayApiError,
  patchGameDayPlayer,
} from "@/lib/golf-game-day/api";
import {
  localStorageStore,
  readOrganiser,
  writeGameDayMeta,
  writeOrganiser,
} from "@/lib/golf-game-day/storage";
import { ShareGameDay } from "./ShareGameDay";
import { GameDayColumn, PrimaryButton, ScreenTitle } from "./ui";
import { useAuth } from "@/hooks/useAuth";

export function ShareClient({ gameDayId }: { gameDayId: string }) {
  const auth = useAuth();
  const [day, setDay] = useState<GameDayCreated | null>(null);
  const [organiserToken, setOrganiserToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const store = localStorageStore();
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("organiser");
    if (fromUrl) {
      const existing = readOrganiser(store, gameDayId);
      writeOrganiser(store, {
        gameDayId,
        organiserToken: fromUrl,
        organiserPlayerId: existing?.organiserPlayerId ?? null,
        claimed: existing?.claimed ?? false,
      });
      params.delete("organiser");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
    }
    const token = readOrganiser(store, gameDayId)?.organiserToken ?? null;
    setOrganiserToken(token);
    let cancelled = false;
    fetchOrganiserGameDay(gameDayId, token)
      .then((next) => {
        if (cancelled) return;
        setDay(next);
        writeGameDayMeta(store, next.id, { weekendEventId: next.weekendEventId });
        const stored = readOrganiser(store, next.id);
        if (stored) {
          writeOrganiser(store, {
            ...stored,
            organiserPlayerId: next.organiserPlayerId ?? stored.organiserPlayerId,
            claimed: next.claimed === true,
          });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof GameDayApiError ? cause.message : "Could not open this game day.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [gameDayId]);

  useEffect(() => {
    if (!auth.isAuthenticated || !day || day.claimed !== false || !organiserToken) return;
    let cancelled = false;
    claimGameDay(day.id, organiserToken)
      .then((claimed) => {
        if (cancelled) return;
        setDay((current) =>
          current
            ? {
                ...current,
                ...claimed,
                organiserToken: current.organiserToken ?? organiserToken,
              }
            : current,
        );
        const store = localStorageStore();
        const stored = readOrganiser(store, day.id);
        if (stored) {
          writeOrganiser(store, {
            ...stored,
            claimed: true,
            organiserPlayerId: claimed.organiserPlayerId ?? stored.organiserPlayerId,
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, day, organiserToken]);

  async function onSavePlayer(playerId: string, body: PatchGameDayPlayerInput) {
    const next = await patchGameDayPlayer(gameDayId, playerId, body, organiserToken);
    setDay((current) =>
      current
        ? { ...next, organiserToken: current.organiserToken ?? organiserToken ?? undefined }
        : next,
    );
  }

  if (!day && !error) {
    return (
      <GameDayColumn>
        <p className="text-sm text-zinc-500">Loading…</p>
      </GameDayColumn>
    );
  }

  if (!day) {
    return (
      <GameDayColumn>
        <ScreenTitle>Share</ScreenTitle>
        <p className="mt-3 text-sm text-zinc-600">{error}</p>
        {!auth.isAuthenticated ? (
          <div className="mt-8">
            <PrimaryButton type="button" onClick={() => auth.signIn(`/golf/game-day/${gameDayId}`)}>
              Sign in
            </PrimaryButton>
          </div>
        ) : null}
      </GameDayColumn>
    );
  }

  return (
    <ShareGameDay
      day={day}
      origin={origin}
      organiserToken={organiserToken}
      onSavePlayer={onSavePlayer}
    />
  );
}
