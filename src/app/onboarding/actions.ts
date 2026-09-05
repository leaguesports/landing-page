"use server";

import { searchVenues, type VenueDetail } from "@/services/venues";

export type OnboardingVenueOption = {
  cmsId: string;
  name: string;
  slug: string;
  city: string | null;
  sports: string[];
};

function toOption(venue: VenueDetail): OnboardingVenueOption | null {
  const cmsId = venue._id?.trim();
  const name = venue.name?.trim();
  const slug = venue.slug?.trim();
  if (!cmsId || !name || !slug) return null;

  const sports = [
    ...(venue.sports ?? [])
      .map((sport) => sport.slug)
      .filter((slug): slug is string => !!slug),
    ...(venue.broadcasts ?? [])
      .map((sport) => sport.slug)
      .filter((slug): slug is string => !!slug),
  ];

  return {
    cmsId,
    name,
    slug,
    city: venue.address?.city?.trim() || venue.address?.suburb?.trim() || null,
    sports: [...new Set(sports)],
  };
}

export async function lookupOnboardingVenues(
  sportSlugs: string[],
): Promise<OnboardingVenueOption[]> {
  const slugs = [
    ...new Set(
      sportSlugs
        .map((slug) => slug.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 8);

  if (slugs.length === 0) {
    const venues = await searchVenues({});
    return venues
      .map(toOption)
      .filter((item): item is OnboardingVenueOption => !!item)
      .slice(0, 24);
  }

  const batches = await Promise.all(
    slugs.map((sportSlug) => searchVenues({ sportSlug })),
  );

  const byCmsId = new Map<string, OnboardingVenueOption>();
  for (const venues of batches) {
    for (const venue of venues) {
      const option = toOption(venue);
      if (!option || byCmsId.has(option.cmsId)) continue;
      byCmsId.set(option.cmsId, option);
    }
  }

  return [...byCmsId.values()].slice(0, 36);
}
