import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GolfCourseCms } from "../../types/golf-round.ts";
import { venueDetailNavLinks } from "./watch-chrome.ts";
import {
  isFixtureSportLabel,
  isPlayResultsSportLabel,
  venueShowsFindFixtures,
  venueShowsLeaderboards,
  venueShowsMatchHistory,
  venueShowsPlaySports,
  venueShowsSportsSection,
  venueSupportsPlayResults,
  type VenuePlayChromeInput,
} from "./play-chrome.ts";

function playableCourse(): GolfCourseCms {
  return {
    holes: Array.from({ length: 9 }, (_, i) => ({
      number: i + 1,
      par: 4,
      strokeIndex: i + 1,
    })),
  };
}

const climbing: VenuePlayChromeInput = {
  sports: [{ name: "Climbing", slug: "climbing" }],
  broadcasts: [],
};

const karting: VenuePlayChromeInput = {
  sports: [{ name: "Karting", slug: "karting" }],
  broadcasts: [],
};

const padel: VenuePlayChromeInput = {
  sports: [{ name: "Padel", slug: "padel" }],
  broadcasts: [],
};

describe("venueSupportsPlayResults", () => {
  it("hides match history and leaderboards for climbing and karting", () => {
    assert.equal(venueSupportsPlayResults(climbing), false);
    assert.equal(venueShowsMatchHistory(climbing), false);
    assert.equal(venueShowsLeaderboards(climbing), false);
    assert.equal(venueSupportsPlayResults(karting), false);
    assert.equal(venueShowsMatchHistory(karting), false);
    assert.equal(venueShowsLeaderboards(karting), false);
    assert.equal(
      venueSupportsPlayResults({
        sports: [{ name: "Go Karting", slug: "go-karting" }],
      }),
      false,
    );
  });

  it("keeps them for linked padel, golf, and darts", () => {
    assert.equal(venueSupportsPlayResults(padel), true);
    assert.equal(venueShowsMatchHistory(padel), true);
    assert.equal(venueShowsLeaderboards(padel), true);
    assert.equal(
      venueSupportsPlayResults({
        sports: [{ name: "Golf", slug: "golf" }],
      }),
      true,
    );
    assert.equal(
      venueSupportsPlayResults({
        sports: [{ name: "Darts", slug: "darts" }],
      }),
      true,
    );
  });

  it("accepts padel and darts aliases and a playable golf course without a tag", () => {
    assert.equal(isPlayResultsSportLabel("paddle"), true);
    assert.equal(isPlayResultsSportLabel("dart"), true);
    assert.equal(isPlayResultsSportLabel("autodarts"), true);
    assert.equal(isPlayResultsSportLabel("ar-darts"), true);
    assert.equal(isPlayResultsSportLabel("climbing"), false);
    assert.equal(isPlayResultsSportLabel("indoor-golf"), false);
    assert.equal(
      venueSupportsPlayResults({ sports: ["paddle", "pool"] }),
      true,
    );
    assert.equal(
      venueSupportsPlayResults({
        sports: [{ name: "Climbing", slug: "climbing" }],
        golfCourse: playableCourse(),
      }),
      true,
    );
    assert.equal(
      venueSupportsPlayResults({
        sports: [{ name: "Indoor Golf", slug: "indoor-golf" }],
        golfCourse: { holes: [] },
      }),
      false,
    );
  });

  it("ignores watch broadcasts and blank sport rows", () => {
    assert.equal(
      venueSupportsPlayResults({
        sports: [],
        broadcasts: [
          { _id: "soccer", name: "Soccer", slug: "soccer" },
          { _id: "rugby", name: "Rugby", slug: "rugby" },
        ],
      }),
      false,
    );
    assert.equal(
      venueSupportsPlayResults({
        sports: [{ name: "  ", slug: null }, { name: "", slug: "  " }],
      }),
      false,
    );
  });
});

describe("venue sports section", () => {
  it("keeps climbing and karting chips and hides a section with no sports", () => {
    assert.equal(venueShowsPlaySports(climbing), true);
    assert.equal(venueShowsSportsSection(climbing), true);
    assert.equal(venueShowsPlaySports(karting), true);
    assert.equal(venueShowsSportsSection({ sports: [], broadcasts: [] }), false);
    assert.equal(
      venueShowsSportsSection({
        sports: [{ name: "", slug: " " }],
        broadcasts: [{ _id: " ", name: "", slug: null }],
      }),
      false,
    );
  });

  it("keeps the section for a sports bar that only broadcasts", () => {
    assert.equal(venueShowsPlaySports({ sports: [] }), false);
    assert.equal(
      venueShowsSportsSection({
        sports: [],
        broadcasts: [{ _id: "soccer", name: "Soccer", slug: "soccer" }],
      }),
      true,
    );
  });
});

describe("venueShowsFindFixtures", () => {
  it("hides fixture CTAs on climbing and karting unless the venue screens", () => {
    assert.equal(venueShowsFindFixtures(climbing, false), false);
    assert.equal(venueShowsFindFixtures(karting, false), false);
    assert.equal(venueShowsFindFixtures(padel, false), false);
    assert.equal(
      venueShowsFindFixtures(
        { sports: [{ name: "Golf", slug: "golf" }] },
        false,
      ),
      false,
    );
    assert.equal(
      venueShowsFindFixtures(
        { sports: [{ name: "Darts", slug: "darts" }] },
        false,
      ),
      false,
    );
    assert.equal(isFixtureSportLabel("karting"), false);
    assert.equal(isFixtureSportLabel("climbing"), false);
    assert.equal(venueShowsFindFixtures(climbing, true), true);
  });

  it("keeps fixture CTAs for events-list sports and watch venues", () => {
    assert.equal(isFixtureSportLabel("soccer"), true);
    assert.equal(isFixtureSportLabel("football"), true);
    assert.equal(isFixtureSportLabel("rugby"), true);
    assert.equal(isFixtureSportLabel("motorsport"), true);
    assert.equal(
      venueShowsFindFixtures(
        { sports: [{ name: "Soccer", slug: "soccer" }] },
        false,
      ),
      true,
    );
    assert.equal(
      venueShowsFindFixtures(
        {
          sports: [],
          broadcasts: [{ name: "Rugby", slug: "rugby" }],
        },
        false,
      ),
      true,
    );
  });
});

describe("venue detail nav", () => {
  it("drops match history and leaderboards on climbing and karting", () => {
    const labels = venueDetailNavLinks({
      hasQuickStart: false,
      venue: climbing,
    }).map((link) => link.label);
    assert.deepEqual(labels, ["About", "Sports", "Location"]);
    assert.deepEqual(
      venueDetailNavLinks({
        hasQuickStart: false,
        venue: karting,
      }).map((link) => link.label),
      ["About", "Sports", "Location"],
    );
  });

  it("keeps match history and leaderboards for padel", () => {
    const labels = venueDetailNavLinks({
      hasQuickStart: true,
      venue: padel,
    }).map((link) => link.label);
    assert.deepEqual(labels, [
      "Quick start",
      "About",
      "Match history",
      "Leaderboards",
      "Sports",
      "Location",
    ]);
  });

  it("drops the sports jump when a venue lists nothing", () => {
    const labels = venueDetailNavLinks({
      hasQuickStart: false,
      venue: { sports: [], broadcasts: [] },
    }).map((link) => link.label);
    assert.deepEqual(labels, ["About", "Location"]);
  });
});
