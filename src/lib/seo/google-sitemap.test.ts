import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveGoogleSitemapConfig,
  searchConsoleSitemapSubmitUrl,
} from "./google-sitemap.ts";

const FEED = "https://leaguesports.co.za/sitemap-index.xml";

describe("resolveGoogleSitemapConfig", () => {
  it("skips when the site URL or service account is missing", () => {
    assert.equal(resolveGoogleSitemapConfig({}, FEED).ok, false);
    const siteOnly = resolveGoogleSitemapConfig(
      { GSC_SITE_URL: "sc-domain:leaguesports.co.za" },
      FEED,
    );
    assert.equal(siteOnly.ok, false);
    if (!siteOnly.ok) {
      assert.match(siteOnly.reason, /service account/);
    }
  });

  it("accepts a JSON key or an email plus private key", () => {
    const fromJson = resolveGoogleSitemapConfig(
      {
        GSC_SITE_URL: " sc-domain:leaguesports.co.za ",
        GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({
          client_email: "bot@example.iam.gserviceaccount.com",
          private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
        }),
      },
      FEED,
    );
    assert.equal(fromJson.ok, true);
    if (fromJson.ok) {
      assert.equal(fromJson.siteUrl, "sc-domain:leaguesports.co.za");
      assert.equal(fromJson.email, "bot@example.iam.gserviceaccount.com");
      assert.match(fromJson.key, /BEGIN PRIVATE KEY/);
      assert.equal(fromJson.feedUrl, FEED);
    }

    const fromPair = resolveGoogleSitemapConfig(
      {
        GSC_SITE_URL: "https://leaguesports.co.za/",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "bot@example.iam.gserviceaccount.com",
        GOOGLE_SERVICE_ACCOUNT_KEY:
          "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
      },
      FEED,
    );
    assert.equal(fromPair.ok, true);
    if (fromPair.ok) {
      assert.match(fromPair.key, /\n/);
      assert.doesNotMatch(fromPair.key, /\\n/);
    }
  });
});

describe("searchConsoleSitemapSubmitUrl", () => {
  it("encodes a domain property and the sitemap index", () => {
    const url = searchConsoleSitemapSubmitUrl(
      "sc-domain:leaguesports.co.za",
      FEED,
    );
    assert.equal(
      url,
      "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Aleaguesports.co.za/sitemaps/https%3A%2F%2Fleaguesports.co.za%2Fsitemap-index.xml",
    );
  });
});