import type {
  FixtureFeedItem,
  FixtureFeedSnapshot,
  FixtureLiveBoard,
  MatchScoreBoard,
  MotorsportTop3Board,
} from "../../types/fixture-feed.ts";
import {
  isMotorsportSport,
  prefersMatchScoreBoard,
} from "../../types/fixture-feed.ts";
import { isSafeRelativeHref, isValidFixtureSlug, normalizeFixtureSlug } from "./slug.ts";

type FeedState = {
  board: FixtureLiveBoard | null;
  items: FixtureFeedItem[];
};

const store = new Map<string, FeedState>();
const MAX_FEEDS = 200;

function nowIso(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 10)}`;
}

function allowDemoLive(): boolean {
  return (
    process.env.FIXTURE_DEMO_LIVE === "1" &&
    process.env.NODE_ENV !== "production" &&
    !process.env.VERCEL_ENV
  );
}

/** Parse "Springboks vs All Blacks" titles into sides. */
export function parseMatchSides(title: string): {
  home: string;
  away: string;
} | null {
  const cleaned = title.trim();
  const match = cleaned.match(/^(.+?)\s+(?:vs\.?|v\.?|versus)\s+(.+)$/i);
  if (!match?.[1] || !match[2]) return null;
  return { home: match[1].trim(), away: match[2].trim() };
}

function seedMatchBoard(
  title: string,
  status: MatchScoreBoard["status"],
): MatchScoreBoard {
  const sides = parseMatchSides(title) ?? {
    home: title.split(/\s+/).slice(0, 2).join(" ") || "Home",
    away: "Away",
  };
  const liveOrFinal = status === "live" || status === "final";
  return {
    kind: "match_score",
    status,
    home: { name: sides.home, score: liveOrFinal && allowDemoLive() ? 17 : 0 },
    away: { name: sides.away, score: liveOrFinal && allowDemoLive() ? 14 : 0 },
    clock: status === "live" && allowDemoLive() ? "54'" : status === "final" ? "FT" : null,
    period: status === "live" && allowDemoLive() ? "2nd half" : null,
    updatedAt: nowIso(),
    source: "manual",
  };
}

function seedMotorsportBoard(
  status: MotorsportTop3Board["status"],
): MotorsportTop3Board {
  if (status === "scheduled" || !allowDemoLive()) {
    return {
      kind: "motorsport_top3",
      status: "scheduled",
      leaders: [],
      sessionLabel: null,
      updatedAt: nowIso(),
      source: "manual",
    };
  }
  return {
    kind: "motorsport_top3",
    status,
    leaders: [
      { pos: 1, driver: "M. Verstappen", team: "Red Bull", gap: "—" },
      { pos: 2, driver: "L. Norris", team: "McLaren", gap: "+3.2s" },
      { pos: 3, driver: "C. Leclerc", team: "Ferrari", gap: "+8.1s" },
    ],
    sessionLabel: status === "live" ? "Lap 34/58" : "Finished",
    updatedAt: nowIso(),
    source: "manual",
  };
}

function seedItems(
  slug: string,
  board: FixtureLiveBoard | null,
  venueCount: number,
  sportSlug: string | null,
): FixtureFeedItem[] {
  const items: FixtureFeedItem[] = [];
  const watchHref =
    venueCount > 0
      ? `/events/${slug}#where-to-watch`
      : sportSlug
        ? `/venues?intent=watch&sport=${encodeURIComponent(sportSlug)}`
        : "/venues?intent=watch";

  items.push({
    id: newId("sys"),
    fixtureSlug: slug,
    kind: "moment",
    authorKind: "system",
    authorLabel: "LeagueSports",
    body: "Fixture feed is open — follow for desk updates and where to watch nearby.",
    createdAt: nowIso(-45 * 60 * 1000),
    reactionCount: 0,
  });

  // Only attach score moments once a real (non-scheduled) board exists.
  if (board?.kind === "match_score" && board.status !== "scheduled") {
    items.push({
      id: newId("ops"),
      fixtureSlug: slug,
      kind: "score_update",
      authorKind: "ops",
      authorLabel: "Match desk",
      body: `${board.home.name} ${board.home.score}–${board.away.score} ${board.away.name}${board.clock ? ` · ${board.clock}` : ""}`,
      createdAt: nowIso(-12 * 60 * 1000),
      reactionCount: 0,
    });
  }

  if (
    board?.kind === "motorsport_top3" &&
    board.status !== "scheduled" &&
    board.leaders[0]
  ) {
    const lead = board.leaders[0];
    items.push({
      id: newId("ops"),
      fixtureSlug: slug,
      kind: "score_update",
      authorKind: "ops",
      authorLabel: "Race desk",
      body: `P1 ${lead.driver}${lead.team ? ` (${lead.team})` : ""}${board.sessionLabel ? ` · ${board.sessionLabel}` : ""}`,
      createdAt: nowIso(-8 * 60 * 1000),
      reactionCount: 0,
    });
  }

  const safeWatchHref = isSafeRelativeHref(watchHref) ? watchHref : "/venues?intent=watch";
  items.push({
    id: newId("venue"),
    fixtureSlug: slug,
    kind: "venue_nudge",
    authorKind: "system",
    authorLabel: "Watch nearby",
    body:
      venueCount > 0
        ? `${venueCount} venue${venueCount === 1 ? "" : "s"} listed for this screening — grab a spot before kickoff buzz peaks.`
        : "Find a bar or fan zone screening this one near you.",
    createdAt: nowIso(-3 * 60 * 1000),
    reactionCount: 0,
    ctaHref: safeWatchHref,
    ctaLabel: venueCount > 0 ? "See venues" : "Browse Watch",
  });

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function trimStore(): void {
  while (store.size > MAX_FEEDS) {
    const oldest = store.keys().next().value;
    if (!oldest) break;
    store.delete(oldest);
  }
}

export type EnsureFeedInput = {
  slug: string;
  title: string;
  sportSlug: string | null;
  venueCount: number;
  /** Local-only demo live boards when FIXTURE_DEMO_LIVE=1. */
  forceLive?: boolean;
};

/**
 * Create (or return) a feed for a known fixture page render.
 * Seeds scheduled / 0–0 boards — never invented live scores in prod.
 * In-process Map is MVP-only; shared KV/DB should replace it before scale.
 */
export function ensureFixtureFeed(input: EnsureFeedInput): FixtureFeedSnapshot {
  const slug = normalizeFixtureSlug(input.slug);
  if (!isValidFixtureSlug(slug)) {
    throw new Error("Invalid fixture slug");
  }

  const existing = store.get(slug);
  if (existing) {
    return {
      fixtureSlug: slug,
      board: existing.board,
      items: [...existing.items],
    };
  }

  const wantLive = Boolean(input.forceLive) && allowDemoLive();
  const status: FixtureLiveBoard["status"] = wantLive ? "live" : "scheduled";

  let board: FixtureLiveBoard | null = null;
  if (isMotorsportSport(input.sportSlug)) {
    board = seedMotorsportBoard(status);
  } else if (
    prefersMatchScoreBoard(input.sportSlug) ||
    parseMatchSides(input.title)
  ) {
    board = seedMatchBoard(input.title, status);
  }

  const items = seedItems(slug, board, input.venueCount, input.sportSlug);
  store.set(slug, { board, items });
  trimStore();
  return { fixtureSlug: slug, board, items: [...items] };
}

export function getFixtureFeed(slug: string): FixtureFeedSnapshot | null {
  const key = normalizeFixtureSlug(slug);
  if (!isValidFixtureSlug(key)) return null;
  const state = store.get(key);
  if (!state) return null;
  return {
    fixtureSlug: key,
    board: state.board,
    items: [...state.items],
  };
}

export function setFixtureBoard(
  slug: string,
  board: FixtureLiveBoard,
): FixtureFeedSnapshot {
  const key = normalizeFixtureSlug(slug);
  if (!isValidFixtureSlug(key)) {
    throw new Error("Invalid fixture slug");
  }
  const state = store.get(key) ?? { board: null, items: [] };
  const nextBoard: FixtureLiveBoard = {
    ...board,
    updatedAt: board.updatedAt || nowIso(),
    source: board.source || "manual",
  };
  state.board = nextBoard;

  const scoreBody =
    nextBoard.kind === "match_score"
      ? `${nextBoard.home.name} ${nextBoard.home.score}–${nextBoard.away.score} ${nextBoard.away.name}${nextBoard.clock ? ` · ${nextBoard.clock}` : ""}`
      : `P1 ${nextBoard.leaders[0]?.driver ?? "—"}${nextBoard.sessionLabel ? ` · ${nextBoard.sessionLabel}` : ""}`;

  const item: FixtureFeedItem = {
    id: newId("ops"),
    fixtureSlug: key,
    kind: "score_update",
    authorKind: "ops",
    authorLabel:
      nextBoard.kind === "motorsport_top3" ? "Race desk" : "Match desk",
    body: scoreBody,
    createdAt: nowIso(),
    reactionCount: 0,
  };
  state.items = [item, ...state.items].slice(0, 80);
  store.set(key, state);
  trimStore();
  return { fixtureSlug: key, board: nextBoard, items: [...state.items] };
}

export function addFanReply(
  slug: string,
  body: string,
  _ignoredAuthorLabel?: string,
): FixtureFeedItem {
  const key = normalizeFixtureSlug(slug);
  if (!isValidFixtureSlug(key)) {
    throw new Error("Invalid fixture slug");
  }
  const state = store.get(key);
  if (!state) {
    throw new Error("Fixture feed not found");
  }
  const trimmed = body.trim().slice(0, 280);
  if (!trimmed) {
    throw new Error("Reply cannot be empty");
  }
  // Never trust client-supplied display names — spoofing "Match desk" is trivial.
  const item: FixtureFeedItem = {
    id: newId("fan"),
    fixtureSlug: key,
    kind: "fan_reply",
    authorKind: "fan",
    authorLabel: "Fan",
    body: trimmed,
    createdAt: nowIso(),
    reactionCount: 0,
  };
  state.items = [item, ...state.items].slice(0, 80);
  store.set(key, state);
  return item;
}

export function reactToFeedItem(
  slug: string,
  itemId: string,
): FixtureFeedItem | null {
  const key = normalizeFixtureSlug(slug);
  if (!isValidFixtureSlug(key)) return null;
  const state = store.get(key);
  if (!state) return null;
  const item = state.items.find((row) => row.id === itemId);
  if (!item) return null;
  item.reactionCount += 1;
  return { ...item };
}

/** Test helper — clear in-process state. */
export function resetFixtureFeedStore(): void {
  store.clear();
}
