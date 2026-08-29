import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VENUE_PLACEHOLDER_IMAGE } from "../services/venueQuery.ts";
import { getSecurityHeaders } from "./security-headers.ts";

function cspValue(nodeEnv?: typeof process.env.NODE_ENV): string {
  const csp = getSecurityHeaders(nodeEnv).find(
    (header) => header.key === "Content-Security-Policy",
  );
  assert.ok(csp);
  return csp.value;
}

describe("getSecurityHeaders img-src", () => {
  it("omits localhost from production CSP", () => {
    assert.equal(cspValue("production").includes("http://localhost:3002"), false);
  });

  it("allows localhost images outside production", () => {
    assert.equal(cspValue("development").includes("http://localhost:3002"), true);
  });

  it("allows same-origin and Sanity CDN hosts used by venue photos", () => {
    const csp = cspValue("production");
    assert.match(csp, /img-src[^;]*'self'/);
    assert.match(csp, /img-src[^;]*https:\/\/cdn\.sanity\.io/);
    assert.equal(VENUE_PLACEHOLDER_IMAGE.startsWith("/"), true);
    assert.doesNotMatch(VENUE_PLACEHOLDER_IMAGE, /astratic|unsplash/i);
  });

  it("does not upgrade HTTP on local next dev so same-origin /api works", () => {
    assert.equal(
      cspValue("development").includes("upgrade-insecure-requests"),
      false,
    );
    assert.equal(
      cspValue("production").includes("upgrade-insecure-requests"),
      true,
    );
  });
});
