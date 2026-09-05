/** Minimum characters before onboarding venue search runs. */
export const ONBOARDING_VENUE_QUERY_MIN = 2;

/** Cap results so the step stays scannable. */
export const ONBOARDING_VENUE_RESULT_LIMIT = 12;

export type OnboardingVenueOption = {
  cmsId: string;
  name: string;
  slug: string;
  city: string | null;
  sports: string[];
};

/**
 * Normalize a free-text venue query for Sanity `match` + ranking.
 * Returns an empty string when the query is too short to search.
 */
export function normalizeOnboardingVenueQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Sanity full-text token with a trailing wildcard for prefix matches. */
export function onboardingVenueMatchTerm(query: string): string | null {
  const normalized = normalizeOnboardingVenueQuery(query);
  if (normalized.length < ONBOARDING_VENUE_QUERY_MIN) return null;
  // Strip characters that break GROQ match tokens; keep letters/digits/spaces.
  const token = normalized
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (token.length < ONBOARDING_VENUE_QUERY_MIN) return null;
  return `${token}*`;
}

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
