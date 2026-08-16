import { Tv } from "lucide-react";

type WatchHubProps = {
  partialSportSlug?: string;
  sportDisplayName?: string;
};

export function WatchHub({ partialSportSlug, sportDisplayName }: WatchHubProps) {
  const sportLabel =
    sportDisplayName ??
    (partialSportSlug ? partialSportSlug.replace(/-/g, " ") : undefined);

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-linear-to-br from-sky-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          <Tv className="h-3.5 w-3.5" aria-hidden />
          Bars &amp; fan zones
        </p>

        <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
          Find somewhere to{" "}
          <span className="text-sky-400">watch</span>
          {sportLabel ? (
            <>
              <br />
              <span className="text-white">{sportLabel}</span>
            </>
          ) : null}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
          {partialSportSlug
            ? "Pick a suburb or area below. Every listing shows venues screening this sport with live screens."
            : "Start with a sport or series, then choose an area to see bars and fan zones near you."}
        </p>

        {!partialSportSlug ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#watch-sports"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
            >
              Choose a sport
            </a>
            <a
              href="#watch-series"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Choose a series
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
