import { CITY_DIRECTORY, filterSuggestions } from "../../data/cities.ts";
import type { SearchSuggestion } from "../../data/cities.ts";
import { SPORT_CATALOG } from "../sports/catalog.ts";
import {
  buildVenueDirectoryPath,
  classifySiteSearch,
  type ParsedVenueSearch,
} from "./venueSearch.ts";

export type NavbarSearchGroup = "match" | "name" | "sport" | "place" | "start";

export type NavbarSearchTarget = {
  id: string;
  label: string;
  detail: string;
  href: string;
  group: NavbarSearchGroup;
};

export type NavbarSearchPlan = {
  submitHref: string;
  destination: NavbarSearchTarget | null;
  nameSearch: NavbarSearchTarget | null;
  catalog: NavbarSearchTarget[];
};

/** Shown when the navbar field is focused and still empty. */
export const NAVBAR_SEARCH_START: readonly NavbarSearchTarget[] = [
  {
    id: "start-watch",
    label: "Watch",
    detail: "Find a screen",
    href: "/watch",
    group: "start",
  },
  {
    id: "start-play",
    label: "Play",
    detail: "Find a court or course",
    href: "/play",
    group: "start",
  },
  {
    id: "start-venues",
    label: "Venues",
    detail: "Bars, courts, and clubs",
    href: "/venues",
    group: "start",
  },
  {
    id: "start-soccer",
    label: "Soccer",
    detail: "Watch soccer",
    href: "/watch/soccer",
    group: "start",
  },
  {
    id: "start-padel",
    label: "Padel",
    detail: "Find a court",
    href: "/play/padel",
    group: "start",
  },
  {
    id: "start-cape-town",
    label: "Cape Town",
    detail: "Venues in Cape Town",
    href: "/venues?location=cape-town",
    group: "start",
  },
];

const WATCH_FIRST = new Set(["soccer", "rugby", "cricket", "motorsport"]);
const CATALOG_LIMIT = 5;

type VenueNameHit = {
  name: string;
  slug: string;
};

function sportRecord(slug: string) {
  return SPORT_CATALOG.find((sport) => sport.slug === slug) ?? null;
}

function preferredIntent(slug: string): "watch" | "play" | null {
  const sport = sportRecord(slug);
  const watch = sport?.capabilities.includes("watch") ?? false;
  const play = sport ? sport.capabilities.includes("play") : true;
  if (watch && play) return WATCH_FIRST.has(slug) ? "watch" : "play";
  if (watch) return "watch";
  if (play) return "play";
  return null;
}

function preferredDirectoryHref(parsed: ParsedVenueSearch): string {
  if (!parsed.sportSlug) return buildVenueDirectoryPath(parsed);
  if (parsed.intent === "watch" || parsed.intent === "play") {
    return buildVenueDirectoryPath(parsed);
  }
  const intent = preferredIntent(parsed.sportSlug);
  if (!intent) return buildVenueDirectoryPath(parsed);
  return buildVenueDirectoryPath({ ...parsed, intent });
}

function playDetail(slug: string): string {
  const sport = sportRecord(slug);
  return sport ? `Find a ${sport.noun}` : "Courts, clubs, and courses";
}

function destinationTarget(
  parsed: ParsedVenueSearch,
  href: string,
): NavbarSearchTarget {
  const sport = parsed.sportName;
  const place = parsed.locationLabel;
  const intent =
    parsed.intent === "watch" || parsed.intent === "play"
      ? parsed.intent
      : parsed.sportSlug
        ? preferredIntent(parsed.sportSlug)
        : null;

  let label = "Venues";
  let detail = "Browse venues";
  if (intent === "watch" && sport && place) {
    label = `Watch ${sport} in ${place}`;
    detail = "Screens and venues";
  } else if (intent === "play" && sport && place) {
    label = `Play ${sport} in ${place}`;
    detail = "Courts, clubs, and courses";
  } else if (intent === "watch" && sport) {
    label = `Watch ${sport}`;
    detail = "Bars and fan zones";
  } else if (intent === "play" && sport) {
    label = `Play ${sport}`;
    detail = playDetail(parsed.sportSlug ?? "");
  } else if (place) {
    label = place;
    detail = parsed.locationKind === "suburb" ? "Suburb" : "City";
  } else if (intent === "watch") {
    label = "Watch";
    detail = "Find a screen";
  } else if (intent === "play") {
    label = "Play";
    detail = "Find a place to play";
  }

  return { id: "destination", label, detail, href, group: "match" };
}

function sportTargets(suggestion: SearchSuggestion): NavbarSearchTarget[] {
  const slug = suggestion.sportSlug;
  if (!slug) return [];
  const sport = sportRecord(slug);
  const watch = sport?.capabilities.includes("watch") ?? false;
  const play = sport ? sport.capabilities.includes("play") : true;
  const watchRow: NavbarSearchTarget = {
    id: `watch-${slug}`,
    label: `Watch ${suggestion.label}`,
    detail: "Bars and fan zones",
    href: `/watch/${slug}`,
    group: "sport",
  };
  const playRow: NavbarSearchTarget = {
    id: `play-${slug}`,
    label: `Play ${suggestion.label}`,
    detail: playDetail(slug),
    href: `/play/${slug}`,
    group: "sport",
  };
  if (watch && play) {
    return WATCH_FIRST.has(slug) ? [watchRow, playRow] : [playRow, watchRow];
  }
  if (watch) return [watchRow];
  if (play) return [playRow];
  return [];
}

function placeTarget(suggestion: SearchSuggestion): NavbarSearchTarget {
  const slug =
    suggestion.kind === "suburb" ? suggestion.suburbSlug : suggestion.citySlug;
  const cityName = suggestion.citySlug
    ? CITY_DIRECTORY.find((city) => city.slug === suggestion.citySlug)?.name
    : null;
  return {
    id: suggestion.id,
    label: suggestion.label,
    detail:
      suggestion.kind === "suburb"
        ? cityName
          ? `Suburb · ${cityName}`
          : "Suburb"
        : "City",
    href: buildVenueDirectoryPath({
      intent: null,
      sportSlug: null,
      sportName: null,
      locationSlug: slug ?? null,
      locationLabel: suggestion.label,
      locationKind: suggestion.kind === "suburb" ? "suburb" : "city",
      citySlug: suggestion.citySlug ?? null,
    }),
    group: "place",
  };
}

function dedupe(targets: NavbarSearchTarget[]): NavbarSearchTarget[] {
  const seen = new Set<string>();
  const rows: NavbarSearchTarget[] = [];
  for (const target of targets) {
    if (seen.has(target.href)) continue;
    seen.add(target.href);
    rows.push(target);
  }
  return rows;
}

function catalogTargets(
  query: string,
  skip: Set<string>,
): NavbarSearchTarget[] {
  const suggestions = filterSuggestions(query, 6);
  const rows: NavbarSearchTarget[] = [];
  for (const suggestion of suggestions) {
    if (suggestion.kind === "sport") rows.push(...sportTargets(suggestion));
    else rows.push(placeTarget(suggestion));
  }
  return dedupe(rows)
    .filter((row) => !skip.has(row.href))
    .slice(0, CATALOG_LIMIT);
}

/**
 * Interpret a navbar query as a destination, a venue-name search, and a
 * short list of sport/place alternatives. Venue hits stay async in the UI.
 */
export function planNavbarSearch(query: string): NavbarSearchPlan {
  const classified = classifySiteSearch(query, null);
  if (classified.kind === "empty") {
    return {
      submitHref: "/venues",
      destination: null,
      nameSearch: null,
      catalog: [],
    };
  }

  if (classified.kind === "venue-name") {
    const nameSearch: NavbarSearchTarget = {
      id: "name-search",
      label: `Search venues for "${classified.nameQuery}"`,
      detail: "Venue name",
      href: classified.href,
      group: "name",
    };
    return {
      submitHref: nameSearch.href,
      destination: null,
      nameSearch,
      catalog: catalogTargets(query, new Set([nameSearch.href])),
    };
  }

  const href = preferredDirectoryHref(classified.parsed);
  return {
    submitHref: href,
    destination: destinationTarget(classified.parsed, href),
    nameSearch: null,
    catalog: catalogTargets(query, new Set([href])),
  };
}

/** Enter with nothing highlighted. An exact venue name opens that venue. */
export function navbarSearchSubmitHref(
  query: string,
  venues: readonly VenueNameHit[] = [],
): string {
  const trimmed = query.trim();
  if (!trimmed) return "/venues";
  const exact = venues.find(
    (venue) => venue.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return `/venues/${exact.slug}`;
  return planNavbarSearch(trimmed).submitHref;
}
