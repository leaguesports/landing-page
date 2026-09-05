import Link from "next/link";
import type { PlayerHistoryStats } from "@/lib/padel/history";

type PadelProgressSummaryProps = {
  stats: PlayerHistoryStats;
  /** Compact strip for history page; full block for hub. */
  variant?: "hub" | "strip";
};

function FormPills({ recentForm }: { recentForm: PlayerHistoryStats["recentForm"] }) {
  if (recentForm.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Lock a match with a clear winner to start your form.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Recent form">
      {recentForm.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={
            result === "W"
              ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-300"
              : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-300"
          }
        >
          {result}
        </span>
      ))}
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        Last {recentForm.length}
      </span>
    </div>
  );
}

export function PadelProgressSummary({
  stats,
  variant = "hub",
}: PadelProgressSummaryProps) {
  if (stats.locked === 0) {
    return (
      <div
        className={
          variant === "hub"
            ? "mt-6 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6"
            : "rounded-3xl border border-white/8 bg-[#141814] px-5 py-5"
        }
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Progress
        </p>
        <h3 className="mt-2 font-display text-2xl tracking-wide text-white">
          No locked matches yet
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
          Play a padel match and lock the scorecard — wins, form, and win rate
          show up here from real results only.
        </p>
        <Link
          href="/padel/new"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
        >
          Start a match
        </Link>
      </div>
    );
  }

  const statTiles = [
    { label: "Locked", value: String(stats.locked) },
    { label: "Wins", value: String(stats.wins) },
    { label: "Losses", value: String(stats.losses) },
    { label: "Win rate", value: `${stats.winRate}%` },
  ];

  return (
    <div className={variant === "hub" ? "mt-6 space-y-4" : "space-y-4"}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Progress
          </p>
          {variant === "hub" ? (
            <h3 className="mt-1 font-display text-2xl tracking-wide text-white">
              Padel form
            </h3>
          ) : null}
        </div>
        {variant === "hub" ? (
          <Link
            href="/padel/history"
            className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Full history
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statTiles.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/8 bg-[#141814] px-4 py-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl tracking-wide text-white tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Recent form
        </p>
        <div className="mt-3">
          <FormPills recentForm={stats.recentForm} />
        </div>
      </div>
    </div>
  );
}
