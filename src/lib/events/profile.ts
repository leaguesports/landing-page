/**
 * Customer copy for an event page.
 * Built from the fixture itself — kickoff, teams, venues, broadcast —
 * so the page still reads when editorial intro copy is missing.
 */

import type { FixtureRelatedLink } from "./links.ts";
import { eventSportVoice } from "./sport-voice.ts";
import { FIXTURE_TIMEZONE } from "../sports/events-feed.ts";

export type FixtureProfileVenue = {
  name?: string | null;
  slug?: string | null;
  city?: string | null;
};

export type FixtureProfileInput = {
  title: string;
  sportSlug?: string | null;
  sportName?: string | null;
  competition?: string | null;
  series?: string | null;
  teams?: Array<{ name?: string | null }>;
  startsAt?: string | null;
  broadcastInfo?: string | null;
  venues?: FixtureProfileVenue[];
  hostVenue?: FixtureProfileVenue | null;
  circuitLine?: string | null;
};

export type FixtureProfileFact = {
  label: string;
  value: string;
  href?: string;
};

export type FixtureProfileFaq = {
  question: string;
  answer: string;
};

export type FixtureProfile = {
  shortName: string;
  eyebrow: string;
  lede: string;
  facts: FixtureProfileFact[];
  faqs: FixtureProfileFaq[];
  keywords: string[];
  headings: {
    about: string;
    watch: string;
    questions: string;
  };
};

const BROADCAST_LEDE_MAX = 180;

function sentence(value: string): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function englishList(items: readonly string[]): string {
  const names = items.map((item) => item.trim()).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function uniqueTexts(values: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const text = value?.replace(/\s+/g, " ").trim() ?? "";
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function readableSeries(series: string | null | undefined): string | null {
  const text = series?.trim() ?? "";
  if (!text) return null;
  if (text === text.toLowerCase() && text.includes("-")) return null;
  return text;
}

function teamNames(input: FixtureProfileInput): string[] {
  return uniqueTexts((input.teams ?? []).map((team) => team.name));
}

export function fixtureProfileName(input: FixtureProfileInput): string {
  const teams = teamNames(input);
  if (teams.length >= 2) return `${teams[0]} vs ${teams[1]}`;
  if (teams.length === 1) return teams[0]!;
  return input.title.trim() || "This fixture";
}

export function formatFixtureKickoff(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  const date = parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: FIXTURE_TIMEZONE,
  });
  const time = parsed.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: FIXTURE_TIMEZONE,
  });
  return `${date} at ${time} SAST`;
}

function competitionOf(input: FixtureProfileInput): string | null {
  return input.competition?.trim() || readableSeries(input.series);
}

function listedVenues(input: FixtureProfileInput): FixtureProfileVenue[] {
  const rows: FixtureProfileVenue[] = [];
  const seen = new Set<string>();
  const add = (venue: FixtureProfileVenue | null | undefined) => {
    const name = venue?.name?.trim() ?? "";
    if (!name) return;
    const key = (venue?.slug?.trim() || name).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ name, slug: venue?.slug?.trim() || null, city: venue?.city?.trim() || null });
  };
  add(input.hostVenue);
  for (const venue of input.venues ?? []) add(venue);
  return rows;
}

function cityNames(venues: FixtureProfileVenue[]): string[] {
  return uniqueTexts(venues.map((venue) => venue.city));
}

function screeningSentence(
  input: FixtureProfileInput,
  name: string,
  venues: FixtureProfileVenue[],
): string | null {
  const host = input.hostVenue?.name?.trim();
  const cities = cityNames(venues);
  if (host) {
    const city = input.hostVenue?.city?.trim();
    const place = city ? `${host} in ${city}` : host;
    const others = venues.filter((venue) => venue.name?.trim().toLowerCase() !== host.toLowerCase());
    if (others.length > 0) {
      return sentence(
        `${name} is at ${place}, and ${others.length} other venue${others.length === 1 ? " has" : "s have"} listed a screening`,
      );
    }
    return sentence(`${name} is at ${place}`);
  }

  if (venues.length > 0) {
    const shown = venues.slice(0, 3).map((venue) => venue.name!.trim());
    const extra = venues.length > shown.length ? `, plus ${venues.length - shown.length} more` : "";
    const cityBit = cities.length > 0 ? ` in ${englishList(cities.slice(0, 3))}` : "";
    return sentence(`It is listed at ${englishList(shown)}${extra}${cityBit}`);
  }

  return null;
}

function whereSentence(input: FixtureProfileInput, name: string, venues: FixtureProfileVenue[]): string {
  const circuit = input.circuitLine?.trim();
  const screening = screeningSentence(input, name, venues);
  const race = circuit ? sentence(`The race is at ${circuit}`) : "";
  if (screening && race) return `${screening} ${race}`;
  if (race) return race;
  if (screening) return screening;
  return sentence("Screening venues appear on this page as bars and fan zones list it");
}

function voiceOf(input: FixtureProfileInput) {
  return eventSportVoice(input);
}

function whatSentence(input: FixtureProfileInput, name: string): string {
  const sport = input.sportName?.trim();
  const competition = competitionOf(input);
  const when = formatFixtureKickoff(input.startsAt);
  const noun = voiceOf(input).eventNoun;
  const kind = sport ? `${sport.toLowerCase()} ${noun}` : noun;
  const inCompetition = competition ? ` in the ${competition}` : "";
  const onWhen = when ? ` on ${when}` : "";
  return sentence(`${name} is a ${kind}${inCompetition}${onWhen}`);
}

function broadcastSentence(input: FixtureProfileInput): string | null {
  const text = input.broadcastInfo?.replace(/\s+/g, " ").trim() ?? "";
  if (!text || text.length > BROADCAST_LEDE_MAX) return null;
  return sentence(text);
}

export function fixtureProfileLede(input: FixtureProfileInput): string {
  const name = fixtureProfileName(input);
  const venues = listedVenues(input);
  return [whatSentence(input, name), whereSentence(input, name, venues), broadcastSentence(input)]
    .filter(Boolean)
    .join(" ");
}

export function fixtureProfileFacts(input: FixtureProfileInput): FixtureProfileFact[] {
  const facts: FixtureProfileFact[] = [];
  const when = formatFixtureKickoff(input.startsAt);
  if (when) facts.push({ label: voiceOf(input).startLabel, value: when });

  const sport = input.sportName?.trim();
  if (sport) facts.push({ label: "Sport", value: sport });

  const competition = competitionOf(input);
  if (competition) facts.push({ label: "Competition", value: competition });

  const circuit = input.circuitLine?.trim();
  if (circuit) facts.push({ label: "Circuit", value: circuit });

  const hostName = input.hostVenue?.name?.trim();
  const hostSlug = input.hostVenue?.slug?.trim();
  if (hostName) {
    facts.push({
      label: "Host",
      value: hostName,
      ...(hostSlug ? { href: `/venues/${hostSlug}` } : {}),
    });
  }

  const venues = listedVenues(input);
  const screeningCount = (input.venues ?? []).filter((venue) => venue.name?.trim()).length;
  if (screeningCount > 0) {
    facts.push({
      label: "Screenings",
      value: screeningCount === 1 ? "1 venue" : `${screeningCount} venues`,
    });
  }
  const cities = cityNames(venues);
  if (cities.length > 0) {
    facts.push({ label: "Places", value: englishList(cities.slice(0, 3)) });
  }

  const broadcast = input.broadcastInfo?.replace(/\s+/g, " ").trim();
  if (broadcast) facts.push({ label: "Broadcast", value: broadcast });

  return facts;
}

export function fixtureProfileFaqs(input: FixtureProfileInput): FixtureProfileFaq[] {
  const name = fixtureProfileName(input);
  const faqs: FixtureProfileFaq[] = [];
  const when = formatFixtureKickoff(input.startsAt);
  if (when) {
    faqs.push({
      question: `When is ${name}?`,
      answer: `${name} is scheduled for ${when}. Times on this page use South Africa Standard Time.`,
    });
  }

  const venues = listedVenues(input);
  const circuit = input.circuitLine?.trim();
  if (circuit) {
    faqs.push({
      question: `Where is ${name}?`,
      answer: venues.length > 0
        ? `The race is at ${circuit}. Screening venues in South Africa are listed on this page.`
        : `The race is at ${circuit}. Screening venues in South Africa are listed on this page when bars and fan zones add them.`,
    });
  }
  if (venues.length > 0) {
    const shown = venues.slice(0, 3).map((venue) => venue.name!.trim());
    const cities = cityNames(venues);
    const cityBit = cities.length > 0 ? ` The listed places are in ${englishList(cities.slice(0, 3))}.` : "";
    faqs.push({
      question: `Where can I watch ${name}?`,
      answer: `${name} is listed at ${englishList(shown)}.${cityBit} Open a venue for the address and directions.`,
    });
  } else if (!circuit) {
    const sport = input.sportName?.trim();
    faqs.push({
      question: `Where can I watch ${name}?`,
      answer: sport
        ? `No venue has listed a screening yet. Use Watch to find bars and fan zones showing ${sport.toLowerCase()}.`
        : "No venue has listed a screening yet. Use Watch to find bars and fan zones showing live sport.",
    });
  }

  const competition = competitionOf(input);
  const sport = input.sportName?.trim();
  const noun = voiceOf(input).eventNoun;
  const start = voiceOf(input).startLabel.toLowerCase();
  if (competition || sport) {
    faqs.push({
      question: `What competition is ${name}?`,
      answer: competition
        ? `${name} is a ${sport ? `${sport.toLowerCase()} ` : ""}${noun} in the ${competition}. This page has the ${start}, screening venues, and a live feed.`
        : `${name} is a ${sport!.toLowerCase()} ${noun}. This page has the ${start}, screening venues, and a live feed.`,
    });
  }

  const broadcast = input.broadcastInfo?.replace(/\s+/g, " ").trim();
  if (broadcast && broadcast.length <= BROADCAST_LEDE_MAX) {
    faqs.push({
      question: `How is ${name} broadcast?`,
      answer: sentence(broadcast),
    });
  }

  return faqs.slice(0, 4);
}

export function fixtureProfileKeywords(input: FixtureProfileInput): string[] {
  const name = fixtureProfileName(input);
  const venues = listedVenues(input);
  return uniqueTexts([
    name,
    input.title,
    input.sportName,
    competitionOf(input),
    input.circuitLine,
    ...teamNames(input),
    ...cityNames(venues),
    ...venues.map((venue) => venue.name),
    "where to watch",
    "live sport",
    "South Africa",
    "LeagueSports",
  ]);
}

export function fixtureProfileEyebrow(input: FixtureProfileInput): string {
  const sport = input.sportName?.trim();
  const competition = competitionOf(input);
  if (sport && competition) return `${sport} · ${competition}`;
  if (sport) return sport;
  if (competition) return competition;
  return "Fixture";
}

export function buildFixtureProfile(input: FixtureProfileInput): FixtureProfile {
  const shortName = fixtureProfileName(input);
  return {
    shortName,
    eyebrow: fixtureProfileEyebrow(input),
    lede: fixtureProfileLede(input),
    facts: fixtureProfileFacts(input),
    faqs: fixtureProfileFaqs(input),
    keywords: fixtureProfileKeywords(input),
    headings: {
      about: `About ${shortName}`,
      watch: `Where to watch ${shortName}`,
      questions: `Questions about ${shortName}`,
    },
  };
}

export function describeFixtureLinks(
  links: readonly FixtureRelatedLink[],
  input: { title: string; sportName?: string | null },
): Array<FixtureRelatedLink & { description: string }> {
  const title = input.title.trim() || "this fixture";
  const sport = input.sportName?.trim();
  return links
    .filter((link) => link.kind !== "venue")
    .map((link) => {
      let description = "Another page on LeagueSports.";
      if (link.kind === "guide") description = `Read this alongside ${title}.`;
      if (link.kind === "fixture") {
        const noun = eventSportVoice({ sportName: sport, title }).eventNoun;
        description = sport
          ? `Another ${sport.toLowerCase()} ${noun} on the calendar.`
          : `Another ${noun} on the calendar.`;
      }
      if (link.kind === "watch") {
        description = sport
          ? `Bars and fan zones screening ${sport.toLowerCase()}.`
          : "Bars and fan zones screening live sport.";
      }
      if (link.kind === "play") {
        description = sport
          ? `Courts and clubs for ${sport.toLowerCase()}.`
          : "Courts and clubs for this sport.";
      }
      return { ...link, description };
    });
}
