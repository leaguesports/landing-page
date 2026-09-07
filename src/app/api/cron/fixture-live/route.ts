import { isAuthorizedFixtureIngest } from "@/lib/fixtures/ingest/auth";
import { ingestLiveFixtureBoards } from "@/lib/fixtures/ingest/poll";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Manual ops + external scheduler trigger. Polls sports-data APIs only when a
 * CMS fixture is inside its live window, then writes `FixtureLiveBoard` + Ably.
 *
 * Do not register a sub-daily Vercel Cron here while the project is Hobby —
 * `* * * * *` fails the deployment. Hit this route with CRON_SECRET / ops key.
 */
async function run(request: Request) {
  if (!isAuthorizedFixtureIngest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await ingestLiveFixtureBoards();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("[fixture-ingest] poll failed", error);
    return NextResponse.json(
      { ok: false, error: "Ingest failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
