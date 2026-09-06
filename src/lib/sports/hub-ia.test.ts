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
  HUB_PLAY_START_BY_SLUG,
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
  hubPlayContinueHref,
  hubPlayEmptyNearbyHref,
  hubPlayHref,
  hubPlayNearbyHref,
  hubPlayShowsGolf,
  hubPlayShowsPadel,
  hubPlaySportOptions,
  hubPlayStartHref,
  hubPlayableSports,
  isHubPlayableSport,
  hubSearchHref,
  hubShowsSportControl,
  hubShowsStartActions,
  hubWatchHref,
  isHubTabId,
  takeHubPreview,
  hubConnectedCount,
} from "./hub-ia.ts";
import { SPORT_CATALOG } from "./catalog.ts";

describe("signed-in hub IA (#145 / #150)", () => {
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

  it("filters Play to catalog sports that support play and have a start href", () => {
    const playable = hubPlayableSports(SPORT_CATALOG);
    assert.deepEqual(
      playable.map((sport) => sport.slug),
      ["padel", "golf"],
    );
    assert.deepEqual(Object.keys(HUB_PLAY_START_BY_SLUG), ["padel", "golf"]);
    assert.equal(hubPlayStartHref("padel"), HUB_START_MATCH_HREF);
    assert.equal(hubPlayStartHref("golf"), HUB_START_GOLF_HREF);
    assert.equal(hubPlayStartHref("motorsport"), null);
    assert.equal(hubPlayStartHref("darts"), null);
    assert.equal(hubPlayStartHref("pool"), null);
    assert.equal(hubPlayStartHref("rugby"), null);

    const motorsport = SPORT_CATALOG.find((sport) => sport.slug === "motorsport");
    const darts = SPORT_CATALOG.find((sport) => sport.slug === "darts");
    const rugby = SPORT_CATALOG.find((sport) => sport.slug === "rugby");
    const padel = SPORT_CATALOG.find((sport) => sport.slug === "padel");
    assert.ok(motorsport && darts && rugby && padel);
    assert.equal(isHubPlayableSport(motorsport), false);
    assert.equal(isHubPlayableSport(darts), false);
    assert.equal(isHubPlayableSport(rugby), false);
    assert.equal(isHubPlayableSport(padel), true);
    assert.ok(!playable.some((sport) => sport.capabilities.includes("watch") && !sport.capabilities.includes("play")));
  });

  it("maps playable slugs to create-flow hrefs and scopes by hub focus", () => {
    const all = hubPlaySportOptions(SPORT_CATALOG, "all");
    assert.deepEqual(
      all.map((option) => [option.slug, option.startHref]),
      [
        ["padel", HUB_START_MATCH_HREF],
        ["golf", HUB_START_GOLF_HREF],
      ],
    );
    assert.deepEqual(
      all.map((option) => option.startLabel),
      ["Start a match", "Start a round"],
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "padel").map((option) => option.startHref),
      [HUB_START_MATCH_HREF],
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "golf").map((option) => option.startHref),
      [HUB_START_GOLF_HREF],
    );
    assert.deepEqual(hubPlaySportOptions(SPORT_CATALOG, "motorsport"), []);
    assert.deepEqual(hubPlaySportOptions(SPORT_CATALOG, "rugby"), []);
    assert.deepEqual(hubPlaySportOptions(SPORT_CATALOG, "darts"), []);
    assert.equal(hubPlayShowsPadel("all"), true);
    assert.equal(hubPlayShowsPadel("padel"), true);
    assert.equal(hubPlayShowsPadel("golf"), false);
    assert.equal(hubPlayShowsGolf("golf"), true);
    assert.equal(hubPlayShowsGolf("padel"), false);
  });

  it("omits Continue unless a live href is supplied — never from locked history", () => {
    const without = hubPlaySportOptions(SPORT_CATALOG, "all");
    assert.equal(
      without.every((option) => option.continueHref === null),
      true,
    );
    assert.equal(hubPlayContinueHref("padel"), null);
    assert.equal(hubPlayContinueHref("golf", {}), null);
    assert.equal(hubPlayContinueHref("darts", { darts: "/darts/abc" }), null);
    assert.equal(
      hubPlayContinueHref("padel", { padel: "/padel/live-1" }),
      "/padel/live-1",
    );
    const withContinue = hubPlaySportOptions(SPORT_CATALOG, "golf", {
      golf: "/golf/round-9",
    });
    assert.deepEqual(
      withContinue.map((option) => option.continueHref),
      ["/golf/round-9"],
    );
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
    assert.equal(hubPlayEmptyNearbyHref("all", SPORT_CATALOG), HUB_PLAY_HREF);
    assert.equal(
      hubPlayEmptyNearbyHref("rugby", SPORT_CATALOG),
      "/play/rugby",
    );
    assert.equal(
      hubPlayEmptyNearbyHref("motorsport", SPORT_CATALOG),
      HUB_FIND_VENUES_HREF,
    );
    assert.notEqual(
      hubPlayEmptyNearbyHref("motorsport", SPORT_CATALOG),
      "/play/motorsport",
    );
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
