import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SITEMAP_PUBLISHED_VENUES_QUERY } from "./source.ts";

describe("sitemap published venue query", () => {
  it("lists published venue slugs and skips draft documents", () => {
    assert.match(SITEMAP_PUBLISHED_VENUES_QUERY, /_type == "venue"/);
    assert.match(SITEMAP_PUBLISHED_VENUES_QUERY, /defined\(slug\.current\)/);
    assert.ok(
      SITEMAP_PUBLISHED_VENUES_QUERY.includes('!(_id in path("drafts.**"))'),
    );
  });
});
