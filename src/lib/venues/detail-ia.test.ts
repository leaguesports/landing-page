import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasUpcomingScreenings,
  isPlayVenue,
  isWatchVenue,
  venueAmenitiesDescription,
  venueDetailChrome,
  venueDetailKind,
  venueDetailMetaDescription,
  venueDetailNavLinks,
  venueDetailSectionOrder,
  venueSportsSectionCopy,
  venueStayCloseCopy,
} from "./detail-ia.ts";

const padelCourt = {
  sports: [{ slug: "padel" }],
  broadcasts: [],
  upcoming_screenings: [],
};

const sportsBar = {
  sports: [],
  broadcasts: [{ slug: "soccer" }],
  upcoming_screenings: [],
};

const screeningPub = {
  sports: [],
  broadcasts: [],
  upcoming_screenings: [
    { title: "Saturday rugby", startsAt: "2026-09-19T15:00:00.000Z" },
  ],
};

const hybridClub = {
  sports: [{ slug: "padel" }],
  broadcasts: [{ slug: "rugby" }],
  upcoming_screenings: [],
};

describe("isWatchVenue", () => {
  it("is true when the venue broadcasts sports", () => {
    assert.equal(isWatchVenue(sportsBar), true);
  });

  it("is true when there is at least one upcoming screening", () => {
    assert.equal(isWatchVenue(screeningPub), true);
  });

  it("is false for play-only courts with no broadcasts or screenings", () => {
    assert.equal(isWatchVenue(padelCourt), false);
  });

  it("ignores empty or incomplete screenings", () => {
    assert.equal(
      isWatchVenue({
        sports: [{ slug: "padel" }],
        broadcasts: [],
        upcoming_screenings: [
          { title: "", startsAt: "2026-09-19T15:00:00.000Z" },
          { title: "Kickoff", startsAt: "  " },
        ],
      }),
      false,
    );
    assert.equal(hasUpcomingScreenings([]), false);
    assert.equal(hasUpcomingScreenings(null), false);
  });

  it("does not treat has_big_screens as watch classification", () => {
    const screensOnly = {
      sports: [{ slug: "padel" }],
      broadcasts: [],
      upcoming_screenings: [],
      has_big_screens: true,
    };
    assert.equal(isWatchVenue(screensOnly), false);
    assert.equal(venueDetailKind(screensOnly), "play-only");
  });
});

describe("isPlayVenue", () => {
  it("is true when Play sports are listed", () => {
    assert.equal(isPlayVenue(padelCourt), true);
    assert.equal(isPlayVenue(sportsBar), false);
  });

  it("is true when quick-start activities exist even without sports tags", () => {
    assert.equal(isPlayVenue({ sports: [], broadcasts: [] }, true), true);
    assert.equal(isPlayVenue({ sports: null, broadcasts: [] }, false), false);
  });
});

describe("venueDetailKind", () => {
  it("classifies play-only, watch-only, and hybrid", () => {
    assert.equal(venueDetailKind(padelCourt), "play-only");
    assert.equal(venueDetailKind(sportsBar), "watch-only");
    assert.equal(venueDetailKind(screeningPub), "watch-only");
    assert.equal(venueDetailKind(hybridClub), "hybrid");
    assert.equal(
      venueDetailKind({ sports: [], broadcasts: [], upcoming_screenings: [] }),
      "neither",
    );
  });

  it("treats a play court with screenings as hybrid", () => {
    assert.equal(
      venueDetailKind({
        sports: [{ slug: "padel" }],
        broadcasts: [],
        upcoming_screenings: screeningPub.upcoming_screenings,
      }),
      "hybrid",
    );
  });
});

describe("venueDetailChrome", () => {
  it("hides Watch chrome on play-only venues", () => {
    const chrome = venueDetailChrome("play-only", 1);
    assert.equal(chrome.showWatchWhatsOn, false);
    assert.equal(chrome.showWatchChips, false);
    assert.equal(chrome.showFindPlacesToWatch, false);
    assert.equal(chrome.ctaMentionsScreenings, false);
    assert.equal(chrome.showPlayChips, true);
    assert.equal(chrome.showPlayStack, true);
    assert.equal(chrome.showSportsSection, true);
    assert.equal(chrome.showFindPlacesToPlay, true);
  });

  it("shows Watch what’s-on on watch-only and hybrid, not fake attendance", () => {
    for (const kind of ["watch-only", "hybrid"] as const) {
      const chrome = venueDetailChrome(kind, kind === "hybrid" ? 1 : 0);
      assert.equal(chrome.showWatchWhatsOn, true);
      assert.equal(chrome.showWatchChips, true);
      assert.equal(chrome.showFindPlacesToWatch, true);
      assert.equal(chrome.ctaMentionsScreenings, true);
    }
    assert.equal(venueDetailChrome("watch-only", 0).showPlayStack, false);
    assert.equal(venueDetailChrome("hybrid", 1).showPlayStack, true);
    assert.equal(venueDetailChrome("watch-only", 0).showPlayChips, false);
  });

  it("omits the sports section when a play-only venue has no sport chips", () => {
    const chrome = venueDetailChrome("play-only", 0);
    assert.equal(chrome.showSportsSection, false);
    assert.equal(chrome.showPlayChips, false);
  });
});

describe("venueDetailNavLinks", () => {
  it("drops This weekend on play-only and keeps the play stack", () => {
    assert.deepEqual(
      venueDetailNavLinks({ kind: "play-only", hasQuickStart: true }).map(
        (link) => link.href,
      ),
      [
        "#quick-start",
        "#friends-played",
        "#match-history",
        "#leaderboards",
        "#amenities",
        "#location",
      ],
    );
    assert.equal(
      venueDetailNavLinks({
        kind: "play-only",
        hasQuickStart: true,
      }).some((link) => link.href === "#weekend" || link.href === "#sports"),
      false,
    );
  });

  it("puts This weekend first on watch-only and skips play-stack links", () => {
    assert.deepEqual(
      venueDetailNavLinks({ kind: "watch-only", hasQuickStart: false }).map(
        (link) => link.label,
      ),
      ["This weekend", "Sports", "Amenities", "Location"],
    );
  });

  it("puts This weekend first on hybrid, then the play stack", () => {
    assert.deepEqual(
      venueDetailNavLinks({ kind: "hybrid", hasQuickStart: true }).map(
        (link) => link.href,
      ),
      [
        "#weekend",
        "#quick-start",
        "#friends-played",
        "#match-history",
        "#leaderboards",
        "#amenities",
        "#location",
      ],
    );
  });
});

describe("venueDetailSectionOrder", () => {
  it("orders play-only as start CTA → friends → boards → CMS", () => {
    assert.deepEqual(
      venueDetailSectionOrder({
        kind: "play-only",
        hasQuickStart: true,
        showSportsSection: true,
      }),
      [
        "quick-start",
        "friends-played",
        "match-history",
        "leaderboards",
        "about",
        "sports",
        "amenities",
        "location",
        "stay-close",
      ],
    );
  });

  it("puts what’s-on first on watch-only, then CMS", () => {
    assert.deepEqual(
      venueDetailSectionOrder({
        kind: "watch-only",
        hasQuickStart: false,
        showSportsSection: true,
      }),
      ["weekend", "about", "sports", "amenities", "location", "stay-close"],
    );
  });

  it("puts what’s-on first on hybrid, then the play stack", () => {
    assert.deepEqual(
      venueDetailSectionOrder({
        kind: "hybrid",
        hasQuickStart: true,
        showSportsSection: true,
      }),
      [
        "weekend",
        "quick-start",
        "friends-played",
        "match-history",
        "leaderboards",
        "about",
        "sports",
        "amenities",
        "location",
        "stay-close",
      ],
    );
  });
});

describe("copy helpers", () => {
  it("does not pitch screenings on play-only stay-close copy", () => {
    assert.doesNotMatch(venueStayCloseCopy("play-only"), /screening/i);
    assert.match(venueStayCloseCopy("play-only"), /places to play/);
    assert.match(venueStayCloseCopy("watch-only"), /screenings/);
    assert.match(venueStayCloseCopy("hybrid"), /screenings/);
  });

  it("uses play-vs-watch metadata instead of always saying screens", () => {
    assert.equal(
      venueDetailMetaDescription({
        name: "Discovery Padel Park",
        suburb: "Sandton",
        kind: "play-only",
      }),
      "Discovery Padel Park in Sandton — play, amenities, and match details on LeagueSports.",
    );
    assert.match(
      venueDetailMetaDescription({
        name: "Tigers Milk",
        kind: "watch-only",
      }),
      /screens/,
    );
    assert.doesNotMatch(
      venueDetailMetaDescription({
        name: "Discovery Padel Park",
        kind: "play-only",
      }),
      /screens/,
    );
  });

  it("keeps amenities copy generic on play-only", () => {
    assert.equal(venueAmenitiesDescription("play-only"), "On-site facilities");
    assert.match(venueAmenitiesDescription("hybrid"), /screens/);
  });

  it("labels the sports section by venue kind", () => {
    assert.equal(venueSportsSectionCopy("play-only").title, "Play at this venue");
    assert.equal(
      venueSportsSectionCopy("watch-only").title,
      "Watch at this venue",
    );
  });
});
