"use client";

import { CITY_DIRECTORY, type IntentMode } from "@/data/cities";
import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";

type CityGridProps = {
  intent?: IntentMode;
};

const CITY_IMAGES: Record<string, string> = {
  "cape-town":
    "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=70",
  johannesburg:
    "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=1200&q=70",
  durban:
    "https://images.unsplash.com/photo-1682065936841-6bb7f68207b7?auto=format&fit=crop&w=1200&q=70",
  pretoria:
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=70",
};

export function CityGrid({ intent = "watch" }: CityGridProps) {
  const accentText =
    intent === "watch"
      ? "text-sky-400 hover:text-sky-300"
      : "text-emerald-400 hover:text-emerald-300";
  const chipHover =
    intent === "watch"
      ? "hover:border-sky-400/40 hover:text-sky-200"
      : "hover:border-emerald-400/40 hover:text-emerald-200";

  return (
    <section className="border-t border-white/5 bg-[#0c0f0c] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 sm:mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Local directories
          </p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-wide text-white">
            Browse by city
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Jump into {intent} venues across South Africa&apos;s main metros.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {CITY_DIRECTORY.map((city) => (
            <article
              key={city.slug}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-[#141814]"
            >
              <div className="relative h-36 sm:h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CITY_IMAGES[city.slug] ?? CITY_IMAGES.johannesburg}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#141814] via-[#141814]/40 to-transparent" />
              </div>

              <div className="relative -mt-8 px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <MapPin
                        className="h-4 w-4 shrink-0 text-zinc-500"
                        aria-hidden
                      />
                      <h3 className="font-display text-3xl tracking-wide text-white">
                        {city.name}
                      </h3>
                    </div>
                    <Link
                      href={`/venues?intent=${intent}&location=${city.slug}`}
                      className={`inline-flex min-h-10 items-center gap-1.5 text-sm font-medium ${accentText}`}
                    >
                      Open directory
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {city.suburbs.map((suburb) => (
                    <li key={suburb.slug}>
                      <Link
                        href={`/venues?intent=${intent}&location=${suburb.slug}`}
                        className={`inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/4 px-3.5 py-2 text-sm text-zinc-300 transition-colors ${chipHover}`}
                      >
                        {suburb.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
