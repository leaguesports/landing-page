import { consumeRateLimit, clientIp } from "@/lib/fixtures/rate-limit";
import { LOCATION_MAX_WINDOW_MS } from "@/lib/openf1/replay";
import { parseIsoParam, parseSessionKeyParam } from "@/lib/openf1/replay-params";
import { fetchOpenF1LocationChunk, OpenF1UpstreamError } from "@/lib/openf1/upstream";
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

  const url = new URL(request.url);
  const fromIso = parseIsoParam(url.searchParams.get("from"));
  const toIso = parseIsoParam(url.searchParams.get("to"));
  if (!fromIso || !toIso) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }
  const fromMs = Date.parse(fromIso);
  const toMs = Date.parse(toIso);
  if (!(toMs > fromMs) || toMs - fromMs > LOCATION_MAX_WINDOW_MS) {
    return NextResponse.json(
      { error: "Invalid location window" },
      { status: 400 },
    );
  }

  const ip = clientIp(request);
  const limit = consumeRateLimit(`f1-replay-location:${ip}`, 45, 60_000);
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
    const points = await fetchOpenF1LocationChunk(sessionKey, fromIso, toIso);
    return NextResponse.json(
      { from: fromIso, to: toIso, points },
      {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=120" },
      },
    );
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
    console.error("[f1-replay] location failed", error);
    return NextResponse.json({ error: "Location unavailable" }, { status: 502 });
  }
}
