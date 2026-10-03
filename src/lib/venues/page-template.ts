/**
 * Customer venue templates (issue #259).
 *
 * Watch and one-sport Play replace the current page. Anything else stays
 * on the current page — including multi-play clubs and hybrids that both
 * screen and host play. Do not guess a hybrid into either template.
 *
 * Gates are the existing ones: `venueSupportsWatch` (broadcasts or
 * screenings) and Play sport identity (linked `sports`, plus a playable
 * golf course). No new CMS flags.
 */

import { hasPlayableGolfCourse } from "../golf/course.ts";
import { isGolfSportLabel } from "../golf/venue-options.ts";
import { isDartsSportLabel } from "../darts/venue-options.ts";
import { isPadelSportLabel } from "../padel/venue-options.ts";
import {
  resolveSportSlug,
  SPORT_CATALOG,
  toHubSportSlug,
} from "../sports/catalog.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";
import {
  venueAmenityShown,
  venueSupportsWatch,
  type ListedAmenityKey,
  type VenueWatchChromeInput,
} from "./watch-chrome.ts";
import {
  venuePlaySportLabels,
  type VenuePlayChromeInput,
} from "./play-chrome.ts";
import { venueQuickStartActivities } from "./quick-start.ts";

export type VenuePageTemplate = "watch" | "play" | "default";

export type VenueTemplateInput = VenueWatchChromeInput &
  VenuePlayChromeInput & {
    slug?: string | null;
    /** Portable Text or plain text. Publish notes are stripped for the customer paragraph. */
    description?: unknown;
    hours?: unknown;
    openingHours?: unknown;
  };

const SEO_NAME_SUFFIXES = ["sports bar", "sport bar", "sportsbar"] as const;

const AMENITY_LABELS: readonly { key: ListedAmenityKey; label: string }[] = [
  { key: "has_generator_backup", label: "Generator" },
  { key: "has_big_screens", label: "Big screen" },
  { key: "has_live_audio", label: "Sound on" },
  { key: "has_craft_drafts", label: "Draft beer" },
  { key: "has_food_menu", label: "Food" },
  { key: "has_outdoor_area", label: "Outdoor" },
  { key: "has_parking", label: "Parking" },
];

/** Editorial leftovers that must not reach the customer paragraph. */
const PUBLISH_NOTE =
  /playtomic|no confirmed|not confirmed|unconfirmed|(?:^|\b)at publish\b|publish note|phone\s*\/\s*website|internal note|\btbc\b|to be confirmed|do not publish/i;

export type VenuePlaySport = {
  key: string;
  name: string;
};

type PortableSpan = { text?: string | null };
type PortableBlock = { children?: PortableSpan[] | null };

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function playSportKey(label: string): string | null {
  const raw = label.trim();
  if (!raw) return null;
  if (isPadelSportLabel(raw)) return "padel";
  if (isGolfSportLabel(raw)) return "golf";
  if (isDartsSportLabel(raw)) return "darts";
  const resolved = resolveSportSlug(raw);
  if (resolved) return toHubSportSlug(resolved) ?? resolved;
  const slug = raw.toLowerCase().replace(/\s+/g, "-");
  return slug || null;
}

function sportDisplayName(key: string, venue: VenueTemplateInput): string {
  const catalog = SPORT_CATALOG.find((sport) => sport.slug === key);
  if (catalog) return catalog.name;
  const label = venuePlaySportLabels(venue).find((item) => {
    return playSportKey(item) === key && item.toLowerCase() !== key;
  });
  if (label?.trim()) return label.trim();
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Distinct Play sports this venue hosts. Aliases collapse (paddle/padel,
 * dart/autodarts). A playable golf course counts as golf. Broadcasts do not.
 */
export function venueDistinctPlaySports(
  venue: VenueTemplateInput,
): VenuePlaySport[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const label of venuePlaySportLabels(venue)) {
    const key = playSportKey(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
  }
  if (hasPlayableGolfCourse(venue.golfCourse) && !seen.has("golf")) {
    keys.push("golf");
  }
  return keys.map((key) => ({ key, name: sportDisplayName(key, venue) }));
}

export function classifyVenuePage(venue: VenueTemplateInput): VenuePageTemplate {
  const screens = venueSupportsWatch(venue);
  const playCount = venueDistinctPlaySports(venue).length;
  if (screens && playCount > 0) return "default";
  if (playCount > 1) return "default";
  if (screens) return "watch";
  if (playCount === 1) return "play";
  return "default";
}

/**
 * H1. Drops a trailing suburb/city and a trailing "Sports Bar" SEO suffix.
 * The full CMS name stays in the document title.
 */
export function venueShortDisplayName(
  name: string,
  place?: { suburb?: string | null; city?: string | null },
): string {
  const original = name.trim();
  let short = original;
  const places = [place?.suburb, place?.city]
    .map((value) => value?.trim() || "")
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  for (let guard = 0; guard < 6; guard += 1) {
    let next = short;
    for (const placeName of places) {
      const re = new RegExp(`(?:[,\\s]+)${escapeRegExp(placeName)}$`, "i");
      next = next.replace(re, "").trim();
    }
    for (const suffix of SEO_NAME_SUFFIXES) {
      const re = new RegExp(`\\s+${suffix}$`, "i");
      next = next.replace(re, "").trim();
    }
    if (next === short) break;
    short = next;
  }
  return short || original;
}

/** Watch: suburb, then city if the suburb is missing. */
export function venueWatchPlace(address: {
  suburb?: string | null;
  city?: string | null;
}): string {
  return address.suburb?.trim() || address.city?.trim() || "";
}

/** Play: "Century City, Cape Town" when suburb and city differ. */
export function venuePlayPlace(address: {
  suburb?: string | null;
  city?: string | null;
}): string {
  const suburb = address.suburb?.trim() || "";
  const city = address.city?.trim() || "";
  if (suburb && city && suburb.toLowerCase() !== city.toLowerCase()) {
    return `${suburb}, ${city}`;
  }
  return suburb || city;
}

export function venueAboutPlain(description: unknown): string {
  if (typeof description === "string") return description.trim();
  if (!Array.isArray(description)) return "";
  return description
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const children = (block as PortableBlock).children;
      if (!Array.isArray(children)) return "";
      return children
        .map((span) => (typeof span?.text === "string" ? span.text : ""))
        .join("");
    })
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function sentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/))
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function isPublishNote(sentence: string): boolean {
  return PUBLISH_NOTE.test(sentence);
}

/** One customer paragraph. Publish notes are dropped, not rewritten. */
export function venueCustomerAbout(description: unknown): string | null {
  const kept = sentences(venueAboutPlain(description)).filter(
    (sentence) => !isPublishNote(sentence),
  );
  const text = kept.join(" ").replace(/\s+/g, " ").trim();
  return text || null;
}

/**
 * Court count and indoor/outdoor only when the venue copy states them.
 * Outdoor seating is not an outdoor court.
 */
export function venueCourtFacility(description: unknown): string | null {
  const text = venueAboutPlain(description);
  const rich = text.match(/\b(\d{1,2})\s+(indoor|outdoor|covered)\s+courts?\b/i);
  if (rich?.[1] && rich[2]) {
    const noun = rich[1] === "1" ? "court" : "courts";
    return `${rich[1]} ${rich[2].toLowerCase()} ${noun}`;
  }
  const plain = text.match(/\b(\d{1,2})\s+courts?\b/i);
  if (plain?.[1]) {
    const noun = plain[1] === "1" ? "court" : "courts";
    return `${plain[1]} ${noun}`;
  }
  return null;
}

export function venueGolfHoles(
  course: GolfCourseCms | null | undefined,
): string | null {
  const total = course?.holesTotal;
  if (typeof total === "number" && Number.isInteger(total) && total >= 9 && total <= 18) {
    return `${total} holes`;
  }
  const count = course?.holes?.length ?? 0;
  if (count >= 9) return `${count} holes`;
  return null;
}

export function venueGoodForLabels(
  venue: VenueTemplateInput,
  supportsWatch: boolean,
): string[] {
  return AMENITY_LABELS.filter((item) =>
    venueAmenityShown(item.key, venue[item.key], supportsWatch),
  ).map((item) => item.label);
}

function amenityPhrase(labels: readonly string[]): string | null {
  if (labels.length === 0) return null;
  const [first, ...rest] = labels;
  return [first, ...rest.map((label) => label.toLowerCase())].join(", ");
}

/**
 * One facts line: facility (if known), the one sport, amenities once.
 * "2 outdoor courts. Padel. Food, outdoor, parking."
 */
export function venuePlayFactsLine(
  venue: VenueTemplateInput,
  sportName: string,
): string | null {
  const sport = venueDistinctPlaySports(venue)[0];
  const facility =
    venueCourtFacility(venue.description) ??
    (sport?.key === "golf" ? venueGolfHoles(venue.golfCourse) : null);
  const amenities = amenityPhrase(venueGoodForLabels(venue, false));
  const parts = [facility, sportName.trim(), amenities].filter(Boolean);
  if (parts.length === 0) return null;
  return `${parts.join(". ")}.`;
}

/** Hours only when the venue record already has a text value. Never guessed. */
export function venueHoursLine(venue: object): string | null {
  const record = venue as { hours?: unknown; openingHours?: unknown };
  for (const value of [record.hours, record.openingHours]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Match create with this venue and its one sport prefilled.
 * Null when that sport has no scorecard (karting, climbing).
 */
export function venueStartMatchHref(venue: VenueTemplateInput): string | null {
  const sports = venueDistinctPlaySports(venue);
  if (sports.length !== 1) return null;
  const sport = sports[0]!;
  const slug = venue.slug?.trim() ?? "";
  if (!slug) return null;
  const activities = venueQuickStartActivities({
    slug,
    sports: venuePlaySportLabels(venue),
    golfCourse: venue.golfCourse ?? null,
  });
  const activity =
    activities.find((item) => item.sportSlug === sport.key) ?? null;
  if (!activity?.href.includes("venue=")) return null;
  return activity.href;
}
