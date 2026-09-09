import type { CtaSlot } from "@/lib/analytics/track";
import type { TypedObject } from "@portabletext/types";

export const GUIDE_SPORTS = [
  "padel",
  "golf",
  "darts",
  "rugby",
  "soccer",
  "cricket",
  "tennis",
] as const;

export type GuideSport = (typeof GUIDE_SPORTS)[number];
export type GuideIntent = "play" | "watch";

export const GUIDE_TOC_MIN_HEADINGS = 3;
export const INLINE_CTA_RATIO = 0.45;
export const INLINE_CTA_MIN_BLOCKS = 4;

export type GuideHeading = {
  id: string;
  text: string;
  key: string;
};

export type GuideHeroTint = {
  kind: "tint";
  wash: string;
  glow: string;
  patternClassName: string;
};

export type GuideHeroVisual =
  | { kind: "image"; src: string }
  | GuideHeroTint;

const SPORT_WASH: Record<GuideSport, string> = {
  padel: "from-emerald-800 via-emerald-950 to-[#0c0f0c]",
  golf: "from-lime-800 via-emerald-950 to-[#0c0f0c]",
  darts: "from-amber-800 via-stone-950 to-[#0c0f0c]",
  rugby: "from-[#2d6a2d] via-emerald-950 to-[#0c0f0c]",
  soccer: "from-[#1a6fb5] via-slate-950 to-[#0c0f0c]",
  cricket: "from-[#c8a84b] via-yellow-950 to-[#0c0f0c]",
  tennis: "from-lime-700 via-emerald-950 to-[#0c0f0c]",
};

export function guideSportFromText(
  parts: Array<string | null | undefined>,
): GuideSport | null {
  const haystack = parts.filter(Boolean).join(" ").toLowerCase();
  return GUIDE_SPORTS.find((sport) => haystack.includes(sport)) ?? null;
}

export function portableTextBlockText(block: TypedObject): string {
  if (!("children" in block) || !Array.isArray(block.children)) return "";
  return block.children
    .map((child) => {
      if (!child || typeof child !== "object") return "";
      const text = (child as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
  return slug || "section";
}

function uniqueSlug(text: string, used: Set<string>): string {
  const base = slugifyHeading(text);
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  const id = `${base}-${n}`;
  used.add(id);
  return id;
}

export function extractGuideHeadings(
  content: TypedObject[],
  style: "h2" | "h3",
): GuideHeading[] {
  const used = new Set<string>();
  const headings: GuideHeading[] = [];
  for (const block of content) {
    if (block._type !== "block") continue;
    if (!("style" in block) || block.style !== style) continue;
    const text = portableTextBlockText(block);
    if (!text) continue;
    const id = uniqueSlug(text, used);
    const key = typeof block._key === "string" && block._key ? block._key : id;
    headings.push({ id, text, key });
  }
  return headings;
}

export function extractGuideH2s(content: TypedObject[]): GuideHeading[] {
  return extractGuideHeadings(content, "h2");
}

/** Prefer H2s; fall back to H3s so current CMS section titles still get a TOC. */
export function extractGuideTocHeadings(content: TypedObject[]): GuideHeading[] {
  const h2s = extractGuideHeadings(content, "h2");
  if (h2s.length >= GUIDE_TOC_MIN_HEADINGS) return h2s;
  const h3s = extractGuideHeadings(content, "h3");
  if (h3s.length >= GUIDE_TOC_MIN_HEADINGS) return h3s;
  return h2s;
}

export function shouldShowGuideToc(headings: readonly GuideHeading[]): boolean {
  return headings.length >= GUIDE_TOC_MIN_HEADINGS;
}

export function guideHeadingIdMap(
  headings: readonly GuideHeading[],
): Map<string, string> {
  return new Map(
    headings.filter((heading) => heading.key).map((heading) => [heading.key, heading.id]),
  );
}

export function headingAccentClass(intent: GuideIntent): string {
  return intent === "watch" ? "border-sky-400" : "border-emerald-400";
}

export function guideHeroFallback(sport: string | null, intent: GuideIntent): GuideHeroTint {
  const sportWash =
    sport && sport in SPORT_WASH ? SPORT_WASH[sport as GuideSport] : undefined;
  const wash =
    sportWash ??
    (intent === "watch"
      ? "from-sky-800 via-sky-950 to-[#0c0f0c]"
      : "from-emerald-800 via-emerald-950 to-[#0c0f0c]");
  return {
    kind: "tint",
    wash,
    glow: intent === "watch" ? "bg-sky-400/25" : "bg-emerald-400/25",
    patternClassName: "guide-hero-pattern",
  };
}

/** Never treat a stock/placeholder photo as a unique guide hero. */
export function isRepeatedPlaceholderPhoto(url: string): boolean {
  return /venue-placeholder|placeholder\.(svg|png|jpg|webp)|unsplash\.com\/photo/i.test(
    url,
  );
}

export function guideHeroVisual(input: {
  imageUrl?: string | null;
  sport: string | null;
  intent: GuideIntent;
}): GuideHeroVisual {
  const src = input.imageUrl?.trim() ?? "";
  if (src && !isRepeatedPlaceholderPhoto(src)) {
    return { kind: "image", src };
  }
  return guideHeroFallback(input.sport, input.intent);
}

function isListItemBlock(block: unknown): boolean {
  if (!block || typeof block !== "object") return false;
  const listItem = (block as { listItem?: unknown }).listItem;
  return typeof listItem === "string" && listItem.length > 0;
}

/**
 * Insert index for the mid-article CTA (~40–50% through body).
 * Snaps forward out of a list so we never split a bullet/number run.
 */
export function inlineCtaInsertIndex(blocks: readonly unknown[]): number | null {
  if (blocks.length < INLINE_CTA_MIN_BLOCKS) return null;
  let index = Math.floor(blocks.length * INLINE_CTA_RATIO);
  while (index < blocks.length && isListItemBlock(blocks[index])) {
    index += 1;
  }
  if (index <= 0 || index >= blocks.length) return null;
  const ratio = index / blocks.length;
  if (ratio < 0.4) {
    index = Math.min(blocks.length - 1, Math.ceil(blocks.length * 0.4));
    while (index < blocks.length && isListItemBlock(blocks[index])) {
      index += 1;
    }
  }
  if (index <= 0 || index >= blocks.length) return null;
  return index;
}

export function splitGuideContentForInlineCta<T>(blocks: T[]): {
  before: T[];
  after: T[];
} {
  const index = inlineCtaInsertIndex(blocks);
  if (index === null) return { before: blocks, after: [] };
  return { before: blocks.slice(0, index), after: blocks.slice(index) };
}

export function guideCtaSlot(placement: "hero" | "mid" | "end"): CtaSlot {
  return placement === "hero" ? "hero" : "inline";
}
