import { TournamentRow } from "@/components/tournaments/TournamentRow";
import {
  TOURNAMENTS_NEW_HREF,
  partitionMineLists,
  type TournamentsMineSnapshot,
} from "@/lib/tournaments/tournaments";
import Link from "next/link";

type TournamentsMineProps = {
  snapshot: TournamentsMineSnapshot;
};

export function TournamentsMine({ snapshot }: TournamentsMineProps) {
  const lists = partitionMineLists(snapshot);
  const empty =
    lists.organizing.length === 0 &&
    lists.entered.length === 0 &&
    lists.completed.length === 0;

  return (
    <div className="space-y-8">
      {empty ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No tournaments yet. Create a single-elimination draw for 4, 8, or 16
            teams, then invite captains.
          </p>
          <Link
            href={TOURNAMENTS_NEW_HREF}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            New tournament
          </Link>
        </div>
      ) : (
        <>
          <section aria-labelledby="organizing-tournaments">
            <h2
              id="organizing-tournaments"
              className="font-display text-2xl tracking-wide text-white"
            >
              Organizing
            </h2>
            {lists.organizing.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Nothing you are running right now.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lists.organizing.map((row) => (
                  <TournamentRow key={row.id} tournament={row} />
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="entered-tournaments">
            <h2
              id="entered-tournaments"
              className="font-display text-2xl tracking-wide text-white"
            >
              Entered
            </h2>
            {lists.entered.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                No live entries on your teams.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lists.entered.map((row) => (
                  <TournamentRow key={row.id} tournament={row} />
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="completed-tournaments">
            <h2
              id="completed-tournaments"
              className="font-display text-2xl tracking-wide text-white"
            >
              Completed
            </h2>
            {lists.completed.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No finished events yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lists.completed.map((row) => (
                  <TournamentRow key={row.id} tournament={row} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
