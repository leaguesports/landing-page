import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  appearOnVenueLeaderboardsPutBody,
  emptyRecords,
  formatVenueLeaderboardStats,
  isVenueLeaderboardEmpty,
  listedVenueLeaderboardEntries,
  parseBoardFromSearch,
  parseBoardQuery,
  parseWindowQuery,
  selectGrinderWindow,
  selectVenueLeaderboardTab,
  VENUE_LEADERBOARD_EMPTY_COPY,
  VENUE_LEADERBOARD_EMPTY_CTA,
  VENUE_LEADERBOARD_OPT_OUT_LABEL,
  VENUE_LEADERBOARD_TAB_LABELS,
  venueLeaderboardPlayHref,
  venueLeaderboardQuery,
  visibleBoardIds,
  visibleVenueLeaderboardTabs,
} from "./boards.ts";
import type { VenueLeaderboardEntry } from "./types.ts";

function entry(
  userId: string,
  extras: Partial<VenueLeaderboardEntry> = {},
): VenueLeaderboardEntry {
  return {
    rank: extras.rank ?? 1,
    userId,
    displayName: extras.displayName ?? "Alex P.",
    avatarUrl: extras.avatarUrl ?? null,
    stats: extras.stats ?? { wins: 4, events: 5 },
  };
}

describe("venue leaderboard query ?board= deep link", () => {
  it("parses board slugs and ignores unknown values", () => {
    assert.equal(parseBoardQuery("grinder"), "grinder");
    assert.equal(parseBoardQuery("POTM"), "potm");
    assert.equal(parseBoardQuery("records"), "records");
    assert.equal(parseBoardQuery("streak"), "streak");
    assert.equal(parseBoardQuery("improved"), null);
    assert.equal(parseBoardQuery(""), null);
    assert.equal(parseBoardQuery(undefined), null);
  });

  it("reads ?board= from a query string, URLSearchParams, and Next searchParams", () => {
    assert.equal(parseBoardFromSearch("?board=grinder"), "grinder");
    assert.equal(parseBoardFromSearch("board=streak&window=all"), "streak");
    assert.equal(
      parseBoardFromSearch(new URLSearchParams("board=potm")),
      "potm",
    );
    assert.equal(parseBoardFromSearch({ board: "records" }), "records");
    assert.equal(parseBoardFromSearch({ board: ["grinder"] }), "grinder");
    assert.equal(parseBoardFromSearch({ board: "improved" }), null);
    assert.equal(parseBoardFromSearch(null), null);
  });

  it("selects the deep-linked tab only when that board is present and non-empty", () => {
    const tabs = {
      records: false,
      potm: true,
      grinder: true,
      streak: false,
    };
    assert.equal(selectVenueLeaderboardTab("grinder", tabs), "grinder");
    assert.equal(selectVenueLeaderboardTab("streak", tabs), "potm");
    assert.equal(selectVenueLeaderboardTab("records", tabs), "potm");
    assert.equal(selectVenueLeaderboardTab(null, tabs), "potm");
    assert.equal(
      selectVenueLeaderboardTab("grinder", {
        records: false,
        potm: false,
        grinder: false,
        streak: false,
      }),
      null,
    );
  });
});

describe("hide-empty-tab logic", () => {
  it("treats ranked boards as empty when first is null and entries is []", () => {
    assert.equal(
      isVenueLeaderboardEmpty({
        board: "potm",
        first: null,
        entries: [],
      }),
      true,
    );
    assert.equal(
      isVenueLeaderboardEmpty({
        board: "potm",
        first: entry("user-alex"),
        entries: [entry("user-alex")],
      }),
      false,
    );
  });

  it("treats records as empty only when golf/padel/darts lists are empty", () => {
    assert.equal(
      isVenueLeaderboardEmpty({
        board: "records",
        first: null,
        entries: [],
        records: emptyRecords(),
      }),
      true,
    );
    assert.equal(
      isVenueLeaderboardEmpty({
        board: "records",
        first: null,
        entries: [],
        records: {
          ...emptyRecords(),
          golf: {
            bestGrossByTee: [
              {
                teeId: "tee-white",
                teeName: "White",
                userId: "user-blake",
                displayName: "Blake G.",
                avatarUrl: null,
                stats: { score: 72, eventId: "g1", lockedAt: "2026-09-01" },
              },
            ],
            bestNetByTee: [],
          },
        },
      }),
      false,
    );
  });

  it("hides empty tabs and keeps grinder if either window has rows", () => {
    const tabs = visibleVenueLeaderboardTabs({
      records: {
        board: "records",
        first: null,
        entries: [],
        records: emptyRecords(),
      },
      potm: { board: "potm", first: null, entries: [] },
      grinderMonth: { board: "grinder", first: null, entries: [] },
      grinderAll: {
        board: "grinder",
        first: entry("user-alex", { stats: { events: 4 } }),
        entries: [entry("user-alex", { stats: { events: 4 } })],
      },
      streak: { board: "streak", first: null, entries: [] },
    });
    assert.deepEqual(tabs, {
      records: false,
      potm: false,
      grinder: true,
      streak: false,
    });
    assert.deepEqual(visibleBoardIds(tabs), ["grinder"]);
    assert.equal(VENUE_LEADERBOARD_TAB_LABELS.grinder, "Grinder");
    assert.equal(VENUE_LEADERBOARD_TAB_LABELS.potm, "Player of the month");
  });
});

describe("grinder window toggle", () => {
  it("builds window=month|all only on the grinder query", () => {
    assert.equal(
      venueLeaderboardQuery({ board: "grinder", window: "month" }),
      "board=grinder&window=month",
    );
    assert.equal(
      venueLeaderboardQuery({ board: "grinder", window: "all" }),
      "board=grinder&window=all",
    );
    assert.equal(
      venueLeaderboardQuery({ board: "records", window: "all" }),
      "board=records",
    );
    assert.equal(parseWindowQuery("all"), "all");
    assert.equal(parseWindowQuery("week"), null);
  });

  it("keeps the requested window when it has rows, else falls back", () => {
    assert.equal(selectGrinderWindow("month", false, true), "month");
    assert.equal(selectGrinderWindow("all", true, false), "all");
    assert.equal(selectGrinderWindow("month", true, false), "all");
    assert.equal(selectGrinderWindow("all", false, true), "month");
    assert.equal(selectGrinderWindow(null, true, true), "month");
    assert.equal(selectGrinderWindow("all", true, true), "all");
  });
});

describe("empty CTA copy", () => {
  it("uses the locked empty-board sentence and Start CTA to Play", () => {
    assert.equal(
      VENUE_LEADERBOARD_EMPTY_COPY,
      "Play and lock a game here to open this board.",
    );
    assert.equal(VENUE_LEADERBOARD_EMPTY_CTA, "Start");
    assert.equal(venueLeaderboardPlayHref("padel"), "/play/padel");
    assert.equal(venueLeaderboardPlayHref("golf"), "/play/golf");
    assert.equal(venueLeaderboardPlayHref("darts"), "/play/darts");
    assert.equal(venueLeaderboardPlayHref("rugby"), "/play");
    assert.equal(venueLeaderboardPlayHref(null), "/play");
  });
});

describe("venue leaderboard presentation helpers", () => {
  it("does not double-list #1 when entries already includes first", () => {
    const first = entry("user-alex");
    const rest = entry("user-blake", { rank: 2, displayName: "Blake G." });
    assert.deepEqual(listedVenueLeaderboardEntries(first, [first, rest]), [
      first,
      rest,
    ]);
    assert.deepEqual(listedVenueLeaderboardEntries(first, [rest]), [
      first,
      rest,
    ]);
    assert.deepEqual(listedVenueLeaderboardEntries(null, [rest]), [rest]);
  });

  it("formats wins, events, streak, and golf stats", () => {
    assert.equal(
      formatVenueLeaderboardStats({ wins: 4, events: 5 }),
      "4 wins · 5 games",
    );
    assert.equal(formatVenueLeaderboardStats({ streak: 3 }), "3-win streak");
    assert.equal(
      formatVenueLeaderboardStats({ netAverage: 68.4, events: 4, netRounds: 3 }),
      "68.4 net avg · 3 net rounds · 4 games",
    );
    assert.equal(formatVenueLeaderboardStats({ score: 68 }), "68");
  });

  it("documents the You-settings opt-out label", () => {
    assert.equal(
      VENUE_LEADERBOARD_OPT_OUT_LABEL,
      "Appear on venue leaderboards",
    );
    assert.deepEqual(appearOnVenueLeaderboardsPutBody(false), {
      appearOnVenueLeaderboards: false,
    });
  });
});
