import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NAVBAR_SEARCH_START,
  navbarSearchSubmitHref,
  planNavbarSearch,
} from "./navbarSearch.ts";

describe("planNavbarSearch", () => {
  it("offers watch, play, and venues before a query is typed", () => {
    const hrefs = NAVBAR_SEARCH_START.map((item) => item.href);
    assert.ok(hrefs.includes("/watch"));
    assert.ok(hrefs.includes("/play"));
    assert.ok(hrefs.includes("/venues"));
    const plan = planNavbarSearch("   ");
    assert.equal(plan.submitHref, "/venues");
    assert.equal(plan.destination, null);
    assert.equal(plan.catalog.length, 0);
  });

  it("sends a play sport to play and still offers watch", () => {
    const plan = planNavbarSearch("padel");
    assert.equal(plan.submitHref, "/play/padel");
    assert.equal(plan.destination?.href, "/play/padel");
    assert.ok(plan.catalog.some((item) => item.href === "/watch/padel"));
    assert.equal(
      plan.catalog.some((item) => item.href === "/play/padel"),
      false,
    );
  });

  it("sends a watch sport to watch and still offers play", () => {
    const plan = planNavbarSearch("soccer");
    assert.equal(plan.submitHref, "/watch/soccer");
    assert.ok(plan.catalog.some((item) => item.href === "/play/soccer"));
  });

  it("keeps an explicit watch query on the screening landing", () => {
    const plan = planNavbarSearch("Watch soccer in Claremont");
    assert.equal(plan.submitHref, "/watch/soccer/claremont");
    assert.equal(plan.destination?.label, "Watch Soccer in Claremont");
    assert.equal(plan.nameSearch, null);
  });

  it("sends a suburb to the venue directory", () => {
    const plan = planNavbarSearch("Sandton");
    assert.equal(plan.submitHref, "/venues?location=sandton");
    assert.equal(plan.destination?.detail, "Suburb");
  });

  it("pairs a play sport with a suburb", () => {
    const plan = planNavbarSearch("padel sandton");
    assert.equal(plan.submitHref, "/play/padel/sandton");
  });

  it("treats a venue name as name search instead of a sport landing", () => {
    const plan = planNavbarSearch("Africa Padel");
    assert.equal(plan.destination, null);
    assert.equal(plan.submitHref, "/venues?q=Africa%20Padel");
    assert.match(plan.nameSearch?.label ?? "", /Africa Padel/);
  });

  it("routes motorsport and f1 to watch, not play", () => {
    const motorsport = planNavbarSearch("motorsport");
    assert.equal(motorsport.submitHref, "/watch/motorsport");
    assert.equal(
      motorsport.catalog.some((item) => item.href.startsWith("/play/")),
      false,
    );
    assert.equal(planNavbarSearch("f1").submitHref, "/watch/motorsport");
  });
});

describe("navbarSearchSubmitHref", () => {
  it("opens an exact venue name match", () => {
    assert.equal(
      navbarSearchSubmitHref("Africa Padel", [
        { name: "Africa Padel", slug: "africa-padel" },
      ]),
      "/venues/africa-padel",
    );
  });

  it("falls back to the planned href when no venue name matches", () => {
    assert.equal(
      navbarSearchSubmitHref("padel", [{ name: "Padel House", slug: "padel-house" }]),
      "/play/padel",
    );
  });

  it("sends an empty query to the venue hub", () => {
    assert.equal(navbarSearchSubmitHref("  "), "/venues");
  });
});
