"use client";

import { useVenueNameSearch } from "@/hooks/useVenueNameSearch";
import { VENUE_NAME_SEARCH_DEBOUNCE_MS } from "@/lib/search/nameSearch";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

type VenueNameTypeaheadProps = {
  initialQuery?: string;
  placeholder?: string;
  inputId?: string;
  /** Keep `?q=` in sync so SearchAction / hub / hero landings stay shareable. */
  syncUrl?: boolean;
  tone?: "hub" | "panel";
};

function syncVenueNameQuery(query: string) {
  const url = new URL(window.location.href);
  const next = query.trim();
  const current = url.searchParams.get("q") ?? "";
  if (current === next) return;
  if (next) url.searchParams.set("q", next);
  else url.searchParams.delete("q");
  const search = url.searchParams.toString();
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${search ? `?${search}` : ""}`,
  );
}

export function VenueNameTypeahead({
  initialQuery = "",
  placeholder = "Search by venue name",
  inputId,
  syncUrl = false,
  tone = "hub",
}: VenueNameTypeaheadProps) {
  const generatedId = useId();
  const listId = useId();
  const fieldId = inputId ?? generatedId;
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const { results, pending, error, tooShort, empty, hint, emptyCopy, errorCopy } =
    useVenueNameSearch(query);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!syncUrl) return;
    const handle = window.setTimeout(
      () => syncVenueNameQuery(query),
      VENUE_NAME_SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(handle);
  }, [query, syncUrl]);

  const showList = open && results.length > 0;
  const shell =
    tone === "panel"
      ? "relative z-20 w-full"
      : "relative z-20 max-w-xl";
  const inputClass =
    tone === "panel"
      ? "min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/40 focus:outline-none"
      : "min-h-12 w-full rounded-full border border-white/10 bg-black/20 py-3 pl-11 pr-12 text-sm text-white placeholder:text-zinc-500 focus:border-[var(--color-brand)]/50 focus:outline-none";

  return (
    <div className={shell}>
      <label className="sr-only" htmlFor={fieldId}>
        Search venues by name
      </label>
      <Search className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-zinc-500" />
      <input
        id={fieldId}
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
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        className={inputClass}
      />
      {pending ? (
        <LoaderCircle className="absolute right-4 top-4 h-4 w-4 animate-spin text-zinc-500" />
      ) : null}

      {tooShort ? (
        <p className="mt-3 text-sm text-zinc-500">{hint}</p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-amber-300/90">{errorCopy}</p>
      ) : null}

      {empty ? <p className="mt-3 text-sm text-zinc-500">{emptyCopy}</p> : null}

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#141814] shadow-2xl"
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
