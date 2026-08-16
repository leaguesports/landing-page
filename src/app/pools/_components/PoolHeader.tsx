import { Calendar, Users } from "lucide-react";
import { formatMatchDateTime, getPoolUiState, SCORING_RULES } from "@/lib/pool-utils";
import type { PoolView } from "@/types/pool";
import PoolStatusBadge from "./PoolStatusBadge";

export default function PoolHeader({ pool }: { pool: PoolView }) {
  const uiState = getPoolUiState(pool);
  const { fixture } = pool;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Prediction pool
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-wide text-white sm:text-4xl">
            {pool.name}
          </h1>
        </div>
        <PoolStatusBadge fixtureStatus={fixture.status} uiState={uiState} />
      </div>

      <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {fixture.title}
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 sm:gap-8">
          <div className="text-center">
            <p className="text-lg font-medium text-white sm:text-xl">
              {fixture.homeTeamName}
            </p>
            {fixture.homeScore !== null && (
              <p className="mt-1 font-display text-3xl tabular-nums text-[var(--color-brand)]">
                {fixture.homeScore}
              </p>
            )}
          </div>
          <span className="text-xl font-medium text-zinc-600">vs</span>
          <div className="text-center">
            <p className="text-lg font-medium text-white sm:text-xl">
              {fixture.awayTeamName}
            </p>
            {fixture.awayScore !== null && (
              <p className="mt-1 font-display text-3xl tabular-nums text-[var(--color-brand)]">
                {fixture.awayScore}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" aria-hidden />
            {formatMatchDateTime(fixture.matchDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden />
            {pool.memberCount} {pool.memberCount === 1 ? "member" : "members"}
          </span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs capitalize text-zinc-500">
            {fixture.sport}
          </span>
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        <span className="font-medium text-zinc-400">Scoring: </span>
        {SCORING_RULES[pool.scoringRule].label}
      </p>
    </div>
  );
}
