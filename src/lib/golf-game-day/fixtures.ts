import type {
  GameDayCreated,
  GameDayLeaderboard,
  GameDayPreview,
  RankingRow,
} from "../../types/golf-game-day.ts";
import { formatGameDayDate, gameDayHeadline } from "./paths.ts";
import { finishedRound, midRound } from "./scoring-ui.ts";

const FIXTURE_DATE = "2026-11-01";
const FIXTURE_VENUE = "Zebula Golf Estate & Spa";
const FIXTURE_DATE_LABEL = formatGameDayDate(FIXTURE_DATE);
const FIXTURE_HEADLINE = gameDayHeadline(FIXTURE_VENUE, FIXTURE_DATE);

export const FIXTURE_DAY_ID = "8c2f0a1e-6b4d-4a1e-8f3a-0b1c2d3e4f50";

function livePlayer(input: {
  name: string;
  handicapIndex: number;
  cardNumber: number;
  gross: number;
  parSoFar: number;
  shotsReceived: number;
  thru: number;
  move?: number | null;
}): RankingRow {
  const scores = midRound(input);
  return {
    position: "0",
    positionNumber: 0,
    tied: false,
    playerId: input.name.toLowerCase(),
    displayName: input.name,
    you: input.name === "Mike",
    cardId: `card-${input.cardNumber}`,
    cardNumber: input.cardNumber,
    handicapIndex: input.handicapIndex,
    playingHandicap: input.shotsReceived,
    thru: scores.thru,
    gross: scores.gross,
    toPar: scores.toPar,
    net: scores.net,
    stableford: scores.stableford,
    countbackNote: null,
    move: input.move ?? null,
  };
}

const liveRows: RankingRow[] = [
  livePlayer({ name: "Nadia", handicapIndex: 4, cardNumber: 3, gross: 38, parSoFar: 48, shotsReceived: 4, thru: 12, move: 5 }),
  livePlayer({ name: "Brandon", handicapIndex: 14, cardNumber: 1, gross: 46, parSoFar: 48, shotsReceived: 10, thru: 12, move: -1 }),
  livePlayer({ name: "Mike", handicapIndex: 6, cardNumber: 2, gross: 36, parSoFar: 44, shotsReceived: 6, thru: 11 }),
  livePlayer({ name: "Sipho", handicapIndex: 9, cardNumber: 1, gross: 46, parSoFar: 48, shotsReceived: 8, thru: 12 }),
  livePlayer({ name: "Pieter", handicapIndex: 18, cardNumber: 1, gross: 46, parSoFar: 44, shotsReceived: 12, thru: 11 }),
  livePlayer({ name: "Ruan", handicapIndex: 22, cardNumber: 2, gross: 48, parSoFar: 44, shotsReceived: 14, thru: 11 }),
  livePlayer({ name: "Lindi", handicapIndex: 8, cardNumber: 3, gross: 38, parSoFar: 40, shotsReceived: 8, thru: 10 }),
  livePlayer({ name: "Johan", handicapIndex: 16, cardNumber: 3, gross: 48, parSoFar: 40, shotsReceived: 16, thru: 10 }),
  livePlayer({ name: "Ayesha", handicapIndex: 11, cardNumber: 2, gross: 37, parSoFar: 36, shotsReceived: 10, thru: 9 }),
  livePlayer({ name: "Chris", handicapIndex: 20, cardNumber: 1, gross: 48, parSoFar: 36, shotsReceived: 18, thru: 9 }),
];

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

function placeTied(rows: RankingRow[], score: (row: RankingRow) => number): RankingRow[] {
  let position = 1;
  return rows.map((row, index) => {
    const value = score(row);
    if (index > 0 && score(rows[index - 1]!) !== value) position = index + 1;
    const tied = rows.filter((item) => score(item) === value).length > 1;
    return {
      ...row,
      position: tied ? `T${position}` : String(position),
      positionNumber: position,
      tied,
    };
  });
}

export function fixtureLeaderboard(access: "player" | "watch" = "player"): GameDayLeaderboard {
  const mark = (rows: RankingRow[]) =>
    rows.map((item) => ({
      ...item,
      you: access === "player" && item.playerId === "mike",
    }));
  const gross = mark(placeTied(byGross(liveRows), (row) => row.toPar ?? 999));
  const net = mark(placeTied(byNet(liveRows), (row) => row.net ?? 999));
  const stableford = mark(placeTied(byStableford(liveRows), (row) => row.stableford ?? 0));
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
    updatedLabel: "10:42",
    watchLabel: "leaguesports.co.za/w/ZB47",
    feed: [
      {
        id: "feed-1",
        type: "lead_change",
        message: "Nadia leads · 38 pts",
        at: "2026-11-01T08:42:00.000Z",
        leaderName: "Nadia",
        metric: "stableford",
        value: 38,
      },
      {
        id: "feed-2",
        type: "birdie",
        message: "Nadia birdie · 10",
        at: "2026-11-01T08:41:00.000Z",
        playerName: "Nadia",
        holeNumber: 10,
      },
      {
        id: "feed-3",
        type: "thru",
        message: "Card 3 thru 9",
        at: "2026-11-01T08:28:00.000Z",
        cardNumber: 3,
        holeNumber: 9,
      },
      {
        id: "feed-4",
        type: "birdie",
        message: "Pieter birdie · 6",
        at: "2026-11-01T08:12:00.000Z",
        playerName: "Pieter",
        holeNumber: 6,
      },
      {
        id: "feed-5",
        type: "card_locked",
        message: "Card 1 confirmed",
        at: "2026-11-01T08:05:00.000Z",
        cardNumber: 1,
      },
    ],
    cards: [
      { id: "card-1", number: 1, status: "live", thru: 12, playerCount: 4, syncedAt: "2026-11-01T08:18:00.000Z" },
      { id: "card-2", number: 2, status: "live", thru: 11, playerCount: 3, syncedAt: "2026-11-01T08:36:00.000Z" },
      { id: "card-3", number: 3, status: "live", thru: 12, playerCount: 3, syncedAt: "2026-11-01T08:42:00.000Z" },
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
  finishedPlayer({ name: "Nadia", handicapIndex: 4, playingHandicap: 4, gross: 70, countbackNote: "Won countback" }),
  finishedPlayer({ name: "Brandon", handicapIndex: 14, playingHandicap: 14, gross: 80, countbackNote: "Lost countback (last 9)" }),
  finishedPlayer({ name: "Mike", handicapIndex: 6, playingHandicap: 6, gross: 76, countbackNote: null, you: true }),
  finishedPlayer({ name: "Sipho", handicapIndex: 9, playingHandicap: 9, gross: 83, countbackNote: null }),
  finishedPlayer({ name: "Pieter", handicapIndex: 18, playingHandicap: 18, gross: 94, countbackNote: null }),
  finishedPlayer({ name: "Ruan", handicapIndex: 22, playingHandicap: 22, gross: 100, countbackNote: null }),
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
