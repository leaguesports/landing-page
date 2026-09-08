import {
  canStartFixture,
  fixtureNavigateHref,
  formatRoundLabel,
  slotsByRound,
  type PublicSlot,
  type PublicTournament,
} from "@/lib/tournaments/tournaments";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type TournamentBracketProps = {
  tournament: PublicTournament;
  pending: boolean;
  onStartFixture: (slotId: string) => void;
};

function teamLabel(
  team: PublicSlot["homeTeam"],
  seed: number | null,
): string {
  if (!team) return "TBD";
  return seed ? `${team.name} (${seed})` : team.name;
}

export function TournamentBracket({
  tournament,
  pending,
  onStartFixture,
}: TournamentBracketProps) {
  const grouped = slotsByRound(tournament.bracket.slots);
  const rounds = [...grouped.keys()].sort((a, b) => a - b);

  if (rounds.length === 0) {
    return (
      <p className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm text-zinc-400">
        Bracket appears after the draw is generated.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <section key={round} aria-labelledby={`round-${round}`}>
          <h3
            id={`round-${round}`}
            className="mb-2 text-sm font-semibold text-zinc-200"
          >
            {formatRoundLabel(round, tournament.size)}
          </h3>
          <ul className="space-y-2">
            {(grouped.get(round) ?? []).map((slot) => {
              const matchHref = fixtureNavigateHref(slot);
              const winner =
                slot.winnerTeamId === slot.homeTeam?.id
                  ? slot.homeTeam
                  : slot.winnerTeamId === slot.awayTeam?.id
                    ? slot.awayTeam
                    : null;
              const canStart = canStartFixture(tournament, slot);
              return (
                <li
                  key={slot.id}
                  className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                    Slot {slot.position}
                    {winner ? ` · ${winner.name} advance` : ""}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {teamLabel(slot.homeTeam, slot.homeSeed)} vs{" "}
                    {teamLabel(slot.awayTeam, slot.awaySeed)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {matchHref ? (
                      <Link
                        href={matchHref}
                        className="inline-flex min-h-10 items-center gap-1 rounded-full border border-white/12 px-4 text-xs font-medium text-white hover:bg-white/5"
                      >
                        Team match
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : canStart ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onStartFixture(slot.id)}
                        className="inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-400 px-4 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                      >
                        Start fixture
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Waiting for both teams
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
