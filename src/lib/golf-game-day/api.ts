import { getRailwayApiOrigin } from "../api-origin.ts";
import { postLooksRight, type LooksRightResponse } from "./looks-right.ts";
import { gameDayUserMessage } from "./multi-scorer.ts";
import type {
  CreateGameDayInput,
  GameDayCard,
  GameDayCreated,
  GameDayLeaderboard,
  GameDayPreview,
  HolePutBody,
  HolePutResponse,
  JoinResult,
  PatchGameDayPlayerInput,
  WeekendLeaderboard,
} from "../../types/golf-game-day.ts";

export const GAME_DAY_TOKEN_HEADER = "X-Game-Day-Token";
export const GAME_DAY_WATCH_HEADER = "X-Game-Day-Watch-Token";
export const GAME_DAY_ORGANISER_HEADER = "X-Game-Day-Organiser-Token";

export type GameDayTransport = {
  fetchImpl?: typeof fetch;
  baseUrl?: string;
};

export type GameDayAuth = {
  deviceToken?: string | null;
  watchToken?: string | null;
  organiserToken?: string | null;
};

export class GameDayApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GameDayApiError";
    this.status = status;
  }
}

type RequestOptions = GameDayTransport & {
  method?: string;
  body?: unknown;
  deviceToken?: string | null;
  watchToken?: string | null;
  organiserToken?: string | null;
};

function requestBase(explicit?: string): string {
  if (explicit) return explicit.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return getRailwayApiOrigin();
}

export async function gameDayRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = requestBase(options.baseUrl);
  if (!base) {
    throw new GameDayApiError(0, "API URL is not configured");
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.deviceToken) headers[GAME_DAY_TOKEN_HEADER] = options.deviceToken;
  if (options.watchToken) headers[GAME_DAY_WATCH_HEADER] = options.watchToken;
  if (options.organiserToken) headers[GAME_DAY_ORGANISER_HEADER] = options.organiserToken;

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(`${base}${path}`, {
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      credentials: "include",
      cache: "no-store",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new GameDayApiError(0, "You are offline. Scores stay on this phone.");
  }

  if (!response.ok) {
    let server: string | undefined;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) server = payload.error;
    } catch {
      // Status mapping still applies.
    }
    throw new GameDayApiError(response.status, gameDayUserMessage(response.status, server));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function createGameDay(
  input: CreateGameDayInput,
  transport?: GameDayTransport,
): Promise<GameDayCreated> {
  return gameDayRequest("/api/golf-game-days", { method: "POST", body: input, ...transport });
}

export function fetchOrganiserGameDay(
  id: string,
  organiserToken?: string | null,
  transport?: GameDayTransport,
): Promise<GameDayCreated> {
  return gameDayRequest(`/api/golf-game-days/${encodeURIComponent(id)}`, {
    organiserToken,
    ...transport,
  });
}

export function claimGameDay(
  id: string,
  organiserToken: string,
  transport?: GameDayTransport,
): Promise<GameDayCreated> {
  return gameDayRequest(`/api/golf-game-days/${encodeURIComponent(id)}/claim`, {
    method: "POST",
    body: {},
    organiserToken,
    ...transport,
  });
}

export function patchGameDayPlayer(
  gameDayId: string,
  playerId: string,
  body: PatchGameDayPlayerInput,
  organiserToken?: string | null,
  transport?: GameDayTransport,
): Promise<GameDayCreated> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/players/${encodeURIComponent(playerId)}`,
    { method: "PATCH", body, organiserToken, ...transport },
  );
}

export function fetchInvite(code: string): Promise<GameDayPreview> {
  return gameDayRequest(`/api/golf-game-days/invite/${encodeURIComponent(code)}`);
}

export function joinGameDay(
  code: string,
  body: { playerId?: string; displayName?: string; handicapIndex: number | null; teeName: string },
): Promise<JoinResult> {
  return gameDayRequest(`/api/golf-game-days/invite/${encodeURIComponent(code)}/join`, {
    method: "POST",
    body,
  });
}

export function startCard(
  gameDayId: string,
  deviceToken: string,
  body: unknown,
): Promise<{ card: GameDayCard; scoring: boolean; slot: number }> {
  return gameDayRequest(`/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards`, {
    method: "POST",
    deviceToken,
    body,
  });
}

export function joinCard(
  gameDayId: string,
  cardId: string,
  deviceToken: string,
): Promise<{ card: GameDayCard; slot: number; scoring: boolean }> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/join`,
    { method: "POST", deviceToken, body: {} },
  );
}

export function takeOverCard(
  gameDayId: string,
  cardId: string,
  deviceToken: string,
): Promise<{ cardId: string; scoring: boolean; scorerPlayerId: string }> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/take-over`,
    { method: "POST", deviceToken, body: {} },
  );
}

export function putHole(
  gameDayId: string,
  cardId: string,
  holeNumber: number,
  auth: GameDayAuth,
  body: HolePutBody,
  transport?: GameDayTransport,
): Promise<HolePutResponse> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/holes/${holeNumber}`,
    { method: "PUT", body, ...auth, ...transport },
  );
}

export function unlockCard(
  gameDayId: string,
  cardId: string,
  organiserToken?: string | null,
  transport?: GameDayTransport,
): Promise<{ card: GameDayCard; version: number; leaderboard: GameDayLeaderboard }> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/unlock`,
    { method: "POST", body: {}, organiserToken, ...transport },
  );
}

export function markLooksRight(
  gameDayId: string,
  cardId: string,
  deviceToken: string,
): Promise<LooksRightResponse> {
  return postLooksRight({
    gameDayId,
    cardId,
    deviceToken,
    baseUrl: requestBase(),
    fetchImpl: fetch,
  }).catch((cause: unknown) => {
    const status = cause && typeof cause === "object" && "status" in cause ? Number(cause.status) : 0;
    const message = cause instanceof Error ? cause.message : "Could not mark the card";
    if (cause instanceof TypeError || status === 0) {
      throw new GameDayApiError(0, "You are offline. Scores stay on this phone.");
    }
    throw new GameDayApiError(
      Number.isFinite(status) ? status : 0,
      gameDayUserMessage(Number.isFinite(status) ? status : 0, message),
    );
  });
}

export function confirmCard(
  gameDayId: string,
  cardId: string,
  auth: GameDayAuth,
  transport?: GameDayTransport,
): Promise<{ card: GameDayCard; golfRoundId: string; version: number; leaderboard: GameDayLeaderboard }> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/confirm`,
    { method: "POST", body: {}, ...auth, ...transport },
  );
}

export function fetchCard(
  gameDayId: string,
  cardId: string,
  auth: GameDayAuth,
): Promise<GameDayCard> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}`,
    auth,
  );
}

export function fetchLeaderboard(
  gameDayId: string,
  auth: GameDayAuth,
): Promise<GameDayLeaderboard> {
  return gameDayRequest(`/api/golf-game-days/${encodeURIComponent(gameDayId)}/leaderboard`, auth);
}

export function fetchWatchLeaderboard(watchToken: string): Promise<GameDayLeaderboard> {
  return gameDayRequest(
    `/api/golf-game-days/watch/${encodeURIComponent(watchToken)}/leaderboard`,
  );
}

export function fetchWeekendLeaderboard(
  weekendEventId: string,
  auth: GameDayAuth,
): Promise<WeekendLeaderboard> {
  return gameDayRequest(
    `/api/golf-game-days/weekends/${encodeURIComponent(weekendEventId)}/leaderboard`,
    auth,
  );
}
