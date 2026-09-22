import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TypedObject } from "@portabletext/types";
import {
  cartoDarkTileUrl,
  parseWatchGuideVenueCards,
  splitGuideVenueHook,
  tilePixelFraction,
  GUIDE_VENUE_HOOK_MAX,
} from "./venueCards.ts";

function textBlock(
  text: string,
  key: string,
  extras: Record<string, unknown> = {},
): TypedObject {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
    ...extras,
  } as TypedObject;
}

function heading(
  style: "h1" | "h2" | "h3",
  text: string,
  key: string,
  href?: string,
): TypedObject {
  const marks = href ? ["link"] : [];
  return {
    _type: "block",
    _key: key,
    style,
    markDefs: href ? [{ _key: "link", _type: "link", href }] : [],
    children: [{ _type: "span", _key: `${key}-span`, text, marks }],
  } as TypedObject;
}

function linkedLine(
  text: string,
  key: string,
  href: string,
  listItem?: "bullet",
): TypedObject {
  return textBlock(text, key, {
    ...(listItem ? { listItem } : {}),
    markDefs: [{ _key: "link", _type: "link", href }],
    children: [{ _type: "span", _key: `${key}-span`, text, marks: ["link"] }],
  });
}

function pilotBody(): TypedObject[] {
  return [
    heading("h1", "Best Sports Bars in Johannesburg", "title"),
    textBlock("Pick a suburb below, then open the venue page.", "intro"),
    textBlock("Jump to: Rosebank · Illovo", "jump"),
    heading("h2", "Best for", "best"),
    linkedLine(
      "Springboks: The Troyeville · Bench Warmers",
      "chip-rugby",
      "https://leaguesports.co.za/venues/the-troyeville",
      "bullet",
    ),
    linkedLine(
      "F1: Bench Warmers · Time Out Sports Bar",
      "chip-f1",
      "/venues/time-out-sports-bar",
      "bullet",
    ),
    heading("h2", "Upcoming on LeagueSports", "upcoming"),
    textBlock("Big fixtures coming up — open the event.", "upcoming-intro"),
    linkedLine(
      "Stormers vs Bulls (URC)",
      "fx1",
      "/events/stormers-vs-bulls-urc-2026",
      "bullet",
    ),
    linkedLine(
      "Proteas vs India (ODI)",
      "fx2",
      "https://leaguesports.co.za/events/proteas-vs-india-odi-2026",
      "bullet",
    ),
    linkedLine("Find where to watch → Browse all events", "see-all", "/events"),
    heading("h2", "Rosebank", "rosebank"),
    heading(
      "h3",
      "1. Bench Warmers, Rosebank",
      "v1",
      "/venues/benchwarmers-sports-bar",
    ),
    textBlock(
      "Multi-screen sports bar energy in Rosebank. Bench Warmers is the classic Joburg sports-bar blast.",
      "v1-body",
    ),
    textBlock("Best for: F1 race weekends and Springboks Tests.", "v1-best", {
      listItem: "bullet",
    }),
    linkedLine("Open venue →", "v1-cta", "/venues/benchwarmers-sports-bar"),
    heading("h2", "Fourways", "fourways"),
    heading(
      "h3",
      "4. Molly Malone's, Fourways",
      "v4",
      "/venues/molly-malones-fourways",
    ),
    textBlock(
      "Irish pub warmth, northern suburbs screens. Molly Malone's brings a communal deck.",
      "v4-body",
    ),
    textBlock("Best for: Social rugby and soccer in Fourways.", "v4-best", {
      listItem: "bullet",
    }),
    linkedLine(
      "View Molly Malone's Fourways on LeagueSports",
      "v4-view",
      "https://leaguesports.co.za/venues/molly-malones-fourways",
      "bullet",
    ),
    heading(
      "h3",
      "5. Founders at Giles, Craighall Park",
      "v5",
      "/venues/founders-at-giles",
    ),
    textBlock(
      "Neighbourhood local, calmer screens. When you want cricket without stadium noise.",
      "v5-body",
    ),
    textBlock("Best for: Relaxed cricket and midweek soccer.", "v5-best", {
      listItem: "bullet",
    }),
    linkedLine(
      "View Founders at Giles on LeagueSports",
      "v5-view",
      "/venues/founders-at-giles",
      "bullet",
    ),
    heading("h2", "FAQs", "faqs"),
    heading("h3", "Best for Springboks?", "faq1"),
    textBlock("The Troyeville for hardcore rugby locals.", "faq1-body"),
    heading("h2", "Find a screening venue", "find"),
    textBlock("Ready to pick a bar?", "find-body"),
  ];
}

describe("splitGuideVenueHook", () => {
  it("keeps the first sentence when it fits the scan line", () => {
    const split = splitGuideVenueHook(
      "Multi-screen sports bar energy in Rosebank. Bench Warmers is the classic blast.",
    );
    assert.equal(split.hook, "Multi-screen sports bar energy in Rosebank.");
    assert.equal(split.rest, "Bench Warmers is the classic blast.");
    assert.ok(split.hook.length <= GUIDE_VENUE_HOOK_MAX);
  });

  it("cuts a long sentence and keeps the full paragraph for the blurb", () => {
    const paragraph = `Word `.repeat(40).trim();
    const split = splitGuideVenueHook(paragraph);
    assert.ok(split.hook.length <= GUIDE_VENUE_HOOK_MAX + 1);
    assert.equal(split.rest, paragraph);
  });
});

describe("parseWatchGuideVenueCards", () => {
  it("lifts Best for chips and upcoming above the venue cards", () => {
    const parsed = parseWatchGuideVenueCards(pilotBody());
    assert.equal(parsed.status, "ready");
    if (parsed.status !== "ready") return;

    assert.equal(parsed.bestFor?.id, "best-for");
    assert.equal(parsed.bestFor?.title, "Best for");
    assert.equal(parsed.bestFor?.items.length, 2);

    assert.equal(parsed.upcoming?.id, "upcoming-on-leaguesports");
    assert.equal(
      parsed.upcoming?.intro,
      "Big fixtures coming up — open the event.",
    );
    assert.deepEqual(
      parsed.upcoming?.fixtures.map((item) => item.href),
      ["/events/stormers-vs-bulls-urc-2026", "/events/proteas-vs-india-odi-2026"],
    );
    assert.equal(parsed.upcoming?.seeAllHref, "/events");

    assert.equal(parsed.venues.length, 3);
    assert.equal(parsed.venues[0]?.name, "Bench Warmers");
    assert.equal(parsed.venues[0]?.suburb, "Rosebank");
    assert.equal(parsed.venues[0]?.anchorId, "rosebank");
    assert.equal(parsed.venues[0]?.slug, "benchwarmers-sports-bar");
    assert.equal(
      parsed.venues[0]?.hook,
      "Multi-screen sports bar energy in Rosebank.",
    );
    assert.equal(
      parsed.venues[0]?.bestFor,
      "F1 race weekends and Springboks Tests.",
    );
    assert.equal(parsed.venues[0]?.blurb.includes("Open venue"), false);
    assert.equal(parsed.venues[0]?.blurb.includes("View "), false);

    assert.equal(parsed.venues[1]?.anchorId, "fourways");
    assert.equal(parsed.venues[1]?.slug, "molly-malones-fourways");
    assert.equal(parsed.venues[1]?.blurb.includes("LeagueSports"), false);

    assert.equal(parsed.venues[2]?.suburb, "Craighall Park");
    assert.equal(parsed.venues[2]?.anchorId, null);
    assert.equal(parsed.venues[2]?.slug, "founders-at-giles");

    const leadText = parsed.lead
      .map((block) =>
        "children" in block && Array.isArray(block.children)
          ? block.children
              .map((child) =>
                child && typeof child === "object" && "text" in child
                  ? String((child as { text?: string }).text ?? "")
                  : "",
              )
              .join("")
          : "",
      )
      .join("\n");
    assert.match(leadText, /Jump to: Rosebank/);
    assert.match(leadText, /Pick a suburb below/);
    assert.equal(leadText.includes("Bench Warmers"), false);
    assert.equal(leadText.includes("Springboks:"), false);

    const tailText = parsed.tail
      .map((block) =>
        "children" in block && Array.isArray(block.children)
          ? block.children
              .map((child) =>
                child && typeof child === "object" && "text" in child
                  ? String((child as { text?: string }).text ?? "")
                  : "",
              )
              .join("")
          : "",
      )
      .join("\n");
    assert.match(tailText, /Best for Springboks\?/);
    assert.match(tailText, /Find a screening venue/);
    assert.equal(tailText.includes("View Molly"), false);
  });

  it("still parses when upcoming sits after the venues", () => {
    const blocks: TypedObject[] = [
      textBlock("Intro.", "intro"),
      heading("h2", "Rosebank", "rosebank"),
      heading("h3", "1. Bench Warmers, Rosebank", "v1", "/venues/benchwarmers-sports-bar"),
      textBlock("Screens everywhere. Loud on big nights.", "v1-body"),
      linkedLine(
        "View Bench Warmers on LeagueSports",
        "v1-view",
        "/venues/benchwarmers-sports-bar",
        "bullet",
      ),
      heading("h2", "Upcoming on LeagueSports", "upcoming"),
      linkedLine("Stormers vs Bulls (URC)", "fx", "/events/stormers-vs-bulls-urc-2026", "bullet"),
      heading("h2", "FAQs", "faqs"),
      textBlock("Book ahead.", "faq"),
    ];
    const parsed = parseWatchGuideVenueCards(blocks);
    assert.equal(parsed.status, "ready");
    if (parsed.status !== "ready") return;
    assert.equal(parsed.upcoming?.fixtures.length, 1);
    assert.equal(parsed.venues[0]?.slug, "benchwarmers-sports-bar");
    assert.equal(parsed.bestFor, null);
    assert.match(parsed.notes.join(" "), /No Best for/);
  });

  it("keeps a venue name with no slug and no link", () => {
    const parsed = parseWatchGuideVenueCards([
      heading("h2", "Rosebank", "rosebank"),
      heading("h3", "1. Quiet Bar, Rosebank", "v1"),
      textBlock("A calmer room.", "body"),
    ]);
    assert.equal(parsed.status, "ready");
    if (parsed.status !== "ready") return;
    assert.equal(parsed.venues[0]?.slug, null);
    assert.equal(parsed.venues[0]?.name, "Quiet Bar");
  });

  it("stops when one venue points at two slugs", () => {
    const parsed = parseWatchGuideVenueCards([
      heading("h3", "1. Bench Warmers, Rosebank", "v1", "/venues/benchwarmers-sports-bar"),
      textBlock("Screens everywhere.", "body"),
      linkedLine("Open venue →", "cta", "/venues/somewhere-else"),
    ]);
    assert.equal(parsed.status, "skip");
    if (parsed.status !== "skip") return;
    assert.match(parsed.reason, /Conflicting venue links/);
  });

  it("leaves ordinary guides alone", () => {
    const parsed = parseWatchGuideVenueCards([
      heading("h2", "Courts", "a"),
      textBlock("Book ahead.", "b"),
      heading("h2", "Pricing", "c"),
      textBlock("Peak rates.", "d"),
    ]);
    assert.equal(parsed.status, "skip");
  });
});

describe("carto map thumb", () => {
  it("builds a dark CARTO tile and a fraction inside that tile", () => {
    const url = cartoDarkTileUrl(-26.1306542, 28.0496232);
    assert.match(url, /^https:\/\/[abcd]\.basemaps\.cartocdn\.com\/dark_all\/15\/\d+\/\d+@2x\.png$/);
    const fraction = tilePixelFraction(-26.1306542, 28.0496232);
    assert.ok(fraction.x >= 0 && fraction.x < 1);
    assert.ok(fraction.y >= 0 && fraction.y < 1);
  });
});
