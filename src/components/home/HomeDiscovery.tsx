"use client";

import { HomePhoneMockup } from "@/components/home/HomePhoneMockup";
import Link from "next/link";

function HeroActions({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/padel/new"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.03]"
        >
          Play now
        </Link>
        <Link
          href="/venues"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
        >
          Find a venue
        </Link>
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        Scorecards are live for padel and golf. Sign in to keep locked results
        on your hub.
      </p>
    </div>
  );
}

export function HomeDiscovery() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-16 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-[8%] h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        <div className="absolute inset-0 bg-linear-to-b from-[#0c0f0c]/40 via-transparent to-[#0c0f0c]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              South Africa
            </p>
            <h1 className="animate-rise">
              <span className="font-display block text-[clamp(2.75rem,11vw,5.5rem)] leading-[0.9] tracking-wide text-white">
                LEAGUE
                <span className="text-[var(--color-brand)]">SPORTS</span>
              </span>
              <span className="mt-3 block text-xl font-semibold leading-snug tracking-tight text-white sm:mt-5 sm:text-4xl sm:leading-tight">
                Live padel scorecards and sports venues
              </span>
            </h1>
            <p className="animate-rise-delay mt-3 text-sm leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg sm:leading-8">
              Lock matches to your history, find a court to play, or pick a
              venue screening the fixture — all in one place.
            </p>

            <HeroActions className="animate-rise-delay-2 mt-7 hidden lg:block" />
          </div>

          <div className="animate-rise-delay flex justify-center lg:justify-end">
            <HomePhoneMockup />
          </div>

          <HeroActions className="animate-rise-delay-2 lg:hidden" />
        </div>
      </div>
    </section>
  );
}
