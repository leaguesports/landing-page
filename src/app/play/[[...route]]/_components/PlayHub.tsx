import { Trophy } from "lucide-react";

type PlayHubProps = {
  partialSportSlug?: string;
  sportDisplayName?: string;
};

export function PlayHub({ partialSportSlug, sportDisplayName }: PlayHubProps) {
  const sportLabel =
    sportDisplayName ??
    (partialSportSlug ? partialSportSlug.replace(/-/g, " ") : undefined);

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          <Trophy className="h-3.5 w-3.5" aria-hidden />
          Courts &amp; clubs
        </p>

        <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
          Find somewhere to{" "}
          <span className="text-emerald-400">play</span>
          {sportLabel ? (
            <>
              <br />
              <span className="text-white">{sportLabel}</span>
            </>
          ) : null}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
          {partialSportSlug
            ? "Pick an area below to see venues hosting this sport."
            : "Search by city or sport to find courts, clubs, and open sessions near you."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/venues"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            Browse venues
          </a>
          <a
            href="/#open-matches"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
          >
            Open matches
          </a>
        </div>
      </div>
    </section>
  );
}
