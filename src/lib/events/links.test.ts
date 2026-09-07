import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixtureInternalLinks } from "./links.ts";
import type { UpcomingFixture } from "../sports/events-feed.ts";

function fixture(
  overrides: Partial<UpcomingFixture> & Pick<UpcomingFixture, "slug" | "title">,
): UpcomingFixture {
  return {
    sportSlug: "rugby",
    startsAt: "2026-09-06T16:00:00.000Z",
    venues: [],
    kind: "event",
    ...overrides,
  };
}

describe("fixtureInternalLinks", () => {
  it("links host venue, guide, related fixtures, and city watch/play", () => {
    const current = fixture({
      slug: "springboks-vs-all-blacks-2026-09-06",
      title: "Springboks vs All Blacks",
      hostVenue: {
        name: "Ellis Park",
        slug: "ellis-park",
        city: "Johannesburg",
        citySlug: "johannesburg",
      },
      relatedGuide: {
        title: "Best sports bars in Joburg",
        slug: "best-sports-bars-joburg",
      },
      venues: [
        {
          name: "The Local",
          slug: "the-local",
          city: "Johannesburg",
          citySlug: "johannesburg",
        },
      ],
    });
    const related = [
      fixture({
        slug: "springboks-vs-wallabies-2026-09-13",
        title: "Springboks vs Wallabies",
      }),
    ];

    const hrefs = fixtureInternalLinks(current, related).map((item) => item.href);
    assert.ok(hrefs.includes("/venues/ellis-park"));
    assert.ok(hrefs.includes("/venues/the-local"));
    assert.ok(hrefs.includes("/guides/best-sports-bars-joburg"));
    assert.ok(hrefs.includes("/events/springboks-vs-wallabies-2026-09-13"));
    assert.ok(hrefs.includes("/watch/rugby/johannesburg"));
    assert.ok(hrefs.includes("/play/rugby/johannesburg"));
  });

  it("does not invent play links for watch-only motorsport", () => {
    const current = fixture({
      slug: "italian-grand-prix-2026-09-07",
      title: "Italian Grand Prix",
      sportSlug: "motorsport",
      venues: [
        {
          name: "Pit Stop",
          slug: "pit-stop",
          city: "Cape Town",
          citySlug: "cape-town",
        },
      ],
    });
    const hrefs = fixtureInternalLinks(current).map((item) => item.href);
    assert.ok(hrefs.includes("/watch/motorsport/cape-town"));
    assert.equal(
      hrefs.some((href) => href.startsWith("/play/")),
      false,
    );
  });
});
