import {
  completeFixtureFaqs,
  fixturePlainText,
  INDEX_FAQ_MAX,
  isFixtureIndexable,
} from "./index-bar.ts";

export const EVENT_JSON_LD_SITE_URL = "https://leaguesports.co.za";

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
  address?: {
    "@type": "PostalAddress";
    addressLocality?: string;
    addressCountry?: string;
  };
};

type SubEventJsonLd = {
  "@type": "SportsEvent";
  name: string;
  startDate?: string;
  endDate?: string;
  eventStatus?:
    | "https://schema.org/EventScheduled"
    | "https://schema.org/EventCancelled";
};

export type SportsEventJsonLd = {
  "@type": "SportsEvent";
  name: string;
  url: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  sport?: string;
  superEvent?: {
    "@type": "SportsEvent";
    name: string;
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

function placeFromVenue(venue: EventJsonLdVenue, siteUrl: string): PlaceJsonLd | null {
  const name = venue.name.trim();
  const slug = venue.slug.trim();
  if (!name || !slug) return null;

  const place: PlaceJsonLd = {
    "@type": "Place",
    name,
    url: absoluteUrl(siteUrl, `/venues/${slug}`),
  };
  const city = venue.city?.trim();
  if (city) {
    place.address = {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "ZA",
    };
  }
  return place;
}

function placeFromCircuit(circuit: EventJsonLdCircuit): PlaceJsonLd | null {
  const name = circuit.name.trim();
  if (!name) return null;
  const place: PlaceJsonLd = {
    "@type": "Place",
    name,
  };
  const locality = circuit.location?.trim();
  const country = circuit.countryName?.trim() || circuit.countryCode?.trim();
  if (locality || country) {
    place.address = {
      "@type": "PostalAddress",
    };
    if (locality) place.address.addressLocality = locality;
    if (country) place.address.addressCountry = country;
  }
  return place;
}

/**
 * Real venues plus an official F1 circuit when OpenF1 weekend data is present.
 * Never invent geo coordinates or a default city.
 */
export function eventJsonLdPlaces(
  input: Pick<EventJsonLdInput, "hostVenue" | "screeningVenues" | "circuit">,
  siteUrl: string,
): PlaceJsonLd[] {
  const places: PlaceJsonLd[] = [];
  const seen = new Set<string>();

  function pushPlace(place: PlaceJsonLd | null, key: string) {
    if (!place) return;
    const normalized = key.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    places.push(place);
  }

  function pushVenue(venue: EventJsonLdVenue | null | undefined) {
    if (!venue) return;
    pushPlace(placeFromVenue(venue, siteUrl), venue.slug);
  }

  if (input.circuit) {
    pushPlace(placeFromCircuit(input.circuit), `circuit:${input.circuit.name}`);
  }
  pushVenue(input.hostVenue ?? null);
  for (const venue of input.screeningVenues ?? []) {
    pushVenue(venue);
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
  };

  const description = fixturePlainText(input.description ?? "");
  if (description) event.description = description;

  const startDate = toIsoDate(input.startsAt);
  if (startDate) event.startDate = startDate;
  const endDate = toIsoDate(input.endsAt);
  if (endDate) event.endDate = endDate;

  const sport = input.sportName?.trim();
  if (sport) event.sport = sport;

  const competition = input.competition?.trim();
  if (competition) {
    event.superEvent = {
      "@type": "SportsEvent",
      name: competition,
    };
  }

  const teams = (input.teams ?? [])
    .map((team) => team.name.trim())
    .filter(Boolean)
    .map((name) => ({ "@type": "SportsTeam" as const, name }));
  if (teams.length > 0) event.competitor = teams;

  const places = eventJsonLdPlaces(input, siteUrl);
  if (places.length === 1) event.location = places[0];
  else if (places.length > 1) event.location = places;

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
      }
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
