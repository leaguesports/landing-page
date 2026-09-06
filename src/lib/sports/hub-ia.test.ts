import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HUB_BADGE_STRIP_LIMIT,
  HUB_BROWSE_FIXTURES_HREF,
  HUB_DEFAULT_TAB,
  HUB_DISCOVER_SEGMENTS,
  HUB_FIND_VENUES_HREF,
  HUB_FOR_YOU_EMPTY_CTAS,
  HUB_GOLF_HISTORY_HREF,
  HUB_GUIDES_HREF,
  HUB_INTEGRATIONS_HREF,
  HUB_PADEL_HISTORY_HREF,
  HUB_PLAY_EMPTY_CTAS,
  HUB_PLAY_HREF,
  HUB_RECENT_LOCK_LIMIT,
  HUB_SPORT_CONTROL,
  HUB_START_GOLF_HREF,
  HUB_START_MATCH_HREF,
  HUB_TAB_IDS,
  HUB_TABS,
  HUB_TRAINING_HREF,
  HUB_WATCH_HREF,
  hubDiscoverShortcuts,
  hubPlayHref,
  hubPlayShowsGolf,
  hubPlayShowsPadel,
  hubShowsSportControl,
  hubShowsStartActions,
  hubWatchHref,
  isHubTabId,
  takeHubPreview,
  hubConnectedCount,
} from "./hub-ia.ts";

describe("signed-in hub IA v2 (#143)", () => {
  it("exposes exactly five bottom-nav tabs in locked order", () => {
    assert.deepEqual(HUB_TAB_IDS, [
      "home",
      "play",
      "discover",
      "people",
      "you",
    ]);
    assert.deepEqual(
      HUB_TABS.map((tab) => tab.label),
      ["Home", "Play", "Discover", "People", "You"],
    );
    assert.equal(HUB_TABS.length, 5);
    assert.equal(HUB_DEFAULT_TAB, "home");
    assert.equal(isHubTabId("discover"), true);
    assert.equal(isHubTabId("tools"), false);
  });

  it("scopes the sport dropdown to Home, Discover, and Play", () => {
    assert.equal(HUB_SPORT_CONTROL, "dropdown");
    assert.equal(hubShowsSportControl("home"), true);
    assert.equal(hubShowsSportControl("play"), true);
    assert.equal(hubShowsSportControl("discover"), true);
    assert.equal(hubShowsSportControl("people"), false);
    assert.equal(hubShowsSportControl("you"), false);
  });

  it("keeps Start a match sticky on Home and Play only", () => {
    assert.equal(HUB_START_MATCH_HREF, "/padel/new");
    assert.equal(HUB_START_GOLF_HREF, "/golf/new");
    assert.equal(hubShowsStartActions("home"), true);
    assert.equal(hubShowsStartActions("play"), true);
    assert.equal(hubShowsStartActions("discover"), false);
    assert.equal(hubShowsStartActions("people"), false);
    assert.equal(hubShowsStartActions("you"), false);
  });

  it("uses browse fixtures and Discover venues — never a tools grid", () => {
    assert.deepEqual(
      HUB_FOR_YOU_EMPTY_CTAS.map((cta) => cta.href),
      [HUB_BROWSE_FIXTURES_HREF, HUB_FIND_VENUES_HREF],
    );
    assert.equal(HUB_BROWSE_FIXTURES_HREF, "/events");
    assert.equal(HUB_FIND_VENUES_HREF, "/venues");
    assert.equal(HUB_FOR_YOU_EMPTY_CTAS[1]?.tab, "discover");
    assert.doesNotMatch(
      HUB_FOR_YOU_EMPTY_CTAS.map((cta) => cta.label).join(" "),
      /tools/i,
    );
  });

  it("uses Start a match as the Play empty CTA", () => {
    assert.deepEqual(
      HUB_PLAY_EMPTY_CTAS.map((cta) => cta.href),
      [HUB_START_MATCH_HREF],
    );
    assert.equal(HUB_PADEL_HISTORY_HREF, "/padel/history");
    assert.equal(HUB_GOLF_HISTORY_HREF, "/golf/history");
    assert.equal(hubPlayShowsPadel("all"), true);
    assert.equal(hubPlayShowsPadel("padel"), true);
    assert.equal(hubPlayShowsPadel("golf"), false);
    assert.equal(hubPlayShowsGolf("golf"), true);
    assert.equal(hubPlayShowsGolf("padel"), false);
  });

  it("curates Discover shortcuts without rebuilding the finder", () => {
    assert.deepEqual(
      HUB_DISCOVER_SEGMENTS.map((segment) => segment.id),
      ["play", "watch"],
    );
    const play = hubDiscoverShortcuts("play", "all");
    const watch = hubDiscoverShortcuts("watch", "all");
    const hrefs = [...play, ...watch].map((item) => item.href);
    assert.deepEqual(hrefs, [
      HUB_FIND_VENUES_HREF,
      HUB_PLAY_HREF,
      HUB_BROWSE_FIXTURES_HREF,
      HUB_WATCH_HREF,
      HUB_GUIDES_HREF,
    ]);
    assert.equal(
      [...play, ...watch].some((item) => item.href.includes("?")),
      false,
    );
    assert.equal(hubPlayHref("padel"), "/play/padel");
    assert.equal(hubWatchHref("rugby"), "/watch/rugby");
    assert.equal(hubDiscoverShortcuts("play", "padel")[1]?.href, "/play/padel");
  });

  it("caps recent locks and badge icons on the hub", () => {
    assert.equal(HUB_RECENT_LOCK_LIMIT, 8);
    assert.equal(HUB_BADGE_STRIP_LIMIT, 3);
    assert.deepEqual(
      takeHubPreview([1, 2, 3, 4, 5, 6, 7, 8, 9], HUB_RECENT_LOCK_LIMIT),
      [1, 2, 3, 4, 5, 6, 7, 8],
    );
    assert.deepEqual(takeHubPreview(["a", "b", "c", "d"], HUB_BADGE_STRIP_LIMIT), [
      "a",
      "b",
      "c",
    ]);
  });

  it("keeps You links on shipped settings routes", () => {
    assert.equal(HUB_TRAINING_HREF, "/training");
    assert.equal(HUB_INTEGRATIONS_HREF, "/integrations");
  });

  it("counts only connected integrations", () => {
    assert.equal(
      hubConnectedCount([
        { status: "connected" },
        { status: "disconnected" },
        { status: "connected" },
      ]),
      2,
    );
    assert.equal(hubConnectedCount([]), 0);
  });
});
