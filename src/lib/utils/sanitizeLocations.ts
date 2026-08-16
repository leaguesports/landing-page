/**
 * SA suburb → parent city mappings for data integrity checks.
 * Use to flag venues where suburb/city disagree before outreach.
 */

export type SaCity =
  | "Cape Town"
  | "Johannesburg"
  | "Pretoria"
  | "Durban";

export type VenueLocationInput = {
  id?: string;
  slug?: string;
  name?: string;
  suburb?: string | null;
  city?: string | null;
  /** Free-form address string (optional fallback parse) */
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geometry?: { lat?: number | null; lng?: number | null } | null;
};

export type LocationMismatch = {
  id?: string;
  slug?: string;
  name?: string;
  suburb: string;
  city: string;
  expectedCity: SaCity | null;
  reason: "suburb_city_mismatch" | "unknown_suburb" | "missing_city";
};

/** Canonical suburb lists keyed by metro city. */
export const SA_CITY_SUBURBS: Record<SaCity, readonly string[]> = {
  "Cape Town": [
    "Sea Point",
    "Claremont",
    "Green Point",
    "Newlands",
    "Camps Bay",
    "Rondebosch",
    "Woodstock",
  ],
  Johannesburg: [
    "Rosebank",
    "Sandton",
    "Illovo",
    "Parkhurst",
    "Fourways",
    "Randburg",
    "Greenside",
  ],
  Pretoria: ["Menlyn", "Hazelwood", "Brooklyn", "Centurion"],
  Durban: ["Umhlanga", "Ballito", "Morningside", "Berea"],
};

const SUBURB_TO_CITY = new Map<string, SaCity>();

for (const [city, suburbs] of Object.entries(SA_CITY_SUBURBS) as [
  SaCity,
  readonly string[],
][]) {
  for (const suburb of suburbs) {
    SUBURB_TO_CITY.set(normalizePlace(suburb), city);
  }
}

function normalizePlace(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Resolve expected metro city for a known SA suburb, or null if unmapped. */
export function expectedCityForSuburb(suburb: string): SaCity | null {
  if (!suburb.trim()) return null;
  return SUBURB_TO_CITY.get(normalizePlace(suburb)) ?? null;
}

/**
 * Extract suburb/city hints from a free-form address string.
 * Prefers explicit suburb tokens from {@link SA_CITY_SUBURBS}.
 */
export function parseAddressPlaces(address: string): {
  suburb: string | null;
  city: SaCity | null;
} {
  const lower = address.toLowerCase();
  let suburb: string | null = null;
  let city: SaCity | null = null;

  for (const [metro, suburbs] of Object.entries(SA_CITY_SUBURBS) as [
    SaCity,
    readonly string[],
  ][]) {
    if (lower.includes(metro.toLowerCase())) {
      city = metro;
    }
    for (const name of suburbs) {
      if (lower.includes(name.toLowerCase())) {
        suburb = name;
        city = metro;
      }
    }
  }

  return { suburb, city };
}

/**
 * Normalize lat/lng from explicit fields or nested geometry.
 */
export function resolveGeometry(venue: VenueLocationInput): {
  latitude: number | null;
  longitude: number | null;
} {
  const lat =
    typeof venue.latitude === "number"
      ? venue.latitude
      : typeof venue.geometry?.lat === "number"
        ? venue.geometry.lat
        : null;
  const lng =
    typeof venue.longitude === "number"
      ? venue.longitude
      : typeof venue.geometry?.lng === "number"
        ? venue.geometry.lng
        : null;

  return {
    latitude: lat != null && !Number.isNaN(lat) ? lat : null,
    longitude: lng != null && !Number.isNaN(lng) ? lng : null,
  };
}

/**
 * Validate suburb/city pairing. Returns a mismatch record when review is needed.
 */
export function flagSuburbCityMismatch(
  venue: VenueLocationInput,
): LocationMismatch | null {
  let suburb = venue.suburb?.trim() || "";
  let city = venue.city?.trim() || "";

  if ((!suburb || !city) && venue.address?.trim()) {
    const parsed = parseAddressPlaces(venue.address);
    if (!suburb && parsed.suburb) suburb = parsed.suburb;
    if (!city && parsed.city) city = parsed.city;
  }

  if (!suburb) return null;

  const expected = expectedCityForSuburb(suburb);

  if (!expected) {
    return {
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      suburb,
      city: city || "",
      expectedCity: null,
      reason: "unknown_suburb",
    };
  }

  if (!city) {
    return {
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      suburb,
      city: "",
      expectedCity: expected,
      reason: "missing_city",
    };
  }

  if (normalizePlace(city) !== normalizePlace(expected)) {
    // Allow common aliases
    const aliases: Record<string, SaCity> = {
      joburg: "Johannesburg",
      jhb: "Johannesburg",
      "cape town": "Cape Town",
      cpt: "Cape Town",
      tshwane: "Pretoria",
      pta: "Pretoria",
      dbn: "Durban",
    };
    const aliased = aliases[normalizePlace(city)];
    if (aliased === expected) return null;

    return {
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      suburb,
      city,
      expectedCity: expected,
      reason: "suburb_city_mismatch",
    };
  }

  return null;
}

/**
 * Scan a venue list and return records that need manual DB review.
 * Also logs each flag via `console.warn` for migration/script runs.
 */
export function sanitizeVenueLocations(
  venues: VenueLocationInput[],
): LocationMismatch[] {
  const mismatches: LocationMismatch[] = [];

  for (const venue of venues) {
    const flag = flagSuburbCityMismatch(venue);
    if (!flag) continue;

    mismatches.push(flag);
    console.warn(
      `[sanitizeLocations] ${flag.reason}: suburb="${flag.suburb}" city="${flag.city}" expected="${flag.expectedCity ?? "n/a"}"`,
      { id: flag.id, slug: flag.slug, name: flag.name },
    );
  }

  return mismatches;
}

/**
 * Suggest corrected city for a venue based on suburb mapping.
 */
export function suggestCorrectedCity(
  venue: VenueLocationInput,
): SaCity | null {
  const suburb = venue.suburb?.trim();
  if (suburb) {
    const fromSuburb = expectedCityForSuburb(suburb);
    if (fromSuburb) return fromSuburb;
  }
  if (venue.address?.trim()) {
    return parseAddressPlaces(venue.address).city;
  }
  return null;
}
