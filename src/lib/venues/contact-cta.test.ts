import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildVenueWhatsAppUrl,
  hasVenueWhatsAppContact,
  isVenueClaimable,
  normalizePhoneForWhatsApp,
  resolveVenueWhatsAppCta,
  venueContactNumber,
  venueScreeningEmptyCopy,
} from "./contact-cta.ts";

describe("normalizePhoneForWhatsApp", () => {
  it("strips formatting and maps SA local 0XX to 27XX", () => {
    assert.equal(normalizePhoneForWhatsApp("+27 63 960 9784"), "27639609784");
    assert.equal(normalizePhoneForWhatsApp("063 960 9784"), "27639609784");
  });

  it("rejects empty or too-short values so we never emit a dead wa.me", () => {
    assert.equal(normalizePhoneForWhatsApp(""), null);
    assert.equal(normalizePhoneForWhatsApp("   "), null);
    assert.equal(normalizePhoneForWhatsApp("abc"), null);
    assert.equal(normalizePhoneForWhatsApp("123"), null);
    assert.equal(normalizePhoneForWhatsApp(null), null);
  });
});

describe("venueContactNumber", () => {
  it("prefers WhatsApp over phone, matching mapVenueRow", () => {
    assert.equal(
      venueContactNumber({ phone: "0211234567", whatsapp: "0820000000" }),
      "0820000000",
    );
    assert.equal(venueContactNumber({ phone: "0211234567" }), "0211234567");
    assert.equal(venueContactNumber({}), null);
  });
});

describe("buildVenueWhatsAppUrl", () => {
  it("builds a wa.me inquire link from a Play-style CMS number", () => {
    const href = buildVenueWhatsAppUrl("+27 63 960 9784", "Africa Padel Camps Bay");
    assert.ok(href);
    const url = new URL(href);
    assert.equal(url.origin + url.pathname, "https://wa.me/27639609784");
    assert.match(decodeURIComponent(url.searchParams.get("text") ?? ""), /Africa Padel/);
  });

  it("returns null for unusable numbers", () => {
    assert.equal(buildVenueWhatsAppUrl("n/a", "Benchwarmers"), null);
  });
});

describe("resolveVenueWhatsAppCta", () => {
  it("uses the same Inquire / Book WhatsApp CTA for Watch and Play when a number exists", () => {
    const play = resolveVenueWhatsAppCta({
      name: "Africa Padel Camps Bay",
      slug: "africa-padel-camps-bay",
      phone: "+27 63 960 9784",
    });
    const watch = resolveVenueWhatsAppCta({
      name: "Watch Bar",
      slug: "watch-bar",
      whatsapp: "0639609784",
    });
    assert.equal(play.kind, "whatsapp");
    assert.equal(watch.kind, "whatsapp");
    assert.equal(play.label, "Inquire / Book via WhatsApp");
    assert.equal(watch.label, play.label);
  });

  it("falls back to Claim to add WhatsApp when the listing is claimable and has no number", () => {
    const cta = resolveVenueWhatsAppCta({
      name: "Benchwarmers Sports Bar",
      slug: "benchwarmers-sports-bar",
      claim_status: "unclaimed",
      is_verified: false,
    });
    assert.deepEqual(cta, {
      kind: "claim",
      href: "/claim?venue=benchwarmers-sports-bar",
      label: "Claim to add WhatsApp",
    });
  });

  it("does not invent a WhatsApp button for claimed venues without a CMS number", () => {
    const cta = resolveVenueWhatsAppCta({
      name: "Claimed Watch",
      slug: "claimed-watch",
      claim_status: "claimed",
      is_verified: true,
    });
    assert.deepEqual(cta, { kind: "missing", label: "WhatsApp not listed" });
  });
});

describe("isVenueClaimable", () => {
  it("matches the venue-page Claim Profile bar", () => {
    assert.equal(isVenueClaimable({}), true);
    assert.equal(isVenueClaimable({ is_verified: false, claim_status: "unclaimed" }), true);
    assert.equal(isVenueClaimable({ claim_status: "claim_pending" }), false);
    assert.equal(isVenueClaimable({ claim_status: "claimed" }), false);
    assert.equal(isVenueClaimable({ is_verified: true }), false);
  });
});

describe("venueScreeningEmptyCopy", () => {
  it("mentions WhatsApp only when a usable number exists", () => {
    assert.match(
      venueScreeningEmptyCopy({ phone: "+27 63 960 9784" }),
      /via WhatsApp/,
    );
    assert.doesNotMatch(venueScreeningEmptyCopy({}), /WhatsApp/);
    assert.doesNotMatch(venueScreeningEmptyCopy({ phone: "n/a" }), /WhatsApp/);
    assert.equal(hasVenueWhatsAppContact({ phone: "063 960 9784" }), true);
    assert.equal(hasVenueWhatsAppContact({}), false);
  });
});
