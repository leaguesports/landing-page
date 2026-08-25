"use client";

import { ArrowLeftRight, MapPin, Navigation } from "lucide-react";
import { useMemo, useState } from "react";
import {
  distanceKm,
  useGeolocation,
} from "@/hooks/useGeolocation";
import type { VenueOption } from "@/lib/padel/venue-options";

type VenuePickerProps = {
  venues: VenueOption[];
  selected: VenueOption | null;
  onSelect: (venue: VenueOption | null) => void;
};

export function VenuePicker({ venues, selected, onSelect }: VenuePickerProps) {
  const { coords, status, error, request } = useGeolocation();
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = venues;
    if (q) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.suburb.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q),
      );
    }

    if (!coords) return list;

    return [...list].sort((a, b) => {
      const da =
        a.latitude != null && a.longitude != null
          ? distanceKm(coords, {
              latitude: a.latitude,
              longitude: a.longitude,
            })
          : Number.POSITIVE_INFINITY;
      const db =
        b.latitude != null && b.longitude != null
          ? distanceKm(coords, {
              latitude: b.latitude,
              longitude: b.longitude,
            })
          : Number.POSITIVE_INFINITY;
      return da - db;
    });
  }, [venues, query, coords]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courts & clubs…"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400/40"
          />
        </div>
        <button
          type="button"
          onClick={request}
          disabled={status === "loading"}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
        >
          <Navigation className="h-4 w-4 text-emerald-400" aria-hidden />
          {status === "loading" ? "Locating…" : "Near me"}
        </button>
      </div>

      {error ? (
        <p className="text-xs text-amber-400/90">{error}</p>
      ) : null}
      {coords ? (
        <p className="text-xs text-zinc-500">
          Sorted by distance from your location
        </p>
      ) : null}

      <ul className="max-h-56 space-y-2 overflow-y-auto overscroll-contain pr-1">
        <li>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={[
              "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
              selected === null
                ? "border-emerald-400/50 bg-emerald-400/10 text-white"
                : "border-white/8 bg-[#141814] text-zinc-300 hover:border-white/16",
            ].join(" ")}
          >
            <span>Skip — pick later</span>
          </button>
        </li>
        {sorted.slice(0, 24).map((venue) => {
          const active = selected?.id === venue.id;
          const dist =
            coords && venue.latitude != null && venue.longitude != null
              ? distanceKm(coords, {
                  latitude: venue.latitude,
                  longitude: venue.longitude,
                })
              : null;
          return (
            <li key={venue.id}>
              <button
                type="button"
                onClick={() => onSelect(venue)}
                className={[
                  "flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-emerald-400/50 bg-emerald-400/10"
                    : "border-white/8 bg-[#141814] hover:border-white/16",
                ].join(" ")}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">
                    {venue.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {[venue.suburb, venue.city].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {dist != null && Number.isFinite(dist) ? (
                  <span className="shrink-0 text-xs tabular-nums text-emerald-400/90">
                    {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SwapTeamsButton({ onSwap }: { onSwap: () => void }) {
  return (
    <button
      type="button"
      onClick={onSwap}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
    >
      <ArrowLeftRight className="h-4 w-4" aria-hidden />
      Swap Team A / B
    </button>
  );
}
