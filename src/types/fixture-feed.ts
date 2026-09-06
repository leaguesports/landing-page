/**
 * Fixture social feed + live board contracts.
 *
 * Manual ops updates today; a sports-data provider can later write the same
 * `FixtureLiveBoard` shape without changing the UI or Ably event names.
 */

export type FixtureBoardStatus = "scheduled" | "live" | "final";

export type MatchScoreSide = {
  name: string;
  score: number;
};

/** Rugby / soccer / cricket-style scoreboard. */
export type MatchScoreBoard = {
  kind: "match_score";
  status: FixtureBoardStatus;
  home: MatchScoreSide;
  away: MatchScoreSide;
  /** Clock or phase label — e.g. "67'", "HT", "FT". */
  clock?: string | null;
  period?: string | null;
  updatedAt: string;
  /** `manual` now; later `provider:<name>`. */
  source: string;
};

export type MotorsportLeader = {
  pos: 1 | 2 | 3;
  driver: string;
  team?: string | null;
  gap?: string | null;
};

/** Race weekend board — top 3 only on compact surfaces. */
export type MotorsportTop3Board = {
  kind: "motorsport_top3";
  status: FixtureBoardStatus;
  leaders: MotorsportLeader[];
  /** e.g. "Lap 34/58", "Qualifying". */
  sessionLabel?: string | null;
  updatedAt: string;
  source: string;
};

export type FixtureLiveBoard = MatchScoreBoard | MotorsportTop3Board;

export type FixtureFeedAuthorKind = "system" | "ops" | "fan";

export type FixtureFeedItemKind =
  | "score_update"
  | "moment"
  | "venue_nudge"
  | "fan_reply";

export type FixtureFeedItem = {
  id: string;
  fixtureSlug: string;
  kind: FixtureFeedItemKind;
  authorKind: FixtureFeedAuthorKind;
  authorLabel: string;
  body: string;
  createdAt: string;
  reactionCount: number;
  /** Soft venue cross-sell. */
  ctaHref?: string | null;
  ctaLabel?: string | null;
};

export type FixtureFeedSnapshot = {
  fixtureSlug: string;
  board: FixtureLiveBoard | null;
  items: FixtureFeedItem[];
};

export type FixtureChannelEvent =
  | {
      type: "BOARD_UPDATED";
      fixtureSlug: string;
      board: FixtureLiveBoard;
      emittedAt: string;
    }
  | {
      type: "FEED_ITEM_ADDED";
      fixtureSlug: string;
      item: FixtureFeedItem;
      emittedAt: string;
    }
  | {
      type: "REACTION_UPDATED";
      fixtureSlug: string;
      itemId: string;
      reactionCount: number;
      emittedAt: string;
    };

export function fixtureChannelName(slug: string): string {
  return `fixture:${slug.trim().toLowerCase()}`;
}

export function isMotorsportSport(
  sportSlug: string | null | undefined,
): boolean {
  return sportSlug === "motorsport";
}

export function prefersMatchScoreBoard(
  sportSlug: string | null | undefined,
): boolean {
  return (
    sportSlug === "rugby" ||
    sportSlug === "soccer" ||
    sportSlug === "cricket" ||
    !sportSlug
  );
}
