import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
});
