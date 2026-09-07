import { formatDartsHistoryDate } from "@/lib/darts/history";
import { buildDartsLockedScorecard } from "@/lib/darts/locked-scorecard";
import type { DartsMatch } from "@/types/darts-match";

type DartsLockedScorecardProps = {
  match: DartsMatch;
};

export function DartsLockedScorecard({ match }: DartsLockedScorecardProps) {
  const card = buildDartsLockedScorecard(match);
  const dateIso = match.startsAt || match.lockedAt || "";
  const dateLabel = dateIso ? formatDartsHistoryDate(dateIso) : null;
  const venueName = match.venue?.name?.trim() || "Home game";

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#101410] text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Locked · Darts {card.startingScore}
          </p>
          <p className="mt-0.5 truncate font-display text-xl tracking-wide">
            {venueName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-zinc-500">
            {[
              "Double-out",
              dateLabel && dateLabel !== "—" ? dateLabel : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
          Locked
        </span>
      </div>

      <ul className="divide-y divide-white/8">
        {card.players.map((player) => (
          <li
            key={player.slot}
            className={[
              "flex items-center justify-between gap-3 px-4 py-4 sm:px-5",
              player.isWinner ? "bg-emerald-400/10" : "",
            ].join(" ")}
          >
            <div className="min-w-0">
              <p
                className={[
                  "truncate text-sm font-medium",
                  player.isWinner ? "text-emerald-100" : "text-white",
                ].join(" ")}
              >
                {player.displayName}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {player.isWinner ? (
                  <>
                    Winner
                    {player.checkoutScore != null
                      ? ` · checkout ${player.checkoutScore}`
                      : ""}
                  </>
                ) : player.average != null ? (
                  <>
                    {player.visits} visit{player.visits === 1 ? "" : "s"} · avg{" "}
                    {player.average}
                  </>
                ) : (
                  "No visits"
                )}
              </p>
            </div>
            <span
              className={[
                "font-display text-4xl tabular-nums tracking-wide",
                player.isWinner ? "text-emerald-300" : "text-white",
              ].join(" ")}
            >
              {player.remaining}
            </span>
          </li>
        ))}
      </ul>

      {card.visits.length > 0 ? (
        <div className="border-t border-white/8">
          <p className="px-4 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:px-5">
            Visits
          </p>
          <ol className="max-h-56 divide-y divide-white/6 overflow-y-auto">
            {card.visits.map((visit) => (
              <li
                key={visit.turnNumber}
                className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
              >
                <span className="min-w-0 truncate text-sm text-zinc-300">
                  <span className="mr-2 tabular-nums text-zinc-600">
                    {visit.turnNumber}.
                  </span>
                  {visit.displayName}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-white">
                  {visit.score}
                  {visit.bust ? (
                    <span className="ml-2 text-amber-300">bust</span>
                  ) : null}
                  {visit.checkout ? (
                    <span className="ml-2 text-emerald-300">out</span>
                  ) : null}
                  <span className="ml-2 text-zinc-600">
                    → {visit.remainingAfter}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="border-t border-white/8 px-4 py-6 text-center text-sm text-zinc-500">
          No visit log on this result.
        </p>
      )}

      {card.winnerLabel ? (
        <p className="border-t border-white/8 px-4 py-3 text-center text-sm font-medium text-emerald-300">
          {card.winnerLabel} checked out
          {card.checkoutScore != null ? ` on ${card.checkoutScore}` : ""}
        </p>
      ) : null}
    </div>
  );
}
