import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TypedObject } from "@portabletext/types";
import { ctaAnalyticsParams, selectCtaMatrix } from "../conversion/cta-matrix.ts";
import {
  extractGuideH2s,
  extractGuideTocHeadings,
  guideCtaSlot,
  guideHeroFallback,
  guideHeroVisual,
  inlineCtaInsertIndex,
  INLINE_CTA_MIN_BLOCKS,
  isRepeatedPlaceholderPhoto,
  shouldShowGuideToc,
  splitGuideContentForInlineCta,
} from "./presentation.ts";

function h2(text: string, key: string): TypedObject {
  return {
    _type: "block",
    _key: key,
    style: "h2",
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
  } as TypedObject;
}

function para(text: string, key: string): TypedObject {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
  } as TypedObject;
}

function h3(text: string, key: string): TypedObject {
  return {
    _type: "block",
    _key: key,
    style: "h3",
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
  } as TypedObject;
}

function listItem(text: string, key: string): TypedObject {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
  } as TypedObject;
}

describe("shouldShowGuideToc", () => {
  it("shows compact jump links only when there are at least 3 H2s", () => {
    const two = extractGuideH2s([h2("One", "a"), h2("Two", "b")]);
    const three = extractGuideH2s([
      h2("Courts", "a"),
      h2("Pricing", "b"),
      h2("Getting there", "c"),
    ]);
    assert.equal(two.length, 2);
    assert.equal(shouldShowGuideToc(two), false);
    assert.equal(three.length, 3);
    assert.equal(shouldShowGuideToc(three), true);
    assert.equal(three[0]?.id, "courts");
    assert.equal(three[1]?.id, "pricing");
  });

  it("prefers H2s when there are at least 3", () => {
    const headings = extractGuideTocHeadings([
      h2("Courts", "a"),
      h2("Pricing", "b"),
      h2("Getting there", "c"),
      h3("Ignored venue", "d"),
    ]);
    assert.deepEqual(
      headings.map((heading) => heading.text),
      ["Courts", "Pricing", "Getting there"],
    );
  });

  it("falls back to H3s when there are fewer than 3 H2s", () => {
    const headings = extractGuideTocHeadings([
      h2("Only one", "a"),
      h3("Sandton", "b"),
      h3("Midrand", "c"),
      h3("Greenside", "d"),
    ]);
    assert.equal(shouldShowGuideToc(headings), true);
    assert.deepEqual(
      headings.map((heading) => heading.text),
      ["Sandton", "Midrand", "Greenside"],
    );
  });
});

describe("guideHeroVisual tint fallback", () => {
  it("uses a sport/intent tint + pattern when there is no image", () => {
    const visual = guideHeroVisual({
      imageUrl: undefined,
      sport: "rugby",
      intent: "watch",
    });
    assert.equal(visual.kind, "tint");
    if (visual.kind !== "tint") return;
    assert.match(visual.wash, /2d6a2d|sky|emerald/i);
    assert.equal(visual.patternClassName, "guide-hero-pattern");
    assert.match(visual.glow, /sky/);
  });

  it("falls back to intent tint when sport is unknown", () => {
    const play = guideHeroFallback(null, "play");
    const watch = guideHeroFallback(null, "watch");
    assert.match(play.wash, /emerald/);
    assert.match(watch.wash, /sky/);
    assert.equal(play.patternClassName, "guide-hero-pattern");
  });

  it("never uses a repeated placeholder photo as the hero", () => {
    assert.equal(isRepeatedPlaceholderPhoto("/images/venue-placeholder.svg"), true);
    const visual = guideHeroVisual({
      imageUrl: "/images/venue-placeholder.svg",
      sport: "padel",
      intent: "play",
    });
    assert.equal(visual.kind, "tint");
    if (visual.kind !== "tint") return;
    assert.doesNotMatch(visual.wash, /placeholder|unsplash|venue-placeholder/i);
  });

  it("keeps a unique CMS image when present", () => {
    const visual = guideHeroVisual({
      imageUrl: "https://cdn.sanity.io/images/proj/production/hero-1200x800.jpg",
      sport: "padel",
      intent: "play",
    });
    assert.equal(visual.kind, "image");
    if (visual.kind !== "image") return;
    assert.match(visual.src, /cdn\.sanity\.io/);
  });
});

describe("inline CTA slot", () => {
  it("places the mid CTA around 40–50% through the body", () => {
    const blocks = Array.from({ length: 10 }, (_, i) => para(`p${i}`, `p${i}`));
    const index = inlineCtaInsertIndex(blocks);
    assert.ok(index !== null);
    const ratio = (index as number) / blocks.length;
    assert.ok(ratio >= 0.4 && ratio <= 0.5, `ratio ${ratio} should be 40–50%`);
    const split = splitGuideContentForInlineCta(blocks);
    assert.equal(split.before.length, index);
    assert.equal(split.after.length, blocks.length - (index as number));
    assert.ok(split.after.length > 0);
  });

  it("skips the mid CTA on thin bodies", () => {
    const blocks = Array.from({ length: INLINE_CTA_MIN_BLOCKS - 1 }, (_, i) =>
      para(`p${i}`, `p${i}`),
    );
    assert.equal(inlineCtaInsertIndex(blocks), null);
    const split = splitGuideContentForInlineCta(blocks);
    assert.equal(split.after.length, 0);
    assert.equal(split.before.length, blocks.length);
  });

  it("does not split in the middle of a list", () => {
    const blocks: TypedObject[] = [
      para("intro", "i"),
      para("more", "m"),
      listItem("a", "l1"),
      listItem("b", "l2"),
      listItem("c", "l3"),
      para("after list", "end"),
    ];
    const index = inlineCtaInsertIndex(blocks);
    assert.ok(index !== null);
    assert.equal(isListItemAt(blocks, index as number), false);
  });
});

describe("guide CTA slot params", () => {
  it("uses cta_slot=inline with page_type=guide for mid and end kits", () => {
    const matrix = selectCtaMatrix({
      pageType: "guide",
      guideIntent: "play",
      sport: "padel",
    });
    assert.equal(guideCtaSlot("hero"), "hero");
    assert.equal(guideCtaSlot("mid"), "inline");
    assert.equal(guideCtaSlot("end"), "inline");

    const mid = ctaAnalyticsParams(matrix, guideCtaSlot("mid"), {
      sport: "padel",
      slug: "best-padel-courts-cape-town",
    });
    assert.equal(mid.page_type, "guide");
    assert.equal(mid.cta_slot, "inline");
    assert.equal(mid.sport, "padel");
    assert.equal(mid.slug, "best-padel-courts-cape-town");
  });
});

function isListItemAt(blocks: TypedObject[], index: number): boolean {
  const block = blocks[index];
  return Boolean(
    block &&
      typeof block === "object" &&
      "listItem" in block &&
      typeof (block as { listItem?: unknown }).listItem === "string",
  );
}
