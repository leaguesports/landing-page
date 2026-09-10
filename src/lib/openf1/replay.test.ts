import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { worldVec, MISSING_Z_MAX, TRACK_SCALE, TRACK_Z0 } from "./coords.ts";
import {
  appendLocationPoints,
  mergeLocationSamples,
  sampleAt,
} from "./location-buffer.ts";
import { openF1LocationUrl, meetingMatchesEventSlug } from "./upstream.ts";
import { flagStateAt, buildScrubMarks, standingsAt } from "./race-control.ts";
import { parseReplayDrivers, parseReplayCircuit, teamColourHex } from "./replay-parse.ts";
import {
  bufferFillRatio,
  chunkWindows,
  formatReplayClock,
  lookaheadMsForSpeed,
  replayConfigFromWeekend,
} from "./replay.ts";
import { resolveReplayWindow } from "./replay-window.ts";
import { parseSessionKeyParam, parseIsoParam } from "./replay-params.ts";
import type { OpenF1Weekend } from "./openf1.ts";
import type { RaceControlEvent } from "./replay.ts";

describe("worldVec", () => {
  it("maps OpenF1 x/y into Three.js x/z and drops missing elevation", () => {
    const mapped = worldVec(1000, 2000, 50);
    assert.equal(mapped.x, 1000 * TRACK_SCALE);
    assert.equal(mapped.z, -2000 * TRACK_SCALE);
    assert.equal(mapped.y, 0);
    assert.ok(50 <= MISSING_Z_MAX);
  });

  it("does not use circuit-local GPS z as world height on a 2D ribbon", () => {
    const spa = worldVec(0, 0, 4133);
    assert.ok(spa.y > 8);
    const onDeck = worldVec(0, 0, 0);
    assert.equal(onDeck.y, 0);
  });

  it("does not drop below the grid when GPS z is under z0", () => {
    const mapped = worldVec(0, 0, 3000, undefined, 4133);
    assert.equal(mapped.y, 0);
  });

  it("measures elevation relative to a circuit z0", () => {
    const z0 = 4133;
    const onDeck = worldVec(0, 0, 4133, undefined, z0);
    assert.equal(onDeck.y, 0);
    const hill = worldVec(0, 0, 4394, undefined, z0);
    assert.ok(hill.y > 2);
    assert.ok(hill.y < 8);
  });

  it("applies mild elevation when z is present", () => {
    const mapped = worldVec(0, 0, 2500);
    assert.ok(mapped.y > 0);
  });
});

describe("location buffer", () => {
  it("sorts, dedupes equal timestamps, and downsamples tight samples", () => {
    const merged = mergeLocationSamples(
      [
        { t: 400, x: 4, y: 0, z: 0 },
        { t: 0, x: 0, y: 0, z: 0 },
      ],
      [
        { t: 0, x: 1, y: 0, z: 0 },
        { t: 50, x: 2, y: 0, z: 0 },
        { t: 250, x: 3, y: 0, z: 0 },
      ],
      200,
    );
    assert.deepEqual(
      merged.map((row) => row.t),
      [0, 250],
    );
    assert.equal(merged[0]?.x, 1);
  });

  it("lerps within the gap cap and holds across missing chunks", () => {
    const samples = [
      { t: 0, x: 0, y: 0, z: 0 },
      { t: 1000, x: 10, y: 0, z: 0 },
      { t: 10_000, x: 100, y: 0, z: 0 },
    ];
    const mid = sampleAt(samples, 500, 2500);
    assert.equal(mid?.x, 5);
    const held = sampleAt(samples, 2000, 2500);
    assert.equal(held?.x, 10);
  });

  it("groups incoming points per driver", () => {
    const tracks = new Map();
    appendLocationPoints(tracks, [
      { driverNumber: 1, t: 0, x: 0, y: 0, z: 0 },
      { driverNumber: 44, t: 0, x: 8, y: 1, z: 0 },
      { driverNumber: 1, t: 400, x: 2, y: 0, z: 0 },
    ]);
    assert.equal(tracks.get(1)?.length, 2);
    assert.equal(tracks.get(44)?.length, 1);
  });
});

describe("race control flags", () => {
  const events: RaceControlEvent[] = [
    {
      t: 1_000,
      flag: "YELLOW",
      category: "Flag",
      scope: "Sector",
      sector: 1,
      message: "YELLOW IN TRACK SECTOR 1",
    },
    {
      t: 2_000,
      flag: "DOUBLE YELLOW",
      category: "Flag",
      scope: "Sector",
      sector: 1,
      message: "DOUBLE YELLOW IN TRACK SECTOR 1",
    },
    {
      t: 3_000,
      flag: null,
      category: "SafetyCar",
      scope: null,
      sector: null,
      message: "SAFETY CAR DEPLOYED",
    },
    {
      t: 4_000,
      flag: null,
      category: "Other",
      scope: null,
      sector: null,
      message: "RED FLAG - RACE SUSPENDED",
    },
    {
      t: 4_500,
      flag: "CLEAR",
      category: "Flag",
      scope: "Track",
      sector: null,
      message: "TRACK CLEAR",
    },
    {
      t: 5_000,
      flag: null,
      category: "SessionStatus",
      scope: null,
      sector: null,
      message: "SESSION STARTED",
    },
    {
      t: 6_000,
      flag: null,
      category: "SafetyCar",
      scope: null,
      sector: null,
      message: "VSC DEPLOYED",
    },
    {
      t: 7_000,
      flag: "CLEAR",
      category: "Flag",
      scope: "Track",
      sector: null,
      message: "TRACK CLEAR",
    },
    {
      t: 8_000,
      flag: "CHEQUERED",
      category: "Flag",
      scope: "Track",
      sector: null,
      message: "CHEQUERED FLAG",
    },
  ];

  it("applies display priority red > SC > VSC > double yellow > yellow > chequered", () => {
    assert.equal(flagStateAt(events, 1_000).kind, "yellow");
    assert.equal(flagStateAt(events, 2_000).kind, "double-yellow");
    assert.equal(flagStateAt(events, 3_000).kind, "sc");
    assert.equal(flagStateAt(events, 4_000).kind, "red");
    assert.equal(flagStateAt(events, 5_000).kind, "hidden");
    assert.equal(flagStateAt(events, 6_000).kind, "vsc");
    assert.equal(flagStateAt(events, 7_000).kind, "hidden");
    assert.equal(flagStateAt(events, 8_000).kind, "chequered");
  });

  it("builds scrub marks for major yellow / red / SC / chequered moments", () => {
    const marks = buildScrubMarks(events);
    assert.deepEqual(
      marks.map((mark) => mark.kind),
      ["yellow", "sc", "red", "vsc", "chequered"],
    );
  });
});

describe("standings", () => {
  it("walks position events up to the playhead", () => {
    const drivers = [
      {
        driverNumber: 1,
        acronym: "NOR",
        fullName: "Lando Norris",
        teamName: "McLaren",
        teamColour: "#f47600",
      },
      {
        driverNumber: 16,
        acronym: "LEC",
        fullName: "Charles Leclerc",
        teamName: "Ferrari",
        teamColour: "#ed1131",
      },
    ];
    const rows = standingsAt(
      [
        { t: 0, driverNumber: 16, position: 1 },
        { t: 0, driverNumber: 1, position: 2 },
        { t: 5_000, driverNumber: 1, position: 1 },
        { t: 5_000, driverNumber: 16, position: 2 },
      ],
      5_000,
      drivers,
    );
    assert.equal(rows[0]?.acronym, "NOR");
    assert.equal(rows[1]?.acronym, "LEC");
  });
});

describe("replay window", () => {
  it("uses RACE START and CHEQUERED FLAG from race control", () => {
    const window = resolveReplayWindow({
      sessionStartIso: "2026-09-06T13:00:00.000Z",
      sessionEndIso: "2026-09-06T15:00:00.000Z",
      raceControl: [
        {
          t: Date.parse("2026-09-06T13:03:31.000Z"),
          flag: null,
          category: "Other",
          scope: null,
          sector: null,
          message: "RACE START",
        },
        {
          t: Date.parse("2026-09-06T14:54:46.000Z"),
          flag: "CHEQUERED",
          category: "Flag",
          scope: "Track",
          sector: null,
          message: "CHEQUERED FLAG",
        },
      ],
    });
    assert.equal(window.startIso, "2026-09-06T13:03:31.000Z");
    assert.equal(window.endIso, "2026-09-06T14:55:06.000Z");
  });
});

describe("replay config", () => {
  it("reads the race session off an OpenF1 weekend", () => {
    const weekend = {
      meeting: {
        meetingKey: 1293,
        meetingName: "Italian Grand Prix",
        meetingOfficialName: "Italian Grand Prix",
        eventSlug: "italian-grand-prix-2026-09-06",
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
      },
      sessions: [
        {
          sessionKey: 11361,
          sessionName: "Race",
          sessionType: "Race",
          meetingKey: 1293,
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
        },
      ],
    } satisfies OpenF1Weekend;
    const config = replayConfigFromWeekend(weekend);
    assert.equal(config?.sessionKey, 11361);
    assert.equal(config?.circuitKey, 39);
    assert.equal(config?.title, "Italian Grand Prix");
  });
});

describe("parsers", () => {
  it("prepends # to OpenF1 team colours", () => {
    assert.equal(teamColourHex("F47600"), "#f47600");
    assert.equal(teamColourHex("#ED1131"), "#ed1131");
    assert.equal(teamColourHex("nope"), "#3dff8a");
  });

  it("parses drivers and circuit outlines", () => {
    const drivers = parseReplayDrivers([
      {
        driver_number: 1,
        name_acronym: "NOR",
        full_name: "Lando NORRIS",
        team_name: "McLaren",
        team_colour: "F47600",
      },
    ]);
    assert.equal(drivers[0]?.acronym, "NOR");
    assert.equal(drivers[0]?.teamColour, "#f47600");

    const circuit = parseReplayCircuit(
      {
        circuitKey: 39,
        circuitName: "Monza",
        rotation: 95,
        x: [0, 1, 2, 3, 4, 5, 6, 7],
        y: [0, 1, 2, 3, 4, 5, 6, 7],
        corners: [{ number: 1, trackPosition: { x: 1, y: 2 } }],
      },
      { circuitKey: 39, year: 2026 },
    );
    assert.equal(circuit?.x.length, 8);
    assert.equal(circuit?.z.length, 8);
    assert.equal(circuit?.z0, TRACK_Z0);
    assert.equal(circuit?.corners[0]?.number, 1);
  });
});

describe("helpers", () => {
  it("encodes OpenF1 location inequality filters", () => {
    const url = openF1LocationUrl(
      11361,
      "2026-09-06T13:03:30.000Z",
      "2026-09-06T13:04:10.000Z",
    );
    assert.equal(url.includes("date%3E"), true);
    assert.equal(url.includes("date%3C"), true);
    assert.equal(url.includes("driver_number"), false);
    assert.equal(
      openF1LocationUrl(
        11361,
        "2026-09-06T13:03:30.000Z",
        "2026-09-06T13:04:10.000Z",
        1,
      ).includes("driver_number=1"),
      true,
    );
  });

  it("matches event slugs to meetings across the weekend, not only date_start", () => {
    const meeting = {
      meetingName: "Italian Grand Prix",
      eventSlug: "italian-grand-prix-2026-09-04",
      dateStart: "2026-09-04T10:30:00.000Z",
      dateEnd: "2026-09-06T15:00:00.000Z",
    };
    assert.equal(
      meetingMatchesEventSlug(meeting, "italian-grand-prix-2026-09-06"),
      true,
    );
    assert.equal(
      meetingMatchesEventSlug(meeting, "spanish-grand-prix-2026-09-06"),
      false,
    );
  });

  it("chunks the race and reports buffer fill", () => {
    const windows = chunkWindows(0, 100_000, 40_000);
    assert.equal(windows.length, 3);
    assert.equal(bufferFillRatio([{ from: 0, to: 40_000 }], 0, 100_000), 0.4);
    assert.equal(lookaheadMsForSpeed(20) > lookaheadMsForSpeed(1), true);
    assert.equal(formatReplayClock(125_000), "2:05");
  });

  it("validates session and ISO params", () => {
    assert.equal(parseSessionKeyParam("11361"), 11361);
    assert.equal(parseSessionKeyParam("nope"), null);
    assert.equal(parseIsoParam("2026-09-06T13:03:30.000Z"), "2026-09-06T13:03:30.000Z");
    assert.equal(parseIsoParam("yesterday"), null);
  });
});
