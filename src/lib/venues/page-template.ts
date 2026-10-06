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
import {
  buildVenueWhatsAppUrl,
  normalizePhoneForWhatsApp,
} from "./contact-cta.ts";

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

/**
 * Short Watch chips. `phrase` stays the Play facts sentence.
 * A chip appears only when that amenity flag is set.
 */
const AMENITY_LABELS: readonly {
  key: ListedAmenityKey;
  label: string;
  phrase: string;
}[] = [
  { key: "has_generator_backup", label: "Backup", phrase: "generator" },
  { key: "has_big_screens", label: "Screens", phrase: "big screens" },
  { key: "has_live_audio", label: "Commentary", phrase: "live commentary" },
  { key: "has_craft_drafts", label: "Draft", phrase: "draft beer" },
  { key: "has_food_menu", label: "Food", phrase: "food" },
  { key: "has_outdoor_area", label: "Terrace", phrase: "outdoor" },
  { key: "has_parking", label: "Parking", phrase: "parking" },
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

/** Drop a phone number written into the sentence. Leaves court counts and clock times. */
function stripPhoneNumbers(sentence: string): string {
  const stripped = sentence.replace(/(?:\+|00)?\d[\d\s()./-]{6,}\d/g, (match) => {
    const digits = match.replace(/\D/g, "");
    return digits.length >= 9 ? " " : match;
  });
  return stripped
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

/**
 * First customer sentence only. Later sentences stay off the page.
 * Publish notes are dropped. Phone numbers inside that sentence are removed.
 */
export function venueCustomerAbout(description: unknown): string | null {
  const kept = sentences(venueAboutPlain(description)).filter(
    (sentence) => !isPublishNote(sentence),
  );
  const first = kept[0];
  if (!first) return null;
  const text = stripPhoneNumbers(first).replace(/\s+/g, " ").trim();
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

function amenityPhrase(venue: VenueTemplateInput, supportsWatch: boolean): string | null {
  const phrases = AMENITY_LABELS.filter((item) =>
    venueAmenityShown(item.key, venue[item.key], supportsWatch),
  ).map((item) => item.phrase);
  if (phrases.length === 0) return null;
  const [first, ...rest] = phrases;
  return [first ? first.charAt(0).toUpperCase() + first.slice(1) : "", ...rest].join(", ");
}

/**
 * Street, suburb, city, province. Skips blanks and a place already written
 * (live Action Padel repeats Century City in the street and the suburb).
 */
export function venueAddressLine(
  address?: {
    street?: string | null;
    suburb?: string | null;
    city?: string | null;
    province?: string | null;
  } | null,
): string | null {
  const parts = [
    address?.street,
    address?.suburb,
    address?.city,
    address?.province,
  ]
    .map((part) => part?.trim() || "")
    .filter(Boolean);
  const kept: string[] = [];
  for (const part of parts) {
    const segments = kept
      .join(", ")
      .split(",")
      .map((segment) => segment.trim().toLowerCase())
      .filter(Boolean);
    if (segments.includes(part.toLowerCase())) continue;
    kept.push(part);
  }
  return kept.length > 0 ? kept.join(", ") : null;
}

/** Quiet line of broadcast sports this venue actually screens. No links. */
export function venueWatchScreensLine(
  venue: Pick<VenueTemplateInput, "broadcasts">,
): string | null {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const item of venue.broadcasts ?? []) {
    const name = item?.name?.trim() ?? "";
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  if (names.length === 0) return null;
  const list =
    names.length === 1
      ? names[0]!
      : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
  return `Screens ${list}.`;
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
  const amenities = amenityPhrase(venue, false);
  const parts = [facility, sportName.trim(), amenities].filter(Boolean);
  if (parts.length === 0) return null;
  return `${parts.join(". ")}.`;
}

export type VenueContactLink = {
  kind: "phone" | "email" | "website" | "whatsapp";
  href: string;
  label: string;
};

function cleanContact(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function websiteHref(value: string): string | null {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function websiteLabel(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./i, "");
  } catch {
    return "Website";
  }
}

/**
 * Contact row for Watch and one-sport Play.
 *
 * Reads the same fields the venue query already coalesces: phone, WhatsApp,
 * website, and email. No booking URL exists on the venue record, so this
 * never adds one and never turns about-copy into a link. Empty records
 * return no links — the row is omitted.
 */
export function venueContactLinks(venue: {
  name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
}): VenueContactLink[] {
  const links: VenueContactLink[] = [];
  const phone = cleanContact(venue.phone);
  const phoneDial = normalizePhoneForWhatsApp(phone);
  if (phone && phoneDial) {
    links.push({ kind: "phone", href: `tel:+${phoneDial}`, label: "Call" });
  }

  const whatsapp = cleanContact(venue.whatsapp);
  const whatsappHref = whatsapp
    ? buildVenueWhatsAppUrl(whatsapp, venue.name?.trim() || "the venue")
    : null;
  if (whatsappHref) {
    links.push({ kind: "whatsapp", href: whatsappHref, label: "WhatsApp" });
  }

  const site = websiteHref(cleanContact(venue.website));
  if (site) {
    links.push({ kind: "website", href: site, label: websiteLabel(site) });
  }

  const email = cleanContact(venue.email);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    links.push({ kind: "email", href: `mailto:${email}`, label: email });
  }

  return links;
}

/** Play primary action. "Start padel" for that venue's one sport. */
export function venueStartMatchLabel(sportName: string): string {
  const sport = sportName.trim().toLowerCase();
  return sport ? `Start ${sport}` : "Start";
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
