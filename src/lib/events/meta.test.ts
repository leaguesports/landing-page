import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixtureSeoDescription, fixtureSeoTitle } from "./meta.ts";

describe("fixtureSeoTitle", () => {
  it("uses seoTitle when set", () => {
    assert.equal(
      fixtureSeoTitle({
        title: "Boks vs ABs",
        seoTitle: "Springboks vs All Blacks — where to watch",
      }),
      "Springboks vs All Blacks — where to watch",
    );
  });

  it("defaults from competition, teams, and date", () => {
    assert.match(
      fixtureSeoTitle({
        title: "Unused",
        competition: "Rugby Championship",
        teams: [{ name: "Springboks" }, { name: "All Blacks" }],
        startsAt: "2026-09-06T16:00:00.000Z",
      }),
      /^Springboks vs All Blacks · Rugby Championship · \d{1,2} Sept? 2026$/,
    );
  });
});

describe("fixtureSeoDescription", () => {
  it("prefers seoDescription, then intro, then venue-count default", () => {
    assert.equal(
      fixtureSeoDescription({
        title: "Derby",
        seoDescription: "Custom meta.",
        seoIntro: "Ignored intro",
      }),
      "Custom meta.",
    );
    assert.equal(
      fixtureSeoDescription({
        title: "Derby",
        seoIntro: "A unique intro about the derby in Johannesburg tonight.",
      }),
      "A unique intro about the derby in Johannesburg tonight.",
    );
    assert.match(
      fixtureSeoDescription({ title: "Derby", venueCount: 2 }),
      /2 venues screening/,
    );
    assert.match(
      fixtureSeoDescription({
        title: "Spanish Grand Prix",
        circuitLine: "Madring, Madrid, Spain",
      }),
      /Madring, Madrid, Spain/,
    );
  });
});
