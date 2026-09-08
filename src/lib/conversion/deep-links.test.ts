import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deepLinkRecovery,
  guideConversionIntent,
  missingObjectOgTitle,
  rankVenuesByCity,
} from "./deep-links.ts";

describe("missingObjectOgTitle", () => {
  it("names the object when the share target is gone", () => {
    assert.equal(
      missingObjectOgTitle("scorecard", "Padel match abc"),
      "Padel match abc scorecard",
    );
    assert.equal(missingObjectOgTitle("event", "Boks vs All Blacks"), "Boks vs All Blacks");
    assert.equal(missingObjectOgTitle("venue", "The Grid"), "The Grid");
    assert.equal(missingObjectOgTitle("team", "Claremont Cats"), "Claremont Cats");
    assert.equal(missingObjectOgTitle("organise", "game-9"), "Organised game game-9");
  });
});

describe("deepLinkRecovery", () => {
  it("stays in-loop and never sends visitors to marketing /", () => {
    const kinds = ["scorecard", "organise", "event", "venue", "team"] as const;
    for (const kind of kinds) {
      const recovery = deepLinkRecovery({ kind, objectName: "Test" });
      assert.notEqual(recovery.primary.href, "/");
      assert.notEqual(recovery.secondary.href, "/");
      assert.ok(recovery.primary.href.startsWith("/"));
    }
    assert.equal(deepLinkRecovery({ kind: "organise" }).primary.href, "/play");
    assert.equal(deepLinkRecovery({ kind: "event" }).primary.href, "/events");
    assert.equal(deepLinkRecovery({ kind: "venue" }).primary.href, "/venues");
    assert.equal(deepLinkRecovery({ kind: "team" }).primary.href, "/teams");
  });
});

describe("rankVenuesByCity", () => {
  it("prefers venues in the requested city without dropping others", () => {
    const ranked = rankVenuesByCity(
      [
        { city: "Johannesburg", suburb: "Sandton" },
        { city: "Cape Town", suburb: "Claremont" },
        { city: "Cape Town", suburb: "Sea Point" },
      ],
      "cape-town",
    );
    assert.equal(ranked[0]?.city, "Cape Town");
    assert.equal(ranked[1]?.city, "Cape Town");
    assert.equal(ranked[2]?.city, "Johannesburg");
    assert.equal(ranked.length, 3);
  });
});

describe("guideConversionIntent", () => {
  it("picks play or watch from slug, title, and keywords", () => {
    assert.equal(
      guideConversionIntent({
        slug: "best-padel-courts-cape-town",
        title: "Best padel courts",
      }),
      "play",
    );
    assert.equal(
      guideConversionIntent({
        slug: "where-to-watch-springboks",
        title: "Where to watch the Springboks",
        keywords: ["screening"],
      }),
      "watch",
    );
  });
});
