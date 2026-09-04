import Link from "next/link";
import {
  formatGolfHistoryDate,
  formatGolfHistoryPlayers,
  formatGolfHistoryScore,
} from "@/lib/golf/history";
import type { GolfHistoryItem } from "@/types/golf-round";

export function GolfHistoryList({ items }: { items: GolfHistoryItem[] }) {
  return (
    <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
      {items.map((item) => {
        const venueName = item.venueName?.trim() || "Golf course";
        return (
          <li key={item.id} className="px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <time
                dateTime={item.startsAt || undefined}
                className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
              >
                {formatGolfHistoryDate(item.startsAt)}
              </time>
              <p className="font-display text-lg tracking-wide text-white tabular-nums">
                {formatGolfHistoryScore(item)}
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
              {formatGolfHistoryPlayers(item.players)}
              {item.holesPlayed ? ` · ${item.holesPlayed} holes` : ""}
              {item.teeName ? ` · ${item.teeName}` : ""}
            </p>
            <Link
              href={`/golf/${item.id}`}
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
