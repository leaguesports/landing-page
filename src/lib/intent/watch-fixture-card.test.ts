import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WATCH_FIXTURE_CAROUSEL_LIMIT,
  WATCH_FIXTURE_SLATE,
  buildWatchFixtureFace,
  deriveWatchShortCode,
  formatWatchFixtureClock,
  formatWatchFixtureDayLabel,
  groupWatchFixturesByDay,
  isWatchFixturesView,
  normaliseWatchTeamColour,
  parseWatchFixtureTitle,
  watchAllFixturesHref,
  watchCarouselFixtures,
  watchFixtureBottomPill,
  watchFixtureFill,
  watchFixtureInk,
  watchFixtureSelectionDetail,
  watchSportMicroLabel,
  watchStripCompetition,
} from "./watch-fixture-card.ts";

const kickoff = "2026-10-31T13:30:00.000Z";

describe("watch fixture pill sandwich", () => {
  it("builds an upcoming kickoff card from a parsed title", () => {
    const face = buildWatchFixtureFace({
      title: "Orlando Pirates vs Kaizer Chiefs",
      startsAt: kickoff,
      venueSlugs: ["beer-park", "cescos"],
      venueNames: { "beer-park": "Beer Park", cescos: "Cesco's" },
    });
    assert.equal(face.sidesSource, "title");
    assert.equal(face.home?.shortCode, "ORL");
    assert.equal(face.away?.shortCode, "KAI");
    assert.equal(face.home?.primaryColour, null);
    assert.equal(face.away?.primaryColour, null);
    assert.equal(face.topPill, "SAT 31 OCT · 15:30");
    assert.equal(face.centre.kind, "kickoff");
    assert.equal(face.centre.label, "15:30");
    assert.equal(face.bottomPill, "2 venues screening");
    assert.equal(face.centre.label.includes("FT"), false);
    assert.equal(face.topPill.includes("Soweto"), false);
  });

  it("uses the venue name when one bar is screening, and says so when none are", () => {
    assert.equal(
      watchFixtureBottomPill({
        venueSlugs: ["beer-park-sandton"],
        venueNames: new Map([["beer-park-sandton", "Beer Park Sandton"]]),
      }),
      "Beer Park Sandton",
    );
    assert.equal(
      watchFixtureBottomPill({ venueSlugs: [], venueNames: new Map() }),
      "No venues listed",
    );
  });

  it("prefers CMS shortCode and hex colour, and drops non-hex colour", () => {
    const face = buildWatchFixtureFace({
      title: "Orlando Pirates vs Kaizer Chiefs",
      startsAt: kickoff,
      teams: [
        { name: "Orlando Pirates", shortCode: "OPA", primaryColour: "#0B5C3A" },
        {
          name: "Kaizer Chiefs",
          shortCode: "chiefs",
          primaryColour: "url(https://www.unitedrugby.com/crest.svg)",
          secondaryColour: "#FFD200",
        },
      ],
      venueSlugs: ["one"],
      venueNames: { one: "Ellis Park" },
    });
    assert.equal(face.sidesSource, "cms");
    assert.equal(face.home?.shortCode, "OPA");
    assert.equal(face.home?.primaryColour, "#0b5c3a");
    assert.equal(face.away?.shortCode, "CHI");
    assert.equal(face.away?.primaryColour, null);
    assert.equal(face.away?.secondaryColour, "#ffd200");
    assert.equal(face.bottomPill, "Ellis Park");
    assert.equal(normaliseWatchTeamColour("not-a-colour"), null);
    assert.equal(watchFixtureFill(null, "home"), WATCH_FIXTURE_SLATE);
    assert.equal(watchFixtureFill("#ffd200", "away"), "#ffd200");
  });

  it("derives three letters and does not invent a second side", () => {
    assert.equal(deriveWatchShortCode("Sharks"), "SHA");
    assert.equal(deriveWatchShortCode("FC Barcelona"), "FCB");
    assert.equal(parseWatchFixtureTitle("Azerbaijan Grand Prix"), null);
    const race = buildWatchFixtureFace({
      title: "Azerbaijan Grand Prix",
      startsAt: "2026-09-26T11:00:00.000Z",
      venueSlugs: ["beer-park-sandton"],
      venueNames: { "beer-park-sandton": "Beer Park Sandton" },
    });
    assert.equal(race.sidesSource, "none");
    assert.equal(race.home, null);
    assert.equal(race.away, null);
    assert.equal(race.centre.kind, "kickoff");
    assert.equal(race.centre.label, "13:00");
  });

  it("shows score–FT–score without the kickoff clock", () => {
    const face = buildWatchFixtureFace({
      title: "Lions vs Leinster",
      startsAt: "2026-09-25T12:45:00.000Z",
      score: { status: "final", homeScore: 27, awayScore: 26 },
      venueSlugs: ["ellis-park"],
      venueNames: { "ellis-park": "Ellis Park" },
    });
    assert.equal(face.centre.kind, "score");
    if (face.centre.kind !== "score") return;
    assert.equal(face.centre.label, "27–FT–26");
    assert.equal(face.centre.status, "FT");
    assert.equal(face.topPill, "FRI 25 SEP · FT");
    assert.equal(face.topPill.includes("14:45"), false);
    assert.equal(face.centre.label.includes("14:45"), false);
    assert.equal(formatWatchFixtureClock("2026-09-25T12:45:00.000Z"), "14:45");
  });

  it("keeps a live cluster in the same shape and ignores a score without two sides", () => {
    const live = buildWatchFixtureFace({
      title: "Sharks vs Lions",
      startsAt: kickoff,
      score: { status: "live", homeScore: 12, awayScore: 8 },
      venueSlugs: [],
    });
    assert.equal(live.centre.kind, "score");
    assert.equal(live.centre.label, "12–LIVE–8");
    assert.equal(live.topPill.endsWith("· LIVE"), true);
    assert.equal(live.topPill.includes("15:30"), false);

    const unpaired = buildWatchFixtureFace({
      title: "Azerbaijan Grand Prix",
      startsAt: kickoff,
      score: { status: "FT", homeScore: 1, awayScore: 0 },
      venueSlugs: [],
    });
    assert.equal(unpaired.centre.kind, "kickoff");
    assert.equal(unpaired.centre.label, "15:30");
    assert.equal(unpaired.topPill.includes("FT"), false);
  });

  it("groups view-all cards by calendar day and caps the carousel", () => {
    const rows = [
      { startsAt: "2026-10-31T13:30:00.000Z", competition: "PSL" },
      { startsAt: "2026-10-31T16:00:00.000Z", competition: "PSL" },
      { startsAt: "2026-11-01T15:00:00.000Z", competition: "PSL" },
    ];
    const groups = groupWatchFixturesByDay(rows);
    assert.deepEqual(
      groups.map((group) => group.label),
      ["Saturday 31 October", "Sunday 1 November"],
    );
    assert.equal(groups[0]?.rows.length, 2);
    assert.equal(formatWatchFixtureDayLabel(kickoff), "Saturday 31 October");
    assert.equal(WATCH_FIXTURE_CAROUSEL_LIMIT, 8);
    assert.equal(watchCarouselFixtures(Array.from({ length: 10 }, (_, i) => i)).length, 8);
    assert.equal(watchStripCompetition(rows), "PSL");
    assert.equal(
      watchStripCompetition([
        { competition: "PSL" },
        { competition: "URC" },
      ]),
      null,
    );
  });

  it("labels the filter, the city-hub sport word, and the view-all href", () => {
    assert.equal(
      watchFixtureSelectionDetail({
        count: 8,
        title: "Orlando Pirates vs Kaizer Chiefs",
        homeCode: "ORL",
        awayCode: "KAI",
      }),
      "8 for ORL vs KAI",
    );
    assert.equal(watchSportMicroLabel("Sim Racing"), "Sim");
    assert.equal(watchSportMicroLabel("  "), null);
    assert.equal(
      watchAllFixturesHref("/watch/soccer/johannesburg"),
      "/watch/soccer/johannesburg?view=fixtures",
    );
    assert.equal(
      watchAllFixturesHref("/watch/johannesburg?fixture=derby"),
      "/watch/johannesburg?fixture=derby&view=fixtures",
    );
    assert.equal(isWatchFixturesView("fixtures"), true);
    assert.equal(isWatchFixturesView("calendar"), false);
    assert.equal(watchFixtureInk("#ffd200"), "#0c0f0c");
    assert.equal(watchFixtureInk(WATCH_FIXTURE_SLATE), "#ffffff");
  });
});
