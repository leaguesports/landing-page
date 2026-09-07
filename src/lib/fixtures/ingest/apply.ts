import type { FixtureLiveBoard } from "../../../types/fixture-feed.ts";
import {
  ensureFixtureFeed,
  getFixtureFeed,
  parseMatchSides,
  setFixtureBoard,
} from "../feed-store.ts";
import { publishBoardUpdated } from "../publish.ts";
import type { IngestApplyResult, IngestFixture, MatchedIngest } from "./types.ts";

export function boardsEquivalent(
  a: FixtureLiveBoard | null | undefined,
  b: FixtureLiveBoard,
): boolean {
  if (!a || a.kind !== b.kind) return false;
  if (a.status !== b.status) return false;
  if (a.kind === "match_score" && b.kind === "match_score") {
    return (
      a.home.name === b.home.name &&
      a.away.name === b.away.name &&
      a.home.score === b.home.score &&
      a.away.score === b.away.score &&
      (a.clock ?? null) === (b.clock ?? null) &&
      (a.period ?? null) === (b.period ?? null)
    );
  }
  if (a.kind === "motorsport_top3" && b.kind === "motorsport_top3") {
    const sameLeaders =
      a.leaders.length === b.leaders.length &&
      a.leaders.every((leader, index) => {
        const other = b.leaders[index];
        return (
          other &&
          leader.pos === other.pos &&
          leader.driver === other.driver &&
          (leader.team ?? null) === (other.team ?? null) &&
          (leader.gap ?? null) === (other.gap ?? null)
        );
      });
    return sameLeaders && (a.sessionLabel ?? null) === (b.sessionLabel ?? null);
  }
  return false;
}

export function isMaterialBoardChange(
  previous: FixtureLiveBoard | null | undefined,
  next: FixtureLiveBoard,
): boolean {
  if (!previous || previous.kind !== next.kind) return true;
  if (previous.status !== next.status) return true;
  if (previous.kind === "match_score" && next.kind === "match_score") {
    return (
      previous.home.score !== next.home.score ||
      previous.away.score !== next.away.score
    );
  }
  if (previous.kind === "motorsport_top3" && next.kind === "motorsport_top3") {
    const prevDrivers = previous.leaders
      .map((row) => `${row.pos}:${row.driver}`)
      .join(",");
    const nextDrivers = next.leaders
      .map((row) => `${row.pos}:${row.driver}`)
      .join(",");
    return prevDrivers !== nextDrivers;
  }
  return true;
}

function displayName(
  fixture: IngestFixture,
  side: "home" | "away",
  fallback: string,
): string {
  const parsed = parseMatchSides(fixture.title);
  if (parsed) return parsed[side];
  const fromTeams = fixture.teams?.[side === "home" ? 0 : 1]?.name?.trim();
  if (fromTeams) return fromTeams;
  return fallback;
}

export function boardFromMatch(row: MatchedIngest): FixtureLiveBoard | null {
  const { fixture, update, swapped } = row;
  if (update.sportFamily === "match" && update.match) {
    const homeName = displayName(
      fixture,
      "home",
      swapped ? update.match.away : update.match.home,
    );
    const awayName = displayName(
      fixture,
      "away",
      swapped ? update.match.home : update.match.away,
    );
    return {
      kind: "match_score",
      status: update.status,
      home: {
        name: homeName,
        score: swapped ? update.match.awayScore : update.match.homeScore,
      },
      away: {
        name: awayName,
        score: swapped ? update.match.homeScore : update.match.awayScore,
      },
      clock: update.clock ?? null,
      period: update.period ?? null,
      updatedAt: new Date().toISOString(),
      source: `provider:${update.provider}`,
    };
  }

  if (update.sportFamily === "motorsport" && update.motorsport) {
    return {
      kind: "motorsport_top3",
      status: update.status,
      leaders: update.motorsport.leaders.slice(0, 3),
      sessionLabel: update.motorsport.sessionLabel ?? null,
      updatedAt: new Date().toISOString(),
      source: `provider:${update.provider}`,
    };
  }

  return null;
}

export async function applyMatchedUpdate(
  row: MatchedIngest,
): Promise<IngestApplyResult> {
  const board = boardFromMatch(row);
  if (!board) {
    return { slug: row.fixture.slug, action: "skipped", board: null };
  }

  if (!getFixtureFeed(row.fixture.slug)) {
    ensureFixtureFeed({
      slug: row.fixture.slug,
      title: row.fixture.title,
      sportSlug: row.fixture.sportSlug,
      venueCount: 0,
    });
  }

  const previous = getFixtureFeed(row.fixture.slug)?.board ?? null;
  if (boardsEquivalent(previous, board)) {
    return { slug: row.fixture.slug, action: "skipped", board: previous };
  }

  const announce = isMaterialBoardChange(previous, board);
  const snapshot = setFixtureBoard(row.fixture.slug, board, { announce });
  if (snapshot.board) {
    await publishBoardUpdated(row.fixture.slug, snapshot.board);
  }
  return {
    slug: row.fixture.slug,
    action: announce ? "announced" : "board",
    board: snapshot.board,
  };
}
