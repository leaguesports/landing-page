import type { FixtureStatus, PoolUiState } from "@/types/pool";

const STATUS_STYLES: Record<
  FixtureStatus | "OPEN" | "LOCKED",
  { label: string; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  LIVE: {
    label: "Live",
    className: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  FINISHED: {
    label: "Finished",
    className: "border-green-500/30 bg-green-500/10 text-green-300",
  },
  POSTPONED: {
    label: "Postponed",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  },
  OPEN: {
    label: "Predictions open",
    className: "border-green-500/30 bg-green-500/10 text-green-300",
  },
  LOCKED: {
    label: "Predictions closed",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
};

export default function PoolStatusBadge({
  fixtureStatus,
  uiState,
}: {
  fixtureStatus: FixtureStatus;
  uiState: PoolUiState;
}) {
  const config =
    uiState === "open"
      ? STATUS_STYLES.OPEN
      : uiState === "locked"
        ? STATUS_STYLES.LOCKED
        : STATUS_STYLES[fixtureStatus];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
