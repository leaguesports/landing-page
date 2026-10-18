import type {
  GameDayCreated,
  GameDayLeaderboard,
  GameDayPreview,
  RankingRow,
} from "../../types/golf-game-day.ts";
import { formatGameDayDate, gameDayHeadline } from "./paths.ts";
import { finishedRound, midRound, netToPar } from "./scoring-ui.ts";

const FIXTURE_DATE = "2026-11-01";
const FIXTURE_VENUE = "Zebula Golf Estate & Spa";
const FIXTURE_DATE_LABEL = formatGameDayDate(FIXTURE_DATE);
const FIXTURE_HEADLINE = gameDayHeadline(FIXTURE_VENUE, FIXTURE_DATE);

export const FIXTURE_DAY_ID = "8c2f0a1e-6b4d-4a1e-8f3a-0b1c2d3e4f50";

function livePlayer(input: {
  name: string;
  handicapIndex: number | null;
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
  livePlayer({ name: "Nadia", handicapIndex: 16, cardNumber: 3, gross: 41, parSoFar: 40, shotsReceived: 9, thru: 10, move: 5 }),
  livePlayer({ name: "Sipho", handicapIndex: 9, cardNumber: 1, gross: 52, parSoFar: 48, shotsReceived: 7, thru: 12, move: -1 }),
  livePlayer({ name: "Pieter", handicapIndex: 12, cardNumber: 2, gross: 45, parSoFar: 43, shotsReceived: 7, thru: 11, move: -1 }),
  livePlayer({ name: "Jaco", handicapIndex: 18, cardNumber: 1, gross: 58, parSoFar: 48, shotsReceived: 12, thru: 12, move: -1 }),
  livePlayer({ name: "Mike", handicapIndex: 6, cardNumber: 2, gross: 44, parSoFar: 43, shotsReceived: 3, thru: 11, move: -1 }),
  livePlayer({ name: "Kabelo", handicapIndex: 20, cardNumber: 2, gross: 53, parSoFar: 43, shotsReceived: 12, thru: 11, move: -1 }),
  livePlayer({ name: "Brandon", handicapIndex: 14, cardNumber: 1, gross: 58, parSoFar: 48, shotsReceived: 9, thru: 12 }),
  livePlayer({ name: "Thandi", handicapIndex: 22, cardNumber: 1, gross: 65, parSoFar: 48, shotsReceived: 15, thru: 12 }),
  livePlayer({ name: "Ruan", handicapIndex: 11, cardNumber: 3, gross: 50, parSoFar: 40, shotsReceived: 7, thru: 10 }),
  livePlayer({ name: "Lerato", handicapIndex: null, cardNumber: 2, gross: 55, parSoFar: 43, shotsReceived: 0, thru: 11 }),
];

function byStableford(rows: RankingRow[]): RankingRow[] {
  return [...rows].sort((left, right) => (right.stableford ?? 0) - (left.stableford ?? 0));
}
function byNet(rows: RankingRow[]): RankingRow[] {
  return [...rows].sort((left, right) => (netToPar(left) ?? 999) - (netToPar(right) ?? 999));
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
  const net = mark(placeTied(byNet(liveRows), (row) => netToPar(row) ?? 999));
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
        message: "Lead change: Nadia leads on 28 pts",
        at: "2026-11-01T08:42:00.000Z",
        leaderName: "Nadia",
        metric: "stableford",
        value: 28,
      },
      {
        id: "feed-2",
        type: "birdie",
        message: "Nadia birdie on 10 · Card 3 thru 10",
        at: "2026-11-01T08:42:00.000Z",
        playerName: "Nadia",
        cardNumber: 3,
        holeNumber: 10,
      },
      {
        id: "feed-3",
        type: "birdie",
        message: "Sipho birdie on 12 · Card 1 thru 12",
        at: "2026-11-01T08:40:00.000Z",
        playerName: "Sipho",
        cardNumber: 1,
        holeNumber: 12,
      },
      {
        id: "feed-4",
        type: "birdie",
        message: "Mike birdie on 11 · Card 2 thru 11",
        at: "2026-11-01T08:38:00.000Z",
        playerName: "Mike",
        cardNumber: 2,
        holeNumber: 11,
      },
      {
        id: "feed-5",
        type: "thru",
        message: "Card 3 thru 9",
        at: "2026-11-01T08:31:00.000Z",
        cardNumber: 3,
        holeNumber: 9,
      },
    ],
    cards: [
      { id: "card-1", number: 1, status: "live", thru: 12, playerCount: 4, syncedAt: "2026-11-01T08:40:00.000Z" },
      { id: "card-2", number: 2, status: "live", thru: 11, playerCount: 4, syncedAt: "2026-11-01T08:38:00.000Z" },
      { id: "card-3", number: 3, status: "live", thru: 10, playerCount: 2, syncedAt: "2026-11-01T08:42:00.000Z" },
    ],
  };
}

function finishedPlayer(input: {
  name: string;
  handicapIndex: number | null;
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

/** Countback order is the source order inside a tied score. v2 results, all 10 players. */
const finishedPlayers: RankingRow[] = [
  finishedPlayer({ name: "Pieter", handicapIndex: 12, playingHandicap: 12, gross: 78, countbackNote: "Won countback" }),
  finishedPlayer({ name: "Nadia", handicapIndex: 16, playingHandicap: 16, gross: 82, countbackNote: "Lost countback (last 9)" }),
  finishedPlayer({ name: "Jaco", handicapIndex: 18, playingHandicap: 18, gross: 85, countbackNote: null }),
  finishedPlayer({ name: "Sipho", handicapIndex: 9, playingHandicap: 9, gross: 79, countbackNote: "Won countback" }),
  finishedPlayer({ name: "Mike", handicapIndex: 6, playingHandicap: 6, gross: 76, countbackNote: "Lost countback (last 9)" }),
  finishedPlayer({ name: "Kabelo", handicapIndex: 20, playingHandicap: 20, gross: 90, countbackNote: "Lost countback (last 9)" }),
  finishedPlayer({ name: "Ruan", handicapIndex: 11, playingHandicap: 11, gross: 83, countbackNote: null }),
  finishedPlayer({ name: "Thandi", handicapIndex: 22, playingHandicap: 22, gross: 97, countbackNote: null }),
  finishedPlayer({ name: "Brandon", handicapIndex: 14, playingHandicap: 14, gross: 90, countbackNote: null, you: true }),
  finishedPlayer({ name: "Lerato", handicapIndex: null, playingHandicap: 0, gross: 89, countbackNote: null }),
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
    watchToken: "ZB47",
    watchPath: "/api/golf-game-days/watch/ZB47/leaderboard",
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
    players: ["Brandon", "Sipho", "Jaco", "Thandi", "Mike", "Lerato", "Pieter", "Kabelo", "Nadia"].map(
      (name) => ({
        id: `p-${name.toLowerCase()}`,
        displayName: name,
        handicapIndex: null,
        teeName: "White",
        joined: name === "Brandon",
        cardId: name === "Brandon" ? "card-1" : null,
        cardNumber: name === "Brandon" ? 1 : null,
        slot: name === "Brandon" ? 1 : null,
      }),
    ),
  };
}

export const CARD_REVIEW_FRONT_PAR = [4, 4, 3, 5, 4, 4, 3, 4, 5] as const;
export const CARD_REVIEW_BACK_PAR = [4, 3, 5, 4, 4, 4, 3, 5, 4] as const;

export type CardReviewLine = {
  name: string;
  scorer: boolean;
  handicapIndex: number | null;
  playingHandicap: number;
  front: readonly number[];
  back: readonly number[];
};

/** Card 2 scorecard transcribed from the review mockup. */
export const CARD_REVIEW_LINES: readonly CardReviewLine[] = [
  {
    name: "Mike",
    scorer: true,
    handicapIndex: 6,
    playingHandicap: 6,
    front: [4, 5, 3, 5, 5, 4, 4, 3, 5],
    back: [4, 2, 5, 3, 5, 5, 3, 6, 5],
  },
  {
    name: "Lerato",
    scorer: false,
    handicapIndex: null,
    playingHandicap: 0,
    front: [5, 6, 5, 7, 4, 4, 4, 6, 7],
    back: [4, 3, 6, 4, 4, 4, 4, 7, 5],
  },
  {
    name: "Pieter",
    scorer: false,
    handicapIndex: 12,
    playingHandicap: 12,
    front: [4, 6, 4, 5, 4, 4, 2, 4, 5],
    back: [4, 3, 5, 5, 4, 4, 4, 5, 6],
  },
  {
    name: "Kabelo",
    scorer: false,
    handicapIndex: 20,
    playingHandicap: 20,
    front: [5, 4, 4, 7, 5, 4, 4, 6, 5],
    back: [6, 3, 5, 6, 5, 5, 5, 5, 6],
  },
];

export function sumNine(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
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
      { id: "p-brandon", displayName: "Brandon", taken: true, cardId: "card-1", cardNumber: 1 },
      { id: "p-sipho", displayName: "Sipho", taken: true, cardId: "card-1", cardNumber: 1 },
      { id: "p-jaco", displayName: "Jaco", taken: true, cardId: "card-1", cardNumber: 1 },
      { id: "p-thandi", displayName: "Thandi", taken: true, cardId: "card-1", cardNumber: 1 },
      { id: "p-lerato", displayName: "Lerato", taken: true, cardId: "card-2", cardNumber: 2 },
      { id: "p-pieter", displayName: "Pieter", taken: true, cardId: "card-2", cardNumber: 2 },
      { id: "p-mike", displayName: "Mike", taken: false, cardId: null, cardNumber: null },
      { id: "p-kabelo", displayName: "Kabelo", taken: false, cardId: null, cardNumber: null },
      { id: "p-nadia", displayName: "Nadia", taken: false, cardId: null, cardNumber: null },
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
          { displayName: "Jaco", slot: 3, scoring: false },
          { displayName: "Thandi", slot: 4, scoring: false },
        ],
      },
      {
        id: "card-2",
        number: 2,
        status: "live",
        openSlots: 2,
        full: false,
        players: [
          { displayName: "Pieter", slot: 1, scoring: true },
          { displayName: "Lerato", slot: 2, scoring: false },
        ],
      },
    ],
  };
}
