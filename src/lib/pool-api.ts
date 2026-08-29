import { getRailwayApiOrigin, isApiConfigured } from "@/lib/api-origin";
import type {
  CreatePoolInput,
  Leaderboard,
  PoolMember,
  PoolView,
  PredictionFormState,
} from "@/types/pool";

export class PoolApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PoolApiError";
    this.status = status;
  }
}

export function isPoolApiConfigured(): boolean {
  return isApiConfigured();
}

/**
 * Browser: same-origin `/api` (first-party cookies).
 * Server: Railway origin from `getRailwayApiOrigin()` — never call that
 * from the browser.
 */
function getRequestBase(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function poolApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!isApiConfigured()) {
    throw new PoolApiError(0, "API URL is not configured");
  }

  const res = await fetch(`${getRequestBase()}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new PoolApiError(
      res.status,
      body.error ?? `Request failed (${res.status})`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const getPool = (code: string) =>
  poolApi<PoolView>(`/api/pools/by-code/${encodeURIComponent(code)}`);

export const getLeaderboard = (code: string) =>
  poolApi<Leaderboard>(
    `/api/pools/by-code/${encodeURIComponent(code)}/leaderboard`,
  );

export const joinPool = (code: string, displayName: string) =>
  poolApi<PoolMember>(`/api/pools/by-code/${encodeURIComponent(code)}/join`, {
    method: "POST",
    body: JSON.stringify({ displayName }),
  });

export async function submitPrediction(
  inviteCode: string,
  poolMemberId: string,
  form: PredictionFormState,
) {
  const body =
    form.type === "EXACT_SCORE"
      ? {
          poolMemberId,
          predictionType: "EXACT_SCORE" as const,
          predictedHomeScore: form.home,
          predictedAwayScore: form.away,
        }
      : form.type === "TOTAL_SCORE"
        ? {
            poolMemberId,
            predictionType: "TOTAL_SCORE" as const,
            predictedTotalScore: form.total,
          }
        : {
            poolMemberId,
            predictionType: "MARGIN" as const,
            predictedWinnerSide: form.side,
            ...(form.side !== "DRAW" && { predictedMargin: form.margin ?? 0 }),
          };

  return poolApi(
    `/api/pools/by-code/${encodeURIComponent(inviteCode)}/predictions`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export const createPool = (data: CreatePoolInput) =>
  poolApi<PoolView>("/api/pools", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const submitResult = (
  code: string,
  homeScore: number,
  awayScore: number,
) =>
  poolApi<Leaderboard>(
    `/api/pools/by-code/${encodeURIComponent(code)}/result`,
    {
      method: "POST",
      body: JSON.stringify({ homeScore, awayScore }),
    },
  );
