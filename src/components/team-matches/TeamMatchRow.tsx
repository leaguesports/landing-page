import {
  formatTeamMatchSport,
  formatTeamMatchStatus,
  formatTeamMatchVersus,
  teamMatchHref,
  type TeamMatchPreview,
} from "@/lib/team-matches/team-matches";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type TeamMatchRowProps = {
  match: TeamMatchPreview;
  now?: Date;
};

export function TeamMatchRow({ match, now = new Date() }: TeamMatchRowProps) {
  const when = formatHubWhen(match.startsAt, now);

  return (
    <li>
      <Link
        href={teamMatchHref(match.id)}
        className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 transition-colors hover:border-white/16"
      >
        <span className="min-w-0">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {formatTeamMatchSport(match.sport)} · {formatTeamMatchStatus(match.status)}
          </span>
          <span className="mt-1 block truncate text-sm font-medium text-white">
            {formatTeamMatchVersus(match)}
          </span>
          <span className="mt-0.5 block truncate text-xs text-zinc-500">
            {when ?? "Time TBC"}
          </span>
        </span>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
      </Link>
    </li>
  );
}
