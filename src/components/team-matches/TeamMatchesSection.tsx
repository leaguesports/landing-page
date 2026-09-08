import { TeamMatchRow } from "@/components/team-matches/TeamMatchRow";
import {
  canCreateChallenge,
  partitionTeamMatches,
  teamMatchNewHref,
  type TeamMatchPreview,
} from "@/lib/team-matches/team-matches";
import type { PublicTeam } from "@/lib/teams/teams";
import { TEAM_TOURNAMENTS_COMING_LATER } from "@/lib/teams/teams";
import Link from "next/link";

type TeamMatchesSectionProps = {
  team: PublicTeam;
  matches: TeamMatchPreview[];
};

export function TeamMatchesSection({ team, matches }: TeamMatchesSectionProps) {
  const { upcoming, recent } = partitionTeamMatches(matches);
  const canChallenge = canCreateChallenge(team.myRole);

  return (
    <section aria-labelledby="team-matches-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Matches
          </p>
          <h2
            id="team-matches-heading"
            className="mt-1 font-display text-2xl tracking-wide text-white"
          >
            Team vs team
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            Challenge another {team.sport} squad, set a lineup, and start a live
            scorecard.
          </p>
        </div>
        {canChallenge ? (
          <Link
            href={teamMatchNewHref(team.id)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Challenge
          </Link>
        ) : null}
      </div>

      {upcoming.length === 0 && recent.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
          No matches yet.
          {canChallenge
            ? " Challenge a same-sport team or share a captain link."
            : " Ask an owner or captain to send a challenge."}
        </p>
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-200">Upcoming</h3>
              <ul className="space-y-2">
                {upcoming.map((row) => (
                  <TeamMatchRow key={row.id} match={row} />
                ))}
              </ul>
            </div>
          ) : null}
          {recent.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-200">Recent</h3>
              <ul className="space-y-2">
                {recent.map((row) => (
                  <TeamMatchRow key={row.id} match={row} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <p className="text-sm leading-relaxed text-zinc-500">
        {TEAM_TOURNAMENTS_COMING_LATER}
      </p>
    </section>
  );
}
