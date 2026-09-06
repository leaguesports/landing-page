import {
  addFanReply,
  getFixtureFeed,
  reactToFeedItem,
} from "@/lib/fixtures/feed-store";
import {
  publishFeedItemAdded,
  publishReactionUpdated,
} from "@/lib/fixtures/publish";
import { clientIp, consumeRateLimit } from "@/lib/fixtures/rate-limit";
import { isValidFixtureSlug, normalizeFixtureSlug } from "@/lib/fixtures/slug";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * Read-only. Does not create feeds — pages call ensureFixtureFeed during SSR.
 * Random slug probing must not grow the in-process Map.
 */
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
  return NextResponse.json(existing);
}

export async function POST(request: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = normalizeFixtureSlug(rawSlug);
  if (!isValidFixtureSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  if (!getFixtureFeed(slug)) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }

  const ip = clientIp(request);
  const limit = consumeRateLimit(`fixture-feed:${slug}:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    action?: string;
    body?: string;
    authorLabel?: string;
    itemId?: string;
  };

  if (payload.action === "react") {
    const itemId = typeof payload.itemId === "string" ? payload.itemId : "";
    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }
    const item = reactToFeedItem(slug, itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    void publishReactionUpdated(slug, item.id, item.reactionCount);
    return NextResponse.json({
      itemId: item.id,
      reactionCount: item.reactionCount,
    });
  }

  if (payload.action === "reply" || !payload.action) {
    const text = typeof payload.body === "string" ? payload.body : "";
    try {
      // Ignore client authorLabel — always render as "Fan".
      const item = addFanReply(slug, text);
      void publishFeedItemAdded(item);
      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid reply" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
