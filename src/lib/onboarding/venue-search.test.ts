import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ONBOARDING_VENUE_QUERY_MIN,
  normalizeOnboardingVenueQuery,
  onboardingVenueMatchTerm,
  rankOnboardingVenues,
  type OnboardingVenueOption,
} from "./venue-search.ts";

function venue(
  partial: Partial<OnboardingVenueOption> & Pick<OnboardingVenueOption, "cmsId" | "name">,
): OnboardingVenueOption {
  return {
    slug: partial.slug ?? partial.cmsId,
    city: partial.city ?? null,
    sports: partial.sports ?? [],
    ...partial,
  };
}

describe("normalizeOnboardingVenueQuery", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizeOnboardingVenueQuery("  Padel   Club  "), "padel club");
  });
});

describe("onboardingVenueMatchTerm", () => {
  it("returns null below the minimum length", () => {
    assert.equal(onboardingVenueMatchTerm("a"), null);
    assert.equal(onboardingVenueMatchTerm(" "), null);
    assert.ok(ONBOARDING_VENUE_QUERY_MIN >= 2);
  });

  it("builds a Sanity prefix match token", () => {
    assert.equal(onboardingVenueMatchTerm("Claremont"), "claremont*");
    assert.equal(onboardingVenueMatchTerm("  Grand Prix "), "grand prix*");
  });

  it("strips punctuation that breaks match tokens", () => {
    assert.equal(onboardingVenueMatchTerm("O'Brien's!"), "o'brien's*");
    assert.equal(onboardingVenueMatchTerm("club #1"), "club 1*");
  });
});

describe("rankOnboardingVenues", () => {
  it("puts preferred-sport venues first, then sorts by name", () => {
    const ranked = rankOnboardingVenues(
      [
        venue({ cmsId: "1", name: "Zebra Courts", sports: ["tennis"] }),
        venue({ cmsId: "2", name: "Alpha Padel", sports: ["padel"] }),
        venue({ cmsId: "3", name: "Beta Club", sports: ["padel", "tennis"] }),
        venue({ cmsId: "4", name: "Yoyo Hall", sports: [] }),
      ],
      ["padel"],
    );

    assert.deepEqual(
      ranked.map((item) => item.name),
      ["Alpha Padel", "Beta Club", "Yoyo Hall", "Zebra Courts"],
    );
  });
});
