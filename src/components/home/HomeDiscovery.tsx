"use client";

import { CityGrid } from "@/components/home/CityGrid";
import { HeroSearch } from "@/components/home/HeroSearch";
import type { IntentMode } from "@/data/cities";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/** Racket-sport court atmosphere for the live scorecard story. */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=2400&q=80";

export function HomeDiscovery() {
  const [intent, setIntent] = useState<IntentMode>("play");

  return (
    <>
      <section className="relative flex min-h-[min(100svh,44rem)] items-end overflow-hidden sm:min-h-[min(88vh,52rem)]">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Players on an indoor court ready for a match"
            fill
            priority
            className="object-cover object-[center_35%] animate-mesh sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#0c0f0c]/50" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0c0f0c] via-[#0c0f0c]/75 to-[#0c0f0c]/30" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0c0f0c]/85 via-[#0c0f0c]/35 to-transparent" />
          <div className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-12 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="animate-rise">
              <span className="font-display block text-[clamp(2.75rem,11vw,8.5rem)] leading-[0.9] tracking-wide text-white">
                LEAGUE
                <span className="text-[var(--color-brand)]">SPORTS</span>
              </span>
              <span className="mt-4 block max-w-xl text-lg font-medium leading-snug text-white sm:mt-5 sm:text-2xl sm:leading-snug">
                Live padel scorecards and sports venues across South Africa
              </span>
            </h1>

            <p className="animate-rise-delay mt-3 max-w-xl text-sm leading-relaxed text-zinc-300 sm:mt-4 sm:text-base">
              Lock a match to your history, find a court to play, or pick a
              venue screening the fixture.
            </p>

            <div className="animate-rise-delay-2 mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link
                href="/padel/new"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
              >
                Play now
              </Link>
              <Link
                href="/venues"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                Find a venue
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0c0f0c] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Directories
            </p>
            <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
              Find a venue
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Search Watch and Play by suburb, city, or sport across South
              Africa.
            </p>
          </div>
          <div className="relative z-20 overflow-visible">
            <HeroSearch initialIntent="play" onIntentChange={setIntent} />
          </div>
        </div>
      </section>

      <CityGrid intent={intent} />
    </>
  );
}
