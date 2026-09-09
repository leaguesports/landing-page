import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GOLF_TOUR_DEFAULT_CAMP_NAMES,
  GOLF_TOUR_HOW_IT_WORKS_KEY,
  GOLF_TOUR_PROXY_SOURCES,
  GOLF_TOURS_HREF,
  GOLF_TOURS_NEW_HREF,
  addDaysIso,
  addGolfTourCampWith,
  addGolfTourFourballWith,
  addGolfTourRosterMemberWith,
  addGolfTourRoundWith,
  addGolfTourStandingFourballWith,
  absoluteAppUrl,
  buildCreateGolfTourPayload,
  buildPlayerSitOutsPayload,
  buildStandingFourballPayload,
  buildStartFourballPayload,
  canMutateTour,
  canStartFourball,
  compareIsoDays,
  copyGolfTourRoundFromWith,
  dismissGolfTourHowItWorks,
  formatAvgGross,
  formatIsoDayLabel,
  fourballSharePath,
  fourballStartNavigateHref,
  golfRoundScorecardHref,
  golfTourCampRosterMemberUrl,
  golfTourCampRosterUrl,
  golfTourCampUrl,
  golfTourCompleteUrl,
  golfTourFourballStartUrl,
  golfTourHref,
  golfTourHostNextStep,
  golfTourHostNextStepAction,
  golfTourLeaderboardUrl,
  golfTourMineUrl,
  golfTourRoundCopyFromUrl,
  golfTourRoundFourballsUrl,
  golfTourRoundPrepareUrl,
  golfTourStandingFourballsUrl,
  golfTourUrl,
  golfToursRootUrl,
  isGolfTourHowItWorksDismissed,
  isHost,
  isIsoDay,
  nextCampPlaceholder,
  parseGolfTour,
  parseGolfTourCamp,
  parseGolfTourFourball,
  parseGolfTourLeaderboard,
  parseGolfTourRound,
  parseIsoDay,
  parseLeaderboardPlayer,
  partitionMineTours,
  prepareGolfTourRoundWith,
  previousRound,
  roundNeedsPrepare,
  shouldShowHostRoundComposer,
  startGolfTourFourballWith,
  todayIsoDay,
  tourRosterCount,
  updateGolfTourFourballWith,
  type PublicGolfTour,
  type PublicGolfTourFourball,
  type PublicGolfTourSummary,
} from "./golf-tours.ts";

function summary(
  overrides: Partial<PublicGolfTourSummary> & Record<string, unknown> = {},
): PublicGolfTourSummary {
  return {
    id: "tour-1",
    name: "Friends Cup",
    startDate: "2026-09-12",
    endDate: "2026-09-14",
    status: "draft",
    hostUserId: "host-1",
    viewer: { role: "host" },
    campCount: 2,
    roundCount: 0,
    fourballCount: 0,
    updatedAt: "2026-09-09T10:00:00.000Z",
    ...overrides,
  };
}

function fourball(
  overrides: Partial<PublicGolfTourFourball> = {},
): PublicGolfTourFourball {
  return {
    id: "fb-1",
    roundId: "round-1",
    campId: "camp-a",
    status: "pending",
    golfRoundId: null,
    path: null,
    standingFourballId: null,
    sitOut: false,
    players: [
      {
        slot: 1,
        userId: "player-1",
        displayName: "Alex",
        isGuest: false,
        sitOut: false,
      },
    ],
    ...overrides,
  };
}

function tour(overrides: Partial<PublicGolfTour> = {}): PublicGolfTour {
  return {
    id: "tour-1",
    name: "Friends Cup",
    startDate: "2026-09-12",
    endDate: "2026-09-14",
    status: "draft",
    hostUserId: "host-1",
    viewer: { role: "host" },
    camps: [
      { id: "camp-a", name: "Camp A", color: null, sortOrder: 0, roster: [] },
      { id: "camp-b", name: "Camp B", color: null, sortOrder: 1, roster: [] },
    ],
    rounds: [
      {
        id: "round-1",
        date: "2026-09-12",
        venueCmsId: "sanity-course-1",
        label: "Saturday AM",
        format: "stroke",
      },
    ],
    standingFourballs: [],
    fourballs: [fourball()],
    createdAt: "2026-09-09T10:00:00.000Z",
    updatedAt: "2026-09-09T10:00:00.000Z",
    ...overrides,
  };
}

describe("golf tour date YYYY-MM-DD helpers", () => {
  it("accepts calendar ISO days and rejects invalid dates", () => {
    assert.equal(isIsoDay("2026-09-12"), true);
    assert.equal(isIsoDay(" 2026-09-12 "), true);
    assert.equal(parseIsoDay(" 2026-09-12 "), "2026-09-12");
    assert.equal(isIsoDay("2026-13-01"), false);
    assert.equal(isIsoDay("2026-02-31"), false);
    assert.equal(isIsoDay("09/12/2026"), false);
    assert.equal(parseIsoDay("2026-09-12"), "2026-09-12");
    assert.equal(parseIsoDay("2026-09-12T00:00:00.000Z"), "2026-09-12");
    assert.equal(parseIsoDay("nope"), null);
    assert.equal(todayIsoDay(new Date(2026, 8, 9)), "2026-09-09");
    assert.equal(addDaysIso("2026-09-12", 2), "2026-09-14");
    assert.equal(addDaysIso("2026-09-30", 1), "2026-10-01");
    assert.equal(addDaysIso("bad", 1), null);
    assert.ok(compareIsoDays("2026-09-14", "2026-09-12") > 0);
    assert.equal(compareIsoDays("2026-09-12", "2026-09-12"), 0);
    assert.match(formatIsoDayLabel("2026-09-12"), /12/);
    assert.equal(
      buildCreateGolfTourPayload({
        name: " Friends Cup ",
        startDate: "2026-09-12",
        endDate: "2026-09-14",
      }).ok,
      true,
    );
    assert.equal(
      buildCreateGolfTourPayload({
        name: "Friends Cup",
        startDate: "12 Sept",
        endDate: "2026-09-14",
      }).ok,
      false,
    );
    assert.equal(
      buildCreateGolfTourPayload({
        name: "Friends Cup",
        startDate: "2026-09-14",
        endDate: "2026-09-12",
      }).ok,
      false,
    );
  });
});

describe("golf tour proxy path order", () => {
  it("lists mine before :id, nests roster under camps, standing before rounds, prepare+copy-from under rounds", () => {
    const mineIdx = GOLF_TOUR_PROXY_SOURCES.indexOf("/api/golf-tours/mine");
    const idIdx = GOLF_TOUR_PROXY_SOURCES.indexOf("/api/golf-tours/:id");
    assert.ok(mineIdx >= 0 && mineIdx < idIdx);
    assert.deepEqual([...GOLF_TOUR_PROXY_SOURCES], [
      "/api/golf-tours",
      "/api/golf-tours/mine",
      "/api/golf-tours/:id",
      "/api/golf-tours/:id/complete",
      "/api/golf-tours/:id/camps",
      "/api/golf-tours/:id/camps/:campId",
      "/api/golf-tours/:id/camps/:campId/roster",
      "/api/golf-tours/:id/camps/:campId/roster/:memberId",
      "/api/golf-tours/:id/standing-fourballs",
      "/api/golf-tours/:id/standing-fourballs/:templateId",
      "/api/golf-tours/:id/rounds",
      "/api/golf-tours/:id/rounds/:roundId",
      "/api/golf-tours/:id/rounds/:roundId/prepare",
      "/api/golf-tours/:id/rounds/:roundId/copy-from/:sourceRoundId",
      "/api/golf-tours/:id/rounds/:roundId/fourballs",
      "/api/golf-tours/:id/fourballs/:fourballId",
      "/api/golf-tours/:id/fourballs/:fourballId/start",
      "/api/golf-tours/:id/leaderboard",
    ]);
    const campIdx = GOLF_TOUR_PROXY_SOURCES.indexOf(
      "/api/golf-tours/:id/camps/:campId",
    );
    const rosterIdx = GOLF_TOUR_PROXY_SOURCES.indexOf(
      "/api/golf-tours/:id/camps/:campId/roster",
    );
    const standingIdx = GOLF_TOUR_PROXY_SOURCES.indexOf(
      "/api/golf-tours/:id/standing-fourballs",
    );
    const roundsIdx = GOLF_TOUR_PROXY_SOURCES.indexOf("/api/golf-tours/:id/rounds");
    const roundIdx = GOLF_TOUR_PROXY_SOURCES.indexOf(
      "/api/golf-tours/:id/rounds/:roundId",
    );
    const prepareIdx = GOLF_TOUR_PROXY_SOURCES.indexOf(
      "/api/golf-tours/:id/rounds/:roundId/prepare",
    );
    const copyIdx = GOLF_TOUR_PROXY_SOURCES.indexOf(
      "/api/golf-tours/:id/rounds/:roundId/copy-from/:sourceRoundId",
    );
    assert.ok(campIdx < rosterIdx);
    assert.ok(standingIdx < roundsIdx);
    assert.ok(roundIdx < prepareIdx && prepareIdx < copyIdx);
    const origin = "https://api.example.test";
    assert.equal(golfToursRootUrl(origin), "https://api.example.test/api/golf-tours");
    assert.equal(
      golfTourMineUrl(origin),
      "https://api.example.test/api/golf-tours/mine",
    );
    assert.equal(
      golfTourUrl(origin, "t1"),
      "https://api.example.test/api/golf-tours/t1",
    );
    assert.equal(
      golfTourCompleteUrl(origin, "t1"),
      "https://api.example.test/api/golf-tours/t1/complete",
    );
    assert.equal(
      golfTourCampUrl(origin, "t1", "c1"),
      "https://api.example.test/api/golf-tours/t1/camps/c1",
    );
    assert.equal(
      golfTourCampRosterUrl(origin, "t1", "c1"),
      "https://api.example.test/api/golf-tours/t1/camps/c1/roster",
    );
    assert.equal(
      golfTourCampRosterMemberUrl(origin, "t1", "c1", "m1"),
      "https://api.example.test/api/golf-tours/t1/camps/c1/roster/m1",
    );
    assert.equal(
      golfTourStandingFourballsUrl(origin, "t1"),
      "https://api.example.test/api/golf-tours/t1/standing-fourballs",
    );
    assert.equal(
      golfTourRoundPrepareUrl(origin, "t1", "r1"),
      "https://api.example.test/api/golf-tours/t1/rounds/r1/prepare",
    );
    assert.equal(
      golfTourRoundCopyFromUrl(origin, "t1", "r2", "r1"),
      "https://api.example.test/api/golf-tours/t1/rounds/r2/copy-from/r1",
    );
    assert.equal(
      golfTourRoundFourballsUrl(origin, "t1", "r1"),
      "https://api.example.test/api/golf-tours/t1/rounds/r1/fourballs",
    );
    assert.equal(
      golfTourFourballStartUrl(origin, "t1", "fb1"),
      "https://api.example.test/api/golf-tours/t1/fourballs/fb1/start",
    );
    assert.equal(
      golfTourLeaderboardUrl(origin, "t1"),
      "https://api.example.test/api/golf-tours/t1/leaderboard",
    );
  });
});

describe("golf tour start → path navigation", () => {
  it("opens the returned /golf/{id} path from start and live fourballs", () => {
    assert.equal(
      fourballStartNavigateHref({
        path: "/golf/round-9",
        golfRoundId: "round-9",
      }),
      "/golf/round-9",
    );
    assert.equal(
      fourballStartNavigateHref({ golfRoundId: "round-9" }),
      "/golf/round-9",
    );
    assert.equal(fourballStartNavigateHref({ path: "/padel/x" }), null);
    assert.equal(fourballStartNavigateHref({}), null);
    assert.equal(golfRoundScorecardHref("round-9"), "/golf/round-9");
    assert.equal(golfTourHref("tour-1"), "/golf-tours/tour-1");
    assert.equal(GOLF_TOURS_HREF, "/golf-tours");
    assert.equal(GOLF_TOURS_NEW_HREF, "/golf-tours/new");

    const started = fourball({
      status: "live",
      golfRoundId: "round-9",
      path: "/golf/round-9",
    });
    assert.equal(fourballStartNavigateHref(started), "/golf/round-9");
    assert.equal(canStartFourball(tour({ status: "active" }), started), true);

    const pending = fourball();
    assert.equal(canStartFourball(tour(), pending, "player-1"), true);
    assert.equal(
      canStartFourball(
        tour({ viewer: { role: "player" } }),
        pending,
        "player-1",
      ),
      true,
    );
    assert.equal(
      canStartFourball(
        tour({ viewer: { role: "player" } }),
        pending,
        "stranger",
      ),
      false,
    );
    assert.equal(
      canStartFourball(tour(), fourball({ players: [] })),
      false,
    );
    assert.equal(
      canStartFourball(tour({ status: "completed" }), pending, "host-1"),
      false,
    );

    const built = buildStartFourballPayload({
      teeName: " White ",
      holesPlayed: 9,
      startingHole: 1,
    });
    assert.deepEqual(built, {
      ok: true,
      payload: { teeName: "White", holesPlayed: 9, startingHole: 1 },
    });
    assert.equal(buildStartFourballPayload({ teeName: "" }).ok, false);
  });

  it("posts start and navigates to the returned golf scorecard path", async () => {
    const live = fourball({
      status: "live",
      golfRoundId: "round-9",
      path: "/golf/round-9",
    });
    const result = await startGolfTourFourballWith(
      "tour-1",
      "fb-1",
      { teeName: "White", holesPlayed: 9, startingHole: 1 },
      {
        fetch: async (url, init) => {
          assert.equal(
            String(url),
            "https://api.example.test/api/golf-tours/tour-1/fourballs/fb-1/start",
          );
          assert.equal(init?.method, "POST");
          assert.equal(init?.credentials, "include");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.teeName, "White");
          return new Response(
            JSON.stringify({
              tour: tour({ status: "active", fourballs: [live] }),
              fourball: live,
              golfRoundId: "round-9",
              path: "/golf/round-9",
            }),
            { status: 201 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.path, "/golf/round-9");
      assert.equal(result.value.golfRoundId, "round-9");
      assert.equal(fourballStartNavigateHref(result.value), "/golf/round-9");
    }
  });
});

describe("golf tour leaderboard row parsing", () => {
  it("parses camp player rows and avg gross from locked cards", () => {
    const row = parseLeaderboardPlayer({
      playerKey: "user:alex",
      userId: "alex",
      displayName: "Alex",
      isGuest: false,
      avgGross: 36,
      playerRoundsCounted: 1,
      totalStrokes: 36,
    });
    assert.deepEqual(row, {
      playerKey: "user:alex",
      userId: "alex",
      displayName: "Alex",
      isGuest: false,
      avgGross: 36,
      playerRoundsCounted: 1,
      totalStrokes: 36,
    });
    assert.equal(formatAvgGross(36), "36");
    assert.equal(formatAvgGross(37.5), "37.5");
    assert.equal(parseLeaderboardPlayer({ playerKey: "x" }), null);

    const guest = parseLeaderboardPlayer({
      playerKey: "guest:pat",
      userId: null,
      displayName: "Pat",
      isGuest: true,
      avgGross: 40.5,
      playerRoundsCounted: 2,
      totalStrokes: 81,
    });
    assert.equal(guest?.playerKey, "guest:pat");
    assert.equal(guest?.isGuest, true);

    const leaderboard = parseGolfTourLeaderboard({
      leaderboard: {
        tourId: "tour-1",
        status: "active",
        camps: [
          {
            campId: "camp-a",
            name: "Camp A",
            color: null,
            players: [
              {
                playerKey: "user:alex",
                userId: "alex",
                displayName: "Alex",
                isGuest: false,
                avgGross: 36,
                playerRoundsCounted: 1,
                totalStrokes: 36,
              },
            ],
          },
        ],
      },
    });
    assert.ok(leaderboard);
    assert.equal(leaderboard.camps[0]?.players[0]?.avgGross, 36);
    assert.equal(
      parseGolfTourLeaderboard({
        leaderboard: { tourId: "t", status: "active", camps: "nope" },
      }),
      null,
    );
  });
});

describe("golf tour mine lists and parsers", () => {
  it("splits hosting / playing / completed and parses a full tour", () => {
    const lists = partitionMineTours([
      summary({ id: "a", viewer: { role: "host" }, status: "draft" }),
      summary({ id: "b", viewer: { role: "player" }, status: "active" }),
      summary({ id: "c", viewer: { role: "host" }, status: "completed" }),
      summary({ id: "d", viewer: { role: "player" }, status: "completed" }),
    ]);
    assert.deepEqual(
      lists.hosting.map((row) => row.id),
      ["a"],
    );
    assert.deepEqual(
      lists.playing.map((row) => row.id),
      ["b"],
    );
    assert.deepEqual(
      lists.completed.map((row) => row.id),
      ["c", "d"],
    );
    assert.deepEqual([...GOLF_TOUR_DEFAULT_CAMP_NAMES], ["Camp A", "Camp B"]);

    const parsed = parseGolfTour(tour());
    assert.ok(parsed);
    assert.equal(parsed.camps.length, 2);
    assert.equal(parsed.rounds[0]?.date, "2026-09-12");
    assert.equal(parsed.fourballs[0]?.players[0]?.displayName, "Alex");
    assert.equal(
      parseGolfTour(tour({ startDate: "not-a-day" as unknown as string })),
      null,
    );
    assert.equal(
      parseGolfTourCamp({ id: "c1", name: "Camp A" })?.sortOrder,
      0,
    );
    assert.equal(
      parseGolfTourRound({
        id: "r1",
        date: "2026-09-12T08:00:00.000Z",
        venueCmsId: "cms-1",
      })?.format,
      "stroke",
    );
  });
});

describe("golf tour host setup path", () => {
  it("names the next empty-state step roster → standing → round → play", () => {
    const empty = tour({
      rounds: [],
      fourballs: [],
      standingFourballs: [],
    });
    assert.equal(golfTourHostNextStep(empty), "roster");
    assert.equal(golfTourHostNextStepAction("roster"), "Add players");
    assert.equal(tourRosterCount(empty), 0);
    assert.equal(shouldShowHostRoundComposer(true, false, "roster"), false);
    assert.equal(shouldShowHostRoundComposer(true, true, "roster"), true);
    assert.equal(shouldShowHostRoundComposer(true, false, "rounds"), true);
    assert.equal(shouldShowHostRoundComposer(false, true, "rounds"), false);
    assert.equal(nextCampPlaceholder(empty.camps), "Camp C");
    assert.equal(canMutateTour(empty), true);
    assert.equal(
      canMutateTour({
        ...empty,
        viewer: { role: "player" },
      }),
      false,
    );
    assert.equal(
      canMutateTour(
        {
          ...empty,
          viewer: { role: "player" },
        },
        "host-1",
      ),
      true,
    );
    assert.equal(
      isHost({ viewer: { role: "player" }, hostUserId: "host-1" }, "host-1"),
      true,
    );
    assert.equal(canMutateTour({ ...empty, status: "completed" }), false);

    const withRoster = tour({
      rounds: [],
      fourballs: [],
      standingFourballs: [],
      camps: [
        {
          id: "camp-a",
          name: "Camp A",
          color: null,
          sortOrder: 0,
          roster: [
            {
              id: "mem-1",
              campId: "camp-a",
              userId: "player-1",
              displayName: "Alex",
              isGuest: false,
            },
          ],
        },
        { id: "camp-b", name: "Camp B", color: null, sortOrder: 1, roster: [] },
      ],
    });
    assert.equal(golfTourHostNextStep(withRoster), "standing");
    assert.equal(golfTourHostNextStepAction("standing"), "Build standing fourballs");

    const withStanding = tour({
      rounds: [],
      fourballs: [],
      standingFourballs: [
        {
          id: "st-1",
          campId: "camp-a",
          name: "Morning group",
          sortOrder: 0,
          players: [
            {
              slot: 1,
              userId: "player-1",
              displayName: "Alex",
              isGuest: false,
              sitOut: false,
            },
          ],
        },
      ],
      camps: withRoster.camps,
    });
    assert.equal(golfTourHostNextStep(withStanding), "rounds");
    assert.equal(golfTourHostNextStepAction("rounds"), "Add round");

    const unprepared = tour({
      fourballs: [],
      standingFourballs: withStanding.standingFourballs,
      camps: withRoster.camps,
    });
    assert.equal(golfTourHostNextStep(unprepared), "prepare");
    assert.equal(roundNeedsPrepare(unprepared, "round-1"), true);
    assert.equal(golfTourHostNextStep(tour()), "start");
    assert.equal(
      golfTourHostNextStep(tour({ status: "completed" })),
      "done",
    );
    assert.equal(
      golfTourHostNextStep(
        tour({
          fourballs: [fourball({ sitOut: true })],
        }),
      ),
      "start",
    );
    assert.equal(
      canStartFourball(tour(), fourball({ sitOut: true })),
      false,
    );
  });

  it("posts camps, rounds, and fourballs and returns the nested tour", async () => {
    const origin = "https://api.example.test";
    const afterCamp = tour({
      camps: [
        ...tour().camps,
        { id: "camp-c", name: "Camp C", color: null, sortOrder: 2, roster: [] },
      ],
    });
    const campResult = await addGolfTourCampWith(
      "tour-1",
      { name: "Camp C" },
      {
        fetch: async (url, init) => {
          assert.equal(String(url), `${origin}/api/golf-tours/tour-1/camps`);
          assert.equal(init?.method, "POST");
          assert.equal(init?.credentials, "include");
          assert.equal(JSON.parse(String(init?.body)).name, "Camp C");
          return new Response(JSON.stringify({ tour: afterCamp }), {
            status: 201,
          });
        },
        baseUrl: origin,
      },
    );
    assert.equal(campResult.ok, true);
    if (campResult.ok) {
      assert.equal(campResult.value.camps.at(-1)?.name, "Camp C");
    }

    const afterRound = tour();
    const roundResult = await addGolfTourRoundWith(
      "tour-1",
      {
        date: "2026-09-13",
        venueCmsId: "sanity-course-1",
        label: "Sunday AM",
        venue: { name: "Test Links", slug: "test-links" },
      },
      {
        fetch: async (url, init) => {
          const href = String(url);
          if (href.includes("/api/venues/")) {
            return new Response(
              JSON.stringify({
                id: "v1",
                cmsId: "sanity-course-1",
                name: "Test Links",
                slug: "test-links",
              }),
              { status: 200 },
            );
          }
          assert.equal(href, `${origin}/api/golf-tours/tour-1/rounds`);
          assert.equal(init?.method, "POST");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.date, "2026-09-13");
          assert.equal(body.venueCmsId, "sanity-course-1");
          assert.equal(body.label, "Sunday AM");
          return new Response(JSON.stringify({ tour: afterRound }), {
            status: 201,
          });
        },
        baseUrl: origin,
      },
    );
    assert.equal(roundResult.ok, true);

    const fourballResult = await addGolfTourFourballWith(
      "tour-1",
      "round-1",
      {
        campId: "camp-a",
        players: [
          {
            slot: 1,
            displayName: "Alex",
            isGuest: false,
            userId: "player-1",
          },
        ],
      },
      {
        fetch: async (url, init) => {
          assert.equal(
            String(url),
            `${origin}/api/golf-tours/tour-1/rounds/round-1/fourballs`,
          );
          assert.equal(init?.method, "POST");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.campId, "camp-a");
          assert.equal(body.players[0].displayName, "Alex");
          return new Response(JSON.stringify({ tour: tour() }), {
            status: 201,
          });
        },
        baseUrl: origin,
      },
    );
    assert.equal(fourballResult.ok, true);
  });
});

describe("golf tour v2 roster / standing / prepare / sit-out clients", () => {
  const origin = "https://api.example.test";

  it("parses roster, standing templates, sit-out, and share paths", () => {
    const parsed = parseGolfTour(
      tour({
        camps: [
          {
            id: "camp-a",
            name: "Camp A",
            color: null,
            sortOrder: 0,
            roster: [
              {
                id: "mem-1",
                campId: "camp-a",
                userId: "player-1",
                displayName: "Alex",
                isGuest: false,
              },
            ],
          },
          { id: "camp-b", name: "Camp B", color: null, sortOrder: 1, roster: [] },
        ],
        standingFourballs: [
          {
            id: "st-1",
            campId: "camp-a",
            name: "Morning group",
            sortOrder: 0,
            players: [
              {
                slot: 1,
                userId: "player-1",
                displayName: "Alex",
                isGuest: false,
                sitOut: false,
              },
            ],
          },
        ],
        fourballs: [
          fourball({
            standingFourballId: "st-1",
            sitOut: false,
            players: [
              {
                slot: 1,
                userId: "player-1",
                displayName: "Alex",
                isGuest: false,
                sitOut: true,
              },
            ],
          }),
        ],
      }),
    );
    assert.ok(parsed);
    assert.equal(parsed.camps[0]?.roster[0]?.displayName, "Alex");
    assert.equal(parsed.standingFourballs[0]?.name, "Morning group");
    assert.equal(parsed.fourballs[0]?.standingFourballId, "st-1");
    assert.equal(parsed.fourballs[0]?.players[0]?.sitOut, true);
    assert.equal(
      parseGolfTourFourball(fourball({ sitOut: true }))?.sitOut,
      true,
    );
    assert.equal(
      parseGolfTourCamp({ id: "c1", name: "Camp A" })?.roster.length,
      0,
    );

    const built = buildStandingFourballPayload({
      campId: "camp-a",
      name: " Morning group ",
      players: [{ slot: 1, rosterMemberId: "mem-1" }],
    });
    assert.equal(built.ok, true);
    if (built.ok) {
      assert.equal(built.payload.campId, "camp-a");
      assert.equal(built.payload.name, "Morning group");
      assert.deepEqual(built.payload.players, [
        { slot: 1, rosterMemberId: "mem-1" },
      ]);
    }
    assert.deepEqual(
      buildPlayerSitOutsPayload([{ slot: 2, sitOut: true }]),
      { ok: true, playerSitOuts: [{ slot: 2, sitOut: true }] },
    );
    assert.equal(buildPlayerSitOutsPayload([]).ok, false);

    const live = fourball({
      status: "live",
      golfRoundId: "round-9",
      path: "/golf/round-9",
    });
    assert.equal(fourballSharePath(live), "/golf/round-9");
    assert.equal(
      absoluteAppUrl("/golf/round-9", "https://leaguesports.co.za"),
      "https://leaguesports.co.za/golf/round-9",
    );
    assert.equal(
      previousRound(
        [
          { id: "r1", date: "2026-09-12", venueCmsId: "c", label: null, format: "stroke" },
          { id: "r2", date: "2026-09-13", venueCmsId: "c", label: null, format: "stroke" },
        ],
        "r2",
      )?.id,
      "r1",
    );
  });

  it("posts roster, standing templates, prepare, copy-from, and sitOut shapes", async () => {
    const rosterResult = await addGolfTourRosterMemberWith(
      "tour-1",
      "camp-a",
      { displayName: "Pat", isGuest: true },
      {
        fetch: async (url, init) => {
          assert.equal(String(url), `${origin}/api/golf-tours/tour-1/camps/camp-a/roster`);
          assert.equal(init?.method, "POST");
          assert.equal(init?.credentials, "include");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.displayName, "Pat");
          assert.equal(body.isGuest, true);
          return new Response(JSON.stringify({ tour: tour() }), { status: 201 });
        },
        baseUrl: origin,
      },
    );
    assert.equal(rosterResult.ok, true);

    const standingResult = await addGolfTourStandingFourballWith(
      "tour-1",
      {
        campId: "camp-a",
        name: "Morning group",
        players: [{ slot: 1, rosterMemberId: "mem-1" }],
      },
      {
        fetch: async (url, init) => {
          assert.equal(
            String(url),
            `${origin}/api/golf-tours/tour-1/standing-fourballs`,
          );
          assert.equal(init?.method, "POST");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.campId, "camp-a");
          assert.equal(body.players[0].rosterMemberId, "mem-1");
          return new Response(JSON.stringify({ tour: tour() }), { status: 201 });
        },
        baseUrl: origin,
      },
    );
    assert.equal(standingResult.ok, true);

    const prepareResult = await prepareGolfTourRoundWith("tour-1", "round-1", {
      fetch: async (url, init) => {
        assert.equal(
          String(url),
          `${origin}/api/golf-tours/tour-1/rounds/round-1/prepare`,
        );
        assert.equal(init?.method, "POST");
        assert.equal(init?.body, undefined);
        return new Response(JSON.stringify({ tour: tour() }), { status: 200 });
      },
      baseUrl: origin,
    });
    assert.equal(prepareResult.ok, true);

    const copyResult = await copyGolfTourRoundFromWith(
      "tour-1",
      "round-2",
      "round-1",
      {
        fetch: async (url, init) => {
          assert.equal(
            String(url),
            `${origin}/api/golf-tours/tour-1/rounds/round-2/copy-from/round-1`,
          );
          assert.equal(init?.method, "POST");
          return new Response(JSON.stringify({ tour: tour() }), { status: 200 });
        },
        baseUrl: origin,
      },
    );
    assert.equal(copyResult.ok, true);

    const sitOutResult = await updateGolfTourFourballWith(
      "tour-1",
      "fb-1",
      { sitOut: true, playerSitOuts: [{ slot: 1, sitOut: true }] },
      {
        fetch: async (url, init) => {
          assert.equal(
            String(url),
            `${origin}/api/golf-tours/tour-1/fourballs/fb-1`,
          );
          assert.equal(init?.method, "PATCH");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.sitOut, true);
          assert.deepEqual(body.playerSitOuts, [{ slot: 1, sitOut: true }]);
          return new Response(
            JSON.stringify({ tour: tour({ fourballs: [fourball({ sitOut: true })] }) }),
            { status: 200 },
          );
        },
        baseUrl: origin,
      },
    );
    assert.equal(sitOutResult.ok, true);
  });

  it("dismisses first-run How it works copy once", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
    assert.equal(isGolfTourHowItWorksDismissed(storage), false);
    dismissGolfTourHowItWorks(storage);
    assert.equal(isGolfTourHowItWorksDismissed(storage), true);
    assert.equal(store.get(GOLF_TOUR_HOW_IT_WORKS_KEY), "1");
  });
});

describe("golf tour share buttons (no naked URL-only)", () => {
  it("uses Share buttons in hub and share control, not a naked URL as the only control", async () => {
    const { readFileSync } = await import("node:fs");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const here = dirname(fileURLToPath(import.meta.url));
    const hub = readFileSync(
      join(here, "../../components/golf-tours/GolfTourHub.tsx"),
      "utf8",
    );
    const share = readFileSync(
      join(here, "../../components/golf-tours/GolfTourShareButton.tsx"),
      "utf8",
    );
    const row = readFileSync(
      join(here, "../../components/golf-tours/GolfTourRow.tsx"),
      "utf8",
    );
    assert.match(hub, /GolfTourShareButton/);
    assert.match(hub, /Open scorecard/);
    assert.match(hub, /Start scorecard/);
    assert.match(hub, /Add players/);
    assert.match(hub, /Build standing fourballs/);
    assert.match(hub, /Add round/);
    assert.match(hub, /Prepare round/);
    assert.match(hub, /Sit out group/);
    assert.doesNotMatch(hub, /<a[^>]+href=\{[^}]*sharePath/);
    assert.doesNotMatch(hub, />\{sharePath\}</);
    assert.doesNotMatch(hub, />\{openHref\}</);
    assert.match(share, /type="button"/);
    assert.match(share, /\{copied \? "Copied" : label\}/);
    assert.match(share, /navigator\.share/);
    assert.match(share, /clipboard\.writeText/);
    assert.doesNotMatch(share, /<a[^>]+href=\{url\}[^>]*>\{url\}/);
    assert.doesNotMatch(share, />\{path\}</);
    assert.match(row, /\bOpen\b/);
    assert.match(row, /golfTourHref/);
  });
});

