import { consumeRateLimit, clientIp } from "@/lib/fixtures/rate-limit";
import {
  loadReplayCatalog,
  replayCatalogYearOrDefault,
} from "@/lib/openf1/replay-catalog";
import { OpenF1UpstreamError } from "@/lib/openf1/upstream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limit = consumeRateLimit(`f1-replay-meetings:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  const year = replayCatalogYearOrDefault(
    new URL(request.url).searchParams.get("year"),
  );

  try {
    const catalog = await loadReplayCatalog(year);
    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
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
    console.error("[f1-replay] meetings catalog failed", error);
    return NextResponse.json({ error: "Replay catalog unavailable" }, { status: 502 });
  }
}
