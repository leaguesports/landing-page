import type { Guide } from "../actions";
import { GuideCard } from "./GuideCard";

export function GuidesIndex({ guides }: { guides: Guide[] }) {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Editorial
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Guides
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Local tips for fans and players across South Africa.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {guides.length === 0 ? (
            <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-16 text-center sm:px-8">
              <p className="text-base text-zinc-400">
                No guides published yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {guides.map((guide) => (
                <GuideCard key={guide._id} guide={guide} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
