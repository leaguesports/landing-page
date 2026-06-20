"use client";

import { formatPredictionDisplay, getPredictionTypeLabel } from "@/lib/pool-utils";
import type { Leaderboard, PoolView } from "@/types/pool";
import { Trophy } from "lucide-react";

type LeaderboardMember =
  | Leaderboard["members"][number]
  | PoolView["members"][number];

function getRank(member: LeaderboardMember, index: number): number {
  return "rank" in member ? member.rank : index + 1;
}

export default function LeaderboardTable({
  members,
  winners = [],
  showPoints = false,
  highlightHidden = false,
}: {
  members: LeaderboardMember[];
  homeTeamName?: string;
  awayTeamName?: string;
  winners?: Array<{ id: string; displayName: string }>;
  showPoints?: boolean;
  highlightHidden?: boolean;
}) {
  const winnerIds = new Set(winners.map((w) => w.id));
  const sorted = [...members].sort((a, b) => {
    const rankA = "rank" in a ? a.rank : 0;
    const rankB = "rank" in b ? b.rank : 0;
    if (rankA && rankB) return rankA - rankB;
    return b.totalPoints - a.totalPoints;
  });

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No members yet. Be the first to join!</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-4 py-3 font-semibold text-zinc-400">#</th>
            <th className="px-4 py-3 font-semibold text-zinc-400">Name</th>
            <th className="px-4 py-3 font-semibold text-zinc-400">Prediction</th>
            {showPoints && (
              <th className="px-4 py-3 text-right font-semibold text-zinc-400">Pts</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((member, index) => {
            const isWinner = winnerIds.has(member.id);
            const prediction = member.prediction;
            const isHidden =
              highlightHidden && prediction !== null && prediction.summary === null;

            return (
              <tr
                key={member.id}
                className={`border-b border-white/5 last:border-0 ${
                  isWinner ? "bg-green-500/10" : ""
                }`}
              >
                <td className="px-4 py-3 tabular-nums text-zinc-500">
                  {getRank(member, index)}
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  <span className="inline-flex items-center gap-2">
                    {member.displayName}
                    {isWinner && (
                      <Trophy className="h-4 w-4 text-green-400" aria-label="Winner" />
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {!prediction ? (
                    <span className="text-zinc-600">No prediction</span>
                  ) : isHidden ? (
                    <span className="text-zinc-600">
                      {getPredictionTypeLabel(prediction.predictionType)} ·{" "}
                      {formatPredictionDisplay(prediction, { hidden: true })}
                    </span>
                  ) : (
                    <span>
                      {formatPredictionDisplay(prediction)}
                      {showPoints && prediction.pointsEarned !== null && (
                        <span className="ml-2 text-green-400">
                          +{prediction.pointsEarned}
                        </span>
                      )}
                    </span>
                  )}
                </td>
                {showPoints && (
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-green-400">
                    {member.totalPoints}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
