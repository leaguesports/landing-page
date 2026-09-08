import {
  formatTournamentSport,
  formatTournamentStatus,
  TOURNAMENTS_HREF,
  partitionMineLists,
  tournamentHref,
  type TournamentsMineSnapshot,
} from "@/lib/tournaments/tournaments";
import { takeHubPreview } from "@/lib/sports/hub-ia";
import { ArrowUpRight, Medal } from "lucide-react";
import Link from "next/link";

const PREVIEW_LIMIT = 4;

type TournamentsStripProps = {
  snapshot: TournamentsMineSnapshot;
};

export function TournamentsStrip({ snapshot }: TournamentsStripProps) {
  const lists = partitionMineLists(snapshot);
  const preview = takeHubPreview(
    [...lists.organizing, ...lists.entered, ...lists.completed],
    PREVIEW_LIMIT,
  );
  if (preview.length === 0) return null;

  return (
    <section aria-labelledby="hub-tournaments" className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3
            id="hub-tournaments"
            className="font-display text-xl tracking-wide text-white"
          >
            Tournaments
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            Events you are running or entered in.
          </p>
        </div>
        <Link
          href={TOURNAMENTS_HREF}
          className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          See all
        </Link>
      </div>
      <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
        {preview.map((row) => (
          <li key={row.id}>
            <Link
              href={tournamentHref(row.id)}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/3 sm:px-5"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-emerald-200">
                <Medal className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                  {formatTournamentSport(row.sport)} ·{" "}
                  {formatTournamentStatus(row.status)}
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-white">
                  {row.name}
                </span>
              </span>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-zinc-600"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
