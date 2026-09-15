import {
  VENUE_NAME_SEARCH_MIN,
  normalizeVenueNameQuery,
  venueNameMatchTerm,
} from "../search/nameSearch.ts";

/** Minimum characters before onboarding venue search runs. */
export const ONBOARDING_VENUE_QUERY_MIN = VENUE_NAME_SEARCH_MIN;

/** Cap results so the step stays scannable. */
export const ONBOARDING_VENUE_RESULT_LIMIT = 12;

export type OnboardingVenueOption = {
  cmsId: string;
  name: string;
  slug: string;
  city: string | null;
  sports: string[];
};

export const normalizeOnboardingVenueQuery = normalizeVenueNameQuery;
export const onboardingVenueMatchTerm = venueNameMatchTerm;

/**
 * Prefer venues that host/broadcast the sports the user already picked,
 * then alphabetical by name.
 */
export function rankOnboardingVenues(
  venues: OnboardingVenueOption[],
  sportSlugs: string[],
): OnboardingVenueOption[] {
  const preferred = new Set(
    sportSlugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean),
  );

  return [...venues].sort((a, b) => {
    const aHit = a.sports.some((slug) => preferred.has(slug.toLowerCase()));
    const bHit = b.sports.some((slug) => preferred.has(slug.toLowerCase()));
    if (aHit !== bHit) return aHit ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
