import { TournamentRow } from "@/components/tournaments/TournamentRow";
import { canCreateChallenge } from "@/lib/team-matches/team-matches";
import type { PublicTeam } from "@/lib/teams/teams";
import {
  TOURNAMENTS_HREF,
  type PublicTournamentSummary,
} from "@/lib/tournaments/tournaments";
import Link from "next/link";

type TeamTournamentsSectionProps = {
  team: PublicTeam;
  tournaments: PublicTournamentSummary[];
};

export function TeamTournamentsSection({
  team,
  tournaments,
}: TeamTournamentsSectionProps) {
  const canEnter = canCreateChallenge(team.myRole);

  return (
    <section aria-labelledby="team-tournaments-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Tournaments
          </p>
          <h2
            id="team-tournaments-heading"
            className="mt-1 font-display text-2xl tracking-wide text-white"
          >
            Single-elim draws
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            {team.sport} events this squad has entered or been invited to.
          </p>
        </div>
        <Link
          href={TOURNAMENTS_HREF}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white/5"
        >
          Browse
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
          No tournaments yet.
          {canEnter
            ? " Register from an invite link, or create one and invite captains."
            : " Ask an owner or captain to enter this squad."}
        </p>
      ) : (
        <ul className="space-y-2">
          {tournaments.map((row) => (
            <TournamentRow key={row.id} tournament={row} />
          ))}
        </ul>
      )}
    </section>
  );
}
