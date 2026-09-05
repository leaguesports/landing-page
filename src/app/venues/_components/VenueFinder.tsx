"use client";

import { CityGrid } from "@/components/home/CityGrid";
import { HeroSearch } from "@/components/home/HeroSearch";
import type { IntentMode } from "@/data/cities";
import {
  venueDirectoryHref,
  venueSearchQueryText,
  type ParsedVenueSearch,
} from "@/lib/search/venueSearch";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

type VenueFinderProps = {
  filters: ParsedVenueSearch;
  resultCountLabel: string;
  filtered: boolean;
  children: ReactNode;
};

function intentMode(intent: string | null): IntentMode {
  return intent === "watch" ? "watch" : "play";
}

export function VenueFinder({
  filters,
  resultCountLabel,
  filtered,
  children,
}: VenueFinderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [browseIntent, setBrowseIntent] = useState<IntentMode>(
    intentMode(filters.intent),
  );

  function apply(partial: {
    intent?: string | null;
    sport?: string | null;
    location?: string | null;
  }) {
    startTransition(() => {
      router.push(
        venueDirectoryHref({
          intent:
            partial.intent === undefined ? filters.intent : partial.intent,
          sport:
            partial.sport === undefined ? filters.sportSlug : partial.sport,
          location:
            partial.location === undefined
              ? filters.locationSlug
              : partial.location,
        }),
      );
    });
  }

  const chips: { key: string; label: string; onClear: () => void }[] = [];
  if (filters.intent === "watch") {
    chips.push({
      key: "intent",
      label: "Watch",
      onClear: () => apply({ intent: null }),
    });
  }
  if (filters.intent === "play") {
    chips.push({
      key: "intent",
      label: "Play",
      onClear: () => apply({ intent: null }),
    });
  }
  if (filters.sportSlug) {
    chips.push({
      key: "sport",
      label: filters.sportName ?? filters.sportSlug,
      onClear: () => apply({ sport: null }),
    });
  }
  if (filters.locationSlug) {
    chips.push({
      key: "location",
      label: filters.locationLabel ?? filters.locationSlug,
      onClear: () => apply({ location: null }),
    });
  }

  return (
    <>
      <section className="overflow-visible border-b border-white/5 bg-[#0c0f0c] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Directories
            </p>
            <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
              Find a venue
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Search Watch and Play by suburb, city, or sport. These
              directories stay — they are not the match scorecard.
            </p>
          </div>
          <div className="relative z-20 overflow-visible">
            <HeroSearch
              key={`${filters.intent ?? ""}-${filters.sportSlug ?? ""}-${filters.locationSlug ?? ""}`}
              initialIntent={intentMode(filters.intent)}
              initialQuery={venueSearchQueryText(filters)}
              onIntentChange={setBrowseIntent}
            />
          </div>

          <div
            className={`mt-6 flex flex-wrap items-center gap-2 ${
              isPending ? "opacity-70" : ""
            }`}
            aria-busy={isPending}
          >
            <p className="text-sm text-zinc-500" aria-live="polite">
              {resultCountLabel}
            </p>
            {filtered ? (
              <>
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onClear}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 text-sm text-zinc-200 transition-colors hover:border-white/20 hover:text-white"
                  >
                    {chip.label}
                    <X className="h-3.5 w-3.5" aria-hidden />
                    <span className="sr-only">Remove {chip.label} filter</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    apply({ intent: null, sport: null, location: null })
                  }
                  className="text-sm font-medium text-zinc-400 underline-offset-2 hover:text-white hover:underline"
                >
                  Clear all
                </button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {children}

      <CityGrid intent={browseIntent} />
    </>
  );
}
