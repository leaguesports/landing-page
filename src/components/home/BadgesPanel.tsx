"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BadgesSnapshot, PersistedBadge } from "@/lib/badges/api";
import { BADGE_CATALOG, type BadgeId } from "@/lib/badges/catalog";
import { evaluateBadges } from "@/lib/badges/evaluate";
import { hasScorecardShareSignal } from "@/lib/badges/share-signal";
import type { PlayerHistoryStats } from "@/lib/padel/history";

type BadgesPanelProps = {
  /** Server GET snapshot — never POST on view. */
  initial: BadgesSnapshot;
  padelStats: PlayerHistoryStats;
  golfLocked: number;
  friendCount: number;
  /** Override outer spacing — use when the panel sits in its own hub tab. */
  className?: string;
};

export function BadgesPanel({
  initial,
  padelStats,
  golfLocked,
  friendCount,
  className = "mt-6",
}: BadgesPanelProps) {
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setShared(hasScorecardShareSignal());
  }, []);

  const serverBadges: PersistedBadge[] | null = initial.fromApi
    ? initial.badges
    : null;

  const localEarned = useMemo(
    () =>
      evaluateBadges({
        padelStats,
        golfLocked,
        friendCount,
        hasSharedScorecard: shared,
      })
        .filter((badge) => badge.earned)
        .map((badge) => badge.id),
    [friendCount, golfLocked, padelStats, shared],
  );

  const earnedIds = useMemo(() => {
    if (serverBadges === null) return localEarned;
    const ids = new Set<BadgeId>(serverBadges.map((badge) => badge.id));
    // Share stays device-local until the API records share *actions*.
    if (shared) ids.add("whatsapp_share");
    return BADGE_CATALOG.map((badge) => badge.id).filter((id) => ids.has(id));
  }, [localEarned, serverBadges, shared]);

  const earnedCount = earnedIds.length;

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Badges
          </p>
          <h3 className="mt-1 font-display text-2xl tracking-wide text-white">
            {earnedCount > 0
              ? `${earnedCount} earned`
              : "Start your collection"}
          </h3>
        </div>
        <p className="text-xs tabular-nums text-zinc-500">
          {earnedCount}/{BADGE_CATALOG.length}
        </p>
      </div>

      {earnedCount === 0 ? (
        <div className="mt-4 rounded-3xl border border-white/8 bg-[#141814] px-5 py-5">
          <p className="text-sm leading-relaxed text-zinc-400">
            Play and lock a match to earn your first badge — no vanity counts,
            only real milestones.
          </p>
          <Link
            href="/padel/new"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            Start a match
          </Link>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BADGE_CATALOG.map((badge) => {
            const earned = earnedIds.includes(badge.id as BadgeId);
            return (
              <li
                key={badge.id}
                className={
                  earned
                    ? "rounded-3xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-4"
                    : "rounded-3xl border border-white/8 bg-[#141814] px-4 py-4 opacity-55"
                }
              >
                <p className="text-sm font-semibold text-white">{badge.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  {earned ? badge.description : badge.howToEarn}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
