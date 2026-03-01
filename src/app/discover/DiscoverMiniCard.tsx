"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { DiscoverItem } from "./types";

type DiscoverMiniCardProps = {
  item: DiscoverItem;
  isSelected: boolean;
  onSelect: () => void;
};

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function DiscoverMiniCard({ item, isSelected, onSelect }: DiscoverMiniCardProps) {
  const href = item.kind === "venue" ? `/venues/${item.slug}` : item.href;
  const title = item.kind === "venue" ? item.name : item.title;
  const sportTag = item.kind === "venue" ? item.sports[0] ?? "Venue" : item.sport;
  const image = item.image;
  const distance = item.distanceKm != null ? formatDistance(item.distanceKm) : null;

  return (
    <Link
      href={href}
      onClick={(e) => {
        onSelect();
      }}
      className={`block rounded-xl border transition-all duration-200 ${isSelected
          ? "border-blue-500/60 bg-white/10 ring-2 ring-blue-500/30"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
        }`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{title}</p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
            {sportTag}
          </p>
          {item.kind === "event" && (
            <p className="mt-0.5 text-xs text-gray-500">
              {item.date} · {item.time}
            </p>
          )}
          {item.kind === "venue" && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
              <span className="truncate">{item.area}</span>
            </div>
          )}
        </div>
        {distance && (
          <div className="shrink-0 self-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-gray-300">
            {distance}
          </div>
        )}
      </div>
    </Link>
  );
}
