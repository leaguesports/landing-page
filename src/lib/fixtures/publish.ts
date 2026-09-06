import type {
  FixtureChannelEvent,
  FixtureFeedItem,
  FixtureLiveBoard,
} from "@/types/fixture-feed";
import { fixtureChannelName } from "@/types/fixture-feed";

/**
 * Best-effort Ably publish for fixture feed channels.
 * No-ops when ABLY_API_KEY is unset (matches padel realtime env).
 */
export async function publishFixtureEvent(
  event: FixtureChannelEvent,
): Promise<void> {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) return;

  try {
    const Ably = (await import("ably")).default;
    const rest = new Ably.Rest({ key: apiKey });
    const channel = rest.channels.get(fixtureChannelName(event.fixtureSlug));
    await channel.publish(event.type, event);
  } catch (error) {
    console.warn("[fixture-feed] Ably publish failed", error);
  }
}

export async function publishBoardUpdated(
  fixtureSlug: string,
  board: FixtureLiveBoard,
): Promise<void> {
  await publishFixtureEvent({
    type: "BOARD_UPDATED",
    fixtureSlug,
    board,
    emittedAt: new Date().toISOString(),
  });
}

export async function publishFeedItemAdded(
  item: FixtureFeedItem,
): Promise<void> {
  await publishFixtureEvent({
    type: "FEED_ITEM_ADDED",
    fixtureSlug: item.fixtureSlug,
    item,
    emittedAt: new Date().toISOString(),
  });
}

export async function publishReactionUpdated(
  fixtureSlug: string,
  itemId: string,
  reactionCount: number,
): Promise<void> {
  await publishFixtureEvent({
    type: "REACTION_UPDATED",
    fixtureSlug,
    itemId,
    reactionCount,
    emittedAt: new Date().toISOString(),
  });
}
