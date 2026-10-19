import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  isRedirectedVenueSlug,
  VENUE_PERMANENT_REDIRECTS,
} from "./redirects.ts";

describe("venue permanent redirects", () => {
  it("301s the Bryanston bowls alias to the club slug", () => {
    assert.deepEqual(VENUE_PERMANENT_REDIRECTS, [
      {
        source: "/venues/bryanston-sports-club-bowls",
        destination: "/venues/bryanston-sports-club",
        statusCode: 301,
      },
    ]);
    assert.equal(isRedirectedVenueSlug("bryanston-sports-club-bowls"), true);
    assert.equal(isRedirectedVenueSlug("bryanston-sports-club"), false);
  });

  it("is the entry next.config redirects() spreads, not a 308 permanent flag", () => {
    const config = readFileSync(
      new URL("../../../next.config.ts", import.meta.url),
      "utf8",
    );
    assert.match(config, /VENUE_PERMANENT_REDIRECTS/);
    assert.equal(
      config.includes("bryanston-sports-club-bowls"),
      false,
      "the slug lives in the redirects module, which next.config spreads",
    );
  });
});
