import { formatHistoryDate } from "@/lib/padel/history";
import { buildPadelLockedScorecard } from "@/lib/padel/locked-scorecard";
import type { PadelMatch } from "@/types/padel-match";

type PadelLockedScorecardProps = {
  match: PadelMatch;
};

function TeamRow({
  label,
  cells,
  setsWon,
  isWinner,
}: {
  label: string;
  cells: Array<{
    display: string;
    tieBreakPoints: number | null;
    won: boolean;
  }>;
  setsWon: number;
  isWinner: boolean;
}) {
  return (
    <tr
      className={
        isWinner
          ? "bg-emerald-400/10"
          : "bg-white/[0.02]"
      }
    >
      <th
        scope="row"
        className={[
          "min-w-[7.5rem] px-4 py-4 text-left text-sm font-semibold",
          isWinner ? "text-emerald-200" : "text-white",
        ].join(" ")}
      >
        <span className="block truncate">{label}</span>
        {isWinner ? (
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            Winner
          </span>
        ) : null}
      </th>
      {cells.map((cell, index) => (
        <td key={index} className="px-2 py-4 text-center">
          <span
            className={[
              "font-display text-4xl tracking-wide tabular-nums",
              cell.won ? "text-white" : "text-zinc-500",
            ].join(" ")}
          >
            {cell.display}
          </span>
          {cell.tieBreakPoints != null ? (
            <span className="ml-0.5 align-super text-[11px] tabular-nums text-zinc-400">
              {cell.tieBreakPoints}
            </span>
          ) : null}
        </td>
      ))}
      <td className="bg-white/5 px-3 py-4 text-center">
        <span
          className={[
            "font-display text-3xl tracking-wide tabular-nums",
            isWinner ? "text-emerald-300" : "text-white",
          ].join(" ")}
        >
          {setsWon}
        </span>
      </td>
    </tr>
  );
}

export function PadelLockedScorecard({ match }: PadelLockedScorecardProps) {
  const card = buildPadelLockedScorecard(match);
  const dateIso = match.startsAt || match.lockedAt || match.createdAt || "";
  const dateLabel = dateIso ? formatHistoryDate(dateIso) : null;
  const rulesLabel =
    match.ruleset === "golden_point" ? "Golden Point" : "Advantage";
  const venueName = match.venue?.name?.trim() || "Padel match";

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#101410] text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Locked · Padel
          </p>
          <p className="mt-0.5 truncate font-display text-xl tracking-wide">
            {venueName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-zinc-500">
            {[rulesLabel, dateLabel && dateLabel !== "—" ? dateLabel : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
          Saved
        </span>
      </div>

      {card.setLabels.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          No set scores on this result.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <caption className="sr-only">
              Set-by-set padel scorecard for {venueName}
            </caption>
            <thead>
              <tr className="bg-white/[0.04] text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                <th scope="col" className="px-4 py-2 text-left">
                  Pair
                </th>
                {card.setLabels.map((label) => (
                  <th key={label} scope="col" className="px-2 py-2 text-center">
                    Set {label}
                  </th>
                ))}
                <th
                  scope="col"
                  className="bg-white/[0.06] px-3 py-2 text-center text-zinc-300"
                >
                  Sets
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              <TeamRow
                label={card.teamA.label}
                cells={card.teamA.cells}
                setsWon={card.teamA.setsWon}
                isWinner={card.teamA.isWinner}
              />
              <TeamRow
                label={card.teamB.label}
                cells={card.teamB.cells}
                setsWon={card.teamB.setsWon}
                isWinner={card.teamB.isWinner}
              />
            </tbody>
          </table>
        </div>
      )}

      {card.winnerLabel ? (
        <p className="border-t border-white/8 px-4 py-3 text-center text-sm font-medium text-emerald-300">
          Final — {card.winnerLabel} win
        </p>
      ) : null}
    </div>
  );
}
