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
  const candidates = [
    FOUR_BALL,
    {
      title: "The Ultimate Guide to the Best Padel Courts in Cape Town",
      slug: "best-padel-courts-cape-town",
    },
  ];

  it("returns the stored slug for an exact match", () => {
    assert.equal(
      resolveGuideSlug("how-to-find-padel-four-ball", candidates),
      "how-to-find-padel-four-ball",
    );
  });

  it("resolves a title-derived alias to the stored slug", () => {
    assert.equal(
      resolveGuideSlug("how-to-find-a-padel-four-ball-near-you", candidates),
      "how-to-find-padel-four-ball",
    );
  });

  it("normalizes case before matching", () => {
    assert.equal(
      resolveGuideSlug("How-To-Find-Padel-Four-Ball", candidates),
      "how-to-find-padel-four-ball",
    );
  });

  it("returns null when the token matches no slug or unique title", () => {
    assert.equal(resolveGuideSlug("missing-guide", candidates), null);
    assert.equal(resolveGuideSlug("", candidates), null);
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
