import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HUB_BADGE_STRIP_LIMIT,
  HUB_BROWSE_FIXTURES_HREF,
  HUB_DEFAULT_TAB,
  HUB_FIND_VENUES_HREF,
  HUB_FOR_YOU_EMPTY_CTAS,
  HUB_GOLF_HISTORY_HREF,
  HUB_HISTORY_OWNER_TAB,
  HUB_INTEGRATIONS_HREF,
  HUB_PADEL_HISTORY_HREF,
  HUB_PLAY_HREF,
  HUB_PLAY_INTENT_CTAS,
  HUB_RECENT_LOCK_LIMIT,
  HUB_SPORT_CONTROL,
  HUB_START_ACTION_TABS,
  HUB_START_GOLF_HREF,
  HUB_START_MATCH_HREF,
  HUB_STICKY_START_ACTIONS,
  HUB_TAB_IDS,
  HUB_TABS,
  HUB_TRAINING_HREF,
  HUB_WATCH_HREF,
  hubOwnsRecentLocks,
  hubPlayHref,
  hubPlayIntentCtas,
  hubPlayNearbyHref,
  hubPlayShowsGolf,
  hubPlayShowsPadel,
  hubSearchHref,
  hubShowsSportControl,
  hubShowsStartActions,
  hubWatchHref,
  isHubTabId,
  takeHubPreview,
  hubConnectedCount,
} from "./hub-ia.ts";

describe("signed-in hub IA (#145)", () => {
  it("exposes exactly four bottom-nav tabs in locked order", () => {
    assert.deepEqual(HUB_TAB_IDS, ["home", "play", "people", "you"]);
    assert.deepEqual(
      HUB_TABS.map((tab) => tab.label),
      ["Home", "Play", "People", "You"],
    );
    assert.equal(HUB_TABS.length, 4);
    assert.equal(HUB_DEFAULT_TAB, "home");
    assert.equal(isHubTabId("discover"), false);
    assert.equal(isHubTabId("play"), true);
    assert.equal(isHubTabId("tools"), false);
  });

  it("scopes the sport dropdown to Home and Play — not People or You", () => {
    assert.equal(HUB_SPORT_CONTROL, "dropdown");
    assert.equal(hubShowsSportControl("home"), true);
    assert.equal(hubShowsSportControl("play"), true);
    assert.equal(hubShowsSportControl("people"), false);
    assert.equal(hubShowsSportControl("you"), false);
  });

  it("keeps Start actions inside Play only — never sticky or on Home", () => {
    assert.equal(HUB_START_MATCH_HREF, "/padel/new");
    assert.equal(HUB_START_GOLF_HREF, "/golf/new");
    assert.equal(HUB_STICKY_START_ACTIONS, false);
    assert.deepEqual(HUB_START_ACTION_TABS, ["play"]);
    assert.equal(hubShowsStartActions("play"), true);
    assert.equal(hubShowsStartActions("home"), false);
    assert.equal(hubShowsStartActions("people"), false);
    assert.equal(hubShowsStartActions("you"), false);
  });

  it("gives You ownership of recent and locked match history", () => {
    assert.equal(HUB_HISTORY_OWNER_TAB, "you");
    assert.equal(hubOwnsRecentLocks("you"), true);
    assert.equal(hubOwnsRecentLocks("play"), false);
    assert.equal(hubOwnsRecentLocks("home"), false);
    assert.equal(hubOwnsRecentLocks("people"), false);
    assert.equal(HUB_PADEL_HISTORY_HREF, "/padel/history");
    assert.equal(HUB_GOLF_HISTORY_HREF, "/golf/history");
  });

  it("uses browse fixtures and venues — never a tools grid or Discover tab", () => {
    assert.deepEqual(
      HUB_FOR_YOU_EMPTY_CTAS.map((cta) => cta.href),
      [HUB_BROWSE_FIXTURES_HREF, HUB_FIND_VENUES_HREF],
    );
    assert.equal(HUB_BROWSE_FIXTURES_HREF, "/events");
    assert.equal(HUB_FIND_VENUES_HREF, "/venues");
    assert.equal(
      HUB_FOR_YOU_EMPTY_CTAS.every((cta) => !("tab" in cta)),
      true,
    );
    assert.doesNotMatch(
      HUB_FOR_YOU_EMPTY_CTAS.map((cta) => cta.label).join(" "),
      /tools|discover/i,
    );
  });

  it("treats Play as start-intent CTAs, not match history", () => {
    assert.deepEqual(
      HUB_PLAY_INTENT_CTAS.map((cta) => cta.href),
      [HUB_START_MATCH_HREF, HUB_START_GOLF_HREF],
    );
    assert.deepEqual(
      HUB_PLAY_INTENT_CTAS.map((cta) => cta.label),
      ["Start a match", "Start a round"],
    );
    assert.deepEqual(
      hubPlayIntentCtas("all").map((cta) => cta.sport),
      ["padel", "golf"],
    );
    assert.deepEqual(
      hubPlayIntentCtas("padel").map((cta) => cta.href),
      [HUB_START_MATCH_HREF],
    );
    assert.deepEqual(
      hubPlayIntentCtas("golf").map((cta) => cta.href),
      [HUB_START_GOLF_HREF],
    );
    assert.deepEqual(hubPlayIntentCtas("rugby"), []);
    assert.equal(hubPlayShowsPadel("all"), true);
    assert.equal(hubPlayShowsPadel("padel"), true);
    assert.equal(hubPlayShowsPadel("golf"), false);
    assert.equal(hubPlayShowsGolf("golf"), true);
    assert.equal(hubPlayShowsGolf("padel"), false);
  });

  it("wires hub search to existing venues / play / watch routes", () => {
    assert.equal(hubSearchHref("", "all"), HUB_FIND_VENUES_HREF);
    assert.equal(hubSearchHref("   ", "padel"), "/play/padel");
    assert.equal(hubSearchHref("sandton", "all"), "/venues?q=sandton");
    assert.equal(hubSearchHref("sandton", "padel"), "/venues?q=padel%20sandton");
    assert.equal(
      hubSearchHref("watch soccer", "padel"),
      "/venues?q=watch%20soccer",
    );
    assert.equal(hubPlayHref("padel"), "/play/padel");
    assert.equal(hubWatchHref("rugby"), "/watch/rugby");
    assert.equal(hubPlayNearbyHref("golf"), "/play/golf");
    assert.equal(hubPlayHref("all"), HUB_PLAY_HREF);
    assert.equal(hubWatchHref("all"), HUB_WATCH_HREF);
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
