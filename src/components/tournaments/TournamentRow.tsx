import {
  formatAcceptedProgress,
  formatTournamentSize,
  formatTournamentSport,
  formatTournamentStatus,
  tournamentHref,
  type PublicTournamentSummary,
} from "@/lib/tournaments/tournaments";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type TournamentRowProps = {
  tournament: PublicTournamentSummary;
};

export function TournamentRow({ tournament }: TournamentRowProps) {
  return (
    <li>
      <Link
        href={tournamentHref(tournament.id)}
        className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
      >
        <span className="min-w-0">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {formatTournamentSport(tournament.sport)} ·{" "}
            {formatTournamentStatus(tournament.status)} ·{" "}
            {formatTournamentSize(tournament.size)}
          </span>
          <span className="mt-1 block truncate text-sm font-medium text-white">
            {tournament.name}
          </span>
          <span className="mt-0.5 block truncate text-xs text-zinc-500">
            {formatAcceptedProgress(tournament.acceptedCount, tournament.size)}
          </span>
        </span>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
      </Link>
    </li>
  );
}
