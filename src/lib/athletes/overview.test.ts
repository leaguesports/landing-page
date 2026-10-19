import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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

  it("only links to surviving hub routes", () => {
    const hrefs = Object.values(ATHLETE_LIVE_HREFS);
    for (const href of hrefs) {
      assert.match(href, /^\/(login\?returnTo=|play|communities|$)/);
    }
  });

  it("links communities from friend and group counts", () => {
    const empty = athletePaths({ friendCount: 0, communityCount: 0 });
    assert.equal(empty[0]?.id, "communities");
    assert.equal(empty[0]?.href, "/communities");
    assert.equal(empty[0]?.stat, "None yet");

    const paths = athletePaths({ friendCount: 4, communityCount: 1 });
    assert.equal(paths[0]?.stat, "1 joined");
    assert.match(paths[0]?.description ?? "", /4 friends/);
  });
});
