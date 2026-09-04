import { Heart } from "lucide-react";
import Link from "next/link";

export function WatchFollowBanner() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#101410] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Stay in the loop
          </p>
          <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
            Follow venues
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Follow venues from a listing to keep them on your home hub — upcoming
            screenings show up when you come back.
          </p>
        </div>

        <Link
          href="/venues"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
        >
          <Heart className="h-4 w-4" aria-hidden />
          Find venues to follow
        </Link>
      </div>
    </section>
  );
}
