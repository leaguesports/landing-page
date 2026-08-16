import { ChevronRight, Target } from "lucide-react";
import Link from "next/link";

export function PoolsCtaBanner() {
  return (
    <section className="sticky top-16 z-30 py-4 sm:py-5 px-4 sm:px-6 lg:px-8 border-y border-amber-500/20 bg-amber-950/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black italic uppercase leading-tight tracking-tight text-white">
              Organising a weekend watch party with mates?
            </h2>
            <p className="mt-1 text-sm text-amber-100/70">
              Create a quick WhatsApp prediction pool in 10 seconds.
            </p>
          </div>

          <Link
            href="/pools/create"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-black uppercase italic tracking-wider text-black transition-colors hover:bg-amber-400"
          >
            <Target className="h-5 w-5" aria-hidden />
            Start a Pool
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
