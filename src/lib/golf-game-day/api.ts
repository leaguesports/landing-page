import { getRailwayApiOrigin } from "@/lib/api-origin";
import type {
  CreateGameDayInput,
  GameDayCard,
  GameDayCreated,
  GameDayLeaderboard,
  GameDayPreview,
  HolePutResponse,
  JoinResult,
  WeekendLeaderboard,
} from "@/types/golf-game-day";

export const GAME_DAY_TOKEN_HEADER = "X-Game-Day-Token";
export const GAME_DAY_WATCH_HEADER = "X-Game-Day-Watch-Token";

export class GameDayApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GameDayApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  deviceToken?: string | null;
  watchToken?: string | null;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
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
    let message = "Request failed";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // Keep the generic message.
    }
    throw new GameDayApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function createGameDay(input: CreateGameDayInput): Promise<GameDayCreated> {
  return gameDayRequest("/api/golf-game-days", { method: "POST", body: input });
}

export function fetchOrganiserGameDay(id: string): Promise<GameDayCreated> {
  return gameDayRequest(`/api/golf-game-days/${encodeURIComponent(id)}`);
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
  deviceToken: string,
  body: { clientTimestamp: string; strokes: Record<string, number> },
): Promise<HolePutResponse> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/holes/${holeNumber}`,
    { method: "PUT", deviceToken, body },
  );
}

export function confirmCard(
  gameDayId: string,
  cardId: string,
  deviceToken: string,
): Promise<{ card: GameDayCard; golfRoundId: string; version: number; leaderboard: GameDayLeaderboard }> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}/confirm`,
    { method: "POST", deviceToken, body: {} },
  );
}

export function fetchCard(
  gameDayId: string,
  cardId: string,
  auth: { deviceToken?: string | null; watchToken?: string | null },
): Promise<GameDayCard> {
  return gameDayRequest(
    `/api/golf-game-days/${encodeURIComponent(gameDayId)}/cards/${encodeURIComponent(cardId)}`,
    auth,
  );
}

export function fetchLeaderboard(
  gameDayId: string,
  auth: { deviceToken?: string | null; watchToken?: string | null },
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
  auth: { deviceToken?: string | null; watchToken?: string | null },
): Promise<WeekendLeaderboard> {
  return gameDayRequest(
    `/api/golf-game-days/weekends/${encodeURIComponent(weekendEventId)}/leaderboard`,
    auth,
  );
}
