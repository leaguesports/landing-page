import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OpenF1Meeting, OpenF1Session } from "./openf1.ts";
import {
  buildReplayCatalog,
  catalogStatusForRace,
  defaultReplayCatalogYear,
  isOpenF1TestingMeeting,
  parseReplayCatalogYear,
  replayCatalogYearOrDefault,
  replayCatalogYears,
} from "./replay-catalog.ts";
import { f1ReplayMeetingsUrl, replayHrefForEventSlug } from "./replay.ts";
import { openF1MeetingsByYearUrl, openF1SessionsByYearUrl } from "./upstream.ts";

function meeting(
  overrides: Partial<OpenF1Meeting> & Pick<OpenF1Meeting, "meetingKey" | "meetingName" | "eventSlug">,
): OpenF1Meeting {
  return {
    meetingOfficialName: overrides.meetingName,
    circuitKey: 39,
    circuitShortName: "Monza",
    circuitType: "Permanent",
    circuitImage: null,
    circuitInfoUrl: null,
    countryKey: 13,
    countryCode: "ITA",
    countryName: "Italy",
    countryFlag: null,
    dateStart: "2026-09-04T10:30:00.000Z",
    dateEnd: "2026-09-06T15:00:00.000Z",
    gmtOffset: "02:00:00",
    isCancelled: false,
    location: "Monza",
    year: 2026,
    ...overrides,
  };
}

function session(
  overrides: Partial<OpenF1Session> &
    Pick<OpenF1Session, "sessionKey" | "meetingKey" | "sessionName">,
): OpenF1Session {
  return {
    sessionType: "Race",
    circuitKey: 39,
    circuitShortName: "Monza",
    countryKey: 13,
    countryCode: "ITA",
    countryName: "Italy",
    dateStart: "2026-09-06T13:00:00.000Z",
    dateEnd: "2026-09-06T15:00:00.000Z",
    gmtOffset: "02:00:00",
    isCancelled: false,
    location: "Monza",
    year: 2026,
    ...overrides,
  };
}

const NOW = new Date("2026-09-10T12:00:00.000Z");

describe("replay catalog", () => {
  it("lists race weekends in calendar order and skips testing", () => {
    const races = buildReplayCatalog(
      [
        meeting({
          meetingKey: 1294,
          meetingName: "Spanish Grand Prix",
          eventSlug: "spanish-grand-prix-2026-09-11",
          circuitKey: 153,
          circuitShortName: "Madring",
          location: "Madrid",
          dateStart: "2026-09-11T10:00:00.000Z",
          dateEnd: "2026-09-13T16:00:00.000Z",
        }),
        meeting({
          meetingKey: 1293,
          meetingName: "Italian Grand Prix",
          eventSlug: "italian-grand-prix-2026-09-04",
        }),
        meeting({
          meetingKey: 1304,
          meetingName: "Pre-Season Testing",
          eventSlug: "pre-season-testing-2026-02-11",
          dateStart: "2026-02-11T08:00:00.000Z",
          dateEnd: "2026-02-13T18:00:00.000Z",
        }),
      ],
      [
        session({
          sessionKey: 11361,
          meetingKey: 1293,
          sessionName: "Race",
        }),
        session({
          sessionKey: 11400,
          meetingKey: 1294,
          sessionName: "Race",
          circuitKey: 153,
          circuitShortName: "Madring",
          dateStart: "2026-09-13T13:00:00.000Z",
          dateEnd: "2026-09-13T15:00:00.000Z",
        }),
        session({
          sessionKey: 11000,
          meetingKey: 1304,
          sessionName: "Practice 1",
          dateStart: "2026-02-11T09:00:00.000Z",
          dateEnd: "2026-02-11T12:00:00.000Z",
        }),
      ],
      NOW,
    );

    assert.equal(races.length, 2);
    assert.equal(races[0]?.meetingName, "Italian Grand Prix");
    assert.equal(races[0]?.round, 1);
    assert.equal(races[0]?.status, "replay");
    assert.equal(races[0]?.replayHref, "/events/italian-grand-prix-2026-09-04/replay");
    assert.equal(races[1]?.meetingName, "Spanish Grand Prix");
    assert.equal(races[1]?.round, 2);
    assert.equal(races[1]?.status, "upcoming");
  });

  it("marks a race live between session start and end", () => {
    const status = catalogStatusForRace(
      {
        dateStart: "2026-09-10T11:00:00.000Z",
        dateEnd: "2026-09-10T13:00:00.000Z",
        isCancelled: false,
      },
      NOW,
    );
    assert.equal(status, "live");
  });

  it("lists past races OpenF1 marked cancelled, and skips future cancellations", () => {
    const races = buildReplayCatalog(
      [
        meeting({
          meetingKey: 1282,
          meetingName: "Bahrain Grand Prix",
          eventSlug: "bahrain-grand-prix-2026-04-10",
          isCancelled: true,
          dateStart: "2026-04-10T11:30:00.000Z",
          dateEnd: "2026-04-12T17:00:00.000Z",
        }),
        meeting({
          meetingKey: 1,
          meetingName: "Cancelled Grand Prix",
          eventSlug: "cancelled-grand-prix-2026-11-01",
          isCancelled: true,
          dateStart: "2026-11-01T12:00:00.000Z",
          dateEnd: "2026-11-03T16:00:00.000Z",
        }),
        meeting({
          meetingKey: 2,
          meetingName: "Practice Only",
          eventSlug: "practice-only-2026-05-08",
        }),
      ],
      [
        session({
          sessionKey: 11261,
          meetingKey: 1282,
          sessionName: "Race",
          isCancelled: true,
          dateStart: "2026-04-12T15:00:00.000Z",
          dateEnd: "2026-04-12T17:00:00.000Z",
        }),
        session({
          sessionKey: 9,
          meetingKey: 1,
          sessionName: "Race",
          isCancelled: true,
          dateStart: "2026-11-03T13:00:00.000Z",
          dateEnd: "2026-11-03T15:00:00.000Z",
        }),
        session({
          sessionKey: 10,
          meetingKey: 2,
          sessionName: "Practice 1",
        }),
      ],
      NOW,
    );
    assert.equal(races.length, 1);
    assert.equal(races[0]?.meetingName, "Bahrain Grand Prix");
    assert.equal(races[0]?.status, "replay");
  });

  it("parses season years from 2023 through the current year", () => {
    assert.equal(parseReplayCatalogYear("2024", NOW), 2024);
    assert.equal(parseReplayCatalogYear("2019", NOW), null);
    assert.equal(parseReplayCatalogYear("nope", NOW), null);
    assert.equal(replayCatalogYearOrDefault("2025", NOW), 2025);
    assert.equal(replayCatalogYearOrDefault(undefined, NOW), 2026);
    assert.equal(defaultReplayCatalogYear(NOW), 2026);
    assert.deepEqual(replayCatalogYears(NOW).slice(0, 2), [2023, 2024]);
    assert.equal(replayCatalogYears(NOW).at(-1), 2026);
  });

  it("builds same-origin catalog and replay hrefs", () => {
    assert.equal(isOpenF1TestingMeeting("Pre-Season Testing"), true);
    assert.equal(isOpenF1TestingMeeting("Italian Grand Prix"), false);
    assert.equal(
      replayHrefForEventSlug("italian-grand-prix-2026-09-06"),
      "/events/italian-grand-prix-2026-09-06/replay",
    );
    assert.equal(f1ReplayMeetingsUrl(2026), "/api/f1-replay/meetings?year=2026");
    assert.equal(
      openF1MeetingsByYearUrl(2026),
      "https://api.openf1.org/v1/meetings?year=2026",
    );
    assert.equal(
      openF1SessionsByYearUrl(2026),
      "https://api.openf1.org/v1/sessions?year=2026",
    );
  });
});
