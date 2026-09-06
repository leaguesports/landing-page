"use client";

import type { FixtureLiveBoard } from "@/types/fixture-feed";

function statusLabel(status: FixtureLiveBoard["status"]): string {
  if (status === "live") return "Live";
  if (status === "final") return "Final";
  return "Upcoming";
}

export function FixtureLiveBoardView({
  board,
  compact = false,
}: {
  board: FixtureLiveBoard | null;
  compact?: boolean;
}) {
  if (!board) return null;
  const live = board.status === "live";

  if (board.kind === "match_score") {
    return (
      <div
        className={
          compact
            ? "flex flex-col gap-1.5"
            : "rounded-2xl border border-white/10 bg-[#141814] px-4 py-4 sm:px-5"
        }
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p
            className={`min-w-0 flex-1 truncate font-semibold text-white ${compact ? "text-sm" : "text-base sm:text-lg"}`}
          >
            {board.home.name}
          </p>
          <div className="flex shrink-0 items-baseline gap-2 font-display tracking-wide">
            <span className={compact ? "text-xl text-white" : "text-3xl text-white sm:text-4xl"}>
              {board.home.score}
            </span>
            <span className="text-sm text-zinc-500">–</span>
            <span className={compact ? "text-xl text-white" : "text-3xl text-white sm:text-4xl"}>
              {board.away.score}
            </span>
          </div>
          <p
            className={`min-w-0 flex-1 truncate text-right font-semibold text-white ${compact ? "text-sm" : "text-base sm:text-lg"}`}
          >
            {board.away.name}
          </p>
        </div>
        <div className={`flex items-center gap-2 ${compact ? "" : "mt-3 border-t border-white/8 pt-3"}`}>
          <StatusPill live={live} status={board.status} />
          {board.clock ? (
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
              {board.clock}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-1.5"
          : "rounded-2xl border border-white/10 bg-[#141814] px-4 py-4 sm:px-5"
      }
    >
      <ol className={`flex min-w-0 ${compact ? "flex-wrap gap-x-3 gap-y-1" : "flex-col gap-2 sm:flex-row sm:gap-4"}`}>
        {board.leaders.slice(0, 3).map((leader) => (
          <li
            key={`${leader.pos}-${leader.driver}`}
            className={`min-w-0 ${compact ? "text-sm" : "flex flex-1 items-baseline gap-2 border-b border-white/6 pb-2 sm:border-b-0 sm:pb-0"}`}
          >
            <span className="font-display text-sky-400">P{leader.pos}</span>{" "}
            <span className="font-semibold text-white">{leader.driver}</span>
            {!compact && leader.gap ? (
              <span className="text-xs text-zinc-500">{leader.gap}</span>
            ) : null}
          </li>
        ))}
      </ol>
      <div className={`flex items-center gap-2 ${compact ? "" : "mt-3 border-t border-white/8 pt-3"}`}>
        <StatusPill live={live} status={board.status} />
        {board.sessionLabel ? (
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            {board.sessionLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({
  live,
  status,
}: {
  live: boolean;
  status: FixtureLiveBoard["status"];
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
        live ? "text-emerald-400" : "text-zinc-500"
      }`}
    >
      {live ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
      ) : null}
      {statusLabel(status)}
    </span>
  );
}
