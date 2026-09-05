import type { FormResult, PlayerHistoryStats } from "@/lib/padel/history";
import { BADGE_CATALOG, type BadgeId } from "./catalog.ts";

export type BadgeEvidence = {
  padelStats: Pick<PlayerHistoryStats, "locked" | "wins" | "recentForm">;
  golfLocked: number;
  friendCount: number;
  /** True when the browser recorded a padel scorecard share. */
  hasSharedScorecard: boolean;
};

export type EvaluatedBadge = {
  id: BadgeId;
  earned: boolean;
};

/** Idempotent unlock evaluation from observable athlete activity. */
export function evaluateBadges(evidence: BadgeEvidence): EvaluatedBadge[] {
  const earned = new Set<BadgeId>();

  if (evidence.padelStats.locked >= 1) earned.add("first_lock");
  if (evidence.padelStats.wins >= 1) earned.add("first_win");
  if (evidence.padelStats.locked >= 5) earned.add("matches_5");
  if (evidence.golfLocked >= 1) earned.add("first_golf");
  if (evidence.hasSharedScorecard) earned.add("whatsapp_share");
  if (evidence.friendCount >= 1) earned.add("first_friend");
  if (hasHotForm(evidence.padelStats.recentForm)) earned.add("hot_form");

  return BADGE_CATALOG.map((badge) => ({
    id: badge.id,
    earned: earned.has(badge.id),
  }));
}

export function earnedBadgeIds(evidence: BadgeEvidence): BadgeId[] {
  return evaluateBadges(evidence)
    .filter((badge) => badge.earned)
    .map((badge) => badge.id);
}

function hasHotForm(recentForm: FormResult[]): boolean {
  let wins = 0;
  for (const result of recentForm) {
    if (result === "W") wins += 1;
  }
  return wins >= 3;
}
