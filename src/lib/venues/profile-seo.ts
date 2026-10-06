/**
 * Customer copy for the venue profile.
 * Watch, play, and hybrid pages share one layout. The words change with the kind.
 */

import { toSlug } from "../../data/suburbs.ts";
import { intentPath } from "../intent/paths.ts";
import {
  venueAddressLine,
  venueCourtFacility,
  venueCustomerSentences,
  venueDistinctPlaySports,
  venueGolfHoles,
  venueGoodForLabels,
  venuePlayPlace,
  venueShortDisplayName,
  type VenueTemplateInput,
} from "./page-template.ts";
import { venueSupportsWatch } from "./watch-chrome.ts";

export type VenueProfileKind = "watch" | "play" | "hybrid" | "listing";

export type VenueProfileInput = VenueTemplateInput & {
  name?: string | null;
  slug?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  email?: string | null;
  address?: {
    street?: string | null;
    suburb?: string | null;
    city?: string | null;
    province?: string | null;
    postcode?: string | null;
  } | null;
};

export type VenueFaq = {
  question: string;
  answer: string;
};

export type VenueCrumb = {
  name: string;
  path: string;
};

export type VenueDirectoryLink = {
  href: string;
  /** Short sitelink label — the sport name, not a full sentence. */
  label: string;
  description: string;
};

const AMENITY_PHRASE: Record<string, string> = {
  Backup: "backup power",
  Screens: "big screens",
  Commentary: "live commentary",
  Draft: "draft beer",
  Food: "food",
  Outdoor: "an outdoor area",
  Parking: "parking",
};

const AMENITY_CHIP: Record<string, string> = {
  Backup: "Backup power",
  Screens: "Big screens",
  Commentary: "Live commentary",
  Draft: "Draft beer",
  Food: "Food",
  Outdoor: "Outdoor area",
  Parking: "Parking",
};

const META_LIMIT = 155;

function nameOf(venue: VenueProfileInput): string {
  return venue.name?.trim() || "This venue";
}

function placeOf(venue: VenueProfileInput): string {
  return venuePlayPlace(venue.address ?? {});
}

function englishList(items: readonly string[]): string {
  const names = items.map((item) => item.trim()).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function sentence(value: string): string {
  const text = value.trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function joinSentences(parts: Array<string | null | undefined>): string {
  return parts.map((part) => sentence(part ?? "")).filter(Boolean).join(" ");
}

function clamp(text: string, max = META_LIMIT): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const last = cut.lastIndexOf(" ");
  const kept = (last > 80 ? cut.slice(0, last) : cut).trimEnd();
  return `${kept}…`;
}

function broadcastNames(venue: VenueProfileInput): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const item of venue.broadcasts ?? []) {
    if (!item || typeof item === "string") continue;
    const name = item.name?.trim() ?? "";
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

function playNames(venue: VenueProfileInput): string[] {
  return venueDistinctPlaySports(venue).map((sport) => sport.name);
}

function facilityBits(venue: VenueProfileInput): string[] {
  const bits: string[] = [];
  const courts = venueCourtFacility(venue.description);
  if (courts) bits.push(courts);
  const playsGolf = venueDistinctPlaySports(venue).some((sport) => sport.key === "golf");
  const holes = playsGolf ? venueGolfHoles(venue.golfCourse) : null;
  if (holes && !bits.some((bit) => bit.toLowerCase() === holes.toLowerCase())) {
    bits.push(holes);
  }
  return bits;
}

function amenitySentence(venue: VenueProfileInput, supportsWatch: boolean): string | null {
  const phrases = venueGoodForLabels(venue, supportsWatch).map(
    (label) => AMENITY_PHRASE[label] ?? label.toLowerCase(),
  );
  if (phrases.length === 0) return null;
  const list = englishList(phrases);
  return list.charAt(0).toUpperCase() + list.slice(1);
}

function titleSports(names: readonly string[]): string | null {
  const shown = names
    .map((name) => name.toLowerCase())
    .filter(Boolean)
    .slice(0, 3);
  if (shown.length === 0) return null;
  return englishList(shown);
}

export function venueProfileKind(venue: VenueProfileInput): VenueProfileKind {
  const watch = venueSupportsWatch(venue);
  const play = venueDistinctPlaySports(venue).length > 0;
  if (watch && play) return "hybrid";
  if (watch) return "watch";
  if (play) return "play";
  return "listing";
}

export function venueProfileEyebrow(venue: VenueProfileInput): string {
  const place = placeOf(venue);
  const inPlace = place ? ` in ${place}` : "";
  const kind = venueProfileKind(venue);
  if (kind === "watch") return `Sports bar${inPlace}`;
  if (kind === "play") {
    const sports = venueDistinctPlaySports(venue);
    if (sports.length === 1) return `${sports[0]!.name}${inPlace}`;
    return `Play${inPlace}`;
  }
  if (kind === "hybrid") return `Watch and play${inPlace}`;
  return `Venue${inPlace}`;
}

export function venueProfileTitle(venue: VenueProfileInput): string {
  const name = nameOf(venue);
  const place = placeOf(venue);
  const where = place ? `, ${place}` : "";
  const kind = venueProfileKind(venue);
  if (kind === "watch") {
    const sports = titleSports(broadcastNames(venue));
    return sports ? `Watch ${sports} at ${name}${where}` : `Watch sport at ${name}${where}`;
  }
  if (kind === "play") {
    const sports = titleSports(playNames(venue));
    return sports ? `Play ${sports} at ${name}${where}` : `Play sport at ${name}${where}`;
  }
  if (kind === "hybrid") return `Watch and play at ${name}${where}`;
  return place ? `${name} in ${place}` : name;
}

export function venueProfileLede(venue: VenueProfileInput): string {
  const name = nameOf(venue);
  const place = placeOf(venue);
  const where = place ? ` in ${place}` : "";
  const kind = venueProfileKind(venue);
  const supportsWatch = kind === "watch" || kind === "hybrid";
  const amenities = amenitySentence(venue, supportsWatch);
  const facilities = facilityBits(venue);

  if (kind === "watch") {
    const sports = broadcastNames(venue).map((sport) => sport.toLowerCase());
    const showing = sports.length
      ? `shows ${englishList(sports)}`
      : "shows live sport";
    return joinSentences([
      `${name}${where} ${showing}`,
      amenities,
      "Fixtures, facilities, and directions are on this page",
    ]);
  }

  if (kind === "play") {
    const sports = playNames(venue).map((sport) => sport.toLowerCase());
    const playing = sports.length ? englishList(sports) : "sport";
    return joinSentences([
      `${name}${where} is where you can play ${playing}`,
      facilities.length ? englishList(facilities) : null,
      amenities,
      "Facilities and directions are on this page",
    ]);
  }

  if (kind === "hybrid") {
    const watching = broadcastNames(venue);
    const playing = playNames(venue);
    return joinSentences([
      `${name}${where} is where you can watch ${
        watching.length
          ? englishList(watching.map((sport) => sport.toLowerCase()))
          : "live sport"
      } and play ${playing.length ? englishList(playing.map((sport) => sport.toLowerCase())) : "sport"}`,
      facilities.length ? englishList(facilities) : null,
      amenities,
      "Fixtures, play, and directions are on this page",
    ]);
  }

  return joinSentences([
    `${name}${where} is a sports venue on LeagueSports`,
    amenities,
    "Address, facilities, and nearby venues are on this page",
  ]);
}

export function venueProfileDescription(venue: VenueProfileInput): string {
  return clamp(venueProfileLede(venue));
}

export function venueProfileAbout(description: unknown): string[] {
  return venueCustomerSentences(description).slice(0, 4);
}

export function venueProfileKeywords(venue: VenueProfileInput): string[] {
  const kind = venueProfileKind(venue);
  const place = placeOf(venue);
  const values: Array<string | null | undefined> = [
    nameOf(venue),
    venue.address?.suburb,
    venue.address?.city,
    place,
    "LeagueSports",
    "South Africa",
  ];
  if (kind === "watch" || kind === "hybrid") {
    values.push("sports bar", "where to watch", "live sport");
    for (const sport of broadcastNames(venue)) {
      values.push(sport, place ? `watch ${sport} in ${place}` : `watch ${sport}`);
    }
  }
  if (kind === "play" || kind === "hybrid") {
    values.push("where to play");
    for (const sport of playNames(venue)) {
      values.push(sport, place ? `play ${sport} in ${place}` : `play ${sport}`);
    }
  }
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

function whereAnswer(venue: VenueProfileInput): string {
  const name = nameOf(venue);
  const line = venueAddressLine(venue.address);
  if (line) return `${name} is at ${line}.`;
  const place = placeOf(venue);
  if (place) return `${name} is in ${place}.`;
  return `${name} is listed on LeagueSports.`;
}

function contactAnswer(venue: VenueProfileInput): string | null {
  const channels: string[] = [];
  if (venue.phone?.trim() || venue.whatsapp?.trim()) channels.push("phone or WhatsApp");
  if (venue.website?.trim()) channels.push("the website");
  if (venue.email?.trim()) channels.push("email");
  if (channels.length === 0) return null;
  return `Use ${englishList(channels)} from this page, or open directions for the trip.`;
}

export function venueProfileFaqs(venue: VenueProfileInput): VenueFaq[] {
  const name = nameOf(venue);
  const kind = venueProfileKind(venue);
  const faqs: VenueFaq[] = [{ question: `Where is ${name}?`, answer: whereAnswer(venue) }];
  const watching = broadcastNames(venue);
  const playing = playNames(venue);

  if (kind === "hybrid") {
    faqs.push({
      question: `Can I watch and play at ${name}?`,
      answer: sentence(
        `Yes. ${name} screens ${
          watching.length ? englishList(watching) : "live sport"
        } and you can play ${
          playing.length ? englishList(playing.map((sport) => sport.toLowerCase())) : "sport"
        } there`,
      ),
    });
  } else if (kind === "watch") {
    faqs.push({
      question: `What can I watch at ${name}?`,
      answer: watching.length
        ? `${name} screens ${englishList(watching)}.`
        : `${name} screens live sport. Upcoming fixtures are listed on this page.`,
    });
  } else if (kind === "play") {
    const facilities = facilityBits(venue);
    const sportLine = playing.length
      ? englishList(playing.map((sport) => sport.toLowerCase()))
      : "sport";
    faqs.push({
      question: `What can I play at ${name}?`,
      answer: facilities.length
        ? `${name} is a place to play ${sportLine}: ${englishList(facilities)}.`
        : `${name} is a place to play ${sportLine}.`,
    });
  }

  const chips = venueFacilityChips(venue).filter(
    (chip) => !facilityBits(venue).some((bit) => bit.toLowerCase() === chip.toLowerCase()),
  );
  if (chips.length > 0) {
    faqs.push({
      question: `What facilities does ${name} have?`,
      answer: `${name} has ${englishList(chips.map((chip) => chip.toLowerCase()))}.`,
    });
  }

  const contact = contactAnswer(venue);
  if (contact) {
    faqs.push({ question: `How do I contact ${name}?`, answer: contact });
  }
  return faqs;
}

export function venueFacilityChips(venue: VenueProfileInput): string[] {
  const kind = venueProfileKind(venue);
  const facilities =
    kind === "play" || kind === "hybrid" ? facilityBits(venue) : [];
  const amenities = venueGoodForLabels(venue, venueSupportsWatch(venue)).map(
    (label) => AMENITY_CHIP[label] ?? label,
  );
  const seen = new Set<string>();
  const chips: string[] = [];
  for (const chip of [...facilities, ...amenities]) {
    const key = chip.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    chips.push(chip);
  }
  return chips;
}

export function venueProfileCrumbs(venue: VenueProfileInput): VenueCrumb[] {
  const name = nameOf(venue);
  const slug = venue.slug?.trim() || "";
  const city = venue.address?.city?.trim() || venue.address?.suburb?.trim() || "";
  const crumbs: VenueCrumb[] = [
    { name: "Home", path: "/" },
    { name: "Venues", path: "/venues" },
  ];
  if (city) {
    crumbs.push({
      name: city,
      path: `/venues?location=${encodeURIComponent(toSlug(city))}`,
    });
  }
  crumbs.push({
    name,
    path: slug ? `/venues/${encodeURIComponent(slug)}` : "/venues",
  });
  return crumbs;
}

export function venueDirectoryLinks(venue: VenueProfileInput): VenueDirectoryLink[] {
  const cityName = venue.address?.city?.trim() || venue.address?.suburb?.trim() || "";
  const citySlug = cityName ? toSlug(cityName) : null;
  const kind = venueProfileKind(venue);
  const links: VenueDirectoryLink[] = [];
  const seen = new Set<string>();
  const push = (href: string, label: string, description: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    links.push({ href, label, description });
  };

  if (kind === "watch" || kind === "hybrid") {
    for (const item of venue.broadcasts ?? []) {
      if (!item || typeof item === "string") continue;
      const slug = item.slug?.trim();
      const sport = item.name?.trim();
      if (!slug || !sport) continue;
      push(
        intentPath("watch", slug, citySlug),
        sport,
        cityName
          ? `Find bars and fan zones screening ${sport} in ${cityName}.`
          : `Choose an area to see bars and fan zones screening ${sport} across South Africa.`,
      );
    }
  }

  if (kind === "play" || kind === "hybrid") {
    for (const sport of venueDistinctPlaySports(venue)) {
      push(
        intentPath("play", sport.key, citySlug),
        sport.name,
        cityName
          ? `Find courts and clubs for ${sport.name} in ${cityName}.`
          : `Choose an area to see courts and clubs hosting ${sport.name} across South Africa.`,
      );
    }
  }

  return links.slice(0, 8);
}

export function venueProfileHeadings(venue: VenueProfileInput): {
  shortName: string;
  about: string;
  fixtures: string;
  play: string;
  book: string;
  location: string;
  nearby: string;
  sports: string;
  faq: string;
} {
  const place = placeOf(venue);
  const shortName =
    venueShortDisplayName(nameOf(venue), {
      suburb: venue.address?.suburb,
      city: venue.address?.city,
    }) || nameOf(venue);
  const kind = venueProfileKind(venue);
  return {
    shortName,
    about: place ? `About ${shortName} in ${place}` : `About ${shortName}`,
    fixtures: `Upcoming fixtures at ${shortName}`,
    play: `Play at ${shortName}`,
    book: `Book at ${shortName}`,
    location: `Where to find ${shortName}`,
    nearby: `Venues near ${shortName}`,
    sports:
      kind === "watch"
        ? `Sports on at ${shortName}`
        : kind === "hybrid"
          ? `Watch and play at ${shortName}`
          : `Sports at ${shortName}`,
    faq: `Questions about ${shortName}`,
  };
}
