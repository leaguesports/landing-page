import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createFlowHref,
  isScorecardSport,
  selectCtaMatrix,
  startMatchLabel,
  stickyActions,
} from "./cta-matrix.ts";

describe("scorecard sports", () => {
  it("treats padel, golf, and darts as live scorecards", () => {
    assert.equal(isScorecardSport("padel"), true);
    assert.equal(isScorecardSport("golf"), true);
    assert.equal(isScorecardSport("darts"), true);
    assert.equal(isScorecardSport("rugby"), false);
    assert.equal(isScorecardSport("soccer"), false);
  });

  it("uses verb copy for start labels", () => {
    assert.equal(startMatchLabel("padel"), "Start a match");
    assert.equal(startMatchLabel("golf"), "Start a round");
    assert.equal(startMatchLabel("darts"), "Start a game");
  });
});

describe("createFlowHref", () => {
  it("deep-links start flows with venue, sport, and city prefills", () => {
    assert.equal(
      createFlowHref("start", {
        sport: "padel",
        venue: "the-grid",
        city: "cape-town",
      }),
      "/padel/new?venue=the-grid&sport=padel&city=cape-town",
    );
    assert.equal(
      createFlowHref("start", { sport: "golf", city: "johannesburg" }),
      "/golf/new?sport=golf&city=johannesburg",
    );
    assert.equal(
      createFlowHref("organise", { sport: "padel", venue: "the-grid" }),
      "/padel/organise?venue=the-grid&sport=padel",
    );
    assert.equal(
      createFlowHref("organise", {
        sport: "golf",
        venue: "glendower",
        city: "johannesburg",
      }),
      "/golf/organise?venue=glendower&sport=golf&city=johannesburg",
    );
  });
});

describe("selectCtaMatrix", () => {
  it("uses Start + Find venues on play city/sport when the sport has a scorecard", () => {
    const matrix = selectCtaMatrix({
      pageType: "play_city_sport",
      sport: "padel",
      city: "cape-town",
      venueCount: 4,
    });
    assert.equal(matrix.primary.id, "start_match");
    assert.equal(matrix.primary.label, "Start a match");
    assert.match(matrix.primary.href, /\/padel\/new/);
    assert.match(matrix.primary.href, /sport=padel/);
    assert.match(matrix.primary.href, /city=cape-town/);
    assert.equal(matrix.secondary.id, "find_venues");
    assert.equal(matrix.secondary.label, "Find venues");
    assert.equal(matrix.fallback, "notify_roadmap");
  });

  it("does not dead-Start when the sport has no scorecard", () => {
    const matrix = selectCtaMatrix({
      pageType: "play_city_sport",
      sport: "rugby",
      city: "cape-town",
      venueCount: 0,
    });
    assert.equal(matrix.primary.id, "find_venues");
    assert.equal(matrix.primary.label, "Find venues");
    assert.notEqual(matrix.primary.href.includes("/padel/new"), true);
    assert.equal(matrix.secondary.id, "browse_sport");
    assert.equal(matrix.fallback, "notify_roadmap");
  });

  it("uses Find where to watch + Browse fixtures on watch city/sport", () => {
    const matrix = selectCtaMatrix({
      pageType: "watch_city_sport",
      sport: "soccer",
      city: "johannesburg",
      venueCount: 2,
    });
    assert.equal(matrix.primary.label, "Find where to watch");
    assert.equal(matrix.primary.href, "#venues");
    assert.equal(matrix.secondary.label, "Browse fixtures");
    assert.equal(matrix.secondary.href, "/events?city=johannesburg");
    assert.equal(matrix.fallback, "notify_roadmap");
  });

  it("picks a play or watch primary on guides from context", () => {
    const play = selectCtaMatrix({
      pageType: "guide",
      guideIntent: "play",
      sport: "padel",
      city: "cape-town",
    });
    assert.equal(play.primary.id, "start_match");
    const watch = selectCtaMatrix({
      pageType: "guide",
      guideIntent: "watch",
      sport: "rugby",
      relatedHref: "/events",
    });
    assert.equal(watch.primary.id, "find_watch");
    assert.equal(watch.secondary.id, "related");
    assert.equal(watch.fallback, "notify_roadmap");
  });

  it("uses Find venues screening or I'm watching on events", () => {
    const withVenues = selectCtaMatrix({
      pageType: "event",
      venueCount: 3,
      shareHref: "https://wa.me/?text=hi",
    });
    assert.equal(withVenues.primary.label, "Find venues screening");
    assert.equal(withVenues.secondary.label, "Share event");
    assert.equal(withVenues.fallback, "notify");

    const empty = selectCtaMatrix({
      pageType: "event",
      venueCount: 0,
      shareHref: "https://wa.me/?text=hi",
    });
    assert.equal(empty.primary.label, "I'm watching");
    assert.equal(empty.primary.href, "#live-feed");
  });

  it("starts a match with venue prefill or finds fixtures on venue pages", () => {
    const start = selectCtaMatrix({
      pageType: "venue",
      sport: "padel",
      venueSlug: "the-grid",
      hasDirections: true,
      directionsHref: "https://maps.example/the-grid",
    });
    assert.equal(start.primary.label, "Start a match");
    assert.match(start.primary.href, /venue=the-grid/);
    assert.equal(start.secondary.label, "Get directions");
    assert.equal(start.fallback, "claim");

    const fixtures = selectCtaMatrix({
      pageType: "venue",
      sport: "soccer",
      hasWhatsApp: true,
      whatsAppHref: "https://wa.me/27",
    });
    assert.equal(fixtures.primary.label, "Find fixtures");
    assert.equal(fixtures.secondary.label, "Inquire on WhatsApp");
  });

  it("caps sticky actions at two", () => {
    const matrix = selectCtaMatrix({
      pageType: "play_city_sport",
      sport: "golf",
      city: "durban",
      venueCount: 1,
    });
    const sticky = stickyActions(matrix);
    assert.equal(sticky.length, 2);
    assert.equal(sticky[0], matrix.primary);
    assert.equal(sticky[1], matrix.secondary);
  });
});
