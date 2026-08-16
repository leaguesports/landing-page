"use client";

import { CITY_DIRECTORY, type IntentMode } from "@/data/cities";
import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

type CityGridProps = {
  intent?: IntentMode;
};

export function CityGrid({ intent = "watch" }: CityGridProps) {
  const base = intent === "watch" ? "/watch" : "/play";
  const accent =
    intent === "watch"
      ? {
          badge: "bg-blue-600",
          border: "hover:border-blue-500/50",
          link: "text-blue-400 hover:text-blue-300",
          chip: "hover:border-blue-500/40 hover:text-blue-300",
          bar: "from-blue-700 via-blue-500 to-blue-600",
        }
      : {
          badge: "bg-green-600",
          border: "hover:border-green-500/50",
          link: "text-green-400 hover:text-green-300",
          chip: "hover:border-green-500/40 hover:text-green-300",
          bar: "from-green-700 via-green-500 to-green-600",
        };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-10">
          <div
            className={`${accent.badge} inline-block px-6 py-1.5 transform -skew-x-6 mb-3`}
          >
            <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
              Browse by City
            </h2>
          </div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1 sm:ml-4">
            Jump straight into local {intent} directories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {CITY_DIRECTORY.map((city) => (
            <article
              key={city.slug}
              className={`group overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/90 transition-all ${accent.border}`}
            >
              <div
                className={`h-1 w-full bg-gradient-to-r ${accent.bar}`}
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-zinc-500 shrink-0" aria-hidden />
                      <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white">
                        {city.name}
                      </h3>
                    </div>
                    <Link
                      href={`${base}/${city.slug}`}
                      className={`inline-flex min-h-10 items-center gap-1 text-[10px] font-black uppercase tracking-widest ${accent.link}`}
                    >
                      Open {city.name} directory
                      <ChevronRight className="h-3 w-3" aria-hidden />
                    </Link>
                  </div>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {city.suburbs.map((suburb) => (
                    <li key={suburb.slug}>
                      <Link
                        href={
                          intent === "watch"
                            ? `${base}/${city.slug}/${suburb.slug}`
                            : `${base}/${city.slug}`
                        }
                        className={`inline-flex min-h-10 items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors ${accent.chip}`}
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
