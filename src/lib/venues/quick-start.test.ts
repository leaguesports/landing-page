import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { padelNewHref, venueQuickStartActivities } from "./quick-start.ts";

describe("padelNewHref", () => {
  it("returns the bare new-match path without a slug", () => {
    assert.equal(padelNewHref(), "/padel/new");
    assert.equal(padelNewHref("  "), "/padel/new");
  });

  it("encodes the venue slug as a query param", () => {
    assert.equal(
      padelNewHref("padel-lab-rivonia"),
      "/padel/new?venue=padel-lab-rivonia",
    );
    assert.equal(
      padelNewHref("padel & co"),
      `/padel/new?venue=${encodeURIComponent("padel & co")}`,
    );
  });
});

describe("venueQuickStartActivities", () => {
  it("offers padel when Play sports include padel", () => {
    const activities = venueQuickStartActivities(
      [
        { name: "Tennis", slug: "tennis" },
        { name: "Padel", slug: "padel" },
      ],
      "padel-social-club",
    );
    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.id, "padel");
    assert.equal(activities[0]?.href, "/padel/new?venue=padel-social-club");
    assert.equal(activities[0]?.cta, "Start padel match");
  });

  it("accepts the paddle alias and a missing slug", () => {
    const activities = venueQuickStartActivities(
      [{ name: "Paddle", slug: null }],
      "court-one",
    );
    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.sportSlug, "padel");
  });

  it("dedupes padel when both padel and paddle are listed", () => {
    const activities = venueQuickStartActivities(
      [
        { name: "Padel", slug: "padel" },
        { name: "Paddle", slug: "paddle" },
      ],
      "court-one",
    );
    assert.equal(activities.length, 1);
  });

  it("returns nothing for watch-only sports bars", () => {
    assert.deepEqual(
      venueQuickStartActivities(
        [
          { name: "Rugby", slug: "rugby" },
          { name: "Soccer", slug: "soccer" },
        ],
        "tigers-milk",
      ),
      [],
    );
  });

  it("returns nothing without a venue slug or sports", () => {
    assert.deepEqual(
      venueQuickStartActivities([{ name: "Padel", slug: "padel" }], "  "),
      [],
    );
    assert.deepEqual(venueQuickStartActivities([], "court"), []);
    assert.deepEqual(venueQuickStartActivities(null, "court"), []);
  });
});
