import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  guideHref,
  isGuideSlug,
  publishedGuides,
  resolveGuideSlug,
  slugifyGuideTitle,
} from "./slugs.ts";

const FOUR_BALL = {
  title: "How to Find a Padel Four-Ball Near You",
  slug: "how-to-find-padel-four-ball",
};

const CLAIM_VENUE = {
  title: "Claim Your Venue on LeagueSports",
  slug: "claim-your-venue-leaguesports",
};

const TRACK_SCORES = {
  title: "Track Padel or Golf Scores on LeagueSports",
  slug: "track-padel-golf-scores",
};

const JOBURG_PADEL = {
  title: "The Ultimate Guide to the Best Padel Courts in Johannesburg",
  slug: "best-padel-courts-joburg",
};

const CAPE_PADEL = {
  title: "The Ultimate Guide to the Best Padel Courts in Cape Town",
  slug: "best-padel-courts-cape-town",
};

/** Production-shaped catalog used to prove unique vs colliding prefixes. */
const PRODUCTION_CANDIDATES = [
  FOUR_BALL,
  TRACK_SCORES,
  CLAIM_VENUE,
  CAPE_PADEL,
  JOBURG_PADEL,
  {
    title: "Best Sports Bars in Cape Town",
    slug: "best-sports-bars-cape-town",
  },
  {
    title: "The 7 Best Sports Bars in Johannesburg for Every Fan",
    slug: "best-sports-bars-johannesburg",
  },
  {
    title: "Where to Watch F1 & Motorsport in Johannesburg",
    slug: "where-to-watch-f1-johannesburg",
  },
  {
    title: "Where to Watch Cricket & the Proteas in Johannesburg",
    slug: "where-to-watch-cricket-johannesburg",
  },
  {
    title: "Where to Watch Rugby & the Springboks in Johannesburg",
    slug: "where-to-watch-rugby-johannesburg",
  },
];

describe("isGuideSlug", () => {
  it("accepts stored Sanity slugs", () => {
    assert.equal(isGuideSlug("how-to-find-padel-four-ball"), true);
    assert.equal(isGuideSlug("best-padel-courts-cape-town"), true);
  });

  it("rejects missing, stringified, or unsafe tokens", () => {
    assert.equal(isGuideSlug(undefined), false);
    assert.equal(isGuideSlug(null), false);
    assert.equal(isGuideSlug(""), false);
    assert.equal(isGuideSlug("undefined"), false);
    assert.equal(isGuideSlug("null"), false);
    assert.equal(isGuideSlug("has space"), false);
    assert.equal(isGuideSlug("/guides/x"), false);
    assert.equal(isGuideSlug(" leading"), false);
  });
});

describe("slugifyGuideTitle", () => {
  it("matches the production 404 title-derived URL for the four-ball guide", () => {
    assert.equal(
      slugifyGuideTitle(FOUR_BALL.title),
      "how-to-find-a-padel-four-ball-near-you",
    );
  });

  it("strips apostrophes the way Sanity slugify does", () => {
    assert.equal(
      slugifyGuideTitle("The Soccer Fan's Handbook: Best Spots"),
      "the-soccer-fans-handbook-best-spots",
    );
  });
});

describe("resolveGuideSlug", () => {
  it("returns the stored slug for an exact match", () => {
    assert.equal(
      resolveGuideSlug("how-to-find-padel-four-ball", PRODUCTION_CANDIDATES),
      "how-to-find-padel-four-ball",
    );
  });

  it("resolves the four-ball title-derived alias to the stored slug", () => {
    assert.equal(
      resolveGuideSlug(
        "how-to-find-a-padel-four-ball-near-you",
        PRODUCTION_CANDIDATES,
      ),
      "how-to-find-padel-four-ball",
    );
  });

  it("resolves a unique shortened prefix to the stored slug", () => {
    assert.equal(
      resolveGuideSlug("claim-your-venue", PRODUCTION_CANDIDATES),
      "claim-your-venue-leaguesports",
    );
  });

  it("resolves a unique title-derived prefix for track scores", () => {
    assert.equal(
      slugifyGuideTitle(TRACK_SCORES.title),
      "track-padel-or-golf-scores-on-leaguesports",
    );
    assert.equal(
      resolveGuideSlug("track-padel-or-golf-scores", PRODUCTION_CANDIDATES),
      "track-padel-golf-scores",
    );
  });

  it("resolves the Joburg padel title-derived slug to the stored slug", () => {
    assert.equal(
      slugifyGuideTitle(JOBURG_PADEL.title),
      "the-ultimate-guide-to-the-best-padel-courts-in-johannesburg",
    );
    assert.equal(
      resolveGuideSlug(
        "the-ultimate-guide-to-the-best-padel-courts-in-johannesburg",
        PRODUCTION_CANDIDATES,
      ),
      "best-padel-courts-joburg",
    );
  });

  it("normalizes case before matching", () => {
    assert.equal(
      resolveGuideSlug("How-To-Find-Padel-Four-Ball", PRODUCTION_CANDIDATES),
      "how-to-find-padel-four-ball",
    );
    assert.equal(
      resolveGuideSlug("Claim-Your-Venue", PRODUCTION_CANDIDATES),
      "claim-your-venue-leaguesports",
    );
  });

  it("returns null when the token matches no slug or unique title", () => {
    assert.equal(resolveGuideSlug("missing-guide", PRODUCTION_CANDIDATES), null);
    assert.equal(resolveGuideSlug("", PRODUCTION_CANDIDATES), null);
  });

  it("does not guess when two titles slugify to the same alias", () => {
    assert.equal(
      resolveGuideSlug("same-title", [
        { title: "Same Title", slug: "one" },
        { title: "Same Title", slug: "two" },
      ]),
      null,
    );
  });

  it("does not guess when multiple stored slugs share a prefix", () => {
    assert.equal(
      resolveGuideSlug("best-padel-courts", PRODUCTION_CANDIDATES),
      null,
    );
    assert.equal(
      resolveGuideSlug("best-sports-bars", PRODUCTION_CANDIDATES),
      null,
    );
    assert.equal(
      resolveGuideSlug("where-to-watch", PRODUCTION_CANDIDATES),
      null,
    );
  });

  it("does not guess when two title slugs share a prefix", () => {
    assert.equal(
      resolveGuideSlug(
        "the-ultimate-guide-to-the-best-padel-courts",
        PRODUCTION_CANDIDATES,
      ),
      null,
    );
  });

  it("does not guess a short unique prefix under the min length", () => {
    assert.equal(resolveGuideSlug("claim", PRODUCTION_CANDIDATES), null);
  });

  it("does not rewrite Johannesburg to the stored Joburg slug", () => {
    assert.equal(
      resolveGuideSlug("best-padel-courts-johannesburg", PRODUCTION_CANDIDATES),
      null,
    );
  });
});

describe("publishedGuides", () => {
  it("drops rows that cannot become a /guides/{slug} href", () => {
    const rows = publishedGuides([
      { _id: "ok", slug: "best-padel-courts-cape-town" },
      { _id: "empty", slug: "" },
      { _id: "missing", slug: null },
      { _id: "bad", slug: "undefined" },
    ]);
    assert.deepEqual(
      rows.map((row) => row._id),
      ["ok"],
    );
  });
});

describe("guideHref", () => {
  it("builds the canonical path", () => {
    assert.equal(guideHref("best-padel-courts-cape-town"), "/guides/best-padel-courts-cape-town");
  });
});
