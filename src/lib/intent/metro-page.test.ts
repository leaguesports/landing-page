import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildIntentActivity } from "./activity.ts";
import { intentDetailFaqs } from "./copy.ts";
import {
  buildIntentEnrichment,
  buildIntentIntroParagraphs,
  metroIntroParagraphs,
} from "./enrichment.ts";
import { buildIntentJsonLd } from "./jsonLd.ts";
import {
  METRO_PAGE_QUERY,
  METRO_PAGE_UNIQUE_MESSAGE,
  METRO_PAGE_UNIQUENESS_QUERY,
  metroActivitySlugCandidates,
  metroPageHeading,
  pickMetroPage,
  resolveMetroPageSeo,
  validateMetroPageUnique,
  type MetroPageRow,
} from "./metro-page.ts";
import {
  metroRelatedLinks,
  watchCalendarSideLinks,
  watchRelatedGuides,
} from "./watch-screenings.ts";

const f1 = buildIntentActivity({ slug: "f1", name: "Formula 1" });
const motorsport = buildIntentActivity({ slug: "motorsport", name: "Motorsport" });
const premierLeague = buildIntentActivity({
  slug: "premier-league",
  name: "Premier League",
});
const soccer = buildIntentActivity({ slug: "soccer", name: "Soccer" });
const padel = buildIntentActivity({ slug: "padel", name: "Padel" });
const rugby = buildIntentActivity({ slug: "rugby", name: "Rugby" });

const rugbyDoc: MetroPageRow = {
  _id: "metro-rugby-jhb",
  intent: "watch",
  activitySlug: "rugby",
  citySlug: "johannesburg",
  h1: "Watch rugby in Johannesburg",
  intro: ["  Ellis Park corridor pubs.  ", ""],
  bestFor: "Best for: Ellis Park on Test days.",
  faq: [
    {
      question: "Where should I watch Springboks Tests in Joburg?",
      answer: "The Troyeville, then [Events](/events).",
    },
    { question: " ", answer: "dropped" },
  ],
  relatedLinks: [
    {
      href: "/guides/where-to-watch-rugby-johannesburg",
      label: "Where to Watch Rugby in Johannesburg",
    },
    { href: "/events", label: "Upcoming fixtures" },
    { href: "https://evil.example/phish", label: "Nope" },
  ],
  metadata: {
    description: "Watch rugby in Johannesburg — Troyeville and Illovo.",
    ogTitle: "Watch rugby in Johannesburg | LeagueSports",
    ogDescription: "Ellis Park to Fourways.",
  },
};

describe("metro activity and city matching", () => {
  it("keeps series pages off the parent sport, and spellings on the same page", () => {
    assert.deepEqual(metroActivitySlugCandidates(f1).sort(), ["f1", "formula-1"]);
    assert.deepEqual(metroActivitySlugCandidates(motorsport), ["motorsport"]);
    assert.deepEqual(metroActivitySlugCandidates(premierLeague), ["premier-league"]);
    assert.deepEqual(metroActivitySlugCandidates(soccer).sort(), ["football", "soccer"]);
    assert.deepEqual(metroActivitySlugCandidates(padel).sort(), ["paddle", "padel"]);
  });

  it("matches johannesburg when the page slug is joburg, and prefers the canonical doc", () => {
    const alias: MetroPageRow = {
      ...rugbyDoc,
      _id: "metro-rugby-joburg",
      citySlug: "joburg",
      h1: "Alias heading",
    };
    const picked = pickMetroPage([alias, rugbyDoc], rugby, "joburg");
    assert.equal(picked?.h1, "Watch rugby in Johannesburg");
    assert.deepEqual(picked?.intro, ["Ellis Park corridor pubs."]);
    assert.equal(picked?.bestFor, "Best for: Ellis Park on Test days.");
  });

  it("does not let an f1 doc satisfy motorsport, or a draft satisfy anyone", () => {
    const f1Doc: MetroPageRow = {
      _id: "metro-f1",
      activitySlug: "f1",
      citySlug: "johannesburg",
      h1: "Watch F1 in Johannesburg",
    };
    const motorsportDoc: MetroPageRow = {
      _id: "metro-motorsport",
      activitySlug: "motorsport",
      citySlug: "johannesburg",
      h1: "Watch motorsport in Johannesburg",
    };
    assert.equal(pickMetroPage([motorsportDoc], f1, "johannesburg"), null);
    assert.equal(pickMetroPage([f1Doc], motorsport, "johannesburg"), null);
    assert.equal(
      pickMetroPage([f1Doc], f1, "johannesburg")?.h1,
      "Watch F1 in Johannesburg",
    );
    assert.equal(
      pickMetroPage(
        [{ ...rugbyDoc, _id: "drafts.metro-rugby-jhb" }],
        rugby,
        "johannesburg",
      ),
      null,
    );
  });

  it("falls back when nothing matches", () => {
    assert.equal(pickMetroPage([], rugby, "johannesburg"), null);
    assert.equal(pickMetroPage(null, rugby, "cape-town"), null);
  });
});

describe("metro copy overrides and template fallback", () => {
  const enrichment = buildIntentEnrichment("watch", []);

  it("uses metro intro and bestFor, and keeps the template when they are empty", () => {
    const fromCms = buildIntentIntroParagraphs({
      intent: "watch",
      activity: rugby,
      locationTitle: "Johannesburg",
      venueCount: 4,
      usedCityFallback: false,
      enrichment,
      metro: rugbyDoc,
    });
    assert.deepEqual(fromCms, [
      "Ellis Park corridor pubs.",
      "Best for: Ellis Park on Test days.",
    ]);
    assert.deepEqual(metroIntroParagraphs(rugbyDoc), fromCms);

    const fallback = buildIntentIntroParagraphs({
      intent: "watch",
      activity: rugby,
      locationTitle: "Johannesburg",
      venueCount: 4,
      usedCityFallback: false,
      enrichment,
      metro: { intro: ["  "], bestFor: "  " },
    });
    assert.match(fallback[0] ?? "", /watch Rugby in Johannesburg/i);
    assert.equal(metroIntroParagraphs({ intro: [], bestFor: null }), null);

    const bestForOnly = buildIntentIntroParagraphs({
      intent: "play",
      activity: padel,
      locationTitle: "Johannesburg",
      venueCount: 21,
      usedCityFallback: false,
      enrichment: buildIntentEnrichment("play", []),
      metro: { intro: [], bestFor: "Best for: Sandton weekday evenings." },
    });
    assert.match(bestForOnly[0] ?? "", /play Padel in Johannesburg/i);
    assert.equal(bestForOnly.at(-1), "Best for: Sandton weekday evenings.");
  });

  it("replaces FAQs and FAQPage JSON-LD, and keeps the rugby near-me template otherwise", () => {
    const cmsFaqs = intentDetailFaqs({
      intent: "watch",
      activity: rugby,
      locationTitle: "Johannesburg",
      locationSlug: "johannesburg",
      venueCount: 4,
      metroFaqs: rugbyDoc.faq,
    });
    assert.equal(cmsFaqs.length, 1);
    assert.equal(
      cmsFaqs[0]?.question,
      "Where should I watch Springboks Tests in Joburg?",
    );
    assert.doesNotMatch(cmsFaqs.map((faq) => faq.question).join(" "), /near me/i);

    const jsonLd = buildIntentJsonLd({
      intent: "watch",
      title: "Watch rugby in Johannesburg",
      description: "Bars",
      activitySlug: "rugby",
      activityName: "Rugby",
      locationSlug: "johannesburg",
      locationTitle: "Johannesburg",
      faqs: cmsFaqs,
      siteUrl: "https://leaguesports.co.za",
    });
    const faqPage = jsonLd["@graph"].find((node) => node["@type"] === "FAQPage") as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    assert.equal(faqPage.mainEntity.length, 1);
    assert.match(faqPage.mainEntity[0]?.acceptedAnswer.text ?? "", /Troyeville/);
    assert.doesNotMatch(faqPage.mainEntity[0]?.acceptedAnswer.text ?? "", /\]\(/);

    const fallback = intentDetailFaqs({
      intent: "watch",
      activity: rugby,
      locationTitle: "Johannesburg",
      locationSlug: "johannesburg",
      venueCount: 4,
      metroFaqs: [],
    });
    assert.equal(fallback.length, 5);
    assert.ok(fallback.some((faq) => /rugby near me/i.test(faq.question)));
  });

  it("uses metro related links, including /events, and falls back to the hardcoded pack", () => {
    const links = watchRelatedGuides("rugby", "joburg", rugbyDoc.relatedLinks);
    assert.deepEqual(
      links.map((link) => link.href),
      ["/guides/where-to-watch-rugby-johannesburg", "/events"],
    );
    assert.deepEqual(metroRelatedLinks(rugbyDoc.relatedLinks), links);
    assert.equal(watchCalendarSideLinks("rugby", "johannesburg", rugbyDoc.relatedLinks).crossSport?.href, "/events");

    assert.deepEqual(
      watchRelatedGuides("rugby", "johannesburg").map((link) => link.href),
      [
        "/guides/where-to-watch-rugby-johannesburg",
        "/guides/best-sports-bars-johannesburg",
      ],
    );
    assert.deepEqual(watchRelatedGuides("soccer", "cape-town", []), [
      {
        href: "/guides/best-sports-bars-cape-town",
        label: "Best Sports Bars in Cape Town",
      },
    ]);
  });

  it("applies h1 and metadata when present and leaves the rest on the template", () => {
    assert.equal(
      metroPageHeading("Watch Rugby in Johannesburg", rugbyDoc.h1),
      "Watch rugby in Johannesburg",
    );
    assert.equal(
      metroPageHeading("Watch Rugby in Johannesburg", "  "),
      "Watch Rugby in Johannesburg",
    );
    const seo = resolveMetroPageSeo({
      fallbackTitle: "Watch Rugby in Johannesburg",
      fallbackDescription: "Find 4 venues.",
      metadata: rugbyDoc.metadata,
    });
    assert.equal(seo.title, "Watch Rugby in Johannesburg");
    assert.equal(seo.titleMode, "template");
    assert.equal(seo.description, "Watch rugby in Johannesburg — Troyeville and Illovo.");
    assert.equal(seo.ogTitle, "Watch rugby in Johannesburg | LeagueSports");
    assert.equal(seo.ogDescription, "Ellis Park to Fourways.");

    const branded = resolveMetroPageSeo({
      fallbackTitle: "Play Padel in Johannesburg",
      fallbackDescription: "Find courts.",
      metadata: { title: "Play padel in Johannesburg | LeagueSports" },
    });
    assert.equal(branded.titleMode, "absolute");
    assert.equal(branded.ogTitle, "Play padel in Johannesburg | LeagueSports");
  });
});

describe("metroPage query", () => {
  it("reads published docs and coalesces null arrays", () => {
    assert.match(METRO_PAGE_QUERY, /!\(_id in path\("drafts\.\*\*"\)\)/);
    assert.match(METRO_PAGE_QUERY, /coalesce\(intro, \[\]\)/);
    assert.match(METRO_PAGE_QUERY, /coalesce\(faq\[\]/);
    assert.match(METRO_PAGE_QUERY, /coalesce\(relatedLinks\[\]/);
    assert.match(METRO_PAGE_UNIQUENESS_QUERY, /^coalesce\(count\(/);
    assert.equal(
      METRO_PAGE_UNIQUE_MESSAGE,
      "A metro page for this intent, activity, and city already exists.",
    );
  });

  it("flags a duplicate intent + activity + city and ignores a null count", async () => {
    const calls: { query: string; params: Record<string, unknown> }[] = [];
    const context = {
      document: { _id: "drafts.metro-rugby-jhb" },
      getClient: () => ({
        fetch: async (query: string, params: Record<string, unknown>) => {
          calls.push({ query, params });
          return 1;
        },
      }),
    };
    const duplicate = await validateMetroPageUnique(
      { intent: "watch", activitySlug: "rugby", citySlug: "johannesburg" },
      context,
    );
    assert.equal(duplicate, METRO_PAGE_UNIQUE_MESSAGE);
    assert.equal(calls[0]?.params.id, "metro-rugby-jhb");
    assert.equal(calls[0]?.params.draftId, "drafts.metro-rugby-jhb");

    const clear = await validateMetroPageUnique(
      { intent: "watch", activitySlug: "rugby", citySlug: "johannesburg" },
      {
        document: { _id: "metro-rugby-jhb" },
        getClient: () => ({
          fetch: async () => null,
        }),
      },
    );
    assert.equal(clear, true);
    assert.equal(
      await validateMetroPageUnique({ intent: "watch" }, context),
      true,
    );
  });
});
