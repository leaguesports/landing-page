import { NextResponse } from "next/server";
import { getMatch, syncMatchState } from "@/lib/match-store";
import type { PadelMatch } from "@/types/padel-match";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const match = await getMatch(id);

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: PadelMatch;

  try {
    body = (await request.json()) as PadelMatch;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.id !== id) {
    return NextResponse.json({ error: "Match id mismatch" }, { status: 400 });
  }

  const saved = await syncMatchState(body);
  return NextResponse.json(saved);
}
