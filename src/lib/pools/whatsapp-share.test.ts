import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildPoolWhatsAppShare,
  poolAbsoluteUrl,
  poolShareText,
} from "./whatsapp-share.ts";

describe("pool WhatsApp share", () => {
  it("builds an absolute /pools/{code} URL", () => {
    assert.equal(
      poolAbsoluteUrl("ab12cd34", "https://leaguesports.co.za/"),
      "https://leaguesports.co.za/pools/ab12cd34",
    );
  });

  it("encodes the invite code in the path", () => {
    assert.equal(
      poolAbsoluteUrl("ab/cd", "https://leaguesports.co.za"),
      "https://leaguesports.co.za/pools/ab%2Fcd",
    );
  });

  it("includes fixture title and absolute URL in share copy", () => {
    const text = poolShareText({
      inviteCode: "ab12cd34",
      fixtureTitle: "Springboks vs All Blacks",
      poolTitle: "Boks tips",
      origin: "https://leaguesports.co.za",
    });
    assert.match(text, /Boks tips/);
    assert.match(text, /Springboks vs All Blacks/);
    assert.match(text, /https:\/\/leaguesports\.co\.za\/pools\/ab12cd34/);
  });

  it("builds a wa.me href without a phone number", () => {
    const share = buildPoolWhatsAppShare({
      inviteCode: "ab12cd34",
      fixtureTitle: "Derby",
      origin: "https://leaguesports.co.za",
    });
    assert.equal(share.poolUrl, "https://leaguesports.co.za/pools/ab12cd34");
    assert.match(share.href, /^https:\/\/wa\.me\/\?text=/);
    assert.equal(share.href.includes("phone"), false);
  });
});
