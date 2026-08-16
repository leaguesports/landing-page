"use client";

import { CityGrid } from "@/components/home/CityGrid";
import { HeroSearch } from "@/components/home/HeroSearch";
import type { IntentMode } from "@/data/cities";
import { useState } from "react";

export function HomeDiscovery() {
  const [intent, setIntent] = useState<IntentMode>("watch");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[80vh] lg:min-h-[88vh] flex items-end">
        <div className="absolute inset-0 bg-linear-to-br from-green-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-linear-to-r from-transparent via-green-600/30 to-transparent"
              style={{
                top: `${10 + i * 12}%`,
                left: "-10%",
                right: "-10%",
                transform: `skewY(-${1 + i * 0.5}deg)`,
                opacity: 0.4 - i * 0.04,
              }}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span
            className="text-[20vw] font-black italic uppercase text-white/2 leading-none tracking-tighter"
            style={{ fontStretch: "condensed" }}
          >
            League
          </span>
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-700 via-green-500 to-green-700" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20 pt-10 sm:pt-16 w-full">
          <p className="text-green-400 text-xs sm:text-sm font-black uppercase tracking-[0.25em] mb-3">
            LeagueSports
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[10rem] font-black italic uppercase leading-none tracking-tighter mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-3xl md:text-4xl lg:text-[6rem] tracking-tight">
              The Home of
            </span>
            <br />
            <span className="text-green-400">Sports</span>
          </h1>

          <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm mb-8 sm:mb-10 max-w-2xl">
            Find where to watch or play near you — search by suburb, city, or
            sport.
          </p>

          <HeroSearch onIntentChange={setIntent} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
      </section>

      <CityGrid intent={intent} />
    </>
  );
}
