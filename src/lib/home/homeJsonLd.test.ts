import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildHomeJsonLd } from "./homeJsonLd.ts";

describe("buildHomeJsonLd", () => {
  it("includes Organization, WebSite, and WebPage nodes", () => {
    const jsonLd = buildHomeJsonLd("https://leaguesports.co.za");
    const types = jsonLd["@graph"].map((node) => node["@type"]);
    assert.deepEqual(types, ["Organization", "WebSite", "WebPage"]);
  });

  it("exposes a venue SearchAction", () => {
    const jsonLd = buildHomeJsonLd("https://leaguesports.co.za");
    const website = jsonLd["@graph"].find((node) => node["@type"] === "WebSite");
    assert.ok(website);
    const action = website.potentialAction as {
      "@type": string;
      target: { urlTemplate: string };
    };
    assert.equal(action["@type"], "SearchAction");
    assert.equal(
      action.target.urlTemplate,
      "https://leaguesports.co.za/venues?q={search_term_string}",
    );
  });
});
