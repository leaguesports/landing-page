import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  golfNewHref,
  padelNewHref,
  venueQuickStartActivities,
} from "./quick-start.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";

function playableCourse(): GolfCourseCms {
  return {
    courseName: "Test",
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      strokeIndex: i + 1,
    })),
  };
}

function venue(
  partial: Partial<{
    slug: string;
    sports: string[];
    golfCourse: GolfCourseCms | null;
  }> & {
    sports: string[];
  },
) {
  return {
    slug: partial.slug ?? "court-one",
    sports: partial.sports,
    golfCourse: partial.golfCourse,
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

describe("golfNewHref", () => {
  it("returns the bare new-round path without a slug", () => {
    assert.equal(golfNewHref(), "/golf/new");
    assert.equal(golfNewHref("  "), "/golf/new");
  });

  it("encodes the venue slug as a query param", () => {
    assert.equal(
      golfNewHref("glendower-golf-club"),
      "/golf/new?venue=glendower-golf-club",
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

  it("offers golf when the venue has a playable golfCourse", () => {
    const activities = venueQuickStartActivities(
      venue({
        slug: "glendower",
        sports: ["golf"],
        golfCourse: playableCourse(),
      }),
    );
    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.id, "golf");
    assert.equal(activities[0]?.href, "/golf/new?venue=glendower");
    assert.equal(activities[0]?.cta, "Start golf round");
  });

  it("offers both padel and golf when both apply", () => {
    const activities = venueQuickStartActivities(
      venue({
        slug: "multi-club",
        sports: ["padel", "golf"],
        golfCourse: playableCourse(),
      }),
    );
    assert.deepEqual(
      activities.map((a) => a.id),
      ["padel", "golf"],
    );
  });

  it("ignores golf sport tags without playable hole data", () => {
    assert.deepEqual(
      venueQuickStartActivities(
        venue({
          slug: "golf-without-scorecard",
          sports: ["golf"],
          golfCourse: { holes: [] },
        }),
      ),
      [],
    );
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
