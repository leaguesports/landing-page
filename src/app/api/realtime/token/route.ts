import Ably from "ably";
import { NextResponse } from "next/server";
import { getRailwayApiOrigin } from "@/lib/api-origin";

/**
 * Issues a short-lived Ably TokenRequest for authenticated (or guest) clients.
 * Capability is scoped to sport match channels: `{sport}:*` publish/subscribe.
 *
 * Env: ABLY_API_KEY (server-only root/api key)
 */
export async function GET(request: Request) {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Realtime is temporarily unavailable" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const sport = (searchParams.get("sport") ?? "padel").toLowerCase();
  const matchId = searchParams.get("matchId");

  let clientId = `guest_${crypto.randomUUID().slice(0, 10)}`;

  const apiBase = getRailwayApiOrigin();
  if (apiBase) {
    try {
      const cookie = request.headers.get("cookie") ?? "";
      const meRes = await fetch(`${apiBase}/api/auth/me`, {
        headers: cookie ? { cookie } : {},
        cache: "no-store",
      });
      if (meRes.ok && meRes.status !== 204) {
        const user = (await meRes.json()) as { id?: string };
        if (user?.id) clientId = user.id;
      }
    } catch {
      // Guest token is fine for Quick-Start
    }
  }

  const channelPattern = matchId
    ? `${sport}:${matchId}`
    : `${sport}:*`;

  const rest = new Ably.Rest({ key: apiKey });

  try {
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId,
      capability: {
        [channelPattern]: ["publish", "subscribe", "presence", "history"],
      },
      ttl: 60 * 60 * 1000,
    });

    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("[realtime/token] Ably token request failed", error);
    return NextResponse.json(
      { error: "Could not issue realtime token" },
      { status: 500 },
    );
  }
}
