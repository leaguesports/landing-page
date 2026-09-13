import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UpcomingFixture } from "../sports/events-feed.ts";
import { relatedFixtureLinks } from "./links.ts";
import {
  discoverEventsHref,
  eventDetailListHref,
  eventMoreSportLabel,
  eventsListCopy,
  eventsListHref,
  eventsSportChips,
  filterFixturesBySport,
  fixtureDateGroupId,
  groupFixturesByDate,
  hubEventsHref,
  parseEventsSportParam,
  saWeekEndDay,
  venuePlacesLabel,
} from "./scope.ts";

function fixture(
  overrides: Partial<UpcomingFixture> & Pick<UpcomingFixture, "slug" | "title">,
): UpcomingFixture {
  return {
    sportSlug: "rugby",
    startsAt: "2026-09-13T16:00:00.000Z",
    venues: [],
    kind: "event",
    ...overrides,
  };
}

describe("parseEventsSportParam", () => {
  it("resolves catalog slugs and aliases onto hub sports", () => {
    assert.equal(parseEventsSportParam("rugby"), "rugby");
    assert.equal(parseEventsSportParam("football"), "soccer");
    assert.equal(parseEventsSportParam("f1"), "motorsport");
    assert.equal(parseEventsSportParam("indoor-golf"), "golf");
  });

  it("treats unknown or empty values as unscoped", () => {
    assert.equal(parseEventsSportParam(undefined), null);
    assert.equal(parseEventsSportParam(""), null);
    assert.equal(parseEventsSportParam("not-a-sport"), null);
    assert.equal(parseEventsSportParam(["", "rugby"]), null);
  });
});

describe("eventsListHref + sport chips", () => {
  it("builds scoped list URLs and keeps city when switching sport", () => {
    assert.equal(eventsListHref(), "/events");
    assert.equal(eventsListHref({ sport: "rugby" }), "/events?sport=rugby");
    assert.equal(
      eventsListHref({ sport: "rugby", city: "cpt" }),
      "/events?sport=rugby&city=cpt",
    );
    assert.equal(eventsListHref({ city: "jhb" }), "/events?city=jhb");
  });

  it("updates chip hrefs to fully re-scope the list", () => {
    const chips = eventsSportChips({ sport: null, city: "jhb" });
    const all = chips.find((chip) => chip.slug === null);
    const rugby = chips.find((chip) => chip.slug === "rugby");
    const soccer = chips.find((chip) => chip.slug === "soccer");

    assert.equal(all?.href, "/events?city=jhb");
    assert.equal(all?.active, true);
    assert.equal(rugby?.href, "/events?sport=rugby&city=jhb");
    assert.equal(soccer?.href, "/events?sport=soccer&city=jhb");

    const rugbyActive = eventsSportChips({ sport: "rugby", city: "jhb" });
    assert.equal(
      rugbyActive.find((chip) => chip.slug === "rugby")?.active,
      true,
    );
    assert.equal(
      rugbyActive.find((chip) => chip.slug === null)?.href,
      "/events?city=jhb",
    );
  });
});

describe("filterFixturesBySport", () => {
  it("keeps only the scoped sport — no other-sport leak", () => {
    const fixtures = [
      fixture({ slug: "boks", title: "Boks", sportSlug: "rugby" }),
      fixture({ slug: "derby", title: "Derby", sportSlug: "soccer" }),
      fixture({ slug: "gp", title: "GP", sportSlug: "motorsport" }),
      fixture({ slug: "mystery", title: "Mystery", sportSlug: null }),
    ];

    const rugby = filterFixturesBySport(fixtures, "rugby");
    assert.deepEqual(
      rugby.map((item) => item.slug),
      ["boks"],
    );
    assert.equal(
      rugby.some((item) => item.sportSlug !== "rugby"),
      false,
    );

    const all = filterFixturesBySport(fixtures, null);
    assert.equal(all.length, 4);
  });
});

describe("groupFixturesByDate", () => {
  it("splits Today / This week / Later on the SA calendar week", () => {
    const now = new Date("2026-09-09T08:00:00.000Z");
    assert.equal(saWeekEndDay("2026-09-09"), "2026-09-13");
    assert.equal(
      fixtureDateGroupId("2026-09-09T16:00:00.000Z", now),
      "today",
    );
    assert.equal(
      fixtureDateGroupId("2026-09-12T16:00:00.000Z", now),
      "this-week",
    );
    assert.equal(
      fixtureDateGroupId("2026-09-20T16:00:00.000Z", now),
      "later",
    );

    const groups = groupFixturesByDate(
      [
        fixture({
          slug: "today-test",
          title: "Today Test",
          startsAt: "2026-09-09T16:00:00.000Z",
        }),
        fixture({
          slug: "week-derby",
          title: "Week Derby",
          startsAt: "2026-09-12T16:00:00.000Z",
        }),
        fixture({
          slug: "later-gp",
          title: "Later GP",
          startsAt: "2026-09-20T16:00:00.000Z",
        }),
        fixture({
          slug: "undated",
          title: "Undated",
          startsAt: null,
        }),
      ],
      now,
    );

    assert.deepEqual(
      groups.map((group) => [group.id, group.label, group.fixtures.map((item) => item.slug)]),
      [
        ["today", "Today", ["today-test"]],
        ["this-week", "This week", ["week-derby"]],
        ["later", "Later", ["later-gp", "undated"]],
      ],
    );
  });

  it("treats a still-visible grace kickoff as Today", () => {
    const now = new Date("2026-09-09T08:00:00.000Z");
    assert.equal(
      fixtureDateGroupId("2026-09-08T18:00:00.000Z", now),
      "today",
    );
  });
});

describe("inbound scoped events links from play / discover", () => {
  it("never sends sport dashboard or Discover context to naked /events", () => {
    assert.equal(hubEventsHref("rugby"), "/events?sport=rugby");
    assert.equal(hubEventsHref("padel"), "/events?sport=padel");
    assert.equal(hubEventsHref("all"), "/events");
    assert.equal(hubEventsHref(null), "/events");
    assert.equal(discoverEventsHref("rugby"), "/events?sport=rugby");
    assert.equal(discoverEventsHref("football"), "/events?sport=soccer");
    assert.equal(discoverEventsHref(null), "/events");
    assert.notEqual(hubEventsHref("rugby"), "/events");
    assert.notEqual(discoverEventsHref("rugby"), "/events");
  });
});

describe("detail stays in-sport", () => {
  it("points chrome at the scoped list and keeps related fixtures in-sport", () => {
    const current = fixture({
      slug: "boks-abs",
      title: "Boks vs ABs",
      sportSlug: "rugby",
    });
    const related = relatedFixtureLinks(current, [
      fixture({
        slug: "boks-wallabies",
        title: "Boks vs Wallabies",
        sportSlug: "rugby",
      }),
      fixture({
        slug: "soweto-derby",
        title: "Soweto Derby",
        sportSlug: "soccer",
      }),
    ]);

    assert.deepEqual(
      related.map((item) => item.href),
      ["/events/boks-wallabies"],
    );
    assert.equal(
      related.some((item) => item.href.includes("soweto")),
      false,
    );
    assert.equal(eventDetailListHref("rugby"), "/events?sport=rugby");
    assert.equal(eventMoreSportLabel("rugby"), "More Rugby");
    assert.equal(eventDetailListHref(null), "/events");
    assert.equal(eventMoreSportLabel(null), "All events");
  });
});

describe("eventsListCopy + venuePlacesLabel", () => {
  it("names the sport on scoped list copy", () => {
    const rugby = eventsListCopy({ sport: "rugby" });
    assert.equal(rugby.heading, "Rugby fixtures");
    assert.match(rugby.sub, /where to watch/);
    assert.equal(rugby.title, "Rugby fixtures");
    assert.match(rugby.description, /rugby/);

    const unscoped = eventsListCopy({});
    assert.equal(unscoped.heading, "Fixtures");
    assert.equal(unscoped.title, "Big games & where to watch");
  });

  it("uses quiet place counts", () => {
    assert.equal(venuePlacesLabel(12), "12 places");
    assert.equal(venuePlacesLabel(1), "1 place");
    assert.equal(venuePlacesLabel(0), null);
  });
});
