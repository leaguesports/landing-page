"use client";

import { MapPin, Navigation, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { distanceKm, useGeolocation } from "@/hooks/useGeolocation";
import { readLastPadelVenueSlug } from "@/lib/padel/quick-start-defaults";
import { orderCaptureVenues } from "@/lib/padel/venue-select";
import type { VenueOption } from "@/lib/padel/venue-options";
import {
  VENUE_NAME_SEARCH_EMPTY,
  venueNameSearchHref,
} from "@/lib/search/nameSearch";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type VenueSelectModalProps = {
  venues: VenueOption[];
  selected: VenueOption | null;
  onSelect: (venue: VenueOption) => void;
  onClose: () => void;
};

function formatVenueDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function sameSlug(slug: string, pinnedSlug: string | null): boolean {
  if (!pinnedSlug) return false;
  return slug.trim().toLowerCase() === pinnedSlug.trim().toLowerCase();
}

export function VenueSelectModal({
  venues,
  selected,
  onSelect,
  onClose,
}: VenueSelectModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const searchId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);

  const { coords, status, error, request } = useGeolocation();
  const [query, setQuery] = useState("");
  const pinnedSlug = useMemo(() => readLastPadelVenueSlug(), []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const courts = useMemo(
    () =>
      orderCaptureVenues(venues, {
        query,
        coords,
        pinnedSlug,
      }),
    [venues, query, coords, pinnedSlug],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const focusable = [
        ...root.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((node) => !node.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  if (typeof document === "undefined") return null;

  const trimmedQuery = query.trim();

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-[#141814] shadow-[0_18px_40px_rgba(0,0,0,0.45)] outline-none sm:h-auto sm:max-h-[min(40rem,calc(100dvh-3rem))] sm:max-w-lg sm:rounded-2xl sm:border sm:border-white/10"
      >
        <div className="shrink-0 space-y-3 border-b border-white/8 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-display text-2xl tracking-wide text-white"
              >
                Choose a court
              </h2>
              <p id={descriptionId} className="mt-0.5 text-sm text-zinc-500">
                Search the padel directory or pick from the list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCloseRef.current()}
              aria-label="Close"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={searchId} className="sr-only">
                Search padel courts
              </label>
              <MapPin
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
                aria-hidden
              />
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search padel courts…"
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/40"
              />
            </div>
            <button
              type="button"
              onClick={request}
              disabled={status === "loading"}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              <Navigation className="h-4 w-4 text-emerald-400" aria-hidden />
              {status === "loading" ? "Locating…" : "Near me"}
            </button>
          </div>

          {error ? <p className="text-xs text-amber-400/90">{error}</p> : null}
          {trimmedQuery && courts.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {VENUE_NAME_SEARCH_EMPTY}{" "}
              <Link
                href={venueNameSearchHref(query)}
                className="font-medium text-emerald-300 hover:text-white"
              >
                Search all venues
              </Link>
            </p>
          ) : null}
          {coords ? (
            <p className="text-xs text-zinc-500">
              Sorted by distance from your location
            </p>
          ) : null}
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3 sm:max-h-[min(28rem,calc(100dvh-14rem))] sm:flex-none">
          {courts.map((venue) => {
            const active = selected?.id === venue.id;
            const pinned = sameSlug(venue.slug, pinnedSlug);
            const dist =
              coords && venue.latitude != null && venue.longitude != null
                ? distanceKm(coords, {
                    latitude: venue.latitude,
                    longitude: venue.longitude,
                  })
                : null;
            const place = [venue.suburb, venue.city]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={venue.id}>
                <button
                  type="button"
                  onClick={() => onSelect(venue)}
                  aria-pressed={active}
                  className={[
                    "flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-emerald-400/50 bg-emerald-400/10"
                      : "border-white/8 bg-[#0c0f0c] hover:border-white/16",
                  ].join(" ")}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">
                      {venue.name}
                    </span>
                    {place ? (
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        {place}
                      </span>
                    ) : null}
                  </span>
                  {pinned || (dist != null && Number.isFinite(dist)) ? (
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {pinned ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                          Last court
                        </span>
                      ) : null}
                      {dist != null && Number.isFinite(dist) ? (
                        <span className="text-xs tabular-nums text-emerald-400/90">
                          {formatVenueDistance(dist)}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
