import {
  addFanReply,
  ensureFixtureFeed,
  getFixtureFeed,
  reactToFeedItem,
} from "@/lib/fixtures/feed-store";
import {
  publishFeedItemAdded,
  publishReactionUpdated,
} from "@/lib/fixtures/publish";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? slug;
  const sportSlug = searchParams.get("sport");
  const venuesRaw = searchParams.get("venues");
  const venueCount = venuesRaw ? Number.parseInt(venuesRaw, 10) : 0;

  const existing = getFixtureFeed(slug);
  const snapshot =
    existing ??
    ensureFixtureFeed({
      slug,
      title,
      sportSlug: sportSlug || null,
      venueCount: Number.isFinite(venueCount) ? venueCount : 0,
    });

  return NextResponse.json(snapshot);
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
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
    title?: string;
    sportSlug?: string | null;
    venueCount?: number;
  };

  if (!getFixtureFeed(slug)) {
    ensureFixtureFeed({
      slug,
      title: payload.title ?? slug,
      sportSlug: payload.sportSlug ?? null,
      venueCount: payload.venueCount ?? 0,
    });
  }

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
      const item = addFanReply(slug, text, payload.authorLabel);
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
