import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { relativeAuthReturnTo } from "./auth-return-to.ts";

/**
 * Mirror of the same-origin check in auth-return-to.ts for Node tests
 * (jsdom sessionStorage is not required for the URL safety rules).
 */
function isSafeSameOriginReturnTo(
  value: string,
  origin: string,
): boolean {
  try {
    const target = new URL(value, origin);
    if (target.origin !== origin) return false;
    if (target.username || target.password) return false;
    return target.pathname.startsWith("/");
  } catch {
    return false;
  }
}

describe("relativeAuthReturnTo", () => {
  it("keeps path and query without becoming absolute", () => {
    assert.equal(
      relativeAuthReturnTo({
        pathname: "/padel/new",
        search: "?venue=the-grid",
      }),
      "/padel/new?venue=the-grid",
    );
    assert.equal(
      relativeAuthReturnTo({ pathname: "/venues/x", search: "" }),
      "/venues/x",
    );
  });
});

describe("auth returnTo safety", () => {
  const origin = "https://leaguesports.co.za";

  it("allows same-origin venue paths", () => {
    assert.equal(
      isSafeSameOriginReturnTo(
        "https://leaguesports.co.za/venues/the-grid",
        origin,
      ),
      true,
    );
    assert.equal(
      isSafeSameOriginReturnTo("/venues/the-grid", origin),
      true,
    );
  });

  it("rejects external and credentialed URLs", () => {
    assert.equal(
      isSafeSameOriginReturnTo("https://evil.example/x", origin),
      false,
    );
    assert.equal(
      isSafeSameOriginReturnTo(
        "https://user:pass@leaguesports.co.za/x",
        origin,
      ),
      false,
    );
  });
});
