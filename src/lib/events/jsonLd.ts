import {
  completeFixtureFaqs,
  fixturePlainText,
  INDEX_FAQ_MAX,
  isFixtureIndexable,
} from "./index-bar.ts";
import {
  detectEventsCityFromText,
  eventsCityLabel,
} from "../sports/events-city.ts";

export const EVENT_JSON_LD_SITE_URL = "https://leaguesports.co.za";
export const EVENT_JSON_LD_ORGANIZER_NAME = "LeagueSports";
export const EVENT_JSON_LD_COUNTRY = "ZA";
export const EVENT_JSON_LD_COUNTRY_NAME = "South Africa";

export type EventJsonLdTeam = {
  name: string;
};

export type EventJsonLdVenue = {
  name: string;
  slug: string;
  city?: string | null;
};

export type EventJsonLdCircuit = {
  name: string;
  location?: string | null;
  countryName?: string | null;
  countryCode?: string | null;
};

export type EventJsonLdSession = {
  name: string;
  startDate: string;
  endDate?: string | null;
  cancelled?: boolean;
};

export type EventJsonLdInput = {
  title: string;
  slug: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  sportName?: string | null;
  competition?: string | null;
  teams?: EventJsonLdTeam[];
  hostVenue?: EventJsonLdVenue | null;
  screeningVenues?: EventJsonLdVenue[];
  circuit?: EventJsonLdCircuit | null;
  sessions?: EventJsonLdSession[];
  image?: string | null;
  faqs?: Array<{ question: string; answer: string }>;
  localAngle?: string | null;
  siteUrl?: string;
};

type SportsTeamJsonLd = {
  "@type": "SportsTeam";
  name: string;
};

type PlaceJsonLd = {
  "@type": "Place";
  name: string;
  url?: string;
  address: {
    "@type": "PostalAddress";
    addressLocality?: string;
    addressCountry: string;
  };
};

type OrganizationJsonLd = {
  "@type": "Organization";
  name: string;
  url: string;
};

type EventStatusJsonLd =
  | "https://schema.org/EventScheduled"
  | "https://schema.org/EventCancelled";

type SubEventJsonLd = {
  "@type": "SportsEvent";
  name: string;
  startDate?: string;
  endDate?: string;
  eventStatus?: EventStatusJsonLd;
  location?: PlaceJsonLd;
};

export type SportsEventJsonLd = {
  "@type": "SportsEvent";
  name: string;
  url: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  sport?: string;
  eventStatus?: EventStatusJsonLd;
  organizer?: OrganizationJsonLd;
  performer?: SportsTeamJsonLd[];
  superEvent?: {
    "@type": "SportsEvent";
    name: string;
    startDate?: string;
    location?: PlaceJsonLd;
    eventStatus?: EventStatusJsonLd;
    organizer?: OrganizationJsonLd;
  };
  competitor?: SportsTeamJsonLd[];
  location?: PlaceJsonLd | PlaceJsonLd[];
  subEvent?: SubEventJsonLd[];
  image?: string;
};

export type BreadcrumbListJsonLd = {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
};

export type FaqPageJsonLd = {
  "@type": "FAQPage";
  "@id": string;
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
};

export type EventJsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": Array<SportsEventJsonLd | BreadcrumbListJsonLd | FaqPageJsonLd>;
};

function absoluteUrl(siteUrl: string, path: string): string {
  const origin = siteUrl.replace(/\/$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function toIsoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function leagueSportsOrganizer(siteUrl: string): OrganizationJsonLd {
  return {
    "@type": "Organization",
    name: EVENT_JSON_LD_ORGANIZER_NAME,
    url: siteUrl.replace(/\/$/, ""),
  };
}

function postalAddress(
  country: string,
  locality?: string | null,
): PlaceJsonLd["address"] {
  const address: PlaceJsonLd["address"] = {
    "@type": "PostalAddress",
    addressCountry: country,
  };
  const city = locality?.trim();
  if (city) address.addressLocality = city;
  return address;
}

function placeFromVenue(
  venue: EventJsonLdVenue,
  siteUrl: string,
  fallbackCity?: string | null,
): PlaceJsonLd | null {
  const name = venue.name.trim();
  const slug = venue.slug.trim();
  if (!name || !slug) return null;

  return {
    "@type": "Place",
    name,
    url: absoluteUrl(siteUrl, `/venues/${slug}`),
    address: postalAddress(
      EVENT_JSON_LD_COUNTRY,
      venue.city?.trim() || fallbackCity,
    ),
  };
}

function placeFromCircuit(circuit: EventJsonLdCircuit): PlaceJsonLd | null {
  const name = circuit.name.trim();
  if (!name) return null;
  const locality = circuit.location?.trim();
  const country = circuit.countryName?.trim() || circuit.countryCode?.trim();
  return {
    "@type": "Place",
    name,
    address: postalAddress(country || EVENT_JSON_LD_COUNTRY, locality),
  };
}

/** Major SA grounds named in fixture copy when CMS hostVenue is empty. */
const KNOWN_STADIUMS: Array<{ name: string; pattern: RegExp }> = [
  { name: "Ellis Park Stadium", pattern: /\bellis park(?: stadium)?\b/i },
  { name: "Emirates Airline Park", pattern: /\bemirates airline park\b/i },
  { name: "FNB Stadium", pattern: /\bfnb stadium\b|\bsoccer city\b/i },
  { name: "Cape Town Stadium", pattern: /\bcape town stadium\b/i },
  { name: "DHL Stadium", pattern: /\bdhl stadium\b/i },
  { name: "Loftus Versfeld", pattern: /\bloftus versfeld\b/i },
  { name: "Kings Park Stadium", pattern: /\bkings park\b/i },
  { name: "Moses Mabhida Stadium", pattern: /\bmoses mabhida\b/i },
];

export function eventLocationHaystack(
  input: Pick<
    EventJsonLdInput,
    "title" | "description" | "localAngle" | "faqs"
  >,
): string {
  const faqs = completeFixtureFaqs(input.faqs);
  return [
    input.title,
    fixturePlainText(input.description ?? ""),
    fixturePlainText(input.localAngle ?? ""),
    ...faqs.flatMap((faq) => [faq.question, faq.answer]),
  ]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");
}

export function detectStadiumNameFromText(
  text: string | null | undefined,
): string | null {
  if (!text?.trim()) return null;
  for (const stadium of KNOWN_STADIUMS) {
    if (stadium.pattern.test(text)) return stadium.name;
  }
  return null;
}

function fallbackEventPlace(
  input: Pick<
    EventJsonLdInput,
    "title" | "description" | "localAngle" | "faqs"
  >,
): PlaceJsonLd {
  const haystack = eventLocationHaystack(input);
  const cityLabel = eventsCityLabel(detectEventsCityFromText(haystack));
  const stadium = detectStadiumNameFromText(haystack);
  return {
    "@type": "Place",
    name: stadium || cityLabel || EVENT_JSON_LD_COUNTRY_NAME,
    address: postalAddress(EVENT_JSON_LD_COUNTRY, cityLabel),
  };
}

/**
 * Real venues plus an official F1 circuit when OpenF1 weekend data is present.
 * Never invent geo coordinates. When no venue is listed, use a city/stadium
 * Place from copy so Google Event markup still has the required location.
 */
export function eventJsonLdPlaces(
  input: Pick<
    EventJsonLdInput,
    | "hostVenue"
    | "screeningVenues"
    | "circuit"
    | "title"
    | "description"
    | "localAngle"
    | "faqs"
  >,
  siteUrl: string,
): PlaceJsonLd[] {
  const places: PlaceJsonLd[] = [];
  const seen = new Set<string>();
  const haystack = eventLocationHaystack(input);
  const fallbackCity = eventsCityLabel(detectEventsCityFromText(haystack));

  function pushPlace(place: PlaceJsonLd | null, key: string) {
    if (!place) return;
    const normalized = key.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    places.push(place);
  }

  function pushVenue(venue: EventJsonLdVenue | null | undefined) {
    if (!venue) return;
    pushPlace(placeFromVenue(venue, siteUrl, fallbackCity), venue.slug);
  }

  if (input.circuit) {
    pushPlace(placeFromCircuit(input.circuit), `circuit:${input.circuit.name}`);
  }
  pushVenue(input.hostVenue ?? null);
  for (const venue of input.screeningVenues ?? []) {
    pushVenue(venue);
  }
  if (places.length === 0) {
    const fallback = fallbackEventPlace(input);
    pushPlace(fallback, `fallback:${fallback.name}`);
  }
  return places;
}

export function buildSportsEventJsonLd(
  input: EventJsonLdInput,
  pageUrl: string,
  siteUrl: string,
): SportsEventJsonLd {
  const event: SportsEventJsonLd = {
    "@type": "SportsEvent",
    name: input.title,
    url: pageUrl,
    eventStatus: "https://schema.org/EventScheduled",
    organizer: leagueSportsOrganizer(siteUrl),
  };

  const description = fixturePlainText(input.description ?? "");
  if (description) event.description = description;

  const startDate = toIsoDate(input.startsAt);
  if (startDate) event.startDate = startDate;
  const endDate = toIsoDate(input.endsAt);
  if (endDate) event.endDate = endDate;

  const sport = input.sportName?.trim();
  if (sport) event.sport = sport;

  const teams = (input.teams ?? [])
    .map((team) => team.name.trim())
    .filter(Boolean)
    .map((name) => ({ "@type": "SportsTeam" as const, name }));
  if (teams.length > 0) {
    event.competitor = teams;
    event.performer = teams;
  }

  const places = eventJsonLdPlaces(input, siteUrl);
  if (places.length === 1) event.location = places[0];
  else if (places.length > 1) event.location = places;

  const primaryLocation = Array.isArray(event.location)
    ? event.location[0]
    : event.location;

  const competition = input.competition?.trim();
  if (competition && startDate && primaryLocation) {
    event.superEvent = {
      "@type": "SportsEvent",
      name: competition,
      startDate,
      location: primaryLocation,
      eventStatus: "https://schema.org/EventScheduled",
      organizer: leagueSportsOrganizer(siteUrl),
    };
  }

  const image = input.image?.trim();
  if (image) event.image = image;

  const sessions = (input.sessions ?? [])
    .map((session) => {
      const name = session.name.trim();
      if (!name) return null;
      const sub: SubEventJsonLd = { "@type": "SportsEvent", name };
      const sessionStart = toIsoDate(session.startDate);
      if (sessionStart) sub.startDate = sessionStart;
      const sessionEnd = toIsoDate(session.endDate);
      if (sessionEnd) sub.endDate = sessionEnd;
      if (session.cancelled) {
        sub.eventStatus = "https://schema.org/EventCancelled";
      } else {
        sub.eventStatus = "https://schema.org/EventScheduled";
      }
      if (primaryLocation) sub.location = primaryLocation;
      return sub;
    })
    .filter((session): session is SubEventJsonLd => session !== null);
  if (sessions.length > 0) event.subEvent = sessions;

  return event;
}

export function buildEventBreadcrumbListJsonLd(
  title: string,
  pageUrl: string,
  siteUrl: string,
): BreadcrumbListJsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl(siteUrl, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Events",
        item: absoluteUrl(siteUrl, "/events"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };
}

export function buildEventFaqPageJsonLd(
  faqs: Array<{ question: string; answer: string }>,
  pageUrl: string,
): FaqPageJsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildEventJsonLd(input: EventJsonLdInput): EventJsonLdGraph {
  const siteUrl = (input.siteUrl ?? EVENT_JSON_LD_SITE_URL).replace(/\/$/, "");
  const pageUrl = absoluteUrl(siteUrl, `/events/${input.slug}`);
  const faqs = completeFixtureFaqs(input.faqs).slice(0, INDEX_FAQ_MAX);

  const graph: EventJsonLdGraph["@graph"] = [
    buildSportsEventJsonLd(input, pageUrl, siteUrl),
    buildEventBreadcrumbListJsonLd(input.title, pageUrl, siteUrl),
  ];

  if (faqs.length > 0) {
    graph.splice(1, 0, buildEventFaqPageJsonLd(faqs, pageUrl));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function findEventJsonLdNode<
  T extends EventJsonLdGraph["@graph"][number]["@type"],
>(
  jsonLd: EventJsonLdGraph,
  type: T,
): Extract<EventJsonLdGraph["@graph"][number], { "@type": T }> | undefined {
  return jsonLd["@graph"].find(
    (node): node is Extract<EventJsonLdGraph["@graph"][number], { "@type": T }> =>
      node["@type"] === type,
  );
}

export { isFixtureIndexable };
