"use client";

import { useMemo, useState } from "react";
import { WatchCard } from "./WatchCard";

export interface WatchItem {
  href: string;
  sport: string;
  image: string;
  title: string;
  date: string;
  time: string;
}

interface WhatsShowingGridProps {
  items: WatchItem[];
}

const ALL = "All";

export function WhatsShowingGrid({ items }: WhatsShowingGridProps) {
  const [sport, setSport] = useState<string | null>(null);

  const sports = useMemo(() => {
    const set = new Set(items.map((i) => i.sport));
    return [ALL, ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (!sport || sport === ALL) return items;
    return items.filter((i) => i.sport === sport);
  }, [items, sport]);

  const active = sport ?? ALL;

  return (
    <>
      {/* Quick sport filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {sports.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSport(s === ALL ? null : s)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              active === s
                ? "border-white/30 bg-white/15 text-white"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, index) => (
          <WatchCard
            key={`${item.sport}-${item.title}-${index}`}
            href={item.href}
            sport={item.sport}
            image={item.image}
            title={item.title}
            date={item.date}
            time={item.time}
          />
        ))}
      </div>
    </>
  );
}
