import { TeamMatchRow } from "@/components/team-matches/TeamMatchRow";
import {
  TEAM_MATCHES_NEW_HREF,
  type TeamMatchesMineSnapshot,
} from "@/lib/team-matches/team-matches";
import Link from "next/link";

type TeamMatchesMineProps = {
  snapshot: TeamMatchesMineSnapshot;
};

export function TeamMatchesMine({ snapshot }: TeamMatchesMineProps) {
  const empty = snapshot.upcoming.length === 0 && snapshot.recent.length === 0;

  return (
    <div className="space-y-8">
      {empty ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No team matches yet. Challenge another squad in the same sport, or
            join from a captain link.
          </p>
          <Link
            href={TEAM_MATCHES_NEW_HREF}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            New challenge
          </Link>
        </div>
      ) : (
        <>
          <section aria-labelledby="upcoming-team-matches">
            <h2
              id="upcoming-team-matches"
              className="font-display text-2xl tracking-wide text-white"
            >
              Upcoming
            </h2>
            {snapshot.upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">Nothing upcoming.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {snapshot.upcoming.map((match) => (
                  <TeamMatchRow key={match.id} match={match} />
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="recent-team-matches">
            <h2
              id="recent-team-matches"
              className="font-display text-2xl tracking-wide text-white"
            >
              Recent
            </h2>
            {snapshot.recent.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No recent results.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {snapshot.recent.map((match) => (
                  <TeamMatchRow key={match.id} match={match} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
