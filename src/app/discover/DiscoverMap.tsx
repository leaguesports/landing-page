"use client";

import { useEffect, useRef, useMemo } from "react";
import type { DiscoverItem } from "./types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

type DiscoverMapProps = {
  items: DiscoverItem[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  userLocation: { lat: number; lng: number } | null;
  className?: string;
};

function getPinColor(item: DiscoverItem): string {
  if (item.kind === "event") {
    if (item.sport.toLowerCase().includes("formula") || item.sport === "F1") return "#ef4444"; // red - F1
    return "#3b82f6"; // blue - other events (watch)
  }
  return item.intent === "play" ? "#22c55e" : "#3b82f6"; // green play, blue watch
}

export function DiscoverMap({
  items,
  selectedId,
  onSelectId,
  userLocation,
  className = "",
}: DiscoverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{
    map: import("leaflet").Map;
    markers: import("leaflet").Marker[];
    userMarker: import("leaflet").CircleMarker | null;
  } | null>(null);

  const itemsWithPos = useMemo(
    () => items.filter((i) => i.lat != null && i.lng != null),
    [items]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-26.135, 28.065],
      zoom: 11,
      zoomControl: false,
    });

    L.tileLayer(DARK_TILES, {
      attribution: ATTRIBUTION,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const markers: import("leaflet").Marker[] = [];

    for (const item of itemsWithPos) {
      const color = getPinColor(item);
      const icon = L.divIcon({
        className: "discover-pin",
        html: `<div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid #0f0f0f;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        }" data-id="${item.id}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([item.lat, item.lng], { icon })
        .addTo(map)
        .on("click", () => onSelectId(item.id));
      (marker as any)._discoverId = item.id;
      markers.push(marker);
    }

    let userMarker: import("leaflet").CircleMarker | null = null;
    if (userLocation) {
      userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        fillColor: "#fbbf24",
        color: "#0f0f0f",
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
    }

    leafletRef.current = { map, markers, userMarker };

    return () => {
      markers.forEach((m) => m.remove());
      userMarker?.remove();
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  // Update markers when items change
  useEffect(() => {
    const leaf = leafletRef.current;
    if (!leaf) return;

    const L = require("leaflet");
    const currentIds = new Set(itemsWithPos.map((i) => i.id));

    leaf.markers.forEach((m: import("leaflet").Marker) => {
      const id = (m as any)._discoverId;
      if (!currentIds.has(id)) {
        m.remove();
      }
    });
    leaf.markers = leaf.markers.filter((m: import("leaflet").Marker) => {
      const id = (m as any)._discoverId;
      return currentIds.has(id);
    });

    const existingIds = new Set(leaf.markers.map((m: import("leaflet").Marker) => (m as any)._discoverId));
    for (const item of itemsWithPos) {
      if (existingIds.has(item.id)) continue;
      const color = getPinColor(item);
      const icon = L.divIcon({
        className: "discover-pin",
        html: `<div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid #0f0f0f;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        }" data-id="${item.id}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([item.lat, item.lng], { icon })
        .addTo(leaf.map)
        .on("click", () => onSelectId(item.id));
      (marker as any)._discoverId = item.id;
      leaf.markers.push(marker);
    }
  }, [itemsWithPos, onSelectId]);

  // Highlight selected pin (optional: move map to show it)
  useEffect(() => {
    const leaf = leafletRef.current;
    if (!leaf || !selectedId) return;

    const item = itemsWithPos.find((i) => i.id === selectedId);
    if (item) {
      leaf.map.setView([item.lat, item.lng], leaf.map.getZoom(), {
        animate: true,
        duration: 0.3,
      });
    }
  }, [selectedId, itemsWithPos]);

  // User location update
  useEffect(() => {
    const leaf = leafletRef.current;
    if (!leaf) return;
    const L = require("leaflet");
    if (userLocation) {
      if (leaf.userMarker) {
        leaf.userMarker.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        leaf.userMarker = L.circleMarker(
          [userLocation.lat, userLocation.lng],
          {
            radius: 8,
            fillColor: "#fbbf24",
            color: "#0f0f0f",
            weight: 2,
            fillOpacity: 1,
          }
        ).addTo(leaf.map);
      }
    } else if (leaf.userMarker) {
      leaf.userMarker.remove();
      leaf.userMarker = null;
    }
  }, [userLocation]);

  return <div ref={mapRef} className={`h-full min-h-[300px] w-full rounded-xl overflow-hidden ${className}`} />;
}
