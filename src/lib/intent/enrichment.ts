import type { IntentActivity } from "./activity.ts";
import type { IntentKind } from "./paths.ts";

/** Venue fields enrichment reads — keep free of `@/` imports for node:test. */
type EnrichmentVenue = {
  name: string;
  hero_image?: unknown;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  has_generator_backup?: boolean | null;
  has_outdoor_area?: boolean | null;
  has_parking?: boolean | null;
  has_food_menu?: boolean | null;
  is_verified?: boolean | null;
  rating?: number | null;
  upcoming_screenings?:
    | { title: string; startsAt: string }[]
    | null;
};

export type IntentAmenityStat = {
  key: string;
  label: string;
  count: number;
};

export type IntentScreeningHighlight = {
  title: string;
  venueName: string;
  startsAt: string;
};

export type IntentPageEnrichment = {
  amenityStats: IntentAmenityStat[];
  screeningHighlights: IntentScreeningHighlight[];
  verifiedCount: number;
  ratedCount: number;
  /** First venue with a usable hero for Open Graph, else null. */
  ogImageVenue: EnrichmentVenue | null;
};

export type IntentIndexPolicy = {
  indexable: boolean;
  /** Location slug to use in the canonical path. */
  canonicalLocationSlug: string;
  reason: "exact-matches" | "empty" | "city-fallback";
};

function countWhere(
  venues: readonly EnrichmentVenue[],
  predicate: (venue: EnrichmentVenue) => boolean,
): number {
  let total = 0;
  for (const venue of venues) {
    if (predicate(venue)) total += 1;
  }
  return total;
}

function hasHeroPhoto(venue: EnrichmentVenue): boolean {
  const image = venue.hero_image;
  if (!image || typeof image !== "object") return false;
  return Boolean((image as { asset?: unknown }).asset);
}

/** Aggregate CMS venue signals so intent pages are less purely templated. */
export function buildIntentEnrichment(
  intent: IntentKind,
  venues: readonly EnrichmentVenue[],
): IntentPageEnrichment {
  const amenityStats: IntentAmenityStat[] = [];

  if (intent === "watch") {
    const screens = countWhere(venues, (v) => Boolean(v.has_big_screens));
    const audio = countWhere(venues, (v) => Boolean(v.has_live_audio));
    const generator = countWhere(venues, (v) =>
      Boolean(v.has_generator_backup),
    );
    if (screens > 0) {
      amenityStats.push({
        key: "screens",
        label:
          screens === 1 ? "1 with big screens" : `${screens} with big screens`,
        count: screens,
      });
    }
    if (audio > 0) {
      amenityStats.push({
        key: "audio",
        label: audio === 1 ? "1 with live audio" : `${audio} with live audio`,
        count: audio,
      });
    }
    if (generator > 0) {
      amenityStats.push({
        key: "generator",
        label:
          generator === 1
            ? "1 with generator backup"
            : `${generator} with generator backup`,
        count: generator,
      });
    }
  } else {
    const outdoor = countWhere(venues, (v) => Boolean(v.has_outdoor_area));
    const parking = countWhere(venues, (v) => Boolean(v.has_parking));
    const food = countWhere(venues, (v) => Boolean(v.has_food_menu));
    if (outdoor > 0) {
      amenityStats.push({
        key: "outdoor",
        label:
          outdoor === 1
            ? "1 with outdoor space"
            : `${outdoor} with outdoor space`,
        count: outdoor,
      });
    }
    if (parking > 0) {
      amenityStats.push({
        key: "parking",
        label: parking === 1 ? "1 with parking" : `${parking} with parking`,
        count: parking,
      });
    }
    if (food > 0) {
      amenityStats.push({
        key: "food",
        label: food === 1 ? "1 with food" : `${food} with food`,
        count: food,
      });
    }
  }

  if (intent === "watch") {
    const parking = countWhere(venues, (v) => Boolean(v.has_parking));
    if (parking > 0 && !amenityStats.some((item) => item.key === "parking")) {
      amenityStats.push({
        key: "parking",
        label: parking === 1 ? "1 with parking" : `${parking} with parking`,
        count: parking,
      });
    }
  }

  const now = Date.now();
  const screeningHighlights: IntentScreeningHighlight[] = venues
    .flatMap((venue) =>
      (venue.upcoming_screenings ?? []).map((screening) => ({
        title: screening.title,
        venueName: venue.name,
        startsAt: screening.startsAt,
      })),
    )
    .filter((item) => {
      const ts = Date.parse(item.startsAt);
      return Number.isFinite(ts)
        ? ts >= now - 60 * 60 * 1000
        : Boolean(item.title);
    })
    .sort((a, b) => {
      const aTs = Date.parse(a.startsAt);
      const bTs = Date.parse(b.startsAt);
      if (!Number.isFinite(aTs) && !Number.isFinite(bTs)) return 0;
      if (!Number.isFinite(aTs)) return 1;
      if (!Number.isFinite(bTs)) return -1;
      return aTs - bTs;
    })
    .slice(0, 3);

  return {
    amenityStats,
    screeningHighlights,
    verifiedCount: countWhere(venues, (v) => Boolean(v.is_verified)),
    ratedCount: countWhere(
      venues,
      (v) => typeof v.rating === "number" && Number.isFinite(v.rating),
    ),
    ogImageVenue: venues.find((venue) => hasHeroPhoto(venue)) ?? null,
  };
}

/**
 * Empty pages and city-fallback suburb pages should not compete in the index.
 * Fallback pages canonicalize to the parent city URL.
 */
export function resolveIntentIndexPolicy(input: {
  locationSlug: string;
  parentSlug: string | null | undefined;
  venueCount: number;
  usedCityFallback: boolean;
}): IntentIndexPolicy {
  if (input.venueCount <= 0) {
    return {
      indexable: false,
      canonicalLocationSlug: input.locationSlug,
      reason: "empty",
    };
  }

  if (input.usedCityFallback && input.parentSlug) {
    return {
      indexable: false,
      canonicalLocationSlug: input.parentSlug,
      reason: "city-fallback",
    };
  }

  return {
    indexable: true,
    canonicalLocationSlug: input.locationSlug,
    reason: "exact-matches",
  };
}

/** Unique-ish intro paragraphs for the detail hero. */
export function buildIntentIntroParagraphs(input: {
  intent: IntentKind;
  activity: IntentActivity;
  locationTitle: string;
  venueCount: number;
  usedCityFallback: boolean;
  cityTitle?: string | null;
  enrichment: IntentPageEnrichment;
}): string[] {
  const {
    intent,
    activity,
    locationTitle,
    venueCount,
    usedCityFallback,
    cityTitle,
    enrichment,
  } = input;
  const verb = intent === "watch" ? "watch" : "play";
  const placeWord =
    intent === "watch" ? "bars and fan zones" : "courts and clubs";
  const paragraphs: string[] = [];

  if (venueCount <= 0) {
    paragraphs.push(
      `We do not have a confirmed ${activity.name} ${intent} venue in ${locationTitle} yet. Browse nearby suburbs below, or check the full venues directory while we expand coverage.`,
    );
    return paragraphs;
  }

  if (usedCityFallback && cityTitle) {
    paragraphs.push(
      `Looking to ${verb} ${activity.name} in ${locationTitle}? We have not mapped a direct match in that suburb yet, so these are the strongest ${placeWord} nearby in ${cityTitle}.`,
    );
  } else if (intent === "watch") {
    paragraphs.push(
      `Looking for somewhere to watch ${activity.name} in ${locationTitle}? LeagueSports currently lists ${venueCount} ${venueCount === 1 ? "venue" : "venues"} tagged for live ${activity.name} screenings — compare screens, parking, and match-day setup before you go.`,
    );
  } else {
    paragraphs.push(
      `Looking for somewhere to play ${activity.name} in ${locationTitle}? LeagueSports currently lists ${venueCount} ${venueCount === 1 ? "venue" : "venues"} hosting ${activity.name} — compare courts, clubs, and facilities, then book or start a session.`,
    );
  }

  const signalBits: string[] = [];
  if (enrichment.verifiedCount > 0) {
    signalBits.push(
      `${enrichment.verifiedCount} verified ${enrichment.verifiedCount === 1 ? "listing" : "listings"}`,
    );
  }
  for (const stat of enrichment.amenityStats.slice(0, 3)) {
    signalBits.push(stat.label);
  }
  if (enrichment.screeningHighlights.length > 0 && intent === "watch") {
    signalBits.push(
      `${enrichment.screeningHighlights.length} upcoming ${enrichment.screeningHighlights.length === 1 ? "screening" : "screenings"} on the calendar`,
    );
  }

  if (signalBits.length > 0) {
    paragraphs.push(
      `From the current listings: ${signalBits.join("; ")}. Open a venue page for address, contact details, and the latest amenities.`,
    );
  } else {
    paragraphs.push(
      `Open a venue page for address, contact details, and the latest amenities before you head out.`,
    );
  }

  return paragraphs;
}
