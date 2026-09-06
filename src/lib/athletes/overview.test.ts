import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ATHLETE_INTEGRATION_COPY,
  ATHLETE_LIVE_HREFS,
  ATHLETES_LOGIN_HREF,
  athleteDisplayName,
  athleteHandle,
  athletePaths,
} from "./overview.ts";

describe("athleteDisplayName", () => {
  it("prefers displayName, then name, then handle", () => {
    assert.equal(
      athleteDisplayName({
        displayName: "Sam",
        name: "Samuel",
        handle: "sam",
      }),
      "Sam",
    );
    assert.equal(
      athleteDisplayName({ name: "Samuel", handle: "sam" }),
      "Samuel",
    );
    assert.equal(athleteDisplayName({ handle: "sam" }), "@sam");
    assert.equal(athleteDisplayName({ handle: "@sam" }), "@sam");
    assert.equal(athleteDisplayName({}), "Athlete");
  });
});

describe("athleteHandle", () => {
  it("returns a leading @ or null", () => {
    assert.equal(athleteHandle({ handle: "sam" }), "@sam");
    assert.equal(athleteHandle({ handle: "@sam" }), "@sam");
    assert.equal(athleteHandle({}), null);
  });
});

describe("athlete live paths", () => {
  it("login CTA carries returnTo=/athletes", () => {
    assert.equal(ATHLETES_LOGIN_HREF, "/login?returnTo=%2Fathletes");
  });

  it("only links to shipped product routes", () => {
    const hrefs = Object.values(ATHLETE_LIVE_HREFS);
    for (const href of hrefs) {
      assert.match(href, /^\/(login\?returnTo=|padel\/|golf\/|communities|training|integrations|$)/);
    }
  });

  it("does not invent game or badge counts when lookups failed", () => {
    const paths = athletePaths({
      padelLocked: null,
      golfLocked: null,
      badgeCount: null,
      friendCount: 0,
      communityCount: 0,
      trainingActiveTitle: null,
      connectedIntegrations: 0,
      connectableIntegrations: 0,
    });
    const games = paths.find((path) => path.id === "games");
    const badges = paths.find((path) => path.id === "badges");
    assert.equal(games?.stat, "Unavailable");
    assert.equal(badges?.stat, "On your hub");
    assert.equal(games?.href, "/");
    assert.equal(badges?.href, "/");
  });

  it("uses real locked and earned counts when known", () => {
    const paths = athletePaths({
      padelLocked: 3,
      golfLocked: 1,
      badgeCount: 2,
      friendCount: 4,
      communityCount: 1,
      trainingActiveTitle: "Accuracy Focus",
      connectedIntegrations: 1,
      connectableIntegrations: 1,
    });
    assert.equal(
      paths.find((path) => path.id === "games")?.stat,
      "3 padel · 1 golf",
    );
    assert.equal(paths.find((path) => path.id === "badges")?.stat, "2 earned");
    assert.equal(
      paths.find((path) => path.id === "training")?.stat,
      "Accuracy Focus",
    );
    assert.equal(
      paths.find((path) => path.id === "integrations")?.href,
      "/integrations",
    );
    assert.equal(
      paths.find((path) => path.id === "communities")?.href,
      "/communities",
    );
    assert.match(
      paths.find((path) => path.id === "communities")?.description ?? "",
      /4 friends/,
    );
  });

  it("never mentions Trackman, Autodarts, or a fake Active status", () => {
    const paths = athletePaths({
      padelLocked: 0,
      golfLocked: 0,
      badgeCount: 0,
      friendCount: 0,
      communityCount: 0,
      trainingActiveTitle: null,
      connectedIntegrations: 0,
      connectableIntegrations: 1,
    });
    const blob = [
      ATHLETE_INTEGRATION_COPY.eyebrow,
      ATHLETE_INTEGRATION_COPY.title,
      ATHLETE_INTEGRATION_COPY.body,
      ...paths.flatMap((path) => [path.title, path.description, path.stat]),
    ].join(" ");
    assert.doesNotMatch(blob, /Trackman|Autodarts|\bActive\b/i);
    assert.match(blob, /Import session/);
    assert.equal(
      paths.find((path) => path.id === "integrations")?.stat,
      "Not connected",
    );
  });
});
