import { NextResponse } from "next/server";
import { cacheMatchState } from "@/lib/match-store";
import type { MatchChannelEvent } from "@/types/padel-match";

/**
 * Warm the in-process cache after a client Ably publish.
 * Persistence lives on the Ably channel — this does not re-publish.
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

  await cacheMatchState(event.state);
  return NextResponse.json({ ok: true });
}
