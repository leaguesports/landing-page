import { Bell, Heart } from "lucide-react";

type WatchHeroProps = {
  sportName: string;
  locationTitle: string;
  venueCount: number;
};

export function WatchHero({
  sportName,
  locationTitle,
  venueCount,
}: WatchHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-linear-to-br from-sky-950/45 via-[#0c0f0c] to-[#0c0f0c]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Watch
        </p>
        <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
          {sportName}
          <span className="block text-sky-400">{locationTitle}</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
          Showing {venueCount} venues with live screens and match-day energy.
        </p>

        <div className="mt-8 flex flex-wrap gap-8">
          {[
            { label: "Fans nearby", value: "100+" },
            { label: "Venues", value: String(venueCount) },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
          >
            <Heart className="h-4 w-4" aria-hidden />
            Follow {sportName}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
          >
            <Bell className="h-4 w-4" aria-hidden />
            Game alerts
          </button>
        </div>
      </div>
    </section>
  );
}
