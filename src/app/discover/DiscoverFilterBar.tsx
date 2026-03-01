"use client";

import { Tv, Trophy, MapPin, Locate } from "lucide-react";
import { ACTIVITY_LIST } from "@/data/activity";
import type { Intent } from "./types";

type DiscoverFilterBarProps = {
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  locationQuery: string;
  onLocationChange: (value: string) => void;
  onUseMyLocation: () => void;
  selectedSports: string[];
  onSportToggle: (slug: string) => void;
  locating?: boolean;
};

export function DiscoverFilterBar({
  intent,
  onIntentChange,
  locationQuery,
  onLocationChange,
  onUseMyLocation,
  selectedSports,
  onSportToggle,
  locating = false,
}: DiscoverFilterBarProps) {
  return (
    <div className="sticky top-0 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f0f0f]/70 px-4 py-4 shadow-xl backdrop-blur-xl md:flex-row md:items-center md:gap-6">
      {/* Intent: Watch vs Play */}
      <div className="flex shrink-0 rounded-xl bg-white/5 p-1">
        <button
          type="button"
          onClick={() => onIntentChange("watch")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
            intent === "watch"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-gray-400 hover:text-white"
          }`}
          aria-pressed={intent === "watch"}
        >
          <Tv className="h-4 w-4" strokeWidth={2} />
          Watch
        </button>
        <button
          type="button"
          onClick={() => onIntentChange("play")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
            intent === "play"
              ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
              : "text-gray-400 hover:text-white"
          }`}
          aria-pressed={intent === "play"}
        >
          <Trophy className="h-4 w-4" strokeWidth={2} />
          Play
        </button>
      </div>

      {/* Location */}
      <div className="relative flex-1 min-w-0">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" strokeWidth={2} />
        <input
          type="search"
          value={locationQuery}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Area / City"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Search by area or city"
        />
        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={locating}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          title="Use my location"
          aria-label="Use my location"
        >
          <Locate className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Sport multi-select */}
      <div className="flex flex-wrap items-center gap-2">
        {ACTIVITY_LIST.map((activity) => {
          const active = selectedSports.includes(activity.slug);
          return (
            <button
              key={activity.id}
              type="button"
              onClick={() => onSportToggle(activity.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                active
                  ? "bg-white/20 text-white ring-1 ring-white/30"
                  : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
              }`}
              aria-pressed={active}
            >
              {activity.slug === "f1" ? "F1" : activity.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
