import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPORT_CATALOG } from "../sports/catalog.ts";
import { HUB_PLAY_DEEP_LINK_REDIRECTS } from "../sports/hub-redirects.ts";
import {
  HUB_CHANGE_SPORT_HREF,
  HUB_CHANGE_SPORT_LABEL,
  HUB_GOLF_HANDICAP_HREF,
  HUB_PLAY_SPORT_PICK,
  HUB_PLAY_TAB_HREF,
  HUB_TABS,
  hubChangeSportHref,
  hubPlayDashboardActions,
  hubPlayGridItems,
  hubPlayGridSports,
  hubPlaySportHref,
  hubPlayTabHref,
  hubPlayTabOpensModal,
  hubTabHref,
  isHubPlayDashboardSport,
} from "../sports/hub-ia.ts";

describe("Play sport-first IA (#212)", () => {
  it("makes the Play tab a /play href — never a modal", () => {
    assert.equal(HUB_PLAY_TAB_HREF, "/play");
    assert.equal(hubPlayTabHref(), "/play");
    assert.equal(hubTabHref("play"), "/play");
    assert.equal(HUB_TABS.find((tab) => tab.id === "play")?.href, "/play");
    assert.equal(HUB_PLAY_SPORT_PICK, "page");
    assert.equal(hubPlayTabOpensModal(), false);
  });

  it("lists padel, golf, and darts on the /play grid", () => {
    const sports = hubPlayGridSports(SPORT_CATALOG);
    assert.deepEqual(
      sports.map((sport) => sport.slug),
      ["padel", "golf", "darts"],
    );
    assert.deepEqual(
      hubPlayGridItems(SPORT_CATALOG).map((item) => [item.slug, item.href, item.name]),
      [
        ["padel", "/play/padel", "Padel"],
        ["golf", "/play/golf", "Golf"],
        ["darts", "/play/darts", "Darts"],
      ],
    );
    assert.equal(isHubPlayDashboardSport("padel"), true);
    assert.equal(isHubPlayDashboardSport("golf"), true);
    assert.equal(isHubPlayDashboardSport("darts"), true);
    assert.equal(isHubPlayDashboardSport("rugby"), false);
  });

  it("sends Change sport back to the /play grid — not a modal", () => {
    assert.equal(HUB_CHANGE_SPORT_HREF, "/play");
    assert.equal(hubChangeSportHref(), "/play");
    assert.equal(HUB_CHANGE_SPORT_LABEL, "Change sport");
    assert.equal(hubPlaySportHref("golf"), "/play/golf");
    assert.equal(hubPlaySportHref("padel"), "/play/padel");
    assert.equal(hubPlaySportHref("  "), "/play");
  });

  it("redirects the global Organise hub onto /play and sport-scoped organise", () => {
    const rows = HUB_PLAY_DEEP_LINK_REDIRECTS.map((row) => [
      row.source,
      row.destination,
    ]);
    assert.deepEqual(
      rows.filter(([source]) => source === "/organise" || source === "/play/organise"),
      [
        ["/organise", "/play"],
        ["/play/organise", "/play"],
      ],
    );
    assert.ok(
      rows.some(
        ([source, dest]) =>
          source === "/play/padel/organise" && dest === "/padel/organise",
      ),
    );
    assert.ok(
      rows.some(
        ([source, dest]) =>
          source === "/play/golf/organise" && dest === "/golf/organise",
      ),
    );
    assert.equal(
      rows.some(([, dest]) => dest === "/play/organise"),
      false,
    );
  });

  it("scopes dashboard actions — Capture always, Organise only when supported, golf extras", () => {
    const padel = hubPlayDashboardActions("padel").map((action) => action.id);
    const golf = hubPlayDashboardActions("golf").map((action) => action.id);
    const darts = hubPlayDashboardActions("darts").map((action) => action.id);

    assert.deepEqual(padel, [
      "start",
      "capture",
      "organise",
      "lobby",
      "team-matches",
      "tournaments",
    ]);
    assert.deepEqual(golf, [
      "start",
      "capture",
      "organise",
      "lobby",
      "team-matches",
      "tournaments",
      "golf-tours",
      "handicap",
    ]);
    assert.deepEqual(darts, [
      "start",
      "capture",
      "lobby",
      "team-matches",
      "tournaments",
    ]);
    assert.equal(darts.includes("organise"), false);
    assert.equal(
      hubPlayDashboardActions("golf").find((action) => action.id === "handicap")
        ?.href,
      HUB_GOLF_HANDICAP_HREF,
    );
    assert.equal(
      hubPlayDashboardActions("golf").find((action) => action.id === "golf-tours")
        ?.href,
      "/golf-tours",
    );
    assert.deepEqual(hubPlayDashboardActions("rugby"), []);
  });
});
