import type { FixtureFeedSnapshot } from "../../types/fixture-feed.ts";
import { loadFixtureBoardFromAbly } from "../ably/fixture-history.ts";
import { getFixtureFeed, setFixtureBoard } from "./feed-store.ts";

/**
 * Return the in-process snapshot, or rebuild the board from Ably history
 * when this isolate never ran ingest / ops.
 */
export async function getOrHydrateFixtureFeed(
  slug: string,
): Promise<FixtureFeedSnapshot | null> {
  const existing = getFixtureFeed(slug);
  if (existing?.board && existing.board.status !== "scheduled") {
    return existing;
  }

  const fromAbly = await loadFixtureBoardFromAbly(slug);
  if (!fromAbly) return existing;

  if (existing && fromAbly.status === "scheduled") return existing;

  setFixtureBoard(slug, fromAbly, { announce: false });
  return getFixtureFeed(slug);
}
