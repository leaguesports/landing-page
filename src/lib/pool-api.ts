import type {
  CreatePoolInput,
  Leaderboard,
  PoolMember,
  PoolView,
} from "@/types/pool";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class PoolApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PoolApiError";
    this.status = status;
  }
}

export function isPoolApiConfigured(): boolean {
  return API_BASE.length > 0;
}

export async function poolApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE) {
    throw new PoolApiError(0, "API URL is not configured");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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

export const submitPrediction = (
  code: string,
  poolMemberId: string,
  scores: { predictedHomeScore: number; predictedAwayScore: number },
) =>
  poolApi(`/api/pools/by-code/${encodeURIComponent(code)}/predictions`, {
    method: "POST",
    body: JSON.stringify({ poolMemberId, ...scores }),
  });

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
