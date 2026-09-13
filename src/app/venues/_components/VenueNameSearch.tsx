"use client";

import {
  VENUE_HUB_SEARCH_MIN,
  type VenueHubSearchHit,
} from "@/lib/venues/hub";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

export function VenueNameSearch() {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VenueHubSearchHit[]>([]);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < VENUE_HUB_SEARCH_MIN) {
      setResults([]);
      setPending(false);
      return;
    }

    let cancelled = false;
    setPending(true);
    const handle = window.setTimeout(() => {
      void fetch(`/api/venues/search?q=${encodeURIComponent(trimmed)}`)
        .then(async (response) => {
          if (!response.ok) throw new Error("search failed");
          return (await response.json()) as { venues?: VenueHubSearchHit[] };
        })
        .then((body) => {
          if (cancelled) return;
          setResults(Array.isArray(body.venues) ? body.venues : []);
          setOpen(true);
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
        })
        .finally(() => {
          if (!cancelled) setPending(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  const showHint = query.trim().length > 0 && query.trim().length < VENUE_HUB_SEARCH_MIN;
  const showEmpty =
    !pending &&
    query.trim().length >= VENUE_HUB_SEARCH_MIN &&
    open &&
    results.length === 0;

  return (
    <div className="relative z-20 max-w-xl">
      <label className="sr-only" htmlFor="venue-hub-search">
        Search venues by name
      </label>
      <Search className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-zinc-500" />
      <input
        id="venue-hub-search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Search by venue name"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        className="min-h-12 w-full rounded-full border border-white/10 bg-black/20 py-3 pl-11 pr-12 text-sm text-white placeholder:text-zinc-500 focus:border-[var(--color-brand)]/50 focus:outline-none"
      />
      {pending ? (
        <LoaderCircle className="absolute right-4 top-4 h-4 w-4 animate-spin text-zinc-500" />
      ) : null}

      {showHint ? (
        <p className="mt-3 text-sm text-zinc-500">
          Type at least {VENUE_HUB_SEARCH_MIN} characters to search by name.
        </p>
      ) : null}

      {showEmpty ? (
        <p className="mt-3 text-sm text-zinc-500">
          No venues matched that name. Try another spelling.
        </p>
      ) : null}

      {open && results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#141814] shadow-2xl"
        >
          {results.map((venue) => (
            <li key={venue.cmsId} role="option">
              <Link
                href={`/venues/${venue.slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
              >
                <span>
                  <span className="block text-sm font-medium text-white">
                    {venue.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {venue.city ?? "South Africa"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
