import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emptyPreferences,
  getPreferencesWith,
  needsOnboarding,
  updatePreferencesWith,
} from "./preferences.ts";

describe("preferences client", () => {
  it("needsOnboarding is true until completed or skipped", () => {
    assert.equal(needsOnboarding(emptyPreferences()), true);
    assert.equal(
      needsOnboarding({
        ...emptyPreferences(),
        onboardingCompletedAt: "2026-09-05T00:00:00.000Z",
      }),
      false,
    );
    assert.equal(
      needsOnboarding({
        ...emptyPreferences(),
        onboardingSkippedAt: "2026-09-05T00:00:00.000Z",
      }),
      false,
    );
  });

  it("GETs and PUTs /api/me/preferences", async () => {
    const calls: Array<{ url: string; method: string; body?: string }> = [];

    const get = await getPreferencesWith({
      fetch: async (input, init) => {
        calls.push({ url: String(input), method: init?.method ?? "GET" });
        return new Response(
          JSON.stringify({
            sports: ["padel"],
            activeSport: "padel",
            onboardingCompletedAt: null,
            onboardingSkippedAt: null,
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://app.test",
    });

    assert.equal(get.ok, true);
    if (get.ok) {
      assert.deepEqual(get.preferences.sports, ["padel"]);
    }

    const put = await updatePreferencesWith(
      {
        sports: ["padel", "golf"],
        activeSport: "golf",
        completeOnboarding: true,
      },
      {
        fetch: async (input, init) => {
          calls.push({
            url: String(input),
            method: init?.method ?? "GET",
            body: typeof init?.body === "string" ? init.body : undefined,
          });
          return new Response(
            JSON.stringify({
              sports: ["padel", "golf"],
              activeSport: "golf",
              onboardingCompletedAt: "2026-09-05T12:00:00.000Z",
              onboardingSkippedAt: null,
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://app.test",
      },
    );

    assert.equal(put.ok, true);
    assert.equal(calls[0]?.url, "https://app.test/api/me/preferences");
    assert.equal(calls[1]?.method, "PUT");
    assert.match(calls[1]?.body ?? "", /completeOnboarding/);
  });

  it("PUTs appearOnVenueLeaderboards and defaults missing GET to true", async () => {
    const get = await getPreferencesWith({
      fetch: async () =>
        new Response(
          JSON.stringify({
            sports: [],
            activeSport: null,
            onboardingCompletedAt: null,
            onboardingSkippedAt: null,
          }),
          { status: 200 },
        ),
      baseUrl: "https://app.test",
    });
    assert.equal(get.ok, true);
    if (get.ok) {
      assert.equal(get.preferences.appearOnVenueLeaderboards, true);
    }

    let putBody = "";
    const put = await updatePreferencesWith(
      { appearOnVenueLeaderboards: false },
      {
        fetch: async (_input, init) => {
          putBody = typeof init?.body === "string" ? init.body : "";
          return new Response(
            JSON.stringify({
              sports: [],
              activeSport: null,
              onboardingCompletedAt: null,
              onboardingSkippedAt: null,
              appearOnVenueLeaderboards: false,
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://app.test",
      },
    );
    assert.equal(put.ok, true);
    if (put.ok) {
      assert.equal(put.preferences.appearOnVenueLeaderboards, false);
    }
    assert.deepEqual(JSON.parse(putBody), {
      appearOnVenueLeaderboards: false,
    });
  });
});
