import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GOLF_TOUR_DEFAULT_CAMP_NAMES,
  GOLF_TOUR_PROXY_SOURCES,
  GOLF_TOURS_HREF,
  GOLF_TOURS_NEW_HREF,
  addDaysIso,
  addGolfTourCampWith,
  addGolfTourFourballWith,
  addGolfTourRoundWith,
  buildCreateGolfTourPayload,
  buildStartFourballPayload,
  canMutateTour,
  canStartFourball,
  compareIsoDays,
  formatAvgGross,
  formatIsoDayLabel,
  fourballStartNavigateHref,
  golfRoundScorecardHref,
  golfTourCampUrl,
  golfTourCompleteUrl,
  golfTourFourballStartUrl,
  golfTourHref,
  golfTourHostNextStep,
  golfTourLeaderboardUrl,
  golfTourMineUrl,
  golfTourRoundFourballsUrl,
  golfTourUrl,
  golfToursRootUrl,
  isHost,
  isIsoDay,
  nextCampPlaceholder,
  parseGolfTour,
  parseGolfTourCamp,
  parseGolfTourLeaderboard,
  parseGolfTourRound,
  parseIsoDay,
  parseLeaderboardPlayer,
  partitionMineTours,
  shouldShowHostRoundComposer,
  startGolfTourFourballWith,
  todayIsoDay,
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
    players: [
      {
        slot: 1,
        userId: "player-1",
        displayName: "Alex",
        isGuest: false,
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
      { id: "camp-a", name: "Camp A", color: null, sortOrder: 0 },
      { id: "camp-b", name: "Camp B", color: null, sortOrder: 1 },
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
  it("lists mine before :id, then nested camps/rounds/fourballs/leaderboard", () => {
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
      "/api/golf-tours/:id/rounds",
      "/api/golf-tours/:id/rounds/:roundId",
      "/api/golf-tours/:id/rounds/:roundId/fourballs",
      "/api/golf-tours/:id/fourballs/:fourballId",
      "/api/golf-tours/:id/fourballs/:fourballId/start",
      "/api/golf-tours/:id/leaderboard",
    ]);
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
  it("keeps host controls available and names the next empty-state step", () => {
    const draft = tour({
      rounds: [],
      fourballs: [],
    });
    assert.equal(golfTourHostNextStep(draft), "rounds");
    assert.equal(shouldShowHostRoundComposer(true, 0, false), true);
    assert.equal(shouldShowHostRoundComposer(true, 1, false), false);
    assert.equal(shouldShowHostRoundComposer(true, 1, true), true);
    assert.equal(shouldShowHostRoundComposer(false, 0, true), false);
    assert.equal(nextCampPlaceholder(draft.camps), "Camp C");
    assert.equal(canMutateTour(draft), true);
    assert.equal(
      canMutateTour({
        ...draft,
        viewer: { role: "player" },
      }),
      false,
    );
    assert.equal(
      canMutateTour(
        {
          ...draft,
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
    assert.equal(canMutateTour({ ...draft, status: "completed" }), false);

    const withRound = tour({ fourballs: [] });
    assert.equal(golfTourHostNextStep(withRound), "fourballs");
    assert.equal(golfTourHostNextStep(tour()), "start");
    assert.equal(
      golfTourHostNextStep(tour({ status: "completed" })),
      "done",
    );
  });

  it("posts camps, rounds, and fourballs and returns the nested tour", async () => {
    const origin = "https://api.example.test";
    const afterCamp = tour({
      camps: [
        ...tour().camps,
        { id: "camp-c", name: "Camp C", color: null, sortOrder: 2 },
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

