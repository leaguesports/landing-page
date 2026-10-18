import type { GameDayCard } from "../../types/golf-game-day.ts";

export const LOOKS_RIGHT_HEADER = "X-Game-Day-Token";

/** POST, no body. The server sets this device's player to looksRight true. */
export function looksRightPath(gameDayId: string, cardId: string): string {
  return `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/looks-right`;
}

export type LooksRightResponse = {
  playerId: string;
  looksRight: true;
};

export async function postLooksRight(input: {
  gameDayId: string;
  cardId: string;
  deviceToken: string;
  baseUrl: string;
  fetchImpl: typeof fetch;
}): Promise<LooksRightResponse> {
  const response = await input.fetchImpl(`${input.baseUrl.replace(/\/$/, "")}${looksRightPath(input.gameDayId, input.cardId)}`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      [LOOKS_RIGHT_HEADER]: input.deviceToken,
    },
  });
  if (!response.ok) {
    let message = "Could not mark the card";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // Keep the generic message.
    }
    const error = new Error(message) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  const payload = (await response.json()) as LooksRightResponse;
  if (payload.looksRight !== true || typeof payload.playerId !== "string") {
    throw new Error("Unexpected looks-right response");
  }
  return payload;
}

export function withLooksRight(
  card: GameDayCard,
  playerId: string,
  looksRight: boolean,
): GameDayCard {
  return {
    ...card,
    players: card.players.map((player) =>
      player.playerId === playerId ? { ...player, looksRight } : player,
    ),
  };
}

/** A queued mark stays true until the server copy arrives without that queue item. */
export function overlayQueuedLooksRight(
  card: GameDayCard,
  pendingPlayerIds: readonly string[],
): GameDayCard {
  if (pendingPlayerIds.length === 0) return card;
  const pending = new Set(pendingPlayerIds);
  return {
    ...card,
    players: card.players.map((player) =>
      pending.has(player.playerId) ? { ...player, looksRight: true } : player,
    ),
  };
}

export type LooksRightPill = {
  label: "Looks right" | "Looks right?";
  filled: boolean;
  interactive: boolean;
};

/** Ticked rows show Looks right. Your unticked row has no chip. Others show Looks right?. */
export function looksRightPill(player: {
  looksRight: boolean;
  you: boolean;
}): LooksRightPill | null {
  if (player.looksRight) {
    return { label: "Looks right", filled: true, interactive: false };
  }
  if (player.you) return null;
  return { label: "Looks right?", filled: false, interactive: false };
}
