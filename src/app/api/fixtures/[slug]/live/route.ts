import {
  ensureFixtureFeed,
  getFixtureFeed,
  setFixtureBoard,
} from "@/lib/fixtures/feed-store";
import { isAuthorizedFixtureOps } from "@/lib/fixtures/ops-auth";
import { publishBoardUpdated } from "@/lib/fixtures/publish";
import { isValidFixtureSlug, normalizeFixtureSlug } from "@/lib/fixtures/slug";
import type { FixtureLiveBoard } from "@/types/fixture-feed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

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
      (board.status === "scheduled" ||
        board.status === "live" ||
        board.status === "final")
    );
  }
  return false;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = normalizeFixtureSlug(rawSlug);
  if (!isValidFixtureSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const existing = getFixtureFeed(slug);
  if (!existing) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }
  return NextResponse.json({ fixtureSlug: slug, board: existing.board });
}

/**
 * Manual ops (and later sports-data providers) write the live board here.
 * Requires FIXTURE_OPS_KEY on Vercel preview/production.
 */
export async function PATCH(request: Request, context: RouteContext) {
  if (!isAuthorizedFixtureOps(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug: rawSlug } = await context.params;
  const slug = normalizeFixtureSlug(rawSlug);
  if (!isValidFixtureSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

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
    // Ops may publish before a page render warmed the in-process store.
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
