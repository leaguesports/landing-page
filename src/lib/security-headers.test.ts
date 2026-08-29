import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getSecurityHeaders } from "./security-headers.ts";

const savedNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = savedNodeEnv;
});

function cspValue(): string {
  const csp = getSecurityHeaders().find(
    (header) => header.key === "Content-Security-Policy",
  );
  assert.ok(csp);
  return csp.value;
}

describe("getSecurityHeaders img-src", () => {
  it("omits localhost from production CSP", () => {
    process.env.NODE_ENV = "production";
    assert.equal(cspValue().includes("http://localhost:3002"), false);
  });

  it("allows localhost images outside production", () => {
    process.env.NODE_ENV = "development";
    assert.equal(cspValue().includes("http://localhost:3002"), true);
  });
});
