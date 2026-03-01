"use client";

import "leaflet/dist/leaflet.css";
import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { DiscoverFilterBar } from "./DiscoverFilterBar";
import { DiscoverResultsList } from "./DiscoverResultsList";
import { getDiscoverVenues, getDiscoverEvents } from "@/data/discover";
import { ACTIVITY_LIST } from "@/data/activity";
import type { Intent } from "./types";
import type { DiscoverItem } from "./types";

const DiscoverMap = dynamic(() => import("./DiscoverMap").then((m) => ({ default: m.DiscoverMap })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-xl bg-zinc-900/80">
      <span className="text-sm text-gray-500">Loading map…</span>
    </div>
  ),
});

export default function DiscoverPage() {
  const [intent, setIntent] = useState<Intent>("watch");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const sportSlugs = selectedSports.length > 0 ? selectedSports : undefined;
  const areaQuery = locationQuery.trim() || undefined;
  const userLat = userLocation?.lat;
  const userLng = userLocation?.lng;

  const venues = useMemo(
    () =>
      getDiscoverVenues(intent, userLat, userLng, sportSlugs, areaQuery),
    [intent, userLat, userLng, sportSlugs, areaQuery]
  );

  const events = useMemo(
    () =>
      intent === "watch"
        ? getDiscoverEvents(sportSlugs, areaQuery, userLat, userLng)
        : [],
    [intent, sportSlugs, areaQuery, userLat, userLng]
  );

  const items: DiscoverItem[] = useMemo(() => {
    const combined = [...venues, ...events];
    if (userLat != null && userLng != null) {
      combined.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    return combined;
  }, [venues, events, userLat, userLng]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSportToggle = useCallback((slug: string) => {
    setSelectedSports((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const emptySportLabels = useMemo(() => {
    if (selectedSports.length === 0) return [];
    return ACTIVITY_LIST.filter((a) => selectedSports.includes(a.slug)).map(
      (a) => a.name
    );
  }, [selectedSports]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:h-[calc(100vh-4rem)]">
      <div className="shrink-0 px-4 py-4">
        <h1 className="mb-4 text-2xl font-black tracking-tight text-white md:text-3xl">
          Discovery Hub
        </h1>
        <DiscoverFilterBar
          intent={intent}
          onIntentChange={setIntent}
          locationQuery={locationQuery}
          onLocationChange={setLocationQuery}
          onUseMyLocation={handleUseMyLocation}
          selectedSports={selectedSports}
          onSportToggle={handleSportToggle}
          locating={locating}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Map — top on mobile (order-1), right 60% on desktop (order-2) */}
        <div className="order-1 h-[280px] w-full shrink-0 md:order-2 md:h-full md:w-[60%]">
          <DiscoverMap
            items={items}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            userLocation={userLocation}
            className="h-full"
          />
        </div>

        {/* Results list — below map on mobile (order-2), left 40% on desktop (order-1) */}
        <aside className="order-2 flex w-full flex-col overflow-hidden border-r border-white/10 bg-[#0f0f0f]/50 md:order-1 md:w-[40%]">
          <div className="flex-1 overflow-y-auto px-4 pt-2">
            <DiscoverResultsList
              items={items}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              intent={intent}
              emptySportLabels={emptySportLabels}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
