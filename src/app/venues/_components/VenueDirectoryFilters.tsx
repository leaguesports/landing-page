"use client";

import type { VenueFilterOption } from "@/services/venues";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

type VenueDirectoryFiltersProps = {
  intent: string | null;
  sport: string | null;
  location: string | null;
  sports: VenueFilterOption[];
  locations: VenueFilterOption[];
};

function directoryHref(next: {
  intent?: string | null;
  sport?: string | null;
  location?: string | null;
}): string {
  const params = new URLSearchParams();
  if (next.intent) params.set("intent", next.intent);
  if (next.sport) params.set("sport", next.sport);
  if (next.location) params.set("location", next.location);
  const qs = params.toString();
  return qs ? `/venues?${qs}` : "/venues";
}

export function VenueDirectoryFilters({
  intent,
  sport,
  location,
  sports,
  locations,
}: VenueDirectoryFiltersProps) {
  const router = useRouter();
  const cities = locations.filter((item) => item.kind === "city");
  const suburbs = locations.filter((item) => item.kind !== "city");

  function apply(partial: {
    intent?: string | null;
    sport?: string | null;
    location?: string | null;
  }) {
    router.push(
      directoryHref({
        intent: partial.intent === undefined ? intent : partial.intent,
        sport: partial.sport === undefined ? sport : partial.sport,
        location:
          partial.location === undefined ? location : partial.location,
      }),
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    apply({
      intent: String(form.get("intent") || "") || null,
      sport: String(form.get("sport") || "") || null,
      location: String(form.get("location") || "") || null,
    });
  }

  const pill = (active: boolean, watchTone: boolean) =>
    `inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? watchTone
          ? "bg-sky-500 text-white"
          : "bg-emerald-400 text-zinc-950"
        : "border border-white/12 text-zinc-300 hover:border-white/20 hover:text-white"
    }`;

  return (
    <form
      method="get"
      action="/venues"
      onSubmit={onSubmit}
      className="mb-8 space-y-4 sm:mb-10"
    >
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

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Sport
          </span>
          <select
            name="sport"
            value={sport ?? ""}
            onChange={(event) =>
              apply({ sport: event.target.value || null })
            }
            className="min-h-11 w-full rounded-2xl border border-white/12 bg-[#141814] px-4 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">All sports</option>
            {sports.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            City / suburb
          </span>
          <select
            name="location"
            value={location ?? ""}
            onChange={(event) =>
              apply({ location: event.target.value || null })
            }
            className="min-h-11 w-full rounded-2xl border border-white/12 bg-[#141814] px-4 text-sm text-white outline-none focus:border-white/30"
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
      </div>

      <input type="hidden" name="intent" value={intent ?? ""} />
    </form>
  );
}
