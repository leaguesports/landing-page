import Link from "next/link";

export function HomeAthleteCta() {
  return (
    <section
      aria-labelledby="athlete-cta-heading"
      className="relative overflow-hidden border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-10 sm:px-10 sm:py-14 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Athletes
            </p>
            <h2
              id="athlete-cta-heading"
              className="font-display text-5xl tracking-wide text-white sm:text-6xl"
            >
              Become a League Sports athlete
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Sign in to track matches, lock results to your profile, and start
              building your sporting record.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-0">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
            >
              Become an athlete
            </Link>
            <Link
              href="/athletes"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
