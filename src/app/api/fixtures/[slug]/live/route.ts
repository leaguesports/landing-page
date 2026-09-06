import {
  ensureFixtureFeed,
  getFixtureFeed,
  setFixtureBoard,
} from "@/lib/fixtures/feed-store";
import { publishBoardUpdated } from "@/lib/fixtures/publish";
import type { FixtureLiveBoard } from "@/types/fixture-feed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function isAuthorizedOps(request: Request): boolean {
  const expected = process.env.FIXTURE_OPS_KEY?.trim();
  // Open in local/dev when unset so desk tools can prototype without secrets.
  if (!expected) return true;
  return request.headers.get("x-ops-key") === expected;
}

function isValidBoard(value: unknown): value is FixtureLiveBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as FixtureLiveBoard;
  if (board.kind === "match_score") {
    return (
      typeof board.home?.name === "string" &&
      typeof board.away?.name === "string" &&
      typeof board.home?.score === "number" &&
      typeof board.away?.score === "number" &&
      (board.status === "scheduled" ||
        board.status === "live" ||
        board.status === "final")
    );
  }
  if (board.kind === "motorsport_top3") {
    return (
      Array.isArray(board.leaders) &&
      board.leaders.length > 0 &&
      (board.status === "scheduled" ||
        board.status === "live" ||
        board.status === "final")
    );
  }
  return false;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const existing = getFixtureFeed(slug);
  if (existing) {
    return NextResponse.json({ fixtureSlug: slug, board: existing.board });
  }
  const snapshot = ensureFixtureFeed({
    slug,
    title: searchParams.get("title") ?? slug,
    sportSlug: searchParams.get("sport"),
    venueCount: Number.parseInt(searchParams.get("venues") ?? "0", 10) || 0,
  });
  return NextResponse.json({ fixtureSlug: slug, board: snapshot.board });
}

/**
 * Manual ops (and later sports-data providers) write the live board here.
 * Set FIXTURE_OPS_KEY in production; omit locally for open prototyping.
 */
export async function PATCH(request: Request, context: RouteContext) {
  if (!isAuthorizedOps(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const board = (body as { board?: unknown })?.board;
  if (!isValidBoard(board)) {
    return NextResponse.json({ error: "Invalid board" }, { status: 400 });
  }

  if (!getFixtureFeed(slug)) {
    ensureFixtureFeed({
      slug,
      title: slug,
      sportSlug: board.kind === "motorsport_top3" ? "motorsport" : "rugby",
      venueCount: 0,
    });
  }

  const snapshot = setFixtureBoard(slug, {
    ...board,
    updatedAt: new Date().toISOString(),
    source: board.source || "manual",
  });
  if (snapshot.board) {
    void publishBoardUpdated(slug, snapshot.board);
  }
  return NextResponse.json(snapshot);
}
