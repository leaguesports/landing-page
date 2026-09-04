import Link from "next/link";
import {
  didPlayerWin,
  formatHistoryDate,
  formatHistoryOpponents,
  formatHistoryScore,
} from "@/lib/padel/history";
import type { PadelHistoryItem } from "@/types/padel-match";

export function PadelHistoryList({
  items,
  playerUserId,
}: {
  items: PadelHistoryItem[];
  /** When set, each row shows Win/Loss for this account. */
  playerUserId?: string;
}) {
  return (
    <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
      {items.map((item) => {
        const venueName = item.venueName?.trim() || "Padel court";
        const won = playerUserId ? didPlayerWin(item, playerUserId) : null;

        return (
          <li key={item.id} className="px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {won === true ? (
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                    Win
                  </span>
                ) : won === false ? (
                  <span className="rounded-full border border-red-500/30 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-300">
                    Loss
                  </span>
                ) : null}
                <time
                  dateTime={item.startsAt || undefined}
                  className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
                >
                  {formatHistoryDate(item.startsAt)}
                </time>
              </div>
              <p className="font-display text-lg tracking-wide text-white tabular-nums">
                {formatHistoryScore(item.score)}
              </p>
            </div>
            {item.venueSlug ? (
              <Link
                href={`/venues/${item.venueSlug}`}
                className="mt-1 inline-block text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                {venueName}
              </Link>
            ) : (
              <p className="mt-1 text-sm font-medium text-zinc-200">{venueName}</p>
            )}
            <p className="mt-1 text-sm text-zinc-400">
              {formatHistoryOpponents(item.opponents)}
            </p>
            <Link
              href={`/padel/${item.id}`}
              className="mt-3 inline-flex text-sm font-medium text-zinc-300 hover:text-white"
            >
              Open scorecard
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
