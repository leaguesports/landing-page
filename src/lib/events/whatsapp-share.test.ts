import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFixtureWhatsAppShare,
  fixtureAbsoluteUrl,
  fixtureWhatsAppHref,
} from "./whatsapp-share.ts";

describe("fixture WhatsApp share", () => {
  it("builds a wa.me href without a phone number", () => {
    const share = buildFixtureWhatsAppShare({
      title: "Springboks vs All Blacks",
      slug: "springboks-vs-all-blacks-2026-09-06",
      origin: "https://leaguesports.co.za",
    });
    assert.equal(
      share.pageUrl,
      "https://leaguesports.co.za/events/springboks-vs-all-blacks-2026-09-06",
    );
    assert.match(share.text, /Springboks vs All Blacks/);
    assert.match(share.text, /leaguesports\.co\.za\/events\//);
    const url = new URL(share.href);
    assert.equal(url.origin + url.pathname, "https://wa.me/");
    assert.ok(url.searchParams.get("text"));
  });

  it("encodes the fixture slug on the page URL", () => {
    assert.equal(
      fixtureAbsoluteUrl("springboks vs all blacks", "https://leaguesports.co.za"),
      "https://leaguesports.co.za/events/springboks%20vs%20all%20blacks",
    );
    const href = fixtureWhatsAppHref("Watch derby\nhttps://example.test/events/x");
    assert.match(href, /^https:\/\/wa\.me\/\?text=/);
    assert.equal(decodeURIComponent(new URL(href).searchParams.get("text") ?? ""), "Watch derby\nhttps://example.test/events/x");
  });
});
