/**
 * Venue detail IA + trust classification (issue #235).
 *
 * Watch/screening = broadcasts or upcoming screenings.
 * Play-capable = Play `sports` or quick-start activities.
 * `has_big_screens` alone does not make a padel club a watch venue.
 */

export type VenueDetailIaInput = {
  sports?: readonly unknown[] | null;
  broadcasts?: readonly unknown[] | null;
  upcoming_screenings?:
    | readonly { title?: string | null; startsAt?: string | null }[]
    | null;
};

export type VenueDetailKind = "play-only" | "watch-only" | "hybrid" | "neither";

export type VenueDetailNavLink = {
  label: string;
  href: string;
};

export type VenueDetailSectionId =
  | "weekend"
  | "quick-start"
  | "friends-played"
  | "match-history"
  | "leaderboards"
  | "about"
  | "sports"
  | "amenities"
  | "location"
  | "stay-close";

export function hasUpcomingScreenings(
  screenings: VenueDetailIaInput["upcoming_screenings"],
): boolean {
  return (screenings ?? []).some(
    (row) => Boolean(row?.title?.trim()) && Boolean(row?.startsAt?.trim()),
  );
}

export function isWatchVenue(venue: VenueDetailIaInput): boolean {
  return (
    (venue.broadcasts?.length ?? 0) > 0 ||
    hasUpcomingScreenings(venue.upcoming_screenings)
  );
}

export function isPlayVenue(
  venue: VenueDetailIaInput,
  hasQuickStart = false,
): boolean {
  return (venue.sports?.length ?? 0) > 0 || hasQuickStart;
}

export function venueDetailKind(
  venue: VenueDetailIaInput,
  hasQuickStart = false,
): VenueDetailKind {
  const watch = isWatchVenue(venue);
  const play = isPlayVenue(venue, hasQuickStart);
  if (play && watch) return "hybrid";
  if (play) return "play-only";
  if (watch) return "watch-only";
  return "neither";
}

export function venueDetailChrome(
  kind: VenueDetailKind,
  sportsCount: number,
): {
  showWatchWhatsOn: boolean;
  showWatchChips: boolean;
  showFindPlacesToWatch: boolean;
  showPlayChips: boolean;
  showFindPlacesToPlay: boolean;
  showSportsSection: boolean;
  showPlayStack: boolean;
  ctaMentionsScreenings: boolean;
} {
  const playCapable = kind === "play-only" || kind === "hybrid";
  const watchCapable = kind === "watch-only" || kind === "hybrid";
  const showPlayChips = playCapable && sportsCount > 0;
  return {
    showWatchWhatsOn: watchCapable,
    showWatchChips: watchCapable,
    showFindPlacesToWatch: watchCapable,
    showPlayChips,
    showFindPlacesToPlay: playCapable,
    showSportsSection: watchCapable || showPlayChips,
    showPlayStack: playCapable,
    ctaMentionsScreenings: watchCapable,
  };
}

export function venueDetailNavLinks(input: {
  kind: VenueDetailKind;
  hasQuickStart: boolean;
}): VenueDetailNavLink[] {
  const { kind, hasQuickStart } = input;
  const links: VenueDetailNavLink[] = [];

  if (kind === "watch-only" || kind === "hybrid") {
    links.push({ label: "This weekend", href: "#weekend" });
  }
  if (hasQuickStart) {
    links.push({ label: "Quick start", href: "#quick-start" });
  }
  if (kind === "play-only" || kind === "hybrid") {
    links.push(
      { label: "Friends", href: "#friends-played" },
      { label: "Match history", href: "#match-history" },
      { label: "Leaderboards", href: "#leaderboards" },
    );
  }
  if (kind === "watch-only") {
    links.push({ label: "Sports", href: "#sports" });
  }
  links.push(
    { label: "Amenities", href: "#amenities" },
    { label: "Location", href: "#location" },
  );
  return links;
}

export function venueDetailSectionOrder(input: {
  kind: VenueDetailKind;
  hasQuickStart: boolean;
  showSportsSection: boolean;
}): VenueDetailSectionId[] {
  const { kind, hasQuickStart, showSportsSection } = input;
  const order: VenueDetailSectionId[] = [];

  if (kind === "watch-only" || kind === "hybrid") {
    order.push("weekend");
  }
  if (hasQuickStart) order.push("quick-start");
  if (kind === "play-only" || kind === "hybrid") {
    order.push("friends-played", "match-history", "leaderboards");
  }
  order.push("about");
  if (showSportsSection) order.push("sports");
  order.push("amenities", "location", "stay-close");
  return order;
}

export function venueDetailMetaDescription(input: {
  name: string;
  suburb?: string | null;
  kind: VenueDetailKind;
}): string {
  const place = input.suburb ? `${input.name} in ${input.suburb}` : input.name;
  if (input.kind === "play-only") {
    return `${place} — play, amenities, and match details on LeagueSports.`;
  }
  if (input.kind === "watch-only") {
    return `${place} — screens, amenities, and matchday details on LeagueSports.`;
  }
  if (input.kind === "hybrid") {
    return `${place} — screens, play, and amenities on LeagueSports.`;
  }
  return `${place} — amenities and venue details on LeagueSports.`;
}

export function venueStayCloseCopy(kind: VenueDetailKind): string {
  if (kind === "play-only") {
    return "Follow this venue to keep it on your list, or browse more places to play nearby.";
  }
  if (kind === "watch-only") {
    return "Follow this venue to keep it on your list, or browse more screenings nearby.";
  }
  return "Follow this venue to keep it on your list, or browse more screenings and places to play nearby.";
}

export function venueAmenitiesDescription(kind: VenueDetailKind): string {
  if (kind === "play-only") return "On-site facilities";
  return "Power, screens, and on-site facilities";
}

export function venueSportsSectionCopy(kind: VenueDetailKind): {
  title: string;
  description: string;
} {
  if (kind === "play-only") {
    return {
      title: "Play at this venue",
      description: "Sports you can play here",
    };
  }
  if (kind === "watch-only") {
    return {
      title: "Watch at this venue",
      description: "Sports this venue screens",
    };
  }
  return {
    title: "Sports at this venue",
    description: "Watch and play what's on offer",
  };
}
