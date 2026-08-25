import { NextResponse } from "next/server";
import { createMatch } from "@/lib/match-store";
import type {
  CreatePadelMatchInput,
  PadelPlayer,
  PadelRuleset,
} from "@/types/padel-match";

type Body = {
  ruleset?: unknown;
  venue?: CreatePadelMatchInput["venue"];
  pairings?: CreatePadelMatchInput["pairings"];
  servingTeam?: unknown;
  createdByUserId?: unknown;
};

function isPlayer(value: unknown): value is PadelPlayer {
  if (!value || typeof value !== "object") return false;
  const p = value as PadelPlayer;
  return (
    typeof p.id === "string" &&
    typeof p.displayName === "string" &&
    typeof p.isGuest === "boolean"
  );
}

function isPairings(
  value: unknown,
): value is CreatePadelMatchInput["pairings"] {
  if (!value || typeof value !== "object") return false;
  const p = value as CreatePadelMatchInput["pairings"];
  return (
    Array.isArray(p.teamA) &&
    Array.isArray(p.teamB) &&
    p.teamA.length === 2 &&
    p.teamB.length === 2 &&
    p.teamA.every(isPlayer) &&
    p.teamB.every(isPlayer)
  );
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ruleset = body.ruleset as PadelRuleset | undefined;
  if (ruleset !== "golden_point" && ruleset !== "advantage") {
    return NextResponse.json(
      { error: "ruleset must be golden_point or advantage" },
      { status: 400 },
    );
  }

  if (!isPairings(body.pairings)) {
    return NextResponse.json(
      { error: "pairings must include four players (Team A × 2, Team B × 2)" },
      { status: 400 },
    );
  }

  const servingTeam =
    body.servingTeam === "B" ? ("B" as const) : ("A" as const);

  const match = await createMatch({
    ruleset,
    venue: body.venue ?? null,
    pairings: body.pairings,
    servingTeam,
    createdByUserId:
      typeof body.createdByUserId === "string" ? body.createdByUserId : null,
  });

  return NextResponse.json(match, { status: 201 });
}
