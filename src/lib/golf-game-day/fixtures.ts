import type {
  GameDayCreated,
  GameDayLeaderboard,
  GameDayPreview,
  RankingRow,
} from "../../types/golf-game-day.ts";
import { formatGameDayDate, gameDayHeadline } from "./paths.ts";
import { finishedRound } from "./scoring-ui.ts";

const FIXTURE_DATE = "2026-11-01";
const FIXTURE_VENUE = "Zebula Golf Estate & Spa";
const FIXTURE_DATE_LABEL = formatGameDayDate(FIXTURE_DATE);
const FIXTURE_HEADLINE = gameDayHeadline(FIXTURE_VENUE, FIXTURE_DATE);

export const FIXTURE_DAY_ID = "8c2f0a1e-6b4d-4a1e-8f3a-0b1c2d3e4f50";

const players = ["Nadia", "Brandon", "Mike", "Sipho", "Pieter", "Ruan"] as const;

function row(
  index: number,
  scores: { gross: number; toPar: number; net: number; stableford: number; thru: number },
): RankingRow {
  const name = players[index] ?? "Player";
  return {
    position: String(index + 1),
    positionNumber: index + 1,
    tied: false,
    playerId: name.toLowerCase(),
    displayName: name,
    you: name === "Mike",
    cardId: `card-${(index % 3) + 1}`,
    cardNumber: (index % 3) + 1,
    handicapIndex: [4, 14, 6, 9, 18, 22][index] ?? null,
    playingHandicap: [4, 16, 7, 10, 20, 24][index] ?? null,
    thru: scores.thru,
    gross: scores.gross,
    toPar: scores.toPar,
    net: scores.net,
    stableford: scores.stableford,
    countbackNote: null,
  };
}

const liveRows: RankingRow[] = [
  row(0, { gross: 52, toPar: -2, net: 48, stableford: 38, thru: 12 }),
  row(1, { gross: 58, toPar: 4, net: 46, stableford: 36, thru: 12 }),
  row(2, { gross: 48, toPar: 0, net: 42, stableford: 34, thru: 8 }),
  row(3, { gross: 55, toPar: 3, net: 47, stableford: 33, thru: 12 }),
  row(4, { gross: 60, toPar: 6, net: 44, stableford: 31, thru: 11 }),
  row(5, { gross: 62, toPar: 8, net: 44, stableford: 29, thru: 11 }),
].map((item, index) => ({ ...item, position: String(index + 1), positionNumber: index + 1 }));

function byStableford(rows: RankingRow[]): RankingRow[] {
  return [...rows].sort((left, right) => (right.stableford ?? 0) - (left.stableford ?? 0));
}
function byNet(rows: RankingRow[]): RankingRow[] {
  return [...rows].sort((left, right) => (left.net ?? 999) - (right.net ?? 999));
}
function byGross(rows: RankingRow[]): RankingRow[] {
  return [...rows].sort((left, right) => (left.toPar ?? 999) - (right.toPar ?? 999));
}

function place(rows: RankingRow[]): RankingRow[] {
  return rows.map((item, index) => ({
    ...item,
    position: String(index + 1),
    positionNumber: index + 1,
    tied: false,
  }));
}

export function fixtureLeaderboard(access: "player" | "watch" = "player"): GameDayLeaderboard {
  const gross = place(byGross(liveRows)).map((item) => ({
    ...item,
    you: access === "player" && item.playerId === "mike",
  }));
  const net = place(byNet(liveRows)).map((item) => ({
    ...item,
    you: access === "player" && item.playerId === "mike",
  }));
  const stableford = place(byStableford(liveRows)).map((item) => ({
    ...item,
    you: access === "player" && item.playerId === "mike",
  }));
  return {
    gameDayId: FIXTURE_DAY_ID,
    version: 4,
    access,
    status: "in_play",
    format: "stroke",
    venueName: FIXTURE_VENUE,
    venueCmsId: "zebula-golf-estate-spa",
    date: FIXTURE_DATE,
    dateLabel: FIXTURE_DATE_LABEL,
    headline: FIXTURE_HEADLINE,
    cardsConfirmed: 1,
    cardsTotal: 3,
    countback: "last 9, 6, 3, 1",
    countbackApplied: false,
    rankings: { gross, net, stableford },
    podium: null,
    feed: [
      {
        id: "feed-1",
        type: "birdie",
        message: "Nadia birdie · 10",
        at: "2026-11-01T08:42:00.000Z",
        playerName: "Nadia",
      },
      {
        id: "feed-2",
        type: "lead_change",
        message: "Lead change · Nadia · 38 pts",
        at: "2026-11-01T08:41:00.000Z",
        leaderName: "Nadia",
        metric: "stableford",
        value: 38,
      },
      {
        id: "feed-3",
        type: "birdie",
        message: "Pieter eagle · 6",
        at: "2026-11-01T08:20:00.000Z",
      },
      {
        id: "feed-4",
        type: "card_locked",
        message: "Card 1 confirmed",
        at: "2026-11-01T08:05:00.000Z",
      },
    ],
    cards: [
      { id: "card-1", number: 1, status: "locked", thru: 18, playerCount: 4, syncedAt: "2026-11-01T08:05:00.000Z" },
      { id: "card-2", number: 2, status: "live", thru: 8, playerCount: 1, syncedAt: "2026-11-01T08:40:00.000Z" },
      { id: "card-3", number: 3, status: "live", thru: 12, playerCount: 4, syncedAt: "2026-11-01T08:42:00.000Z" },
    ],
  };
}

function finishedPlayer(input: {
  name: string;
  handicapIndex: number;
  playingHandicap: number;
  gross: number;
  countbackNote: string | null;
  you?: boolean;
}): RankingRow {
  const scores = finishedRound(input.gross, input.playingHandicap);
  return {
    position: "0",
    positionNumber: 0,
    tied: false,
    playerId: input.name.toLowerCase(),
    displayName: input.name,
    you: input.you ?? false,
    cardId: "card-1",
    cardNumber: 1,
    handicapIndex: input.handicapIndex,
    playingHandicap: input.playingHandicap,
    thru: scores.thru,
    gross: scores.gross,
    toPar: scores.toPar,
    net: scores.net,
    stableford: scores.stableford,
    countbackNote: input.countbackNote,
  };
}

/** Countback order is the source order inside a tied score. */
const finishedPlayers: RankingRow[] = [
  finishedPlayer({ name: "Nadia", handicapIndex: 4, playingHandicap: 4, gross: 70, countbackNote: "Back nine" }),
  finishedPlayer({ name: "Brandon", handicapIndex: 14, playingHandicap: 14, gross: 80, countbackNote: "Back nine" }),
  finishedPlayer({ name: "Mike", handicapIndex: 6, playingHandicap: 6, gross: 76, countbackNote: null, you: true }),
  finishedPlayer({ name: "Sipho", handicapIndex: 9, playingHandicap: 9, gross: 83, countbackNote: "Back six" }),
  finishedPlayer({ name: "Pieter", handicapIndex: 18, playingHandicap: 18, gross: 92, countbackNote: "Back six" }),
  finishedPlayer({ name: "Ruan", handicapIndex: 22, playingHandicap: 22, gross: 98, countbackNote: null }),
];

function orderFinished(
  rows: RankingRow[],
  score: (row: RankingRow) => number,
  direction: "asc" | "desc",
): RankingRow[] {
  const indexed = rows.map((row, index) => ({ row, index }));
  indexed.sort((left, right) => {
    const delta = score(left.row) - score(right.row);
    if (delta !== 0) return direction === "asc" ? delta : -delta;
    return left.index - right.index;
  });
  return place(indexed.map((item) => item.row));
}

export function fixtureResults(): GameDayLeaderboard {
  const gross = orderFinished(finishedPlayers, (row) => row.gross ?? 999, "asc");
  const net = orderFinished(finishedPlayers, (row) => row.net ?? 999, "asc");
  const stableford = orderFinished(finishedPlayers, (row) => row.stableford ?? 0, "desc");
  return {
    ...fixtureLeaderboard("player"),
    status: "final",
    access: "player",
    cardsConfirmed: 3,
    cardsTotal: 3,
    countback: "last 9, 6, 3, 1",
    countbackApplied: true,
    rankings: { gross, net, stableford },
    podium: { gross: gross.slice(0, 3), net: net.slice(0, 3), stableford: stableford.slice(0, 3) },
  };
}

export function fixtureCreated(): GameDayCreated {
  return {
    id: FIXTURE_DAY_ID,
    inviteCode: "ZB47",
    watchToken: "k7Qm9p",
    watchPath: "/api/golf-game-days/watch/k7Qm9p/leaderboard",
    venueCmsId: "zebula-golf-estate-spa",
    venueName: FIXTURE_VENUE,
    date: FIXTURE_DATE,
    dateLabel: FIXTURE_DATE_LABEL,
    headline: FIXTURE_HEADLINE,
    defaultTee: "White",
    teeOptions: ["White", "Yellow", "Red"],
    format: "stroke",
    status: "setup",
    version: 0,
    weekendEventId: "9b6e2c44-1d55-4c2a-9a10-77c1a9d0e221",
    players: [
      {
        id: "p-brandon",
        displayName: "Brandon",
        handicapIndex: null,
        teeName: "White",
        joined: false,
        cardId: null,
        cardNumber: null,
        slot: null,
      },
      {
        id: "p-sipho",
        displayName: "Sipho",
        handicapIndex: null,
        teeName: "White",
        joined: false,
        cardId: null,
        cardNumber: null,
        slot: null,
      },
    ],
  };
}

export function fixturePreview(): GameDayPreview {
  return {
    id: FIXTURE_DAY_ID,
    venueName: FIXTURE_VENUE,
    venueCmsId: "zebula-golf-estate-spa",
    date: FIXTURE_DATE,
    dateLabel: FIXTURE_DATE_LABEL,
    headline: FIXTURE_HEADLINE,
    defaultTee: "White",
    teeOptions: ["White", "Yellow", "Red"],
    format: "stroke",
    status: "setup",
    players: [
      { id: "p-mike", displayName: "Mike", taken: false, cardId: null, cardNumber: null },
      { id: "p-sipho", displayName: "Sipho", taken: true, cardId: "card-1", cardNumber: 1 },
      { id: "p-pieter", displayName: "Pieter", taken: false, cardId: null, cardNumber: null },
      { id: "p-ruan", displayName: "Ruan", taken: false, cardId: null, cardNumber: null },
    ],
    cards: [
      {
        id: "card-1",
        number: 1,
        status: "live",
        openSlots: 0,
        full: true,
        players: [
          { displayName: "Brandon", slot: 1, scoring: true },
          { displayName: "Sipho", slot: 2, scoring: false },
          { displayName: "Pieter", slot: 3, scoring: false },
          { displayName: "Ruan", slot: 4, scoring: false },
        ],
      },
      {
        id: "card-2",
        number: 2,
        status: "live",
        openSlots: 3,
        full: false,
        players: [{ displayName: "Mike", slot: 1, scoring: true }],
      },
    ],
  };
}
