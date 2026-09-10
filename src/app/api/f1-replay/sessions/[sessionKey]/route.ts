import { consumeRateLimit, clientIp } from "@/lib/fixtures/rate-limit";
import { loadReplayBootstrap } from "@/lib/openf1/replay-load";
import { parseSessionKeyParam } from "@/lib/openf1/replay-params";
import { OpenF1UpstreamError } from "@/lib/openf1/upstream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionKey: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { sessionKey: raw } = await context.params;
  const sessionKey = parseSessionKeyParam(raw);
  if (sessionKey === null) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const ip = clientIp(request);
  const limit = consumeRateLimit(`f1-replay-session:${ip}`, 20, 60_000);
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
    const bootstrap = await loadReplayBootstrap(sessionKey);
    if (!bootstrap) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
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
    console.error("[f1-replay] bootstrap failed", error);
    return NextResponse.json({ error: "Replay unavailable" }, { status: 502 });
  }
}
