import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activityDisplayName,
  activityQuerySlugs,
  activitySupportsIntent,
  buildIntentActivity,
  isAllowlistedActivitySlug,
} from "./activity.ts";
import {
  intentBrowseTitle,
  intentDetailDescription,
  intentDetailFaqs,
  intentDetailHeading,
  intentDetailTitle,
  watchCityHubFaqs,
} from "./copy.ts";
import {
  buildIntentEnrichment,
  buildIntentIntroParagraphs,
  resolveIntentIndexPolicy,
} from "./enrichment.ts";
import { buildIntentJsonLd } from "./jsonLd.ts";
import { intentOrDirectoryHref, intentPath } from "./paths.ts";
import { resolveIntentRoute } from "./routes.ts";

describe("intentPath", () => {
  it("builds watch and play landings", () => {
    assert.equal(intentPath("watch"), "/watch");
    assert.equal(intentPath("play", "padel"), "/play/padel");
    assert.equal(intentPath("watch", "f1", "midrand"), "/watch/f1/midrand");
    assert.equal(intentPath("play", "pool", "fourways"), "/play/pool/fourways");
  });
});

describe("intentOrDirectoryHref", () => {
  it("prefers SEO paths when intent and sport are present", () => {
    assert.equal(
      intentOrDirectoryHref({
        intent: "watch",
        sport: "f1",
        location: "midrand",
      }),
      "/watch/f1/midrand",
    );
    assert.equal(
      intentOrDirectoryHref({ intent: "play", sport: "padel" }),
      "/play/padel",
    );
  });

  it("keeps location-only filters on the venues directory", () => {
    assert.equal(
      intentOrDirectoryHref({ intent: "watch", location: "fourways" }),
      "/venues?intent=watch&location=fourways",
    );
  });
});

describe("resolveIntentRoute", () => {
  it("parses landing, browse, and detail segments", () => {
    assert.deepEqual(resolveIntentRoute(undefined), { kind: "landing" });
    assert.deepEqual(resolveIntentRoute([]), { kind: "landing" });
    assert.deepEqual(resolveIntentRoute(["f1"]), {
      kind: "browse",
      activitySlug: "f1",
    });
    assert.deepEqual(resolveIntentRoute(["F1", "Midrand"]), {
      kind: "detail",
      activitySlug: "f1",
      locationSlug: "midrand",
    });
  });

  it("rejects extra path segments", () => {
    assert.deepEqual(resolveIntentRoute(["f1", "midrand", "extra"]), {
      kind: "not-found",
    });
    assert.deepEqual(resolveIntentRoute(["padel", "fourways", "a", "b"]), {
      kind: "not-found",
    });
  });
});

describe("activityQuerySlugs", () => {
  it("maps series aliases onto parent sports", () => {
    assert.ok(activityQuerySlugs("f1").includes("motorsport"));
    assert.ok(activityQuerySlugs("premier-league").includes("soccer"));
    assert.ok(activityQuerySlugs("six-nations").includes("rugby"));
    assert.deepEqual(activityQuerySlugs("padel"), ["padel", "paddle"]);
  });
});


describe("activity allowlist", () => {
  it("allowlists catalog sports and series aliases only", () => {
    assert.equal(isAllowlistedActivitySlug("padel"), true);
    assert.equal(isAllowlistedActivitySlug("f1"), true);
    assert.equal(isAllowlistedActivitySlug("premier-league"), true);
    assert.equal(isAllowlistedActivitySlug("golf"), true);
    assert.equal(isAllowlistedActivitySlug("indoor-golf"), true);
    assert.equal(isAllowlistedActivitySlug("driving-range"), true);
    assert.equal(isAllowlistedActivitySlug("casino"), false);
    assert.equal(isAllowlistedActivitySlug("anything"), false);
  });

  it("rejects play-only sports for watch intent", () => {
    const golf = buildIntentActivity({ slug: "golf" });
    const f1 = buildIntentActivity({ slug: "f1" });
    assert.equal(activitySupportsIntent(golf, "play"), true);
    assert.equal(activitySupportsIntent(golf, "watch"), false);
    assert.equal(activitySupportsIntent(f1, "watch"), true);
    assert.equal(activitySupportsIntent(f1, "play"), false);
  });
});

describe("buildIntentActivity", () => {
  it("keeps Formula 1 display names for f1 URLs", () => {
    const activity = buildIntentActivity({ slug: "f1" });
    assert.equal(activity.kind, "series");
    assert.equal(activity.name, "Formula 1");
    assert.equal(activity.sportSlug, "motorsport");
    assert.equal(activityDisplayName("padel"), "Padel");
  });
});

describe("intent copy", () => {
  it("builds conversion-focused titles and descriptions", () => {
    assert.equal(
      intentDetailTitle("watch", "Formula 1", "Midrand"),
      "Watch Formula 1 in Midrand",
    );
    assert.equal(
      intentDetailHeading("watch", "Formula 1", "Midrand"),
      "Watch Formula 1 in Midrand",
    );
    assert.equal(
      intentDetailTitle("play", "Padel", "Fourways"),
      "Play Padel in Fourways",
    );
    assert.match(
      intentDetailDescription("watch", "Formula 1", "Midrand", 3),
      /3 venues/,
    );
    assert.match(
      intentDetailDescription("watch", "Formula 1", "Midrand", 3, {
        amenityHint: "2 with big screens.",
      }),
      /big screens/,
    );
    assert.equal(
      intentBrowseTitle("play", "Padel"),
      "Play Padel near you",
    );
  });

  it("builds FAQ answers that mention venue count", () => {
    const faqs = intentDetailFaqs({
      intent: "watch",
      activity: buildIntentActivity({ slug: "f1", name: "Formula 1" }),
      locationTitle: "Midrand",
      venueCount: 2,
    });
    assert.equal(faqs.length, 3);
    assert.match(faqs[0]?.answer ?? "", /2 venues/);
  });

  it("adds rugby near-me FAQs on the Johannesburg watch hub only", () => {
    const joburg = intentDetailFaqs({
      intent: "watch",
      activity: buildIntentActivity({ slug: "rugby", name: "Rugby" }),
      locationTitle: "Johannesburg",
      locationSlug: "johannesburg",
      venueCount: 4,
    });
    assert.equal(joburg.length, 5);
    assert.ok(joburg.some((faq) => /rugby near me/i.test(faq.question)));
    assert.ok(joburg.some((faq) => /sports bars near me/i.test(faq.question)));
    assert.match(
      joburg.map((faq) => faq.answer).join(" "),
      /\/guides\/where-to-watch-rugby-johannesburg/,
    );
    assert.match(
      joburg.map((faq) => faq.answer).join(" "),
      /\/guides\/best-sports-bars-johannesburg/,
    );

    const sandton = intentDetailFaqs({
      intent: "watch",
      activity: buildIntentActivity({ slug: "rugby", name: "Rugby" }),
      locationTitle: "Sandton",
      locationSlug: "sandton",
      venueCount: 2,
    });
    assert.equal(sandton.length, 3);
  });

  it("adds sports-bar and rugby near-me FAQs on the Joburg city watch hub", () => {
    const faqs = watchCityHubFaqs({
      cityTitle: "Johannesburg",
      citySlug: "johannesburg",
      venueCount: 6,
    });
    assert.equal(faqs.length, 5);
    assert.ok(faqs.some((faq) => /sports bars near me/i.test(faq.question)));
    assert.ok(faqs.some((faq) => /watch rugby near me/i.test(faq.question)));

    const capeTown = watchCityHubFaqs({
      cityTitle: "Cape Town",
      citySlug: "cape-town",
      venueCount: 2,
    });
    assert.equal(capeTown.length, 3);
  });
});

describe("intent enrichment", () => {
  const sampleVenues = [
    {
      name: "Alpha Bar",
      has_big_screens: true,
      has_live_audio: true,
      has_parking: true,
      is_verified: true,
      rating: 4.5,
      hero_image: { asset: { _ref: "image-abc" } },
      upcoming_screenings: [
        {
          title: "F1 Qualifying",
          startsAt: new Date(Date.now() + 86_400_000).toISOString(),
        },
      ],
    },
    {
      name: "Beta Club",
      has_big_screens: true,
      has_parking: false,
      is_verified: false,
      upcoming_screenings: [],
    },
  ];

  it("aggregates amenity and screening signals", () => {
    const enrichment = buildIntentEnrichment("watch", sampleVenues);
    assert.ok(enrichment.amenityStats.some((stat) => /big screens/.test(stat.label)));
    assert.equal(enrichment.verifiedCount, 1);
    assert.equal(enrichment.screeningHighlights.length, 1);
    assert.equal(enrichment.screeningHighlights[0]?.title, "F1 Qualifying");
  });

  it("noindexes empty and city-fallback pages", () => {
    assert.deepEqual(
      resolveIntentIndexPolicy({
        locationSlug: "midrand",
        parentSlug: "johannesburg",
        venueCount: 0,
        usedCityFallback: false,
      }),
      {
        indexable: false,
        canonicalLocationSlug: "midrand",
        reason: "empty",
      },
    );
    assert.deepEqual(
      resolveIntentIndexPolicy({
        locationSlug: "midrand",
        parentSlug: "johannesburg",
        venueCount: 3,
        usedCityFallback: true,
      }),
      {
        indexable: false,
        canonicalLocationSlug: "johannesburg",
        reason: "city-fallback",
      },
    );
    assert.equal(
      resolveIntentIndexPolicy({
        locationSlug: "midrand",
        parentSlug: "johannesburg",
        venueCount: 2,
        usedCityFallback: false,
      }).indexable,
      true,
    );
  });

  it("builds unique intro paragraphs from CMS signals", () => {
    const enrichment = buildIntentEnrichment("watch", sampleVenues);
    const paragraphs = buildIntentIntroParagraphs({
      intent: "watch",
      activity: buildIntentActivity({ slug: "f1", name: "Formula 1" }),
      locationTitle: "Midrand",
      venueCount: 2,
      usedCityFallback: false,
      enrichment,
    });
    assert.equal(paragraphs.length, 2);
    assert.match(paragraphs[0] ?? "", /watch Formula 1 in Midrand/i);
    assert.match(paragraphs[1] ?? "", /address and amenities/i);
    assert.doesNotMatch(paragraphs.join(" "), /big screens|verified listing|upcoming/i);
  });
});

describe("buildIntentJsonLd", () => {
  it("includes CollectionPage, ItemList, FAQ, and breadcrumbs", () => {
    const jsonLd = buildIntentJsonLd({
      intent: "watch",
      title: "Watch Formula 1 in Midrand",
      description: "Find venues screening Formula 1 in Midrand.",
      activitySlug: "f1",
      activityName: "Formula 1",
      locationSlug: "midrand",
      locationTitle: "Midrand",
      venues: [{ name: "Test Bar", slug: "test-bar" }],
      faqs: [
        {
          question: "Where can I watch Formula 1 in Midrand?",
          answer: "Two venues nearby.",
        },
      ],
      siteUrl: "https://leaguesports.co.za",
    });

    const types = jsonLd["@graph"].map((node) => node["@type"]);
    assert.ok(types.includes("BreadcrumbList"));
    assert.ok(types.includes("CollectionPage"));
    assert.ok(types.includes("ItemList"));
    assert.ok(types.includes("FAQPage"));

    const faqPage = jsonLd["@graph"].find(
      (node) => node["@type"] === "FAQPage",
    ) as {
      mainEntity: { acceptedAnswer: { text: string } }[];
    };
    const linked = buildIntentJsonLd({
      intent: "watch",
      title: "Watch Rugby in Johannesburg",
      description: "Find venues screening rugby in Johannesburg.",
      activitySlug: "rugby",
      activityName: "Rugby",
      locationSlug: "johannesburg",
      locationTitle: "Johannesburg",
      faqs: intentDetailFaqs({
        intent: "watch",
        activity: buildIntentActivity({ slug: "rugby", name: "Rugby" }),
        locationTitle: "Johannesburg",
        locationSlug: "johannesburg",
        venueCount: 4,
      }),
      siteUrl: "https://leaguesports.co.za",
    });
    const linkedFaq = linked["@graph"].find(
      (node) => node["@type"] === "FAQPage",
    ) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    const nearMe = linkedFaq.mainEntity.find((entity) =>
      /rugby near me/i.test(entity.name),
    );
    assert.match(nearMe?.acceptedAnswer.text ?? "", /where to watch rugby in Johannesburg/);
    assert.doesNotMatch(nearMe?.acceptedAnswer.text ?? "", /\]\(/);
    assert.ok(faqPage);

    const crumbs = jsonLd["@graph"].find(
      (node) => node["@type"] === "BreadcrumbList",
    ) as {
      itemListElement: { name: string; item: string }[];
    };
    assert.equal(crumbs.itemListElement.at(-1)?.item, "https://leaguesports.co.za/watch/f1/midrand");
  });
});
