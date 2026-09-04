import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_HOMEPAGE_STATS,
  HOMEPAGE_STATS_QUERY,
  normalizeHomepageStats,
} from "./homepageStats.ts";

describe("HOMEPAGE_STATS_QUERY", () => {
  it("counts Watch and Play with the same broadcast/sports rules as the directories", () => {
    assert.match(
      HOMEPAGE_STATS_QUERY,
      /count\(\*\[_type == "venue" && count\(broadcasts\) > 0\]\)/,
    );
    assert.match(
      HOMEPAGE_STATS_QUERY,
      /count\(\*\[_type == "venue" && count\(sports\) > 0\]\)/,
    );
  });

  it("counts real event docs, screenings, and guides — not hardcoded marketing figures", () => {
    assert.match(HOMEPAGE_STATS_QUERY, /count\(\*\[_type == "event"\]\)/);
    assert.match(
      HOMEPAGE_STATS_QUERY,
      /count\(\*\[_type == "venue"\]\.upcoming_screenings\[\]\)/,
    );
    assert.match(HOMEPAGE_STATS_QUERY, /count\(\*\[_type == "guide"\]\)/);
    assert.doesNotMatch(HOMEPAGE_STATS_QUERY, /500|1200|10K/);
  });
});

describe("normalizeHomepageStats", () => {
  it("returns zeros for missing or invalid rows", () => {
    assert.deepEqual(normalizeHomepageStats(null), EMPTY_HOMEPAGE_STATS);
    assert.deepEqual(normalizeHomepageStats({}), EMPTY_HOMEPAGE_STATS);
    assert.deepEqual(
      normalizeHomepageStats({
        watchVenues: "12",
        playVenues: -1,
        events: Number.NaN,
      }),
      EMPTY_HOMEPAGE_STATS,
    );
  });

  it("adds CMS events and venue screenings into one events total", () => {
    assert.deepEqual(
      normalizeHomepageStats({
        watchVenues: 47,
        playVenues: 23,
        events: 6,
        screenings: 4,
        guides: 4,
      }),
      {
        watchVenues: 47,
        playVenues: 23,
        events: 10,
        guides: 4,
      },
    );
  });
});
