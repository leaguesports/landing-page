"use client";

import { CityGrid } from "@/components/home/CityGrid";
import { HeroSearch } from "@/components/home/HeroSearch";
import type { IntentMode } from "@/data/cities";
import Image from "next/image";
import { useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=80";

export function HomeDiscovery() {
  const [intent, setIntent] = useState<IntentMode>("watch");

  return (
    <>
      <section className="relative flex min-h-[88vh] items-end overflow-visible">
        {/* Full-bleed hero plane — overflow clipped here so search popover can escape */}
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
        </div>

        {/* Soft brand wash */}
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[var(--color-brand)]/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
          <h1 className="font-display animate-rise text-[clamp(3.5rem,14vw,9.5rem)] leading-[0.88] tracking-wide text-white">
            LEAGUE
            <span className="text-[var(--color-brand)]">SPORTS</span>
          </h1>

          <p className="animate-rise-delay mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Find where to watch the game or book your next match — search by
            suburb, city, or sport.
          </p>

          <div className="relative z-20 animate-rise-delay-2 mt-8 sm:mt-10 overflow-visible">
            <HeroSearch onIntentChange={setIntent} />
          </div>
        </div>
      </section>

      <CityGrid intent={intent} />
    </>
  );
}
