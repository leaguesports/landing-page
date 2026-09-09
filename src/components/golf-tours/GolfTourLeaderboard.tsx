import {
  formatAvgGross,
  type PublicGolfTourLeaderboard,
} from "@/lib/golf-tours/golf-tours";

type GolfTourLeaderboardProps = {
  leaderboard: PublicGolfTourLeaderboard | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

export function GolfTourLeaderboard({
  leaderboard,
  loading = false,
  error = null,
  onRefresh,
}: GolfTourLeaderboardProps) {
  const hasRows =
    leaderboard?.camps.some((camp) => camp.players.length > 0) ?? false;

  return (
    <section
      aria-labelledby="golf-tour-leaderboard"
      className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="golf-tour-leaderboard"
            className="font-display text-2xl tracking-wide text-white"
          >
            Leaderboard
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            Average gross on locked, non-sit-out fourball scorecards. Live
            cards and sit-outs do not count until they are locked and playing.
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-white/12 px-3 text-xs font-medium text-zinc-300 hover:border-white/20 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {!hasRows ? (
        <p className="mt-4 text-sm text-zinc-500">
          No locked scores yet. Start a fourball, play the card, then lock it
          to appear here. Sit-outs are excluded.
        </p>
      ) : (
        <div className="mt-5 space-y-6">
          {leaderboard?.camps.map((camp) => (
            <div key={camp.campId}>
              <h3 className="text-sm font-medium text-white">{camp.name}</h3>
              {camp.players.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">
                  No locked rounds in this camp.
                </p>
              ) : (
                <ol className="mt-2 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
                  {camp.players.map((player, index) => (
                    <li
                      key={player.playerKey}
                      className="flex items-baseline justify-between gap-3 px-4 py-2.5"
                    >
                      <span className="min-w-0">
                        <span className="mr-2 tabular-nums text-xs text-zinc-500">
                          {index + 1}
                        </span>
                        <span className="text-sm text-white">
                          {player.displayName}
                        </span>
                        {player.isGuest ? (
                          <span className="ml-2 text-[11px] uppercase tracking-wide text-zinc-500">
                            Guest
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-medium tabular-nums text-emerald-200">
                          {formatAvgGross(player.avgGross)}
                        </span>
                        <span className="block text-[11px] tabular-nums text-zinc-500">
                          {player.totalStrokes} total · {player.playerRoundsCounted}
                          {player.playerRoundsCounted === 1 ? " round" : " rounds"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
