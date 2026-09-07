import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HUB_BADGE_STRIP_LIMIT,
  HUB_BROWSE_FIXTURES_HREF,
  HUB_CAPTURE_DARTS_HREF,
  HUB_CAPTURE_GOLF_HREF,
  HUB_CAPTURE_PADEL_HREF,
  HUB_DEFAULT_TAB,
  HUB_FIND_VENUES_HREF,
  HUB_FOR_YOU_EMPTY_CTAS,
  HUB_DARTS_HISTORY_HREF,
  HUB_GOLF_HISTORY_HREF,
  HUB_HISTORY_OWNER_TAB,
  HUB_INTEGRATIONS_HREF,
  HUB_ORGANISE_GOLF_HREF,
  HUB_ORGANISE_PADEL_HREF,
  HUB_ORGANISED_PREVIEW_LIMIT,
  HUB_PADEL_HISTORY_HREF,
  HUB_PLAY_CAPTURE_BY_SLUG,
  HUB_PLAY_HREF,
  HUB_PLAY_ORGANISE_BY_SLUG,
  HUB_PLAY_SPORT_PICK,
  HUB_PLAY_START_BY_SLUG,
  HUB_PLAY_VERB_IDS,
  HUB_PLAY_VERBS,
  HUB_QUICK_START,
  HUB_QUICK_START_HREF,
  HUB_RECENT_LOCK_LIMIT,
  HUB_SPORT_CONTROL,
  HUB_START_ACTION_TABS,
  HUB_START_DARTS_HREF,
  HUB_START_GOLF_HREF,
  HUB_START_MATCH_HREF,
  HUB_STICKY_START_ACTIONS,
  HUB_TAB_IDS,
  HUB_TABS,
  HUB_TRAINING_HREF,
  HUB_WATCH_HREF,
  hubOrganisedGameHref,
  hubOrganisedGameJoinHref,
  hubOwnsRecentLocks,
  hubPlayCaptureHref,
  hubPlayContinueHref,
  hubPlayEmptyNearbyHref,
  hubPlayHref,
  hubPlayHrefForVerb,
  hubPlayModalDescription,
  hubPlayModalSportOptions,
  hubPlayModalTitle,
  hubPlayNearbyHref,
  hubPlayOrganiseHref,
  hubPlayShowsDarts,
  hubPlayShowsGolf,
  hubPlayShowsPadel,
  hubPlaySportOptions,
  hubPlayStartHref,
  hubPlayableSports,
  isHubPlayableSport,
  isHubPlayVerbId,
  hubSearchHref,
  hubShowsSportControl,
  hubShowsStartActions,
  hubWatchHref,
  isHubTabId,
  takeHubPreview,
  hubConnectedCount,
} from "./hub-ia.ts";
import { SPORT_CATALOG } from "./catalog.ts";

describe("signed-in hub IA (#145 / #150 / #153 / #155 / #157)", () => {
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
    assert.equal(HUB_START_DARTS_HREF, "/darts/new");
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
    assert.equal(HUB_DARTS_HISTORY_HREF, "/darts/history");
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
      ["padel", "golf", "darts"],
    );
    assert.deepEqual(Object.keys(HUB_PLAY_START_BY_SLUG), [
      "padel",
      "golf",
      "darts",
    ]);
    assert.equal(hubPlayStartHref("padel"), HUB_START_MATCH_HREF);
    assert.equal(hubPlayStartHref("golf"), HUB_START_GOLF_HREF);
    assert.equal(hubPlayStartHref("darts"), HUB_START_DARTS_HREF);
    assert.equal(hubPlayStartHref("motorsport"), null);
    assert.equal(hubPlayStartHref("pool"), null);
    assert.equal(hubPlayStartHref("rugby"), null);

    const motorsport = SPORT_CATALOG.find((sport) => sport.slug === "motorsport");
    const darts = SPORT_CATALOG.find((sport) => sport.slug === "darts");
    const rugby = SPORT_CATALOG.find((sport) => sport.slug === "rugby");
    const padel = SPORT_CATALOG.find((sport) => sport.slug === "padel");
    assert.ok(motorsport && darts && rugby && padel);
    assert.equal(isHubPlayableSport(motorsport), false);
    assert.equal(isHubPlayableSport(darts), true);
    assert.equal(isHubPlayableSport(rugby), false);
    assert.equal(isHubPlayableSport(padel), true);
    assert.ok(!playable.some((sport) => sport.capabilities.includes("watch") && !sport.capabilities.includes("play")));
  });

  it("lists Start, Capture, and Organise before any sport pick", () => {
    assert.deepEqual(HUB_PLAY_VERB_IDS, ["start", "capture", "organise"]);
    assert.deepEqual(
      HUB_PLAY_VERBS.map((verb) => verb.label),
      ["Start game", "Capture results", "Organise game"],
    );
    assert.equal(isHubPlayVerbId("start"), true);
    assert.equal(isHubPlayVerbId("capture"), true);
    assert.equal(isHubPlayVerbId("organise"), true);
    assert.equal(isHubPlayVerbId("quick"), false);
    assert.doesNotMatch(
      HUB_PLAY_VERBS.map((verb) => verb.label).join(" "),
      /quick play/i,
    );
    assert.equal(HUB_QUICK_START.href, HUB_QUICK_START_HREF);
    assert.match(HUB_QUICK_START.label, /quick start/i);
    assert.match(HUB_QUICK_START.description, /location/i);
  });

  it("picks the sport in a modal — not inline game blocks", () => {
    assert.equal(HUB_PLAY_SPORT_PICK, "modal");
    assert.equal(hubPlayModalTitle("start"), "Start game");
    assert.equal(hubPlayModalTitle("capture"), "Capture results");
    assert.equal(hubPlayModalTitle("organise"), "Organise game");
    assert.match(hubPlayModalDescription("start"), /live scorecard/i);
    assert.match(hubPlayModalDescription("capture"), /finished score/i);
    assert.match(hubPlayModalDescription("organise"), /venue/i);

    const start = hubPlayModalSportOptions(SPORT_CATALOG, "start");
    assert.deepEqual(
      start.map((option) => [option.slug, option.href, option.verb]),
      [
        ["padel", HUB_START_MATCH_HREF, "start"],
        ["golf", HUB_START_GOLF_HREF, "start"],
        ["darts", HUB_START_DARTS_HREF, "start"],
      ],
    );
    const capture = hubPlayModalSportOptions(SPORT_CATALOG, "capture");
    assert.deepEqual(
      capture.map((option) => [option.slug, option.href, option.verb]),
      [
        ["padel", HUB_CAPTURE_PADEL_HREF, "capture"],
        ["golf", HUB_CAPTURE_GOLF_HREF, "capture"],
        ["darts", HUB_CAPTURE_DARTS_HREF, "capture"],
      ],
    );
    const organise = hubPlayModalSportOptions(SPORT_CATALOG, "organise");
    assert.deepEqual(
      organise.map((option) => [option.slug, option.href, option.verb]),
      [
        ["padel", HUB_ORGANISE_PADEL_HREF, "organise"],
        ["golf", HUB_ORGANISE_GOLF_HREF, "organise"],
      ],
    );
    assert.deepEqual(
      hubPlayModalSportOptions(SPORT_CATALOG, "start").map((option) => option.name),
      ["Padel", "Golf", "Darts"],
    );
    assert.deepEqual(hubPlaySportOptions(SPORT_CATALOG, "motorsport"), []);
    assert.deepEqual(
      hubPlayModalSportOptions(SPORT_CATALOG, "start").map((option) => option.slug),
      ["padel", "golf", "darts"],
    );
  });

  it("maps playable slugs to create-flow hrefs and scopes by hub focus", () => {
    const all = hubPlaySportOptions(SPORT_CATALOG, "all");
    assert.deepEqual(
      all.map((option) => [option.slug, option.href, option.verb]),
      [
        ["padel", HUB_START_MATCH_HREF, "start"],
        ["golf", HUB_START_GOLF_HREF, "start"],
        ["darts", HUB_START_DARTS_HREF, "start"],
      ],
    );
    assert.deepEqual(
      all.map((option) => option.label),
      ["Start a match", "Start a round", "Start a game"],
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "padel").map((option) => option.href),
      [HUB_START_MATCH_HREF],
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "golf").map((option) => option.href),
      [HUB_START_GOLF_HREF],
    );
    assert.deepEqual(hubPlaySportOptions(SPORT_CATALOG, "motorsport"), []);
    assert.deepEqual(hubPlaySportOptions(SPORT_CATALOG, "rugby"), []);
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "darts").map((option) => option.href),
      [HUB_START_DARTS_HREF],
    );
    assert.equal(hubPlayShowsPadel("all"), true);
    assert.equal(hubPlayShowsPadel("padel"), true);
    assert.equal(hubPlayShowsPadel("golf"), false);
    assert.equal(hubPlayShowsGolf("golf"), true);
    assert.equal(hubPlayShowsGolf("padel"), false);
    assert.equal(hubPlayShowsDarts("darts"), true);
    assert.equal(hubPlayShowsDarts("padel"), false);
  });

  it("maps Capture results to finished-score routes for padel, golf, and darts", () => {
    assert.equal(HUB_CAPTURE_PADEL_HREF, "/padel/capture");
    assert.equal(HUB_CAPTURE_GOLF_HREF, "/golf/capture");
    assert.equal(HUB_CAPTURE_DARTS_HREF, "/darts/capture");
    assert.deepEqual(Object.keys(HUB_PLAY_CAPTURE_BY_SLUG), [
      "padel",
      "golf",
      "darts",
    ]);
    assert.equal(hubPlayCaptureHref("padel"), HUB_CAPTURE_PADEL_HREF);
    assert.equal(hubPlayCaptureHref("golf"), HUB_CAPTURE_GOLF_HREF);
    assert.equal(hubPlayCaptureHref("darts"), HUB_CAPTURE_DARTS_HREF);
    assert.equal(hubPlayHrefForVerb("padel", "start"), HUB_START_MATCH_HREF);
    assert.equal(hubPlayHrefForVerb("golf", "capture"), HUB_CAPTURE_GOLF_HREF);
    assert.equal(hubPlayHrefForVerb("motorsport", "capture"), null);

    const capture = hubPlaySportOptions(SPORT_CATALOG, "all", null, "capture");
    assert.deepEqual(
      capture.map((option) => [option.slug, option.href, option.label]),
      [
        ["padel", HUB_CAPTURE_PADEL_HREF, "Capture padel"],
        ["golf", HUB_CAPTURE_GOLF_HREF, "Capture golf"],
        ["darts", HUB_CAPTURE_DARTS_HREF, "Capture darts"],
      ],
    );
    assert.equal(
      capture.every((option) => option.continueHref === null),
      true,
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "padel", null, "capture").map(
        (option) => option.href,
      ),
      [HUB_CAPTURE_PADEL_HREF],
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "darts", null, "capture").map(
        (option) => option.href,
      ),
      [HUB_CAPTURE_DARTS_HREF],
    );
  });

  it("maps Organise game to padel/golf create-flow hrefs and join/detail paths", () => {
    assert.equal(HUB_ORGANISE_PADEL_HREF, "/padel/organise");
    assert.equal(HUB_ORGANISE_GOLF_HREF, "/golf/organise");
    assert.deepEqual(Object.keys(HUB_PLAY_ORGANISE_BY_SLUG), ["padel", "golf"]);
    assert.equal(hubPlayOrganiseHref("padel"), HUB_ORGANISE_PADEL_HREF);
    assert.equal(hubPlayOrganiseHref("golf"), HUB_ORGANISE_GOLF_HREF);
    assert.equal(hubPlayOrganiseHref("darts"), null);
    assert.equal(hubPlayHrefForVerb("padel", "organise"), HUB_ORGANISE_PADEL_HREF);
    assert.equal(hubPlayHrefForVerb("golf", "organise"), HUB_ORGANISE_GOLF_HREF);
    assert.equal(hubPlayHrefForVerb("motorsport", "organise"), null);

    const organise = hubPlaySportOptions(SPORT_CATALOG, "all", null, "organise");
    assert.deepEqual(
      organise.map((option) => [option.slug, option.href, option.label, option.verb]),
      [
        ["padel", HUB_ORGANISE_PADEL_HREF, "Organise padel", "organise"],
        ["golf", HUB_ORGANISE_GOLF_HREF, "Organise golf", "organise"],
      ],
    );
    assert.equal(
      organise.every((option) => option.continueHref === null),
      true,
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "padel", null, "organise").map(
        (option) => option.href,
      ),
      [HUB_ORGANISE_PADEL_HREF],
    );
    assert.deepEqual(
      hubPlaySportOptions(SPORT_CATALOG, "darts", null, "organise"),
      [],
    );
    assert.equal(hubOrganisedGameHref("game-1"), "/play/organised/game-1");
    assert.equal(
      hubOrganisedGameJoinHref("aa".repeat(16)),
      `/play/join/${"aa".repeat(16)}`,
    );
    assert.equal(hubOrganisedGameHref("  "), HUB_PLAY_HREF);
    assert.equal(hubOrganisedGameJoinHref(""), HUB_PLAY_HREF);
    assert.equal(HUB_ORGANISED_PREVIEW_LIMIT, 4);
  });

  it("omits Continue unless a live href is supplied — never from locked history", () => {
    const without = hubPlaySportOptions(SPORT_CATALOG, "all");
    assert.equal(
      without.every((option) => option.continueHref === null),
      true,
    );
    assert.equal(hubPlayContinueHref("padel"), null);
    assert.equal(hubPlayContinueHref("golf", {}), null);
    assert.equal(
      hubPlayContinueHref("darts", { darts: "/darts/abc" }),
      "/darts/abc",
    );
    assert.equal(hubPlayContinueHref("pool", { pool: "/pool/abc" }), null);
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

  it("falls back play/watch hrefs when the focused sport does not support the intent (#147)", () => {
    assert.equal(hubPlayHref("padel"), "/play/padel");
    assert.equal(hubWatchHref("padel"), "/watch/padel");
    assert.equal(hubPlayHref("rugby"), "/play/rugby");
    assert.equal(hubWatchHref("rugby"), "/watch/rugby");
    assert.equal(hubPlayHref("golf"), "/play/golf");
    assert.equal(hubPlayHref("karting"), "/play/karting");
    assert.equal(hubPlayHref("tennis"), "/play/tennis");
    assert.equal(hubWatchHref("golf"), HUB_WATCH_HREF);
    assert.equal(hubWatchHref("karting"), HUB_WATCH_HREF);
    assert.equal(hubWatchHref("tennis"), HUB_WATCH_HREF);
    assert.equal(hubPlayHref("motorsport"), HUB_PLAY_HREF);
    assert.equal(hubWatchHref("motorsport"), "/watch/motorsport");
    assert.equal(hubPlayNearbyHref("motorsport"), HUB_PLAY_HREF);
    assert.equal(hubPlayNearbyHref("golf"), "/play/golf");
    assert.equal(hubSearchHref("", "motorsport"), HUB_PLAY_HREF);
    assert.equal(hubSearchHref("   ", "golf"), "/play/golf");
    assert.equal(hubSearchHref("", "padel"), "/play/padel");
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
