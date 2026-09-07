import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEventJsonLd,
  eventJsonLdPlaces,
  findEventJsonLdNode,
} from "./jsonLd.ts";

const INTRO = Array.from({ length: 50 }, (_, i) => `intro${i + 1}`).join(" ");

const FAQS = [
  {
    question: "Where can I watch this fixture in Johannesburg?",
    answer: Array.from({ length: 12 }, (_, i) => `watch${i + 1}`).join(" "),
  },
  {
    question: "What time does kickoff start in South Africa?",
    answer: Array.from({ length: 12 }, (_, i) => `time${i + 1}`).join(" "),
  },
  {
    question: "Which bars screen Springboks Tests in Cape Town?",
    answer: Array.from({ length: 12 }, (_, i) => `bars${i + 1}`).join(" "),
  },
];

describe("buildEventJsonLd", () => {
  it("emits SportsEvent + BreadcrumbList and omits fake location", () => {
    const jsonLd = buildEventJsonLd({
      title: "Springboks vs All Blacks",
      slug: "springboks-vs-all-blacks-2026-09-06",
      description: INTRO,
      startsAt: "2026-09-06T16:00:00.000Z",
      sportName: "Rugby",
      competition: "Rugby Championship",
      teams: [{ name: "Springboks" }, { name: "All Blacks" }],
    });

    const event = findEventJsonLdNode(jsonLd, "SportsEvent");
    const crumbs = findEventJsonLdNode(jsonLd, "BreadcrumbList");
    const faq = findEventJsonLdNode(jsonLd, "FAQPage");

    assert.equal(jsonLd["@context"], "https://schema.org");
    assert.equal(event?.["@type"], "SportsEvent");
    assert.equal(event?.name, "Springboks vs All Blacks");
    assert.equal(
      event?.url,
      "https://leaguesports.co.za/events/springboks-vs-all-blacks-2026-09-06",
    );
    assert.equal(event?.startDate, "2026-09-06T16:00:00.000Z");
    assert.equal(event?.sport, "Rugby");
    assert.equal(event?.superEvent?.name, "Rugby Championship");
    assert.equal(event?.competitor?.length, 2);
    assert.equal(event?.location, undefined);
    assert.equal(
      JSON.stringify(event ?? {}).includes("GeoCoordinates"),
      false,
    );
    assert.equal(crumbs?.itemListElement[1]?.name, "Events");
    assert.equal(crumbs?.itemListElement[2]?.item, event?.url);
    assert.equal(faq, undefined);
  });

  it("adds FAQPage when FAQs exist and real venues as Place location", () => {
    const jsonLd = buildEventJsonLd({
      title: "Springboks vs All Blacks",
      slug: "springboks-vs-all-blacks-2026-09-06",
      faqs: FAQS,
      hostVenue: {
        name: "Ellis Park",
        slug: "ellis-park",
        city: "Johannesburg",
      },
      screeningVenues: [
        { name: "The Local", slug: "the-local", city: "Cape Town" },
      ],
    });

    const faq = findEventJsonLdNode(jsonLd, "FAQPage");
    const event = findEventJsonLdNode(jsonLd, "SportsEvent");
    assert.equal(faq?.mainEntity.length, 3);
    assert.equal(faq?.mainEntity[0]?.name, FAQS[0]?.question);
    assert.ok(Array.isArray(event?.location));
    if (!Array.isArray(event?.location)) return;
    assert.equal(event.location[0]?.name, "Ellis Park");
    assert.equal(
      event.location[0]?.url,
      "https://leaguesports.co.za/venues/ellis-park",
    );
    assert.equal(event.location[0]?.address?.addressLocality, "Johannesburg");
    assert.equal(
      JSON.stringify(event.location).includes("latitude"),
      false,
    );
  });
});

describe("eventJsonLdPlaces", () => {
  it("drops venues without a real name and slug", () => {
    assert.deepEqual(
      eventJsonLdPlaces(
        {
          hostVenue: { name: "", slug: "missing" },
          screeningVenues: [{ name: "Fan Zone", slug: "" }],
        },
        "https://leaguesports.co.za",
      ),
      [],
    );
  });
});
