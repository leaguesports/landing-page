"use client";

import { VenueNameTypeahead } from "@/components/search/VenueNameTypeahead";

export function VenueNameSearch({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <VenueNameTypeahead
      initialQuery={initialQuery}
      inputId="venue-hub-search"
      syncUrl
    />
  );
}
