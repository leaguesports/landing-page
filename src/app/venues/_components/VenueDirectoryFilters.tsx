"use client";

import type { VenueFilterOption } from "@/services/venues";
import {
  venueDirectoryHref,
  venueDirectoryHrefFromQuery,
} from "@/lib/search/venueSearch";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";

type VenueDirectoryFiltersProps = {
  intent: string | null;
  sport: string | null;
  location: string | null;
  sports: VenueFilterOption[];
  locations: VenueFilterOption[];
  resultCountLabel: string;
  filtered: boolean;
  sportLabel: string | null;
  locationLabel: string | null;
};

export function VenueDirectoryFilters({
  intent,
  sport,
  location,
  sports,
  locations,
  resultCountLabel,
  filtered,
  sportLabel,
  locationLabel,
}: VenueDirectoryFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const cities = locations.filter((item) => item.kind === "city");
  const suburbs = locations.filter((item) => item.kind !== "city");

  function apply(partial: {
    intent?: string | null;
    sport?: string | null;
    location?: string | null;
  }) {
    startTransition(() => {
      router.push(
        venueDirectoryHref({
          intent: partial.intent === undefined ? intent : partial.intent,
          sport: partial.sport === undefined ? sport : partial.sport,
          location:
            partial.location === undefined ? location : partial.location,
        }),
      );
    });
  }

  function onFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    apply({
      intent: String(form.get("intent") || "") || null,
      sport: String(form.get("sport") || "") || null,
      location: String(form.get("location") || "") || null,
    });
  }

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get("q") || "").trim();
    if (!query) return;
    startTransition(() => {
      router.push(venueDirectoryHrefFromQuery(query, intent));
    });
  }

  const pill = (active: boolean, watchTone: boolean) =>
    `inline-flex min-h-10 items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? watchTone
          ? "bg-sky-500 text-white"
          : "bg-emerald-400 text-zinc-950"
        : "border border-white/12 text-zinc-300 hover:border-white/20 hover:text-white"
    }`;

  const selectClass =
    "min-h-11 w-full rounded-2xl border border-white/12 bg-[#141814] px-3 text-sm text-white outline-none focus:border-white/30 sm:px-4";

  const chips: { key: string; label: string; onClear: () => void }[] = [];
  if (intent === "watch") {
    chips.push({
      key: "intent",
      label: "Watch",
      onClear: () => apply({ intent: null }),
    });
  }
  if (intent === "play") {
    chips.push({
      key: "intent",
      label: "Play",
      onClear: () => apply({ intent: null }),
    });
  }
  if (sport) {
    chips.push({
      key: "sport",
      label: sportLabel ?? sport,
      onClear: () => apply({ sport: null }),
    });
  }
  if (location) {
    chips.push({
      key: "location",
      label: locationLabel ?? location,
      onClear: () => apply({ location: null }),
    });
  }

  return (
    <div className="sticky top-16 z-40 border-b border-white/6 bg-[#0c0f0c]/90 backdrop-blur-xl">
      <div
        className={`mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6 lg:px-8 ${
          isPending ? "opacity-70" : ""
        }`}
        aria-busy={isPending}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Watch or play"
          >
            <button
              type="button"
              className={pill(!intent, true)}
              onClick={() => apply({ intent: null })}
            >
              All
            </button>
            <button
              type="button"
              className={pill(intent === "watch", true)}
              onClick={() => apply({ intent: "watch" })}
            >
              Watch
            </button>
            <button
              type="button"
              className={pill(intent === "play", false)}
              onClick={() => apply({ intent: "play" })}
            >
              Play
            </button>
          </div>
          <p className="ml-auto text-sm text-zinc-500" aria-live="polite">
            {resultCountLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
          <form onSubmit={onSearchSubmit} className="relative col-span-2 lg:col-span-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              autoComplete="off"
              placeholder="Sport, suburb, or city…"
              aria-label="Search venues"
              className="min-h-11 w-full rounded-2xl border border-white/12 bg-[#141814] py-2 pr-24 pl-11 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/30"
            />
            <button
              type="submit"
              className="absolute top-1/2 right-1.5 inline-flex min-h-8 -translate-y-1/2 items-center rounded-xl bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/16"
            >
              Search
            </button>
          </form>

          <form
            method="get"
            action="/venues"
            onSubmit={onFilterSubmit}
            className="contents"
          >
            <label className="block">
              <span className="sr-only">Sport</span>
              <select
                name="sport"
                value={sport ?? ""}
                onChange={(event) =>
                  apply({ sport: event.target.value || null })
                }
                className={selectClass}
              >
                <option value="">All sports</option>
                {sports.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <input type="hidden" name="intent" value={intent ?? ""} />
            </label>

            <label className="block">
              <span className="sr-only">City or suburb</span>
              <select
                name="location"
                value={location ?? ""}
                onChange={(event) =>
                  apply({ location: event.target.value || null })
                }
                className={selectClass}
              >
                <option value="">All areas</option>
                {cities.length > 0 ? (
                  <optgroup label="Cities">
                    {cities.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {suburbs.length > 0 ? (
                  <optgroup label="Suburbs">
                    {suburbs.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>
            </label>

          </form>
        </div>

        {filtered ? (
          <div className="flex flex-wrap items-center gap-2">
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
