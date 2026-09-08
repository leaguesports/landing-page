import {
  formatTeamMatchSport,
  formatTeamMatchStatus,
  formatTeamMatchVersus,
  TEAM_MATCHES_HREF,
  teamMatchHref,
  type TeamMatchesMineSnapshot,
} from "@/lib/team-matches/team-matches";
import { formatHubWhen } from "@/lib/sports/hub-feed";
import { takeHubPreview } from "@/lib/sports/hub-ia";
import { ArrowUpRight, Trophy } from "lucide-react";
import Link from "next/link";

const PREVIEW_LIMIT = 4;

type TeamMatchesStripProps = {
  snapshot: TeamMatchesMineSnapshot;
  nowIso: string;
};

export function TeamMatchesStrip({ snapshot, nowIso }: TeamMatchesStripProps) {
  const now = new Date(nowIso);
  const upcoming = takeHubPreview(snapshot.upcoming, PREVIEW_LIMIT);
  const recent = takeHubPreview(snapshot.recent, PREVIEW_LIMIT);
  if (upcoming.length === 0 && recent.length === 0) return null;

  return (
    <section aria-labelledby="hub-team-matches" className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3
            id="hub-team-matches"
            className="font-display text-xl tracking-wide text-white"
          >
            Team matches
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            Upcoming challenges and recent results.
          </p>
        </div>
        <Link
          href={TEAM_MATCHES_HREF}
          className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          See all
        </Link>
      </div>
      <ul className="divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
        {upcoming.map((row) => (
          <li key={`up-${row.id}`}>
            <Link
              href={teamMatchHref(row.id)}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/3 sm:px-5"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-emerald-200">
                <Trophy className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                  {formatTeamMatchSport(row.sport)} ·{" "}
                  {formatTeamMatchStatus(row.status)}
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-white">
                  {formatTeamMatchVersus(row)}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {formatHubWhen(row.startsAt, now) ?? "Time TBC"}
                </span>
              </span>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-zinc-600"
                aria-hidden
              />
            </Link>
          </li>
        ))}
        {upcoming.length === 0
          ? recent.map((row) => (
              <li key={`re-${row.id}`}>
                <Link
                  href={teamMatchHref(row.id)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/3 sm:px-5"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-emerald-200">
                    <Trophy className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                      {formatTeamMatchSport(row.sport)} ·{" "}
                      {formatTeamMatchStatus(row.status)}
                    </span>
                    <span className="mt-1 block truncate text-sm font-medium text-white">
                      {formatTeamMatchVersus(row)}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="mt-1 h-4 w-4 shrink-0 text-zinc-600"
                    aria-hidden
                  />
                </Link>
              </li>
            ))
          : null}
      </ul>
    </section>
  );
}
