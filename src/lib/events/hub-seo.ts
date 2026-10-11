/**
 * Copy and ItemList schema for the events index.
 * Filtered sport and city pages get their own lede and questions.
 */

export type EventsHubFaq = {
  question: string;
  answer: string;
};

function englishList(items: readonly string[]): string {
  const names = items.map((item) => item.trim()).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function sentence(value: string): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function eventsHubLede(input: {
  sportName?: string | null;
  cityName?: string | null;
  titles?: string[];
}): string {
  const sport = input.sportName?.trim();
  const city = input.cityName?.trim();
  const titles = (input.titles ?? []).map((title) => title.trim()).filter(Boolean).slice(0, 3);

  let lead: string;
  if (sport && city) {
    lead = `Upcoming ${sport.toLowerCase()} fixtures, with screenings in ${city} and the national calendar`;
  } else if (sport) {
    lead = `Upcoming ${sport.toLowerCase()} fixtures in South Africa, then the bars and fan zones screening them`;
  } else if (city) {
    lead = `Upcoming fixtures with screenings in ${city}, plus national games on the calendar`;
  } else {
    lead = "Springboks Tests, derbies, and other big South African fixtures, then the bars and fan zones screening them";
  }

  const listed = titles.length > 0 ? ` On this list: ${englishList(titles)}.` : "";
  return sentence(`${lead}.${listed}`);
}

export function eventsHubFaqs(input: {
  sportName?: string | null;
  cityName?: string | null;
}): EventsHubFaq[] {
  const sport = input.sportName?.trim();
  const city = input.cityName?.trim();
  const subject = sport ? sport.toLowerCase() : "these";
  const where = city ? ` in ${city}` : " in South Africa";

  return [
    {
      question: sport ? `What ${sport.toLowerCase()} fixtures are coming up?` : "What fixtures are on this list?",
      answer: sport
        ? `This page lists upcoming ${sport.toLowerCase()} fixtures${where}. Open a fixture for the kickoff, a live feed, and venues that have listed a screening.`
        : `This page lists upcoming fixtures${where}. Open a fixture for the kickoff, a live feed, and venues that have listed a screening.`,
    },
    {
      question: city
        ? `Where can I watch ${subject} fixtures in ${city}?`
        : `Where can I watch ${subject} fixtures?`,
      answer: city
        ? `Each fixture links to bars and fan zones that have listed a screening in ${city}. Venue pages have the address, facilities, and directions.`
        : "Each fixture links to bars and fan zones that have listed a screening. Venue pages have the address, facilities, and directions.",
    },
  ];
}

export function eventsHubKeywords(input: {
  sportName?: string | null;
  cityName?: string | null;
}): string[] {
  const values = [
    input.sportName,
    input.cityName,
    "fixtures",
    "where to watch",
    "live sport",
    "sports bar",
    "South Africa",
    "LeagueSports",
  ];
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const value of values) {
    const text = value?.trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    keywords.push(text);
  }
  return keywords;
}

export function buildEventsItemListJsonLd(input: {
  name: string;
  siteUrl: string;
  fixtures: Array<{ title: string; slug: string }>;
}): Record<string, unknown> {
  const origin = input.siteUrl.replace(/\/$/, "");
  const items = input.fixtures
    .filter((fixture) => fixture.title.trim() && fixture.slug.trim() && !/\s/.test(fixture.slug))
    .slice(0, 24)
    .map((fixture, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: fixture.title.trim(),
      url: `${origin}/events/${fixture.slug.trim()}`,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    numberOfItems: items.length,
    itemListElement: items,
  };
}
