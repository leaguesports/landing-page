"use client";

import {
  VENUE_NAME_SEARCH_DEBOUNCE_MS,
  VENUE_NAME_SEARCH_EMPTY,
  VENUE_NAME_SEARCH_ERROR,
  VENUE_NAME_SEARCH_MIN,
  venueNameSearchHint,
  venueNameSearchShouldFetch,
} from "@/lib/search/nameSearch";
import type { VenueHubSearchHit } from "@/lib/venues/hub";
import { useEffect, useState } from "react";

export type VenueNameSearchState = {
  results: VenueHubSearchHit[];
  pending: boolean;
  error: string | null;
  tooShort: boolean;
  empty: boolean;
  hint: string;
  emptyCopy: string;
  errorCopy: string;
};

export function useVenueNameSearch(query: string): VenueNameSearchState {
  const [results, setResults] = useState<VenueHubSearchHit[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = query.trim();
  const shouldFetch = venueNameSearchShouldFetch(trimmed);
  const tooShort = trimmed.length > 0 && trimmed.length < VENUE_NAME_SEARCH_MIN;

  useEffect(() => {
    if (!shouldFetch) {
      setResults([]);
      setPending(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setPending(true);
    const handle = window.setTimeout(() => {
      void fetch(`/api/venues/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const body = (await response.json()) as {
            venues?: VenueHubSearchHit[];
            error?: string;
          };
          if (!response.ok) {
            throw new Error(body.error || "search_failed");
          }
          return body;
        })
        .then((body) => {
          setResults(Array.isArray(body.venues) ? body.venues : []);
          setError(null);
        })
        .catch((caught: unknown) => {
          if (controller.signal.aborted) return;
          setResults([]);
          setError(VENUE_NAME_SEARCH_ERROR);
          void caught;
        })
        .finally(() => {
          if (!controller.signal.aborted) setPending(false);
        });
    }, VENUE_NAME_SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [shouldFetch, trimmed]);

  return {
    results,
    pending,
    error,
    tooShort,
    empty: shouldFetch && !pending && !error && results.length === 0,
    hint: venueNameSearchHint(VENUE_NAME_SEARCH_MIN),
    emptyCopy: VENUE_NAME_SEARCH_EMPTY,
    errorCopy: VENUE_NAME_SEARCH_ERROR,
  };
}
