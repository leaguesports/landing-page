import { cookies } from "next/headers";
import Link from "next/link";
import { PadelHistoryList } from "@/components/padel/PadelHistoryList";
import { getServerAuthState } from "@/lib/server-auth";
import { lookupVenueHistory } from "@/lib/padel/lookup-history";
import { VenueHistorySignIn } from "./VenueHistorySignIn";

export async function VenueMatchHistory({
  venueName,
  venueCmsId,
}: {
  venueName: string;
  venueCmsId: string;
}) {
  const auth = await getServerAuthState();
  const history = auth.isAuthenticated
    ? await lookupVenueHistory(venueCmsId, {
        cookie: (await cookies()).toString(),
      })
    : null;

  return (
    <section
      id="match-history"
      className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Results
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            Match history
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Locked results at {venueName}.
          </p>
        </header>

        <div className="max-w-3xl">
          {!auth.isAuthenticated ? (
            <VenueHistorySignIn />
          ) : history?.error ? (
            <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {history.error}
            </p>
          ) : history && history.items.length === 0 ? (
            <div className="space-y-5 rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-6 text-sm leading-relaxed text-zinc-400">
              <p>No locked matches at this venue yet.</p>
              <Link
                href="/padel/new"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
              >
                Play a match
              </Link>
            </div>
          ) : history ? (
            <PadelHistoryList
              items={history.items}
              playerUserId={auth.user?.id}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
