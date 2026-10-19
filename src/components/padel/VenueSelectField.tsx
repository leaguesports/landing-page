"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { useState } from "react";
import { VenueSelectModal } from "@/components/padel/VenueSelectModal";
import type { VenueOption } from "@/lib/padel/venue-options";

type VenueSelectFieldProps = {
  venues: VenueOption[];
  selected: VenueOption | null;
  onSelect: (venue: VenueOption | null) => void;
};

export function VenueSelectField({
  venues,
  selected,
  onSelect,
}: VenueSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const place = selected
    ? [selected.suburb, selected.city].filter(Boolean).join(" · ")
    : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={[
          "flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
          selected
            ? "border-emerald-400/40 bg-emerald-400/10 hover:border-emerald-400/60"
            : "border-white/10 bg-[#141814] hover:border-white/16",
        ].join(" ")}
      >
        <MapPin
          className={[
            "h-4 w-4 shrink-0",
            selected ? "text-emerald-400" : "text-zinc-500",
          ].join(" ")}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          {selected ? (
            <>
              <span className="block truncate text-sm font-medium text-white">
                {selected.name}
              </span>
              {place ? (
                <span className="mt-0.5 block truncate text-xs text-zinc-400">
                  {place}
                </span>
              ) : null}
            </>
          ) : (
            <span className="block text-sm text-zinc-400">Choose a court</span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
      </button>
      {open ? (
        <VenueSelectModal
          venues={venues}
          selected={selected}
          onSelect={(venue) => {
            onSelect(venue);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
