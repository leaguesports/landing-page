"use client";

import { useCallback, useState } from "react";
import {
  distanceKm,
  type GeoCoords,
} from "@/lib/geo/distance";

export type { GeoCoords };
export { distanceKm };

export type GeoStatus = "idle" | "loading" | "ready" | "error" | "unsupported";

/**
 * Reusable GPS hook — same browser API as HeroSearch "Near Me",
 * but returns real coordinates for venue proximity sorting.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setError("Geolocation is not supported on this device");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setStatus("ready");
      },
      (err) => {
        setStatus("error");
        setError(err.message || "Could not read location");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
    );
  }, []);

  return { coords, status, error, request };
}
