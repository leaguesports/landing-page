import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  venueAmenitiesDescription,
  venueAmenityShown,
  venueDetailMetaDescription,
  venueDetailNavLinks,
  venueFollowBlurb,
  venueHasBroadcasts,
  venueShowsAmenitiesSection,
  venueSportsSectionDescription,
  venueSupportsWatch,
  type VenueWatchChromeInput,
} from "./watch-chrome.ts";

const karting: VenueWatchChromeInput = {
  name: "Extreme Go Karting Tyger Valley",
  broadcasts: [],
  upcoming_screenings: [],
  sports: [{ name: "Karting", slug: "karting" }],
};

const sportsBar: VenueWatchChromeInput = {
  name: "Benchwarmers Sports Bar",
  broadcasts: [
    { _id: "soccer", name: "Soccer", slug: "soccer" },
    { _id: "rugby", name: "Rugby", slug: "rugby" },
  ],
  upcoming_screenings: [],
  sports: [],
  has_big_screens: true,
  has_live_audio: true,
  has_craft_drafts: true,
};

describe("venueSupportsWatch", () => {
  it("hides watch chrome for play-only karting venues", () => {
    assert.equal(venueSupportsWatch(karting), false);
    assert.equal(venueHasBroadcasts(karting), false);
  });

  it("keeps watch chrome when the venue broadcasts a sport", () => {
    assert.equal(venueSupportsWatch(sportsBar), true);
    assert.equal(venueSupportsWatch({ broadcasts: [], upcoming_screenings: [] }), false);
  });

  it("keeps watch chrome when upcoming screenings exist without broadcasts", () => {
    assert.equal(
      venueSupportsWatch({
        broadcasts: [],
        upcoming_screenings: [
          { title: "Sharks vs Stormers", startsAt: "2026-10-03T17:00:00+02:00" },
        ],
      }),
      true,
    );
  });

  it("ignores blank broadcast and screening rows", () => {
    assert.equal(
      venueSupportsWatch({
        broadcasts: [{ _id: "  ", name: "", slug: null }],
        upcoming_screenings: [{ title: "Derby", startsAt: "  " }, { title: "", startsAt: "tonight" }],
      }),
      false,
    );
  });
});

describe("venue detail copy", () => {
  it("does not imply screens or matchday for karting", () => {
    assert.equal(venueSportsSectionDescription(karting), "Play what's on offer");
    assert.equal(venueAmenitiesDescription(karting), "On-site facilities");
    assert.equal(
      venueFollowBlurb(karting),
      "Follow this venue to keep it on your list, or browse more places to play nearby.",
    );
    assert.equal(
      venueDetailMetaDescription(karting, "Bellville"),
      "Extreme Go Karting Tyger Valley in Bellville — where to play, amenities, and venue details on LeagueSports.",
    );
    assert.equal(venueShowsAmenitiesSection(karting), false);
  });

  it("keeps sports-bar screening copy when broadcasts exist", () => {
    assert.equal(
      venueSportsSectionDescription(sportsBar),
      "Watch and play what's on offer",
    );
    assert.equal(
      venueAmenitiesDescription(sportsBar),
      "Power, screens, and on-site facilities",
    );
    assert.match(venueFollowBlurb(sportsBar), /screenings/);
    assert.match(
      venueDetailMetaDescription(sportsBar, "Rosebank"),
      /screens, amenities, and matchday details/,
    );
    assert.equal(venueShowsAmenitiesSection(sportsBar), true);
  });

  it("shows play-venue amenities that are not broadcast chrome", () => {
    const withParking: VenueWatchChromeInput = {
      ...karting,
      has_parking: true,
      has_big_screens: true,
      has_live_audio: true,
    };
    assert.equal(venueShowsAmenitiesSection(withParking), true);
    assert.equal(venueAmenityShown("has_parking", true, false), true);
    assert.equal(venueAmenityShown("has_craft_drafts", true, false), true);
    assert.equal(venueAmenityShown("has_big_screens", true, false), false);
    assert.equal(venueAmenityShown("has_live_audio", true, false), false);
    assert.equal(venueAmenityShown("has_big_screens", true, true), true);
  });
});

describe("venueDetailNavLinks", () => {
  it("drops weekend and amenities jumps on a karting page", () => {
    const labels = venueDetailNavLinks({
      hasQuickStart: false,
      venue: karting,
    }).map((link) => link.label);
    assert.deepEqual(labels, [
      "About",
      "Match history",
      "Leaderboards",
      "Sports",
      "Location",
    ]);
  });

  it("keeps weekend and amenities jumps for a sports bar", () => {
    const labels = venueDetailNavLinks({
      hasQuickStart: true,
      venue: sportsBar,
    }).map((link) => link.label);
    assert.ok(labels.includes("This weekend"));
    assert.ok(labels.includes("Amenities"));
    assert.equal(labels[0], "Quick start");
  });
});
