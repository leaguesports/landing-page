import type {
  FixtureFeedItem,
  FixtureFeedSnapshot,
  FixtureLiveBoard,
} from "@/types/fixture-feed";

export async function fetchFixtureFeed(
  slug: string,
  init?: {
    title?: string;
    sportSlug?: string | null;
    venueCount?: number;
  },
): Promise<FixtureFeedSnapshot> {
  const params = new URLSearchParams();
  if (init?.title) params.set("title", init.title);
  if (init?.sportSlug) params.set("sport", init.sportSlug);
  if (typeof init?.venueCount === "number") {
    params.set("venues", String(init.venueCount));
  }
  const qs = params.toString();
  const res = await fetch(
    `/api/fixtures/${encodeURIComponent(slug)}/feed${qs ? `?${qs}` : ""}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error("Could not load fixture feed");
  }
  return (await res.json()) as FixtureFeedSnapshot;
}

export async function postFanReply(
  slug: string,
  body: string,
): Promise<FixtureFeedItem> {
  const res = await fetch(`/api/fixtures/${encodeURIComponent(slug)}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Server ignores client author labels to prevent "Match desk" spoofing.
    body: JSON.stringify({ action: "reply", body }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(err?.error ?? "Could not post reply");
  }
  return (await res.json()) as FixtureFeedItem;
}

export async function postFeedReaction(
  slug: string,
  itemId: string,
): Promise<{ itemId: string; reactionCount: number }> {
  const res = await fetch(`/api/fixtures/${encodeURIComponent(slug)}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "react", itemId }),
  });
  if (!res.ok) {
    throw new Error("Could not react");
  }
  return (await res.json()) as { itemId: string; reactionCount: number };
}

/** Ops / provider writer — same shape a sports API would PATCH later. */
export async function patchFixtureLiveBoard(
  slug: string,
  board: FixtureLiveBoard,
  opsKey?: string,
): Promise<FixtureFeedSnapshot> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opsKey) headers["x-ops-key"] = opsKey;
  const res = await fetch(`/api/fixtures/${encodeURIComponent(slug)}/live`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ board }),
  });
  if (!res.ok) {
    throw new Error("Could not update live board");
  }
  return (await res.json()) as FixtureFeedSnapshot;
}
