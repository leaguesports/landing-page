"use client";

import { FixtureLiveBoardView } from "@/components/events/FixtureLiveBoard";
import {
  fetchFixtureFeed,
  postFanReply,
  postFeedReaction,
} from "@/lib/fixtures/feed-client";
import type {
  FixtureChannelEvent,
  FixtureFeedItem,
  FixtureFeedSnapshot,
  FixtureLiveBoard,
} from "@/types/fixture-feed";
import { isSafeRelativeHref } from "@/lib/fixtures/slug";
import { fixtureChannelName } from "@/types/fixture-feed";
import * as Ably from "ably";
import { Heart, MapPin, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

function formatRelative(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diff / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function FeedItemRow({
  item,
  onReact,
  busy,
}: {
  item: FixtureFeedItem;
  onReact: (id: string) => void;
  busy: boolean;
}) {
  const isVenue = item.kind === "venue_nudge";
  return (
    <article
      className={`border-t border-white/8 py-4 first:border-t-0 first:pt-0 ${
        isVenue ? "-mx-1 rounded-xl bg-sky-950/20 px-3 sm:px-4" : ""
      }`}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          {item.authorLabel}
        </span>
        <span className="text-[11px] text-zinc-600">
          {formatRelative(item.createdAt)}
        </span>
        {isVenue ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-400">
            <MapPin className="h-3 w-3" aria-hidden />
            Watch nearby
          </span>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">
        {item.body}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onReact(item.id)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-50"
        >
          <Heart className="h-3.5 w-3.5" aria-hidden />
          {item.reactionCount > 0 ? item.reactionCount : "React"}
        </button>
        {item.ctaHref &&
        item.ctaLabel &&
        isSafeRelativeHref(item.ctaHref) ? (
          <Link
            href={item.ctaHref}
            className="inline-flex min-h-9 items-center rounded-full bg-white px-3 text-xs font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
          >
            {item.ctaLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function FixtureSocialFeed({
  slug,
  title,
  sportSlug,
  venueCount,
  initial,
  watchHref,
}: {
  slug: string;
  title: string;
  sportSlug: string | null;
  venueCount: number;
  initial: FixtureFeedSnapshot;
  watchHref: string;
}) {
  const [board, setBoard] = useState<FixtureLiveBoard | null>(initial.board);
  const [items, setItems] = useState<FixtureFeedItem[]>(initial.items);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    void fetchFixtureFeed(slug, { title, sportSlug, venueCount })
      .then((snapshot) => {
        if (!alive) return;
        setBoard(snapshot.board);
        setItems(snapshot.items);
      })
      .catch(() => {
        /* keep SSR seed */
      });
    return () => {
      alive = false;
    };
  }, [slug, title, sportSlug, venueCount]);

  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: `/api/realtime/token?channel=${encodeURIComponent(fixtureChannelName(slug))}`,
      authMethod: "GET",
      autoConnect: true,
    });
    const channel = client.channels.get(fixtureChannelName(slug));

    const onEvent = (message: Ably.Message) => {
      const event = message.data as FixtureChannelEvent | undefined;
      if (!event || event.fixtureSlug !== slug) return;
      if (event.type === "BOARD_UPDATED") {
        setBoard(event.board);
      } else if (event.type === "FEED_ITEM_ADDED") {
        setItems((prev) => {
          if (prev.some((row) => row.id === event.item.id)) return prev;
          return [event.item, ...prev].slice(0, 80);
        });
      } else if (event.type === "REACTION_UPDATED") {
        setItems((prev) =>
          prev.map((row) =>
            row.id === event.itemId
              ? { ...row, reactionCount: event.reactionCount }
              : row,
          ),
        );
      }
    };

    channel.subscribe(onEvent);
    return () => {
      channel.unsubscribe(onEvent);
      client.close();
    };
  }, [slug]);

  function handleReply(event: React.FormEvent) {
    event.preventDefault();
    const body = reply.trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      try {
        const item = await postFanReply(slug, body);
        setItems((prev) => {
          if (prev.some((row) => row.id === item.id)) return prev;
          return [item, ...prev];
        });
        setReply("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not post");
      }
    });
  }

  function handleReact(itemId: string) {
    startTransition(async () => {
      try {
        const result = await postFeedReaction(slug, itemId);
        setItems((prev) =>
          prev.map((row) =>
            row.id === result.itemId
              ? { ...row, reactionCount: result.reactionCount }
              : row,
          ),
        );
      } catch {
        /* ignore */
      }
    });
  }

  return (
    <div className="space-y-6">
      <FixtureLiveBoardView board={board} />

      <div className="rounded-2xl border border-sky-400/20 bg-linear-to-br from-sky-950/35 via-[#141814] to-[#141814] px-4 py-4 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
          Watch this one live
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          {venueCount > 0
            ? `${venueCount} venue${venueCount === 1 ? "" : "s"} screening nearby — claim a seat while the feed is buzzing.`
            : "Browse Watch venues screening this sport and turn interest into a night out."}
        </p>
        <Link
          href={watchHref}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
        >
          {venueCount > 0 ? "See screening venues" : "Find where to watch"}
        </Link>
      </div>

      <div>
        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Live feed
          </p>
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            Match updates
          </h2>
        </div>

        <form onSubmit={handleReply} className="mb-5 flex gap-2">
          <label className="sr-only" htmlFor={`fixture-reply-${slug}`}>
            Add a short reply
          </label>
          <input
            id={`fixture-reply-${slug}`}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={280}
            placeholder="Say something short…"
            className="min-h-11 flex-1 rounded-full border border-white/12 bg-white/4 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-sky-400/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending || !reply.trim()}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white disabled:opacity-40"
            aria-label="Post reply"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </form>
        {error ? (
          <p className="mb-3 text-sm text-rose-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-2 sm:px-5">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No updates yet — be the first to react when the desk posts.
            </p>
          ) : (
            items.map((item) => (
              <FeedItemRow
                key={item.id}
                item={item}
                onReact={handleReact}
                busy={pending}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
