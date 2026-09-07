import Ably from "ably";
import {
  fixtureChannelName,
  type FixtureChannelEvent,
  type FixtureLiveBoard,
} from "@/types/fixture-feed";

function getAblyRest(): Ably.Rest | null {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) return null;
  return new Ably.Rest({ key: apiKey });
}

function extractBoard(message: Ably.Message): FixtureLiveBoard | null {
  const data = message.data as FixtureChannelEvent | FixtureLiveBoard | null;
  if (!data || typeof data !== "object") return null;
  if ("type" in data && data.type === "BOARD_UPDATED" && data.board) {
    return data.board;
  }
  if ("kind" in data && (data.kind === "match_score" || data.kind === "motorsport_top3")) {
    return data as FixtureLiveBoard;
  }
  return null;
}

/**
 * Recover the latest live board from Ably history so serverless isolates
 * that never ran ingest still serve the current score.
 */
export async function loadFixtureBoardFromAbly(
  slug: string,
): Promise<FixtureLiveBoard | null> {
  const rest = getAblyRest();
  if (!rest) return null;

  const channel = rest.channels.get(fixtureChannelName(slug));
  try {
    const result = await channel.history({
      limit: 50,
      direction: "backwards",
    });
    for (const message of result.items ?? []) {
      if (message.name && message.name !== "BOARD_UPDATED") continue;
      const board = extractBoard(message);
      if (board) return board;
    }
    return null;
  } catch (error) {
    console.error("[ably] fixture board history failed", slug, error);
    return null;
  }
}
