import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { getPublicSiteOrigin, shouldProxyApiPath } from "./api-origin.ts";

describe("getPublicSiteOrigin", () => {
  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://leaguesports.co.za/";
    try {
      assert.equal(getPublicSiteOrigin(), "https://leaguesports.co.za");
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previous;
      }
    }
  });
});

describe("shouldProxyApiPath", () => {
  it("proxies communities, follow, and pool routes", () => {
    assert.equal(shouldProxyApiPath("/api/communities"), true);
    assert.equal(shouldProxyApiPath("/api/communities/rugby-chat/join"), true);
    assert.equal(shouldProxyApiPath("/api/communities/x/members/y"), true);
    assert.equal(shouldProxyApiPath("/api/me/followed-fixtures"), true);
    assert.equal(shouldProxyApiPath("/api/fixtures/wp-vs-sharks/follow"), true);
    assert.equal(shouldProxyApiPath("/api/pools"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/join"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/picks"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/result"), true);
    assert.equal(shouldProxyApiPath("/api/pools/ab12cd34/standings"), true);
    assert.equal(shouldProxyApiPath("/api/auth/login"), false);
    assert.equal(shouldProxyApiPath("/api/internal/health"), false);
  });
});

describe("next.config rewrites", () => {
  it("keeps one rewrite per explicit source plus the two catch-alls", () => {
    const config = readFileSync(new URL("../..", import.meta.url) + "next.config.ts", "utf8");
    const rewriteCount = [...config.matchAll(/source:\s*"\/api\//g)].length;
    const { API_PROXY_EXPLICIT_SOURCES } = require("./api-origin.ts") as typeof import("./api-origin.ts");
    assert.equal(rewriteCount, API_PROXY_EXPLICIT_SOURCES.length + 2);
  });
});
