"use client";

import { CityGrid } from "@/components/home/CityGrid";
import { HeroSearch } from "@/components/home/HeroSearch";
import type { IntentMode } from "@/data/cities";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=80";

export function HomeDiscovery() {
  const [intent, setIntent] = useState<IntentMode>("play");

  return (
    <>
      <section className="relative flex min-h-[88vh] items-end overflow-visible">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover object-center animate-mesh"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#0c0f0c]/55" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0c0f0c] via-[#0c0f0c]/70 to-[#0c0f0c]/25" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0c0f0c]/80 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
          <h1 className="font-display animate-rise text-[clamp(3.5rem,14vw,9.5rem)] leading-[0.88] tracking-wide text-white">
            LEAGUE
            <span className="text-[var(--color-brand)]">SPORTS</span>
          </h1>

          <p className="animate-rise-delay mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Play a padel match on a live scorecard. Lock the result so it
            lands on your history and the court.
          </p>

          <div className="animate-rise-delay-2 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
            <Link
              href="/venues"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Find a venue
            </Link>
            <Link
              href="/padel/new"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
            >
              Play now
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0c0f0c] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Directories
            </p>
            <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
              Find a venue
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Search Watch and Play by suburb, city, or sport. These
              directories stay — they are not the match scorecard.
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
