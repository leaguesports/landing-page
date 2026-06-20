import type { PoolScoringRule, PoolUiState, PoolView } from "@/types/pool";

export function getPoolUiState(pool: PoolView): PoolUiState {
  if (pool.fixture.status === "FINISHED") {
    return "results";
  }
  if (pool.predictionsOpen) {
    return "open";
  }
  return "locked";
}

export function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://leaguesports.co.za";
}

export function getShareUrl(inviteCode: string): string {
  return `${getSiteBaseUrl()}/pools/join/${inviteCode}`;
}

export function getWhatsAppShareUrl(inviteCode: string, poolName: string): string {
  const link = getShareUrl(inviteCode);
  const text = `Join my prediction pool "${poolName}" on LeagueSports! ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function formatMatchDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SCORING_RULES: Record<
  PoolScoringRule,
  { label: string; description: string }
> = {
  EXACT_SCORE_THREE_CORRECT_RESULT_ONE: {
    label: "Exact score (3 pts) + correct result (1 pt)",
    description:
      "Exact score earns 3 points. Correct winner or draw (wrong margin) earns 1 point. Wrong earns 0.",
  },
  CORRECT_RESULT_ONLY: {
    label: "Correct result only (1 pt)",
    description:
      "Correct winner or draw earns 1 point. Wrong earns 0.",
  },
};

export function findCurrentMember(
  pool: PoolView,
  memberId: string | null,
): PoolView["members"][number] | null {
  if (!memberId) {
    return null;
  }
  return pool.members.find((m) => m.id === memberId) ?? null;
}

export function parseNonNegativeInt(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    return null;
  }
  return num;
}

export function formatPrediction(
  home: number | null,
  away: number | null,
  homeTeam: string,
  awayTeam: string,
): string {
  if (home === null || away === null) {
    return "Hidden";
  }
  return `${homeTeam} ${home} – ${away} ${awayTeam}`;
}
