"use client";

import { useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { DiscoverMiniCard } from "./DiscoverMiniCard";
import type { DiscoverItem } from "./types";

type DiscoverResultsListProps = {
  items: DiscoverItem[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  intent: "watch" | "play";
  emptySportLabels?: string[];
};

export function DiscoverResultsList({
  items,
  selectedId,
  onSelectId,
  intent,
  emptySportLabels = [],
}: DiscoverResultsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!selectedId || !listRef.current || !selectedRef.current) return;
    selectedRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mb-4 rounded-full bg-white/10 p-4">
          <Bell className="h-8 w-8 text-gray-400" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-white">Nothing here yet</h3>
        <p className="mt-2 max-w-sm text-sm text-gray-400">
          No {intent === "watch" ? "venues or events" : "venues"} match your filters in this area.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          {emptySportLabels.length > 0
            ? `Follow ${emptySportLabels.join(", ")} to get notified when something opens nearby.`
            : "Follow your favourite sports to get notified when something opens nearby."}
        </p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
        >
          Follow this sport
        </button>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex flex-col gap-3 overflow-y-auto pb-4"
      role="list"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="listitem"
        >
          <DiscoverMiniCard
            item={item}
            isSelected={selectedId === item.id}
            onSelect={() => onSelectId(item.id)}
          />
        </div>
      ))}
    </div>
  );
}
