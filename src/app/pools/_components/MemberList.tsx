"use client";

import { Users } from "lucide-react";
import LeaderboardTable from "./LeaderboardTable";
import type { PoolView } from "@/types/pool";
import { getPoolUiState } from "@/lib/pool-utils";

export default function MemberList({
  pool,
  currentMemberId,
}: {
  pool: PoolView;
  currentMemberId: string | null;
}) {
  const uiState = getPoolUiState(pool);
  const showHidden = uiState === "open";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-zinc-500" aria-hidden />
        <h2 className="text-lg font-bold text-white">
          Members ({pool.memberCount})
        </h2>
      </div>

      {showHidden && (
        <p className="text-sm text-zinc-500">
          🔒 Predictions hidden until kickoff
        </p>
      )}

      <LeaderboardTable
        members={pool.members}
        homeTeamName={pool.fixture.homeTeamName}
        awayTeamName={pool.fixture.awayTeamName}
        showPoints={uiState === "results"}
        highlightHidden={showHidden}
      />

      {currentMemberId && (
        <p className="text-xs text-zinc-500">
          You&apos;re playing as{" "}
          <span className="font-medium text-zinc-300">
            {pool.members.find((m) => m.id === currentMemberId)?.displayName ?? "Unknown"}
          </span>
        </p>
      )}
    </div>
  );
}
