import { NextResponse } from "next/server";
import { syncMatchState } from "@/lib/match-store";
import type { MatchChannelEvent } from "@/types/padel-match";

/**
 * Async DB sync endpoint — called after Ably publish so the scorecard
 * never blocks on persistence. Accepts a channel event and upserts state.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let event: MatchChannelEvent;

  try {
    event = (await request.json()) as MatchChannelEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (event.matchId !== id || !event.state) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  await syncMatchState(event.state);
  return NextResponse.json({ ok: true });
}
