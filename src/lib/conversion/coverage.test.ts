import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COVERAGE_CREATE_PATH,
  COVERAGE_PROXY_SOURCES,
  COVERAGE_UNSUBSCRIBE_PATH,
  buildCoveragePayload,
  buildCoverageUnsubscribePayload,
  coverageHonestyCopy,
  parseCoverageIntentResponse,
} from "./coverage.ts";

describe("coverage proxy paths", () => {
  it("matches the Railway coverage routes", () => {
    assert.deepEqual([...COVERAGE_PROXY_SOURCES], [
      "/api/intents/coverage",
      "/api/intents/coverage/unsubscribe",
    ]);
    assert.equal(COVERAGE_CREATE_PATH, "/api/intents/coverage");
    assert.equal(
      COVERAGE_UNSUBSCRIBE_PATH,
      "/api/intents/coverage/unsubscribe",
    );
  });
});

describe("buildCoveragePayload", () => {
  it("builds a valid body and omits unknown sports", () => {
    const payload = buildCoveragePayload({
      email: "  Fan@Example.com ",
      sport: "padel",
      city: "Cape Town",
      sourcePage: "/play/padel/cape-town",
    });
    assert.deepEqual(payload, {
      email: "fan@example.com",
      sport: "padel",
      city: "cape town",
      sourcePage: "/play/padel/cape-town",
    });
  });

  it("drops sports the coverage API does not store", () => {
    const payload = buildCoveragePayload({
      email: "fan@example.com",
      sport: "soccer",
      city: "johannesburg",
      sourcePage: "https://leaguesports.co.za/watch/soccer/johannesburg?x=1",
    });
    assert.ok(payload);
    assert.equal(payload.sport, undefined);
    assert.equal(payload.city, "johannesburg");
    assert.equal(payload.sourcePage, "/watch/soccer/johannesburg?x=1");
  });

  it("rejects invalid email and unsafe source pages", () => {
    assert.equal(buildCoveragePayload({ email: "not-an-email" }), null);
    const payload = buildCoveragePayload({
      email: "fan@example.com",
      sourcePage: "//evil.example/phish",
    });
    assert.ok(payload);
    assert.equal(payload.sourcePage, undefined);
  });
});

describe("parseCoverageIntentResponse", () => {
  it("returns the public intent and never keeps email", () => {
    const parsed = parseCoverageIntentResponse({
      intent: {
        id: "int_1",
        email: "fan@example.com",
        sport: "golf",
        city: "cape town",
        sourcePage: "/play/golf/cape-town",
        createdAt: "2026-09-08T18:00:00.000Z",
      },
    });
    assert.ok(parsed);
    assert.equal(parsed.id, "int_1");
    assert.equal(parsed.sport, "golf");
    assert.equal("email" in parsed, false);
    assert.equal(
      JSON.stringify(parsed).includes("fan@example.com"),
      false,
    );
  });
});

describe("buildCoverageUnsubscribePayload", () => {
  it("requires a non-empty token", () => {
    assert.deepEqual(buildCoverageUnsubscribePayload(" tok "), { token: "tok" });
    assert.equal(buildCoverageUnsubscribePayload(""), null);
    assert.equal(buildCoverageUnsubscribePayload(null), null);
  });
});

describe("coverageHonestyCopy", () => {
  it("names sport and city without inventing venues", () => {
    assert.match(
      coverageHonestyCopy({ sportName: "padel", cityName: "Cape Town" }),
      /don't list venues we haven't verified/i,
    );
    assert.match(
      coverageHonestyCopy({ sportName: "padel", cityName: "Cape Town" }),
      /No fake padel listings in Cape Town/,
    );
  });
});
