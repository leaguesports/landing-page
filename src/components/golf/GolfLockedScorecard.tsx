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
      return "inline-flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-amber-700 text-amber-800";
    case "birdie":
      return "inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-emerald-700 text-emerald-800";
    case "bogey":
      return "inline-flex h-7 w-7 items-center justify-center rounded-[3px] ring-1 ring-zinc-600 text-zinc-800";
    case "double":
      return "inline-flex h-7 w-7 items-center justify-center rounded-[3px] ring-2 ring-rose-700 text-rose-800";
    default:
      return "tabular-nums text-[#1a2a1c]";
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
      <span className="tabular-nums text-[#1a2a1c]">{cell.display || "—"}</span>
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
    <div className="overflow-hidden rounded-[1.25rem] border border-[#c8b896] bg-[#f3ead6] text-[#1a2a1c] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-start justify-between gap-3 bg-[#1e3a24] px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Scorecard
          </p>
          <p className="mt-0.5 truncate font-display text-xl tracking-wide">
            {courseName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-emerald-100/80">
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
            <tr className="bg-[#e4d7b8]">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[4.75rem] bg-[#e4d7b8] px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5c5344] shadow-[1px_0_0_#c8b896]"
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
                      ? "text-[#3d4a3d]"
                      : "bg-[#d8c79a] text-[#1a2a1c]",
                  ].join(" ")}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#dce8d4]">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-[#dce8d4] px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3d5c3d] shadow-[1px_0_0_#c8b896]"
              >
                Par
              </th>
              {card.parRow.map((cell, index) => (
                <td
                  key={card.columns[index]?.key ?? index}
                  className={[
                    "px-1 py-1.5 tabular-nums",
                    card.columns[index]?.kind === "hole"
                      ? "font-medium"
                      : "bg-[#cfe0c4] font-semibold",
                  ].join(" ")}
                >
                  {cell.display}
                </td>
              ))}
            </tr>
            <tr className="bg-[#efe6cc]">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-[#efe6cc] px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b5d3d] shadow-[1px_0_0_#c8b896]"
              >
                SI
              </th>
              {card.siRow.map((cell, index) => (
                <td
                  key={card.columns[index]?.key ?? index}
                  className="px-1 py-1.5 tabular-nums text-[#6b5d3d]"
                >
                  {cell.display}
                </td>
              ))}
            </tr>
            {card.players.map((player) => (
              <tr
                key={player.slot}
                className={player.isLeader ? "bg-[#e7f4e4]" : "bg-[#f7f1e2]"}
              >
                <th
                  scope="row"
                  className={[
                    "sticky left-0 z-10 max-w-[5.5rem] truncate px-2 py-2 text-left text-xs font-semibold shadow-[1px_0_0_#c8b896]",
                    player.isLeader
                      ? "bg-[#e7f4e4] text-emerald-900"
                      : "bg-[#f7f1e2] text-[#1a2a1c]",
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
                        summary ? "bg-[#efe3c2] font-semibold" : "",
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

      <ul className="divide-y divide-[#d8c79a] border-t border-[#d8c79a] bg-[#f7f1e2]">
        {card.players.map((player) => (
          <li
            key={player.slot}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span
              className={[
                "truncate text-sm",
                player.isLeader ? "font-semibold text-emerald-900" : "text-[#3d4a3d]",
              ].join(" ")}
            >
              {player.displayName}
              {player.isLeader ? (
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Low
                </span>
              ) : null}
            </span>
            <span className="text-sm tabular-nums text-[#1a2a1c]">
              {player.gross}
              <span className="ml-2 text-[#6b5d3d]">
                {formatToPar(player.toPar)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="px-4 py-2 text-[10px] leading-relaxed text-[#6b5d3d]">
        Circle is birdie or better. Square is bogey or worse.
      </p>
    </div>
  );
}
