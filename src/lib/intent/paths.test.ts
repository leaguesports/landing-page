import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activityDisplayName,
  activityQuerySlugs,
  buildIntentActivity,
} from "./activity.ts";
import {
  intentBrowseTitle,
  intentDetailDescription,
  intentDetailFaqs,
  intentDetailTitle,
} from "./copy.ts";
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
});

describe("activityQuerySlugs", () => {
  it("maps series aliases onto parent sports", () => {
    assert.ok(activityQuerySlugs("f1").includes("motorsport"));
    assert.ok(activityQuerySlugs("premier-league").includes("soccer"));
    assert.ok(activityQuerySlugs("six-nations").includes("rugby"));
    assert.deepEqual(activityQuerySlugs("padel"), ["padel", "paddle"]);
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
      intentDetailTitle("play", "Padel", "Fourways"),
      "Play Padel in Fourways",
    );
    assert.match(
      intentDetailDescription("watch", "Formula 1", "Midrand", 3),
      /3 venues/,
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

    const crumbs = jsonLd["@graph"].find(
      (node) => node["@type"] === "BreadcrumbList",
    ) as {
      itemListElement: { name: string; item: string }[];
    };
    assert.equal(crumbs.itemListElement.at(-1)?.item, "https://leaguesports.co.za/watch/f1/midrand");
  });
});
