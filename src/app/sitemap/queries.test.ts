import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SANITY_REVALIDATE_FILTER,
  SANITY_REVALIDATE_PROJECTION,
  SANITY_REVALIDATE_URL,
} from "../../lib/seo/revalidate-projection.ts";
import {
  SITEMAP_EVENTS_QUERY,
  SITEMAP_GUIDES_QUERY,
  SITEMAP_LOCATIONS_QUERY,
  SITEMAP_METRO_PAGES_QUERY,
  SITEMAP_SERIES_QUERY,
  SITEMAP_SPORTS_QUERY,
  SITEMAP_VENUES_QUERY,
} from "./queries.ts";

describe("sitemap document queries", () => {
  it("reads lastmod from each page document _updatedAt", () => {
    for (const query of [
      SITEMAP_VENUES_QUERY,
      SITEMAP_GUIDES_QUERY,
      SITEMAP_EVENTS_QUERY,
      SITEMAP_METRO_PAGES_QUERY,
      SITEMAP_SPORTS_QUERY,
      SITEMAP_SERIES_QUERY,
      SITEMAP_LOCATIONS_QUERY,
    ]) {
      assert.match(query, /"updatedAt": _updatedAt/);
    }
    assert.match(SITEMAP_EVENTS_QUERY, /_type == "event"/);
    assert.match(SITEMAP_GUIDES_QUERY, /_type == "guide"/);
    assert.match(SITEMAP_VENUES_QUERY, /_type == "venue"/);
    assert.match(SITEMAP_METRO_PAGES_QUERY, /_type == "metroPage"/);
    assert.match(SITEMAP_SPORTS_QUERY, /_type == "sport"/);
    assert.match(SITEMAP_SERIES_QUERY, /_type == "series"/);
    assert.match(SITEMAP_LOCATIONS_QUERY, /_type == "location"/);
    assert.doesNotMatch(SITEMAP_EVENTS_QUERY, /\[0\.\.\./);
    assert.doesNotMatch(SITEMAP_GUIDES_QUERY, /_createdAt/);
    assert.doesNotMatch(SITEMAP_EVENTS_QUERY, /coalesce\(_updatedAt/);
  });
});

describe("Sanity revalidate webhook projection", () => {
  it("covers every page document and the fields the handler reads", () => {
    assert.equal(
      SANITY_REVALIDATE_URL,
      "https://leaguesports.co.za/api/revalidate",
    );
    for (const type of [
      "event",
      "venue",
      "guide",
      "metroPage",
      "sport",
      "series",
      "location",
    ]) {
      assert.match(SANITY_REVALIDATE_FILTER, new RegExp(`"${type}"`));
    }
    assert.match(SANITY_REVALIDATE_FILTER, /drafts/);
    for (const field of [
      "_id",
      "_type",
      "slug",
      "startsAt",
      "intent",
      "activitySlug",
      "citySlug",
      "sportSlug",
      "locationType",
      "hostVenue",
      "relatedGuide",
      "screenings",
      "broadcasts",
      "sports",
      "venueLocations",
      "before()",
      "after()",
    ]) {
      assert.equal(SANITY_REVALIDATE_PROJECTION.includes(field), true, field);
    }
  });
});