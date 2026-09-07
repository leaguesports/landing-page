import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseApiSportsFootballFixtures } from "./api-sports-football.ts";
import { parseApiSportsF1Rankings, parseApiSportsF1Races, raceToUpdate } from "./api-sports-f1.ts";
import { parseApiSportsRugbyGames } from "./api-sports-rugby.ts";
import {
  latestPositions,
  openF1ToUpdate,
  parseOpenF1Drivers,
  parseOpenF1Sessions,
} from "./openf1.ts";

describe("API-Sports rugby parser", () => {
  it("maps a live Springboks Test onto a match update", () => {
    const [update] = parseApiSportsRugbyGames({
      response: [
        {
          id: 99,
          date: "2026-09-06T15:00:00+00:00",
          status: { long: "In Play", short: "2H", elapsed: 54 },
          teams: {
            home: { name: "South Africa" },
            away: { name: "New Zealand" },
          },
          scores: { home: 17, away: 14 },
        },
      ],
    });
    assert.ok(update);
    assert.equal(update.status, "live");
    assert.equal(update.clock, "54'");
    assert.equal(update.match?.home, "South Africa");
    assert.equal(update.match?.homeScore, 17);
  });
});

describe("API-Sports football parser", () => {
  it("maps a live PSL derby", () => {
    const [update] = parseApiSportsFootballFixtures({
      response: [
        {
          fixture: {
            id: 7,
            date: "2026-09-12T13:00:00+00:00",
            status: { long: "First Half", short: "1H", elapsed: 23 },
          },
          teams: {
            home: { name: "Kaizer Chiefs" },
            away: { name: "Orlando Pirates" },
          },
          goals: { home: 1, away: 0 },
        },
      ],
    });
    assert.ok(update);
    assert.equal(update.sportFamily, "match");
    assert.equal(update.match?.away, "Orlando Pirates");
    assert.equal(update.clock, "23'");
  });
});

describe("API-Sports F1 parser", () => {
  it("builds a top-3 board from race + rankings", () => {
    const [race] = parseApiSportsF1Races({
      response: [
        {
          id: 12,
          competition: { name: "Italian Grand Prix" },
          circuit: { name: "Autodromo Nazionale Monza" },
          type: "Race",
          date: "2026-09-07T13:00:00+00:00",
          status: "Live",
          laps: { current: 34, total: 53 },
        },
      ],
    });
    assert.ok(race);
    const rankings = parseApiSportsF1Rankings({
      response: [
        {
          position: 2,
          driver: { name: "L. Norris" },
          team: { name: "McLaren" },
          gap: "+3.2s",
        },
        {
          position: 1,
          driver: { name: "M. Verstappen" },
          team: { name: "Red Bull" },
          gap: null,
        },
        {
          position: 3,
          driver: { name: "C. Leclerc" },
          team: { name: "Ferrari" },
          gap: "+8.1s",
        },
      ],
    });
    const update = raceToUpdate(race, rankings);
    assert.ok(update);
    assert.equal(update.motorsport?.leaders[0]?.driver, "M. Verstappen");
    assert.equal(update.motorsport?.sessionLabel, "Lap 34/53");
  });
});

describe("OpenF1 parser", () => {
  it("takes the latest position sample per driver", () => {
    const sessions = parseOpenF1Sessions([
      {
        session_key: 9159,
        meeting_name: "Italian Grand Prix",
        circuit_short_name: "Monza",
        session_name: "Race",
        date_start: "2026-09-07T13:00:00+00:00",
        date_end: "2026-09-07T15:00:00+00:00",
      },
    ]);
    const drivers = parseOpenF1Drivers([
      { driver_number: 1, name_acronym: "VER", team_name: "Red Bull" },
      { driver_number: 4, name_acronym: "NOR", team_name: "McLaren" },
      { driver_number: 16, name_acronym: "LEC", team_name: "Ferrari" },
    ]);
    const positions = latestPositions([
      { driver_number: 1, position: 2, date: "2026-09-07T13:10:00+00:00" },
      { driver_number: 1, position: 1, date: "2026-09-07T13:40:00+00:00" },
      { driver_number: 4, position: 2, date: "2026-09-07T13:40:00+00:00" },
      { driver_number: 16, position: 3, date: "2026-09-07T13:40:00+00:00" },
    ]);
    const update = openF1ToUpdate(
      sessions[0]!,
      drivers,
      positions,
      new Map(),
      new Date("2026-09-07T13:45:00.000Z"),
    );
    assert.ok(update);
    assert.equal(update.status, "live");
    assert.equal(update.motorsport?.leaders[0]?.driver, "VER");
    assert.equal(update.motorsport?.leaders[1]?.driver, "NOR");
  });
});
