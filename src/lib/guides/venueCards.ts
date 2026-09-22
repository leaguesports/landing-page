import type { TypedObject } from "@portabletext/types";
import {
  extractGuideTocHeadings,
  guideHeadingIdMap,
  portableTextBlockText,
  slugifyHeading,
} from "./presentation.ts";
import { resolveGuideLinkHref } from "./portableText.ts";

/** Pilot page only. Joburg Watch pack can reuse the parser later. */
export const GUIDE_VENUE_CARD_PILOT_SLUG = "best-sports-bars-johannesburg";

export const GUIDE_VENUE_HOOK_MAX = 90;

const UPCOMING_FIXTURE_LIMIT = 4;

const TAIL_HEADINGS = new Set([
  "more joburg watch guides",
  "watch by sport",
  "faqs",
  "faq",
  "find a screening venue",
  "find a screening",
]);

const VENUE_PATH = /^\/venues\/([a-z0-9]+(?:-[a-z0-9]+)*)$/i;
const EVENT_FIXTURE_PATH = /^\/events\/([a-z0-9]+(?:-[a-z0-9]+)*)$/i;

export type GuideVenueCardEntry = {
  key: string;
  name: string;
  suburb: string;
  /** Suburb jump target. Set on the first venue in that suburb group. */
  anchorId: string | null;
  slug: string | null;
  hook: string;
  blurb: string;
  /** Detail after the "Best for:" label. */
  bestFor: string | null;
};

export type GuideUpcomingFixtureLink = {
  title: string;
  href: string;
};

export type GuideBestForSection = {
  id: string;
  title: string;
  items: TypedObject[];
};

export type GuideUpcomingSection = {
  id: string;
  title: string;
  intro: string | null;
  fixtures: GuideUpcomingFixtureLink[];
  seeAllHref: string;
};

export type WatchGuideVenueCards =
  | {
      status: "ready";
      lead: TypedObject[];
      bestFor: GuideBestForSection | null;
      upcoming: GuideUpcomingSection | null;
      venues: GuideVenueCardEntry[];
      tail: TypedObject[];
      notes: string[];
    }
  | { status: "skip"; reason: string };

type HeadingKind = "bestFor" | "upcoming" | "tail" | "suburb";

type OpenVenue = {
  key: string;
  name: string;
  suburb: string;
  anchorId: string | null;
  slugs: Set<string>;
  paragraphs: string[];
  bestFor: string[];
  extra: string[];
};

type SuburbGroup = {
  name: string;
  id: string;
  used: boolean;
};

export function isGuideVenueCardPilot(slug: string | null | undefined): boolean {
  return slug?.trim().toLowerCase() === GUIDE_VENUE_CARD_PILOT_SLUG;
}

/**
 * First sentence when it fits the scan line; otherwise a hard cut at ~90
 * characters. Mid-sentence cuts keep the full paragraph as the blurb so
 * the collapsed section does not drop words.
 */
export function splitGuideVenueHook(
  paragraph: string,
  max: number = GUIDE_VENUE_HOOK_MAX,
): { hook: string; rest: string } {
  const trimmed = paragraph.replace(/\s+/g, " ").trim();
  if (!trimmed) return { hook: "", rest: "" };

  const sentence = trimmed.match(/^([\s\S]{1,90}?[.!?])(?:\s+|$)/);
  if (sentence?.[1]) {
    return {
      hook: sentence[1].trim(),
      rest: trimmed.slice(sentence[0].length).trim(),
    };
  }

  if (trimmed.length <= max) return { hook: trimmed, rest: "" };

  const slice = trimmed.slice(0, max);
  const space = slice.lastIndexOf(" ");
  const cut = (space >= 40 ? slice.slice(0, space) : slice).trimEnd();
  return { hook: `${cut}…`, rest: trimmed };
}

/** CARTO dark tile already allowed by the site CSP. One tile, point marked in CSS. */
export function cartoDarkTileUrl(
  latitude: number,
  longitude: number,
  zoom = 15,
): string {
  const { x, y } = tileIndex(latitude, longitude, zoom);
  const sub = ["a", "b", "c", "d"][Math.abs(x + y) % 4];
  return `https://${sub}.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}@2x.png`;
}

/** 0–1 position of the venue inside that tile. */
export function tilePixelFraction(
  latitude: number,
  longitude: number,
  zoom = 15,
): { x: number; y: number } {
  const projected = project(latitude, longitude, zoom);
  return {
    x: projected.x - Math.floor(projected.x),
    y: projected.y - Math.floor(projected.y),
  };
}

/**
 * Split a watch-guide body that already links venues ("View X on LeagueSports"
 * or "Open venue →") into lead, Best-for chips, upcoming fixtures, cards, and tail.
 * Ambiguous slugs or a shape we cannot walk return `skip` — callers keep the
 * portable-text page.
 */
export function parseWatchGuideVenueCards(
  content: readonly TypedObject[] | null | undefined,
): WatchGuideVenueCards {
  if (!content || content.length === 0) {
    return { status: "skip", reason: "Guide body is empty." };
  }

  const headingIds = guideHeadingIdMap(extractGuideTocHeadings([...content]));
  const lead: TypedObject[] = [];
  const tail: TypedObject[] = [];
  const venues: GuideVenueCardEntry[] = [];
  const notes: string[] = [];

  let mode: "lead" | "bestFor" | "upcoming" | "venues" | "tail" = "lead";
  let bestFor: GuideBestForSection | null = null;
  let bestForItems: TypedObject[] = [];
  let upcoming: GuideUpcomingSection | null = null;
  let upcomingIntro: string[] = [];
  let upcomingFixtures: GuideUpcomingFixtureLink[] = [];
  let seeAllHref = "/events";
  let suburb: SuburbGroup | null = null;
  let open: OpenVenue | null = null;

  function headingId(block: TypedObject, text: string): string {
    const key = blockKey(block);
    return (key && headingIds.get(key)) || slugifyHeading(text);
  }

  function closeVenue(): string | null {
    if (!open) return null;
    if (open.slugs.size > 1) {
      return `Conflicting venue links for “${open.name}”.`;
    }
    const slug = [...open.slugs][0] ?? null;
    if (!slug) notes.push(`No venue slug for “${open.name}”.`);
    const first = open.paragraphs[0] ?? "";
    const { hook, rest } = splitGuideVenueHook(first);
    const blurb = [rest, ...open.paragraphs.slice(1), ...open.extra]
      .map((part) => part.trim())
      .filter(Boolean)
      .join("\n\n");
    venues.push({
      key: open.key,
      name: open.name,
      suburb: open.suburb,
      anchorId: open.anchorId,
      slug,
      hook,
      blurb,
      bestFor: open.bestFor.length > 0 ? open.bestFor.join(" ") : null,
    });
    open = null;
    return null;
  }

  for (const block of content) {
    if (block._type !== "block") {
      if (mode === "lead") {
        lead.push(block);
        continue;
      }
      if (mode === "tail") {
        tail.push(block);
        continue;
      }
      return {
        status: "skip",
        reason: "Venue section contains a non-text block, so links were not split.",
      };
    }

    const style = blockStyle(block);
    const text = portableTextBlockText(block);

    if (style === "h2") {
      const conflict = closeVenue();
      if (conflict) return { status: "skip", reason: conflict };
      const kind = classifyHeading(text);
      if (kind === "tail") {
        mode = "tail";
        tail.push(block);
        continue;
      }
      if (kind === "bestFor") {
        mode = "bestFor";
        if (!bestFor) {
          bestForItems = [];
          bestFor = { id: headingId(block, text), title: text, items: bestForItems };
        }
        continue;
      }
      if (kind === "upcoming") {
        mode = "upcoming";
        if (!upcoming) {
          upcomingIntro = [];
          upcomingFixtures = [];
          upcoming = {
            id: headingId(block, text),
            title: text,
            intro: null,
            fixtures: upcomingFixtures,
            seeAllHref,
          };
        }
        continue;
      }
      mode = "venues";
      suburb = { name: text.trim(), id: headingId(block, text), used: false };
      continue;
    }

    if (style === "h3") {
      const numbered = text.match(/^(\d+)\.\s+(.+)$/);
      if (numbered && mode !== "tail") {
        const conflict = closeVenue();
        if (conflict) return { status: "skip", reason: conflict };
        mode = "venues";
        const title = numbered[2]?.trim() ?? "";
        const split = splitVenueTitle(title);
        const anchorId = suburb && !suburb.used ? suburb.id : null;
        if (suburb && anchorId) suburb.used = true;
        open = {
          key: blockKey(block) || slugifyHeading(split.name),
          name: split.name,
          suburb: split.suburb || suburb?.name || "",
          anchorId,
          slugs: new Set(venueSlugsIn(block)),
          paragraphs: [],
          bestFor: [],
          extra: [],
        };
        continue;
      }
      if (mode === "tail" || mode === "lead") {
        (mode === "tail" ? tail : lead).push(block);
        continue;
      }
      return {
        status: "skip",
        reason: `Unexpected heading “${text}” in the venue list.`,
      };
    }

    if (mode === "lead") {
      lead.push(block);
      continue;
    }
    if (mode === "tail") {
      tail.push(block);
      continue;
    }
    if (mode === "bestFor") {
      if (text) bestForItems.push(block);
      continue;
    }
    if (mode === "upcoming") {
      absorbUpcoming(block, text, upcomingIntro, upcomingFixtures, (href) => {
        seeAllHref = href;
      });
      continue;
    }

    if (!open) {
      if (!text) continue;
      return {
        status: "skip",
        reason: "Text between suburb headings was not part of a venue entry.",
      };
    }

    if (!text) continue;
    if (isVenueCtaText(text)) {
      for (const slug of venueSlugsIn(block)) open.slugs.add(slug);
      continue;
    }
    const bestForDetail = parseBestForDetail(text);
    if (bestForDetail) {
      open.bestFor.push(bestForDetail);
      continue;
    }
    if (listItemKind(block)) {
      open.extra.push(text);
      continue;
    }
    open.paragraphs.push(text);
  }

  const conflict = closeVenue();
  if (conflict) return { status: "skip", reason: conflict };

  if (venues.length === 0) {
    return { status: "skip", reason: "No numbered venue headings with body copy." };
  }

  if (bestFor && bestForItems.length === 0) {
    notes.push("Best for heading had no chips.");
    bestFor = null;
  }
  if (!bestFor) notes.push("No Best for chip section in the guide body.");

  if (upcoming) {
    upcoming.intro = upcomingIntro.join(" ").trim() || null;
    upcoming.fixtures = upcomingFixtures.slice(0, UPCOMING_FIXTURE_LIMIT);
    upcoming.seeAllHref = seeAllHref;
    if (upcomingFixtures.length > UPCOMING_FIXTURE_LIMIT) {
      notes.push(
        `Upcoming list has ${upcomingFixtures.length} fixtures; showing ${UPCOMING_FIXTURE_LIMIT}.`,
      );
    }
    if (upcoming.fixtures.length === 0) {
      notes.push("Upcoming section has no event links.");
    }
  } else {
    notes.push("No Upcoming on LeagueSports section in the guide body.");
  }

  return {
    status: "ready",
    lead,
    bestFor,
    upcoming,
    venues,
    tail,
    notes,
  };
}

function absorbUpcoming(
  block: TypedObject,
  text: string,
  intro: string[],
  fixtures: GuideUpcomingFixtureLink[],
  setSeeAll: (href: string) => void,
): void {
  let sawFixture = false;
  let sawIndex = false;
  for (const href of linkHrefs(block)) {
    const path = internalPathname(href);
    if (!path) continue;
    if (EVENT_FIXTURE_PATH.test(path)) {
      sawFixture = true;
      const title = text || "Fixture";
      if (!fixtures.some((item) => item.href === path)) {
        fixtures.push({ title, href: path });
      }
    } else if (path === "/events") {
      sawIndex = true;
      setSeeAll(path);
    }
  }
  if (!sawFixture && !sawIndex && text && !listItemKind(block)) {
    intro.push(text);
  }
}

function classifyHeading(text: string): HeadingKind {
  const normalized = normalizeHeading(text);
  if (normalized === "best for" || normalized.startsWith("best for ")) {
    return "bestFor";
  }
  if (
    normalized === "upcoming on leaguesports" ||
    normalized.startsWith("upcoming on leaguesports")
  ) {
    return "upcoming";
  }
  if (TAIL_HEADINGS.has(normalized) || normalized.startsWith("find a screening")) {
    return "tail";
  }
  return "suburb";
}

function splitVenueTitle(title: string): { name: string; suburb: string | null } {
  const comma = title.lastIndexOf(",");
  if (comma === -1) return { name: title.trim(), suburb: null };
  const name = title.slice(0, comma).trim();
  const suburb = title.slice(comma + 1).trim();
  if (!name || !suburb) return { name: title.trim(), suburb: null };
  return { name, suburb };
}

function parseBestForDetail(text: string): string | null {
  const match = text.trim().match(/^best for\s*:\s*(.+)$/i);
  const detail = match?.[1]?.trim();
  return detail || null;
}

function isVenueCtaText(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (/^open venue\b/.test(normalized)) return true;
  return /^view\s+.+\son leaguesports[.!]?$/.test(normalized);
}

function venueSlugsIn(block: TypedObject): string[] {
  const slugs: string[] = [];
  for (const href of linkHrefs(block)) {
    const path = internalPathname(href);
    if (!path) continue;
    const match = path.match(VENUE_PATH);
    if (match?.[1]) slugs.push(match[1].toLowerCase());
  }
  return slugs;
}

function linkHrefs(block: TypedObject): string[] {
  const hrefByKey = new Map<string, string>();
  for (const def of markDefsOf(block)) {
    if (def._type !== "link") continue;
    if (typeof def._key !== "string" || typeof def.href !== "string") continue;
    hrefByKey.set(def._key, def.href);
  }
  const hrefs: string[] = [];
  for (const span of spansOf(block)) {
    for (const mark of span.marks) {
      const href = hrefByKey.get(mark);
      if (href) hrefs.push(href);
    }
  }
  return hrefs;
}

function internalPathname(href: string): string | null {
  const resolved = resolveGuideLinkHref(href);
  if (resolved.kind !== "internal") return null;
  const path = resolved.href.split("#")[0]?.split("?")[0] ?? "";
  if (!path.startsWith("/")) return null;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function normalizeHeading(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function blockStyle(block: TypedObject): string {
  if (!("style" in block) || typeof block.style !== "string") return "normal";
  return block.style;
}

function listItemKind(block: TypedObject): string | null {
  if (!("listItem" in block)) return null;
  const value = (block as { listItem?: unknown }).listItem;
  return typeof value === "string" && value ? value : null;
}

function blockKey(block: TypedObject): string {
  return typeof block._key === "string" ? block._key : "";
}

function markDefsOf(
  block: TypedObject,
): Array<{ _key?: string; _type?: string; href?: string }> {
  if (!("markDefs" in block) || !Array.isArray(block.markDefs)) return [];
  return block.markDefs.flatMap((def) => {
    if (!def || typeof def !== "object") return [];
    return [def as { _key?: string; _type?: string; href?: string }];
  });
}

function spansOf(
  block: TypedObject,
): Array<{ text: string; marks: string[] }> {
  if (!("children" in block) || !Array.isArray(block.children)) return [];
  return block.children.flatMap((child) => {
    if (!child || typeof child !== "object") return [];
    const text = "text" in child && typeof child.text === "string" ? child.text : "";
    const rawMarks = "marks" in child && Array.isArray(child.marks) ? child.marks : [];
    const marks = rawMarks.filter(
      (mark: unknown): mark is string => typeof mark === "string",
    );
    return [{ text, marks }];
  });
}

function project(
  latitude: number,
  longitude: number,
  zoom: number,
): { x: number; y: number } {
  const n = 2 ** zoom;
  const x = ((longitude + 180) / 360) * n;
  const latRad = (latitude * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

function tileIndex(
  latitude: number,
  longitude: number,
  zoom: number,
): { x: number; y: number } {
  const projected = project(latitude, longitude, zoom);
  return { x: Math.floor(projected.x), y: Math.floor(projected.y) };
}
