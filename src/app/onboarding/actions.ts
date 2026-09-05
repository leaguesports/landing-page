"use server";

import {
  ONBOARDING_VENUE_RESULT_LIMIT,
  onboardingVenueMatchTerm,
  rankOnboardingVenues,
  type OnboardingVenueOption,
} from "@/lib/onboarding/venue-search";
import { sanityClient } from "@/sanity/client";
import {
  mapVenueRow,
  VENUE_PROJECTION,
  type VenueDetail,
  type VenueRow,
} from "@/services/venueQuery";

export type { OnboardingVenueOption };

function toOption(venue: VenueDetail): OnboardingVenueOption | null {
  const cmsId = venue._id?.trim();
  const name = venue.name?.trim();
  const slug = venue.slug?.trim();
  if (!cmsId || !name || !slug) return null;

  const sports = [
    ...(venue.sports ?? [])
      .map((sport) => sport.slug)
      .filter((value): value is string => !!value),
    ...(venue.broadcasts ?? [])
      .map((sport) => sport.slug)
      .filter((value): value is string => !!value),
  ];

  return {
    cmsId,
    name,
    slug,
    city: venue.address?.city?.trim() || venue.address?.suburb?.trim() || null,
    sports: [...new Set(sports)],
  };
}

/**
 * Free-text venue lookup for onboarding. Matches name, city, suburb, or slug.
 * When `sportSlugs` are provided, matching venues are ranked first.
 */
export async function searchOnboardingVenues(
  query: string,
  sportSlugs: string[] = [],
): Promise<OnboardingVenueOption[]> {
  const matchTerm = onboardingVenueMatchTerm(query);
  if (!matchTerm) return [];

  const rows = await sanityClient.fetch<VenueRow[]>(
    `*[
      _type == "venue"
      && (
        name match $term
        || address.city->title match $term
        || address.suburb->title match $term
        || slug.current match $term
      )
    ] | order(name asc) [0...36] {
      ${VENUE_PROJECTION}
    }`,
    { term: matchTerm },
  );

  const options = rows
    .map(mapVenueRow)
    .filter((venue): venue is VenueDetail => venue !== null)
    .map(toOption)
    .filter((item): item is OnboardingVenueOption => !!item);

  return rankOnboardingVenues(options, sportSlugs).slice(
    0,
    ONBOARDING_VENUE_RESULT_LIMIT,
  );
}
