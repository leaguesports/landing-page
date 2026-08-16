import { ArrowUpRight, Target } from "lucide-react";
import Link from "next/link";

export function PoolsCtaBanner() {
  return (
    <section className="border-y border-amber-400/15 bg-linear-to-r from-amber-950/50 via-[#14120c] to-[#0c0f0c] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 text-amber-300">
              <Target className="h-4 w-4" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                Prediction pools
              </span>
            </div>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Organising a weekend watch party?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-amber-100/65 sm:text-base">
              Create a quick WhatsApp prediction pool in about 10 seconds.
            </p>
          </div>

          <Link
            href="/pools/create"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            Start a pool
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
