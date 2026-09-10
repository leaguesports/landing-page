import { consumeRateLimit, clientIp } from "@/lib/fixtures/rate-limit";
import { isOpenF1EventSlug } from "@/lib/openf1/openf1";
import { loadReplayBootstrap, resolveSessionKeyByEventSlug } from "@/lib/openf1/replay-load";
import { OpenF1UpstreamError } from "@/lib/openf1/upstream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ eventSlug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { eventSlug: raw } = await context.params;
  const eventSlug = raw.trim().toLowerCase();
  if (!isOpenF1EventSlug(eventSlug)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const ip = clientIp(request);
  const limit = consumeRateLimit(`f1-replay-event:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  try {
    const sessionKey = await resolveSessionKeyByEventSlug(eventSlug);
    if (sessionKey === null) {
      return NextResponse.json({ error: "Race session not found" }, { status: 404 });
    }
    const bootstrap = await loadReplayBootstrap(sessionKey);
    if (!bootstrap) {
      return NextResponse.json({ error: "Race session not found" }, { status: 404 });
    }
    return NextResponse.json(bootstrap, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    if (error instanceof OpenF1UpstreamError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.status === 429 ? 429 : 502,
          headers: error.retryAfterSec
            ? { "Retry-After": String(error.retryAfterSec) }
            : undefined,
        },
      );
    }
    console.error("[f1-replay] event resolve failed", error);
    return NextResponse.json({ error: "Replay unavailable" }, { status: 502 });
  }
}
