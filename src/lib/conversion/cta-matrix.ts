import { intentOrDirectoryHref, intentPath } from "../intent/paths.ts";
import { padelNewHref, golfNewHref, dartsNewHref } from "../venues/quick-start.ts";
import type { CtaSlot, PageType } from "../analytics/track.ts";

export const SCORECARD_SPORTS = ["padel", "golf", "darts"] as const;
export type ScorecardSport = (typeof SCORECARD_SPORTS)[number];

export const ORGANISE_SPORTS = ["padel", "golf"] as const;
export type OrganiseSport = (typeof ORGANISE_SPORTS)[number];

export type ConversionPageType =
  | "play_city_sport"
  | "watch_city_sport"
  | "guide"
  | "event"
  | "venue";

export type ConversionCta = {
  href: string;
  label: string;
  id: string;
};

export type ConversionFallbackKind = "notify_roadmap" | "notify" | "claim" | null;

export type CtaMatrixInput = {
  pageType: ConversionPageType;
  sport?: string | null;
  city?: string | null;
  venueSlug?: string | null;
  eventSlug?: string | null;
  guideIntent?: "play" | "watch" | null;
  venueCount?: number;
  hasScorecard?: boolean;
  hasDirections?: boolean;
  hasWhatsApp?: boolean;
  whatsAppHref?: string | null;
  directionsHref?: string | null;
  relatedHref?: string | null;
  shareHref?: string | null;
};

export type CtaMatrix = {
  pageType: ConversionPageType;
  primary: ConversionCta;
  secondary: ConversionCta;
  fallback: ConversionFallbackKind;
};

export function isScorecardSport(sport: string | null | undefined): boolean {
  const slug = sport?.trim().toLowerCase();
  return slug === "padel" || slug === "golf" || slug === "darts";
}

export function isOrganiseSport(sport: string | null | undefined): boolean {
  const slug = sport?.trim().toLowerCase();
  return slug === "padel" || slug === "golf";
}

export function startMatchLabel(sport: string | null | undefined): string {
  const slug = sport?.trim().toLowerCase();
  if (slug === "golf") return "Start a round";
  if (slug === "darts") return "Start a game";
  if (slug === "padel") return "Start a match";
  return "Start a match";
}

function appendParams(
  path: string,
  params: Record<string, string | null | undefined>,
): string {
  const [base, existing] = path.split("?");
  const qs = new URLSearchParams(existing ?? "");
  for (const [key, value] of Object.entries(params)) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    qs.set(key, trimmed);
  }
  const serialized = qs.toString();
  return serialized ? `${base}?${serialized}` : base;
}

/** Deep-link into a create / organise flow with venue, sport, and city prefills. */
export function createFlowHref(
  kind: "start" | "organise",
  input: {
    sport?: string | null;
    venue?: string | null;
    city?: string | null;
  } = {},
): string {
  const sport = input.sport?.trim().toLowerCase() ?? "";
  let path = "/padel/new";
  if (kind === "organise") {
    path = sport === "golf" ? "/golf/organise" : "/padel/organise";
  } else if (sport === "golf") {
    path = golfNewHref(input.venue);
  } else if (sport === "darts") {
    path = dartsNewHref(input.venue);
  } else {
    path = padelNewHref(input.venue);
  }

  return appendParams(path, {
    venue: kind === "organise" ? input.venue : undefined,
    sport: sport || undefined,
    city: input.city,
  });
}

export function findVenuesHref(input: {
  intent: "play" | "watch";
  sport?: string | null;
  city?: string | null;
  hash?: string | null;
}): string {
  if (input.hash) return input.hash;
  return intentOrDirectoryHref({
    intent: input.intent,
    sport: input.sport,
    location: input.city,
  });
}

function playPrimary(input: CtaMatrixInput): ConversionCta {
  const sport = input.sport?.trim().toLowerCase() || null;
  const hasScorecard = input.hasScorecard ?? isScorecardSport(sport);
  if (hasScorecard) {
    return {
      id: "start_match",
      label: startMatchLabel(sport),
      href: createFlowHref("start", {
        sport,
        venue: input.venueSlug,
        city: input.city,
      }),
    };
  }
  if (isOrganiseSport(sport)) {
    return {
      id: "organise",
      label: "Organise a game",
      href: createFlowHref("organise", {
        sport,
        venue: input.venueSlug,
        city: input.city,
      }),
    };
  }
  return {
    id: "find_venues",
    label: "Find venues",
    href: findVenuesHref({
      intent: "play",
      sport,
      city: input.city,
      hash: input.venueCount !== undefined ? "#venues" : null,
    }),
  };
}

function playSecondary(input: CtaMatrixInput): ConversionCta {
  const sport = input.sport?.trim().toLowerCase() || null;
  const hasScorecard = input.hasScorecard ?? isScorecardSport(sport);
  if (hasScorecard) {
    return {
      id: "find_venues",
      label: "Find venues",
      href: findVenuesHref({
        intent: "play",
        sport,
        city: input.city,
        hash: input.venueCount !== undefined ? "#venues" : null,
      }),
    };
  }
  if (isOrganiseSport(sport)) {
    return {
      id: "find_venues",
      label: "Find venues",
      href: findVenuesHref({
        intent: "play",
        sport,
        city: input.city,
        hash: "#venues",
      }),
    };
  }
  return {
    id: "browse_sport",
    label: sport ? `Browse ${sport}` : "Browse sports",
    href: sport ? intentPath("play", sport) : "/play",
  };
}

function watchPrimary(input: CtaMatrixInput): ConversionCta {
  const count = input.venueCount ?? 0;
  return {
    id: "find_watch",
    label: count > 0 ? "Find where to watch" : "Find where to watch",
    href:
      count > 0
        ? "#venues"
        : findVenuesHref({
            intent: "watch",
            sport: input.sport,
            city: input.city,
          }),
  };
}

function watchSecondary(input: CtaMatrixInput): ConversionCta {
  const city = input.city?.trim();
  return {
    id: "browse_fixtures",
    label: "Browse fixtures",
    href: city ? `/events?city=${encodeURIComponent(city)}` : "/events",
  };
}

function guidePrimary(input: CtaMatrixInput): ConversionCta {
  const intent = input.guideIntent === "watch" ? "watch" : "play";
  if (intent === "watch") return watchPrimary(input);
  return playPrimary(input);
}

function guideSecondary(input: CtaMatrixInput): ConversionCta {
  if (input.relatedHref) {
    return {
      id: "related",
      label: "Related",
      href: input.relatedHref,
    };
  }
  return {
    id: "find_venues",
    label: "Find venues",
    href: findVenuesHref({
      intent: input.guideIntent === "watch" ? "watch" : "play",
      sport: input.sport,
      city: input.city,
    }),
  };
}

function eventPrimary(input: CtaMatrixInput): ConversionCta {
  const count = input.venueCount ?? 0;
  if (count > 0) {
    return {
      id: "find_screening",
      label: "Find venues screening",
      href: "#where-to-watch",
    };
  }
  return {
    id: "im_watching",
    label: "I'm watching",
    href: "#live-feed",
  };
}

function eventSecondary(input: CtaMatrixInput): ConversionCta {
  return {
    id: "share_event",
    label: "Share event",
    href: input.shareHref || "#",
  };
}

function venuePrimary(input: CtaMatrixInput): ConversionCta {
  const sport = input.sport?.trim().toLowerCase() || null;
  const hasScorecard = input.hasScorecard ?? isScorecardSport(sport);
  if (hasScorecard) {
    return {
      id: "start_match",
      label: startMatchLabel(sport),
      href: createFlowHref("start", {
        sport,
        venue: input.venueSlug,
        city: input.city,
      }),
    };
  }
  return {
    id: "find_fixtures",
    label: "Find fixtures",
    href: "/events",
  };
}

function venueSecondary(input: CtaMatrixInput): ConversionCta {
  if (input.hasDirections && input.directionsHref) {
    return {
      id: "directions",
      label: "Get directions",
      href: input.directionsHref,
    };
  }
  if (input.hasWhatsApp && input.whatsAppHref) {
    return {
      id: "whatsapp",
      label: "Inquire on WhatsApp",
      href: input.whatsAppHref,
    };
  }
  return {
    id: "directions",
    label: "Get directions",
    href: input.directionsHref || "#location",
  };
}

function fallbackFor(pageType: ConversionPageType): ConversionFallbackKind {
  if (pageType === "event") return "notify";
  if (pageType === "venue") return "claim";
  return "notify_roadmap";
}

export function selectCtaMatrix(input: CtaMatrixInput): CtaMatrix {
  const pageType = input.pageType;
  if (pageType === "play_city_sport") {
    return {
      pageType,
      primary: playPrimary(input),
      secondary: playSecondary(input),
      fallback: fallbackFor(pageType),
    };
  }
  if (pageType === "watch_city_sport") {
    return {
      pageType,
      primary: watchPrimary(input),
      secondary: watchSecondary(input),
      fallback: fallbackFor(pageType),
    };
  }
  if (pageType === "guide") {
    return {
      pageType,
      primary: guidePrimary(input),
      secondary: guideSecondary(input),
      fallback: fallbackFor(pageType),
    };
  }
  if (pageType === "event") {
    return {
      pageType,
      primary: eventPrimary(input),
      secondary: eventSecondary(input),
      fallback: fallbackFor(pageType),
    };
  }
  return {
    pageType: "venue",
    primary: venuePrimary(input),
    secondary: venueSecondary(input),
    fallback: fallbackFor("venue"),
  };
}

export function stickyActions(matrix: CtaMatrix): [ConversionCta, ConversionCta] {
  return [matrix.primary, matrix.secondary];
}

export function ctaAnalyticsParams(
  matrix: CtaMatrix,
  slot: CtaSlot,
  extra: { sport?: string | null; city?: string | null; slug?: string | null } = {},
): {
  page_type: PageType;
  cta_slot: CtaSlot;
  sport?: string;
  city?: string;
  slug?: string;
} {
  return {
    page_type: matrix.pageType,
    cta_slot: slot,
    ...(extra.sport ? { sport: extra.sport } : {}),
    ...(extra.city ? { city: extra.city } : {}),
    ...(extra.slug ? { slug: extra.slug } : {}),
  };
}
