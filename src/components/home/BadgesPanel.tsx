"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BadgesSnapshot, PersistedBadge } from "@/lib/badges/api";
import { BADGE_CATALOG, badgeById, type BadgeId } from "@/lib/badges/catalog";
import { evaluateBadges } from "@/lib/badges/evaluate";
import { hasScorecardShareSignal } from "@/lib/badges/share-signal";
import type { PlayerHistoryStats } from "@/lib/padel/history";
import {
  HUB_BADGE_STRIP_LIMIT,
  takeHubPreview,
} from "@/lib/sports/hub-ia";

type BadgesPanelProps = {
  /** Server GET snapshot — never POST on view. */
  initial: BadgesSnapshot;
  padelStats: PlayerHistoryStats;
  golfLocked: number;
  friendCount: number;
  /** Override outer spacing — use when the panel sits under a parent heading. */
  className?: string;
  /** Hub uses a count + icon strip; `/athletes` keeps the full catalog. */
  variant?: "full" | "strip";
};

export function BadgesPanel({
  initial,
  padelStats,
  golfLocked,
  friendCount,
  className = "mt-6",
  variant = "full",
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
  const stripIds = takeHubPreview(earnedIds, HUB_BADGE_STRIP_LIMIT);

  if (variant === "strip") {
    return (
      <div className={className}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Badges
          </p>
          <p className="text-xs tabular-nums text-zinc-500">
            {earnedCount}/{BADGE_CATALOG.length}
          </p>
        </div>
        {earnedCount === 0 ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Lock a match to earn your first badge.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap items-center gap-2">
            {stripIds.map((id) => {
              const badge = badgeById(id);
              const label = badge?.name ?? id;
              return (
                <li
                  key={id}
                  title={badge?.description ?? label}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1"
                >
                  <span
                    aria-hidden
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 font-display text-xs text-emerald-200"
                  >
                    {label.charAt(0)}
                  </span>
                  <span className="text-xs font-medium text-emerald-100">
                    {label}
                  </span>
                </li>
              );
            })}
            {earnedCount > stripIds.length ? (
              <li className="text-xs tabular-nums text-zinc-500">
                +{earnedCount - stripIds.length}
              </li>
            ) : null}
          </ul>
        )}
      </div>
    );
  }

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
