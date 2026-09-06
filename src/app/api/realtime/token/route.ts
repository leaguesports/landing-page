import Ably from "ably";
import { NextResponse } from "next/server";
import { getRailwayApiOrigin } from "@/lib/api-origin";
import { parseFixtureChannel } from "@/lib/fixtures/slug";

/**
 * Issues a short-lived Ably TokenRequest for authenticated (or guest) clients.
 *
 * - Sport match channels (`{sport}:*`) keep publish/subscribe for padel scoring.
 * - Fixture social channels (`fixture:<slug>`) are subscribe/history only —
 *   server `publish.ts` uses the root key for desk writes. Slugs are allowlisted
 *   so Ably wildcards like `fixture:*` / `fixture:foo*` cannot be minted.
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
  const channel = searchParams.get("channel")?.trim() ?? "";

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

  let channelPattern: string;
  let capabilities: string[];

  if (channel.startsWith("fixture:")) {
    const parsed = parseFixtureChannel(channel);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid fixture channel" },
        { status: 400 },
      );
    }
    channelPattern = parsed.channel;
    // Guests must not publish — clients apply BOARD_UPDATED / FEED_ITEM_ADDED
    // blindly, including ctaHref into <Link>.
    capabilities = ["subscribe", "history"];
  } else if (matchId) {
    channelPattern = `${sport}:${matchId}`;
    capabilities = ["publish", "subscribe", "presence", "history"];
  } else {
    channelPattern = `${sport}:*`;
    capabilities = ["publish", "subscribe", "presence", "history"];
  }

  const rest = new Ably.Rest({ key: apiKey });

  try {
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId,
      capability: {
        [channelPattern]: capabilities as (
          | "publish"
          | "subscribe"
          | "presence"
          | "history"
        )[],
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
