import { formatGolfHistoryDate } from "@/lib/golf/history";
import {
  buildGolfLockedScorecard,
  formatToPar,
  type GolfScoreRel,
  type GolfScorecardCell,
} from "@/lib/golf/locked-scorecard";
import type { GolfLiveStrokes, GolfRound } from "@/types/golf-round";

type GolfLockedScorecardProps = {
  round: GolfRound;
  strokes: GolfLiveStrokes;
};

function relClass(rel: GolfScoreRel): string {
  switch (rel) {
    case "eagle":
      return "inline-flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-amber-400/80 text-amber-300";
    case "birdie":
      return "inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-emerald-400/80 text-emerald-300";
    case "bogey":
      return "inline-flex h-7 w-7 items-center justify-center rounded-[3px] ring-1 ring-zinc-400/70 text-zinc-200";
    case "double":
      return "inline-flex h-7 w-7 items-center justify-center rounded-[3px] ring-2 ring-rose-400/80 text-rose-300";
    default:
      return "tabular-nums text-white";
  }
}

function relLabel(rel: GolfScoreRel | null): string | null {
  if (rel === "eagle") return "eagle or better";
  if (rel === "birdie") return "birdie";
  if (rel === "bogey") return "bogey";
  if (rel === "double") return "double bogey or worse";
  return null;
}

function ScoreCell({
  cell,
  marked,
}: {
  cell: GolfScorecardCell;
  marked: boolean;
}) {
  if (!marked || cell.rel == null || cell.rel === "par") {
    return (
      <span className="tabular-nums text-white">{cell.display || "—"}</span>
    );
  }
  const label = relLabel(cell.rel);
  return (
    <span className={relClass(cell.rel)}>
      {cell.display}
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}

export function GolfLockedScorecard({
  round,
  strokes,
}: GolfLockedScorecardProps) {
  const card = buildGolfLockedScorecard(
    round.players,
    strokes,
    round.course.holes,
  );
  const dateLabel = formatGolfHistoryDate(round.startsAt);
  const courseName =
    round.venue?.name?.trim() || round.course.name?.trim() || "Golf scorecard";

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#101410] text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Locked · Golf
          </p>
          <p className="mt-0.5 truncate font-display text-xl tracking-wide">
            {courseName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-zinc-500">
            {[
              round.teeName,
              round.holesPlayed === 18 ? "18 holes" : `${round.holesPlayed} holes`,
              dateLabel !== "—" ? dateLabel : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
          Locked
        </span>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="min-w-max border-collapse text-center text-[11px] sm:text-xs">
          <caption className="sr-only">
            Hole-by-hole golf scorecard for {courseName}
          </caption>
          <thead>
            <tr className="bg-white/[0.04]">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[4.75rem] bg-[#141814] px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 shadow-[1px_0_0_rgba(255,255,255,0.08)]"
              >
                Hole
              </th>
              {card.columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={[
                    "min-w-8 px-1 py-2 font-semibold tabular-nums",
                    column.kind === "hole"
                      ? "text-zinc-400"
                      : "bg-white/[0.06] text-zinc-200",
                  ].join(" ")}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-emerald-400/[0.06]">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-[#122016] px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300/80 shadow-[1px_0_0_rgba(255,255,255,0.08)]"
              >
                Par
              </th>
              {card.parRow.map((cell, index) => (
                <td
                  key={card.columns[index]?.key ?? index}
                  className={[
                    "px-1 py-1.5 tabular-nums text-emerald-100/90",
                    card.columns[index]?.kind === "hole"
                      ? "font-medium"
                      : "bg-emerald-400/10 font-semibold",
                  ].join(" ")}
                >
                  {cell.display}
                </td>
              ))}
            </tr>
            <tr className="bg-white/[0.02]">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-[#121512] px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 shadow-[1px_0_0_rgba(255,255,255,0.08)]"
              >
                SI
              </th>
              {card.siRow.map((cell, index) => (
                <td
                  key={card.columns[index]?.key ?? index}
                  className="px-1 py-1.5 tabular-nums text-zinc-500"
                >
                  {cell.display}
                </td>
              ))}
            </tr>
            {card.players.map((player) => (
              <tr
                key={player.slot}
                className={
                  player.isLeader ? "bg-emerald-400/10" : "bg-transparent"
                }
              >
                <th
                  scope="row"
                  className={[
                    "sticky left-0 z-10 max-w-[5.5rem] truncate px-2 py-2 text-left text-xs font-semibold shadow-[1px_0_0_rgba(255,255,255,0.08)]",
                    player.isLeader
                      ? "bg-[#15251a] text-emerald-200"
                      : "bg-[#101410] text-white",
                  ].join(" ")}
                >
                  {player.displayName}
                </th>
                {player.cells.map((cell, index) => {
                  const column = card.columns[index];
                  const summary = column?.kind !== "hole";
                  return (
                    <td
                      key={column?.key ?? index}
                      className={[
                        "px-1 py-1.5",
                        summary ? "bg-white/5 font-semibold" : "",
                      ].join(" ")}
                    >
                      <ScoreCell cell={cell} marked={!summary} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-white/8 border-t border-white/8 bg-white/[0.02]">
        {card.players.map((player) => (
          <li
            key={player.slot}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span
              className={[
                "truncate text-sm",
                player.isLeader
                  ? "font-semibold text-emerald-200"
                  : "text-zinc-300",
              ].join(" ")}
            >
              {player.displayName}
              {player.isLeader ? (
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                  Low
                </span>
              ) : null}
            </span>
            <span className="text-sm tabular-nums text-white">
              {player.gross}
              <span className="ml-2 text-zinc-500">
                {formatToPar(player.toPar)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="px-4 py-2 text-[10px] leading-relaxed text-zinc-500">
        Circle is birdie or better. Square is bogey or worse.
      </p>
    </div>
  );
}
