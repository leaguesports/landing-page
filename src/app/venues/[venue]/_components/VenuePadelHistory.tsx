import { PadelHistoryList } from "@/components/padel/PadelHistoryList";
import type { HistoryLookup } from "@/lib/padel/lookup-history";

export function VenuePadelHistory({
  venueName,
  lookup,
}: {
  venueName: string;
  lookup: HistoryLookup;
}) {
  return (
    <section
      id="padel-history"
      className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Padel
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            Match history
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Locked results at {venueName}. Live and abandoned scorecards are
            omitted.
          </p>
        </header>

        <div className="max-w-3xl">
          {lookup.error ? (
            <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {lookup.error}
            </p>
          ) : lookup.items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-6 text-sm leading-relaxed text-zinc-400">
              No locked padel matches at this court yet.
            </div>
          ) : (
            <PadelHistoryList items={lookup.items} />
          )}
        </div>
      </div>
    </section>
  );
}
