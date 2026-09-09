import { GolfTourRow } from "@/components/golf-tours/GolfTourRow";
import {
  GOLF_TOURS_NEW_HREF,
  partitionMineTours,
  type PublicGolfTourSummary,
} from "@/lib/golf-tours/golf-tours";
import Link from "next/link";

type GolfToursMineProps = {
  tours: PublicGolfTourSummary[];
};

export function GolfToursMine({ tours }: GolfToursMineProps) {
  const lists = partitionMineTours(tours);
  const empty =
    lists.hosting.length === 0 &&
    lists.playing.length === 0 &&
    lists.completed.length === 0;

  return (
    <div className="space-y-8">
      {empty ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No golf tours yet. Host a multi-day camp event across courses, then
            start fourballs on the existing golf scorecard.
          </p>
          <Link
            href={GOLF_TOURS_NEW_HREF}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            New golf tour
          </Link>
        </div>
      ) : (
        <>
          <section aria-labelledby="hosting-golf-tours">
            <h2
              id="hosting-golf-tours"
              className="font-display text-2xl tracking-wide text-white"
            >
              Hosting
            </h2>
            {lists.hosting.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Nothing you are hosting right now.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lists.hosting.map((row) => (
                  <GolfTourRow key={row.id} tour={row} />
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="playing-golf-tours">
            <h2
              id="playing-golf-tours"
              className="font-display text-2xl tracking-wide text-white"
            >
              Playing
            </h2>
            {lists.playing.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                You are not seated in a live tour yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lists.playing.map((row) => (
                  <GolfTourRow key={row.id} tour={row} />
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="completed-golf-tours">
            <h2
              id="completed-golf-tours"
              className="font-display text-2xl tracking-wide text-white"
            >
              Completed
            </h2>
            {lists.completed.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No finished tours yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lists.completed.map((row) => (
                  <GolfTourRow key={row.id} tour={row} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
