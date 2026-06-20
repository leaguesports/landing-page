import { poolApi } from "@/lib/api-client";
import type {
  CreatePoolInput,
  Leaderboard,
  PoolMember,
  PoolView,
} from "@/types/pool";

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
  scores: { predictedHomeScore: number; predictedAwayScore: number },
  poolMemberId?: string,
) =>
  poolApi(`/api/pools/by-code/${encodeURIComponent(code)}/predictions`, {
    method: "POST",
    body: JSON.stringify({ ...scores, poolMemberId }),
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
