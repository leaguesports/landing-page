import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONVERSION_EVENTS,
  GA4_CONVERSION_EVENTS,
  isConversionEvent,
  isCtaSlot,
  isPageType,
  sanitizeTrackParams,
  toSafeEnum,
  track,
} from "./track.ts";

describe("conversion event catalog", () => {
  it("lists the required GA4 events", () => {
    assert.deepEqual([...CONVERSION_EVENTS], [
      "cta_click",
      "game_start",
      "game_lock",
      "share_click",
      "deep_link_land",
      "auth_soft_wall",
      "generate_lead",
      "roadmap_vote",
      "conversion_fallback",
      "lobby_looking_on",
      "lobby_post_open",
      "lobby_join",
      "lobby_propose_shown",
      "lobby_propose_accept",
    ]);
  });

  it("documents Brandon conversion events", () => {
    assert.deepEqual([...GA4_CONVERSION_EVENTS], [
      "game_start",
      "game_lock",
      "generate_lead",
      "share_click",
    ]);
  });

  it("accepts known enums only", () => {
    assert.equal(isConversionEvent("cta_click"), true);
    assert.equal(isConversionEvent("page_view"), false);
    assert.equal(isPageType("play_city_sport"), true);
    assert.equal(isPageType("lobby"), true);
    assert.equal(isPageType("marketing"), false);
    assert.equal(isCtaSlot("hero"), true);
    assert.equal(isCtaSlot("footer"), false);
  });
});

describe("sanitizeTrackParams", () => {
  it("strips email, name, and token keys", () => {
    const safe = sanitizeTrackParams({
      page_type: "play_city_sport",
      cta_slot: "hero",
      sport: "padel",
      email: "fan@example.com",
      name: "Ada Lovelace",
      displayName: "Ada",
      token: "secret",
      city: "cape-town",
    });
    assert.equal(safe.email, undefined);
    assert.equal(safe.name, undefined);
    assert.equal(safe.displayName, undefined);
    assert.equal(safe.token, undefined);
    assert.equal(safe.sport, "padel");
    assert.equal(safe.city, "cape-town");
    assert.equal(safe.page_type, "play_city_sport");
    assert.equal(safe.cta_slot, "hero");
  });

  it("drops string values that look like emails even on unknown keys", () => {
    const safe = sanitizeTrackParams({
      note: "fan@example.com",
      sport: "golf",
    });
    assert.equal(safe.note, undefined);
    assert.equal(safe.sport, "golf");
  });

  it("keeps sport enums and slugifies city, drops free-text sports", () => {
    const safe = sanitizeTrackParams({
      sport: "Padel in Cape Town with John",
      city: "Cape Town",
    });
    assert.equal(safe.sport, undefined);
    assert.equal(safe.city, "cape-town");
    assert.equal(toSafeEnum("cape-town"), "cape-town");
    assert.equal(toSafeEnum("padel"), "padel");
    assert.equal(
      sanitizeTrackParams({ sport: "padel" }).sport,
      "padel",
    );
  });
});

describe("track", () => {
  it("does not fire on the server", () => {
    assert.equal(typeof window, "undefined");
    track("cta_click", { email: "fan@example.com", page_type: "guide" });
  });
});
