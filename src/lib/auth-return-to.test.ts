import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLoginPageHref,
  relativeAuthReturnTo,
} from "./auth-return-to.ts";

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
        pathname: "/play/padel",
        search: "?city=cape-town",
      }),
      "/play/padel?city=cape-town",
    );
    assert.equal(
      relativeAuthReturnTo({ pathname: "/venues/x", search: "" }),
      "/venues/x",
    );
  });
});

describe("getLoginPageHref", () => {
  it("returns /login when returnTo is empty", () => {
    assert.equal(getLoginPageHref(), "/login");
    assert.equal(getLoginPageHref("  "), "/login");
  });

  it("encodes a relative returnTo on the login page", () => {
    assert.equal(
      getLoginPageHref("/venues/the-grid"),
      "/login?returnTo=%2Fvenues%2Fthe-grid",
    );
    assert.equal(
      getLoginPageHref("/play/padel?city=cape-town"),
      "/login?returnTo=%2Fplay%2Fpadel%3Fcity%3Dcape-town",
    );
  });

  it("avoids nesting /login as returnTo", () => {
    assert.equal(getLoginPageHref("/login"), "/login");
    assert.equal(getLoginPageHref("/login?returnTo=%2F"), "/login");
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
