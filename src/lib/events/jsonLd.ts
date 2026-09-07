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

export type EventJsonLdInput = {
  title: string;
  slug: string;
  description?: string | null;
  startsAt?: string | null;
  sportName?: string | null;
  competition?: string | null;
  teams?: EventJsonLdTeam[];
  hostVenue?: EventJsonLdVenue | null;
  screeningVenues?: EventJsonLdVenue[];
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
  url: string;
  address?: {
    "@type": "PostalAddress";
    addressLocality?: string;
    addressCountry: "ZA";
  };
};

export type SportsEventJsonLd = {
  "@type": "SportsEvent";
  name: string;
  url: string;
  description?: string;
  startDate?: string;
  sport?: string;
  superEvent?: {
    "@type": "SportsEvent";
    name: string;
  };
  competitor?: SportsTeamJsonLd[];
  location?: PlaceJsonLd | PlaceJsonLd[];
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

/**
 * Real venues only — host stadium and listed screening venues.
 * Never invent geo coordinates or a default city.
 */
export function eventJsonLdPlaces(
  input: Pick<EventJsonLdInput, "hostVenue" | "screeningVenues">,
  siteUrl: string,
): PlaceJsonLd[] {
  const places: PlaceJsonLd[] = [];
  const seen = new Set<string>();

  function push(venue: EventJsonLdVenue | null | undefined) {
    if (!venue) return;
    const place = placeFromVenue(venue, siteUrl);
    if (!place) return;
    const key = venue.slug.trim().toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    places.push(place);
  }

  push(input.hostVenue ?? null);
  for (const venue of input.screeningVenues ?? []) {
    push(venue);
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
