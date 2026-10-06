import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UpcomingFixture } from "../sports/events-feed.ts";
import {
  buildWatchVenueWeek,
  eventKickoffsFromRows,
  VENUE_WEEK_EMPTY,
  watchFixtureDetailLine,
  type WatchVenueWeekInput,
} from "./watch-week.ts";

const NOW = new Date("2026-10-03T08:00:00.000Z");
const EVENT_KICKOFF = "2026-10-31T13:30:00.000Z";
const EARLIER_SCREENING = "2026-10-31T11:30:00.000Z";

function fixture(
  partial: Pick<UpcomingFixture, "slug" | "title" | "startsAt" | "kind" | "venues"> &
    Partial<UpcomingFixture>,
): UpcomingFixture {
  return {
    sportSlug: "soccer",
    ...partial,
  };
}

const bench: WatchVenueWeekInput = {
  slug: "benchwarmers-sports-bar",
  has_big_screens: true,
  has_live_audio: true,
  upcoming_screenings: [
    {
      title: "Pirates vs Chiefs",
      startsAt: EARLIER_SCREENING,
      setupTags: ["Big screen", "Sound on", "Outdoor"],
    },
  ],
};

describe("buildWatchVenueWeek", () => {
  it("shows the event kickoff in Johannesburg time, not an earlier screening clock", () => {
    const week = buildWatchVenueWeek({
      venue: bench,
      now: NOW,
      fixtures: [
        fixture({
          slug: "pirates-vs-chiefs-2026-10-31",
          title: "Pirates vs Chiefs",
          startsAt: EARLIER_SCREENING,
          kind: "both",
          venues: [
            { name: "Beer Park Sandton", slug: "beer-park-sandton" },
            { name: "Benchwarmers Sports Bar", slug: "benchwarmers-sports-bar" },
          ],
        }),
      ],
      events: [
        {
          title: "Pirates vs Chiefs",
          slug: "pirates-vs-chiefs-2026-10-31",
          startsAt: EVENT_KICKOFF,
        },
      ],
    });

    assert.deepEqual(week.days, [{ id: "2026-10-31", chip: "Sat 31" }]);
    assert.equal(week.cards.length, 1);
    const card = week.cards[0]!;
    assert.equal(card.title, "Pirates vs Chiefs");
    assert.equal(card.clock, "15:30");
    assert.equal(
      watchFixtureDetailLine(card.clock, card.cues),
      "15:30 · Big screen · Sound on",
    );
    assert.equal(card.href, "/events/pirates-vs-chiefs-2026-10-31");
    assert.equal(card.href?.includes("/venues/"), false);
    assert.equal(card.home?.code, "PIR");
    assert.equal(card.away?.code, "CHI");
    assert.equal(card.home?.colour, null);
    assert.equal(card.away?.colour, null);
    assert.equal(JSON.stringify(card).includes("Beer Park"), false);
    assert.equal(card.cues.includes("Outdoor"), false);
  });

  it("formats the same UTC instant as 15:30 SAST when no separate event row exists", () => {
    const week = buildWatchVenueWeek({
      venue: {
        ...bench,
        upcoming_screenings: [
          { title: "Pirates vs Chiefs", startsAt: EVENT_KICKOFF },
        ],
      },
      now: NOW,
      fixtures: [],
      events: [],
    });
    assert.equal(week.cards[0]?.clock, "15:30");
    assert.equal(week.cards[0]?.dayChip, "Sat 31");
    assert.equal(week.cards[0]?.href, null);
  });

  it("uses a pure event kickoff and curated colours, and links to that event", () => {
    const week = buildWatchVenueWeek({
      venue: {
        slug: "benchwarmers-sports-bar",
        has_big_screens: true,
        has_live_audio: false,
        upcoming_screenings: [
          {
            title: "Orlando Pirates vs Kaizer Chiefs",
            startsAt: EARLIER_SCREENING,
          },
        ],
      },
      now: NOW,
      fixtures: [
        fixture({
          slug: "orlando-pirates-vs-kaizer-chiefs-2026-10-31",
          title: "Orlando Pirates vs Kaizer Chiefs",
          startsAt: EVENT_KICKOFF,
          kind: "event",
          venues: [{ name: "Benchwarmers Sports Bar", slug: "benchwarmers-sports-bar" }],
        }),
      ],
    });
    const card = week.cards[0]!;
    assert.equal(card.clock, "15:30");
    assert.equal(card.href, "/events/orlando-pirates-vs-kaizer-chiefs-2026-10-31");
    assert.equal(card.home?.code, "ORL");
    assert.equal(card.home?.colour, "#000000");
    assert.equal(card.away?.code, "KAI");
    assert.equal(card.away?.colour, "#ffd200");
    assert.deepEqual(card.cues, ["Big screen"]);
  });

  it("uses a CMS team colour when the event already has one", () => {
    const week = buildWatchVenueWeek({
      venue: {
        slug: "benchwarmers-sports-bar",
        upcoming_screenings: [
          { title: "Pirates vs Chiefs", startsAt: EVENT_KICKOFF },
        ],
      },
      now: NOW,
      events: [
        {
          title: "Pirates vs Chiefs",
          slug: "pirates-vs-chiefs-2026-10-31",
          startsAt: EVENT_KICKOFF,
          teams: [
            { name: "Pirates", shortCode: "PIR", primaryColour: "#111111" },
            { name: "Chiefs", shortCode: "CHI", primaryColour: "not-a-colour" },
          ],
        },
      ],
    });
    assert.equal(week.cards[0]?.home?.colour, "#111111");
    assert.equal(week.cards[0]?.away?.colour, null);
    assert.equal(week.cards[0]?.away?.code, "CHI");
  });

  it("omits empty days and the whole week when nothing is listed", () => {
    const week = buildWatchVenueWeek({
      venue: {
        slug: "benchwarmers-sports-bar",
        upcoming_screenings: [
          { title: "Pirates vs Chiefs", startsAt: EVENT_KICKOFF },
          { title: "Sharks vs Stormers", startsAt: "2026-11-01T13:00:00.000Z" },
        ],
      },
      now: NOW,
    });
    assert.deepEqual(
      week.days.map((day) => day.chip),
      ["Sat 31", "Sun 1"],
    );
    assert.equal(week.days.some((day) => day.chip.startsWith("Fri")), false);
    assert.equal(week.cards.length, 2);

    const empty = buildWatchVenueWeek({
      venue: {
        slug: "benchwarmers-sports-bar",
        upcoming_screenings: [
          { title: "Pirates vs Chiefs", startsAt: EVENT_KICKOFF },
        ],
      },
      now: new Date("2026-11-05T08:00:00.000Z"),
    });
    assert.deepEqual(empty.days, []);
    assert.deepEqual(empty.cards, []);
    assert.equal(VENUE_WEEK_EMPTY, "Nothing listed here this week.");
  });
});

describe("eventKickoffsFromRows", () => {
  it("keeps the event kickoff and drops seo-only rows without a time", () => {
    const rows = eventKickoffsFromRows([
      {
        title: "Orlando Pirates vs Kaizer Chiefs",
        slug: "orlando-pirates-vs-kaizer-chiefs-2026-10-31",
        startsAt: EVENT_KICKOFF,
        teams: [{ name: "Orlando Pirates", primaryColour: "#000000" }],
      },
      { title: "Where to watch", slug: "seo-only", startsAt: "" },
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.startsAt, EVENT_KICKOFF);
    assert.equal(rows[0]?.teams?.[0]?.name, "Orlando Pirates");
  });
});
