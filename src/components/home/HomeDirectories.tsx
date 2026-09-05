"use client";

import { CityGrid } from "@/components/home/CityGrid";
import { HeroSearch } from "@/components/home/HeroSearch";
import type { IntentMode } from "@/data/cities";
import { useState } from "react";

export function HomeDirectories() {
  const [intent, setIntent] = useState<IntentMode>("play");

  return (
    <>
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
