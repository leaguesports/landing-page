import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { padelNewHref, venueQuickStartActivities } from "./quick-start.ts";

function venue(
  partial: Partial<{ slug: string; sports: string[] }> & {
    sports: string[];
  },
) {
  return {
    slug: partial.slug ?? "court-one",
    sports: partial.sports,
  };
}

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
      venue({
        slug: "padel-social-club",
        sports: ["tennis", "padel"],
      }),
    );
    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.id, "padel");
    assert.equal(activities[0]?.href, "/padel/new?venue=padel-social-club");
    assert.equal(activities[0]?.cta, "Start padel match");
  });

  it("accepts the paddle alias and a name-only padel tag", () => {
    const activities = venueQuickStartActivities(
      venue({ sports: ["paddle"] }),
    );
    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.sportSlug, "padel");
  });

  it("dedupes to a single padel activity", () => {
    const activities = venueQuickStartActivities(
      venue({ sports: ["padel", "paddle"] }),
    );
    assert.equal(activities.length, 1);
  });

  it("returns nothing for watch-only sports bars", () => {
    assert.deepEqual(
      venueQuickStartActivities(
        venue({
          slug: "tigers-milk",
          sports: ["rugby", "soccer"],
        }),
      ),
      [],
    );
  });

  it("returns nothing without a venue slug or padel sports", () => {
    assert.deepEqual(
      venueQuickStartActivities(venue({ slug: "  ", sports: ["padel"] })),
      [],
    );
    assert.deepEqual(venueQuickStartActivities(venue({ sports: [] })), []);
  });
});
