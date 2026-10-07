import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEventsItemListJsonLd,
  eventsHubFaqs,
  eventsHubKeywords,
  eventsHubLede,
} from "./hub-seo.ts";

describe("events hub copy", () => {
  it("names the sport, the city, and the fixtures on the list", () => {
    const lede = eventsHubLede({
      sportName: "Rugby",
      cityName: "Cape Town",
      titles: ["Springboks vs All Blacks", "Bulls vs Sharks"],
    });
    assert.match(lede, /rugby/);
    assert.match(lede, /Cape Town/);
    assert.match(lede, /Springboks vs All Blacks and Bulls vs Sharks/);
  });

  it("asks where to watch for the active filter", () => {
    const faqs = eventsHubFaqs({ sportName: "Rugby", cityName: "Cape Town" });
    assert.equal(faqs.length, 2);
    assert.match(faqs[1]?.question ?? "", /Cape Town/);
    assert.ok(eventsHubKeywords({ sportName: "Rugby", cityName: "Cape Town" }).includes("Rugby"));
  });

  it("builds an ItemList and skips slugs with spaces", () => {
    const jsonLd = buildEventsItemListJsonLd({
      name: "Rugby fixtures",
      siteUrl: "https://leaguesports.co.za/",
      fixtures: [
        { title: "Springboks vs All Blacks", slug: "springboks-vs-all-blacks" },
        { title: "Broken", slug: "has space" },
      ],
    });
    assert.equal(jsonLd["@type"], "ItemList");
    assert.equal(jsonLd.numberOfItems, 1);
    const items = jsonLd.itemListElement as Array<{ url: string; position: number }>;
    assert.equal(items[0]?.url, "https://leaguesports.co.za/events/springboks-vs-all-blacks");
    assert.equal(items[0]?.position, 1);
  });
});
